/**
 * @module controllers/validationData
 * @file controllers/validationData.js
 * Utility functions for validating request payloads.
 */

/**
 * Returns true when the received value is an empty string.
 * @param {string|number|null|undefined} text Value to evaluate.
 * @returns {boolean}
 */
function strIsEmpty(text) {
  return text === ""
}

/**
 * Checks if a value can be safely converted to a finite number.
 * @param {unknown} num Value to validate.
 * @returns {boolean}
 */
function isNum(num) {
  // Acepta números en formato string o number
  return !Number.isNaN(Number(num))
}

/**
 * Determines whether the provided value represents a positive integer.
 * @param {unknown} value Value to validate.
 * @returns {boolean}
 */
function isPositiveInteger(value) {
  const n = Number(value)
  return Number.isInteger(n) && n > 0
}

/**
 * Validates that the provided numeric value lies within the inclusive range [min, max].
 * @param {unknown} value Value to validate.
 * @param {number} min Minimum accepted value.
 * @param {number} max Maximum accepted value.
 * @returns {boolean}
 */
function isBetween(value, min, max) {
  const n = Number(value)
  if (Number.isNaN(n) || !Number.isFinite(n)) return false
  return n >= min && n <= max
}

// validation functions

/**
 * Checks whether the chromosome payload contains a valid chromosome array.
 * @param {Object} body Request payload.
 * @returns {{isValid: boolean, errors: Object|null}}
 */
function validateChromosome(body) { 
  const errors = {}

  // chromosome -> array u objeto (no se valida más aquí)
  if (!Array.isArray(body.chromosome)) {
    errors.chromosome = 'chromosome debe ser un array u objeto válido'
  }
  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors }
  }
  return { isValid: true, errors: null }
}

/**
 * Valida que los parámetros del entrenamiento sean correctos.
 * @param {Object} body {population_size, f, crossover_rate, mutation_rate, generations}
 * @returns {{isValid: boolean, errors: Object|null, parsed?: Object}}
 */
function validateSearchParams(body) {
  const errors = {}

  // Campos esperados
  const fields = [
    'n_pop',
    //'f',
    'crossover_rate',
    //'mutation_rate',
    'max_gen'
  ]

  // Check presence
  fields.forEach((field) => {
    if (body[field] === undefined || body[field] === null || strIsEmpty(body[field])) {
      errors[field] = 'Campo requerido'
    }
  })

  // Si faltan campos, devolver errores de inmediato
  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors }
  }

  // Validaciones por campo
  // n_pop -> entero positivo (>=2)
  if (!isPositiveInteger(body.n_pop) || Number(body.n_pop) < 2) {
    errors.n_pop = 'n_pop debe ser un entero >= 2'
  }

  // f -> número real > 0 (acepta decimales)
  if (!isNum(body?.f ?? 0.1) || Number(body?.f ?? 0.1) <= 0 || Number(body?.f ?? 0.1) < 0.1) {
    console.log(body?.f);
    errors.f = 'f debe ser un número > = 0.1'
  }

  // crossover_rate -> [0,1]
  if (!isBetween(body.crossover_rate, 0, 1)) {
    errors.crossover_rate = 'crossover_rate debe estar entre 0 y 1'
  }

  // mutation_rate -> [0,1]
  if (!isBetween(body?.mutation_rate ?? 0.1, 0, 1)) {
    console.log(body?.mutation_rate);
    errors.mutation_rate = 'mutation_rate debe estar entre 0 y 1'
  }

  // max_gen -> entero positivo
  if (!isPositiveInteger(body.max_gen) || Number(body.max_gen) < 1) {
    errors.max_gen = 'max_gen debe ser un entero >= 1'
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors }
  }

  // Si todo ok, devolver datos parseados (números)
  const parsed = {
    n_pop: Number(body.n_pop),
    f: Number(body.f),
    crossover_rate: Number(body.crossover_rate),
    mutation_rate: Number(body.mutation_rate),
    max_gen: Number(body.max_gen)
  }

  return { isValid: true, errors: null, parsed }
}

/**
 * Valida los parámetros de entrenamiento.
 * @param {Object} body {data_loader, dataset_len, epochs, chromosome}
 * @returns {{isValid: boolean, errors: Object|null, parsed?: Object}}
 */
function validateTrainingParams(body) {
  const errors = {}

  // Campos esperados
  const fields = [
    'data_loader',
    'dataset_len',
    'epochs',
    'chromosome'
  ]

  // Check presence
  fields.forEach((field) => {
    if (body[field] === undefined || body[field] === null || strIsEmpty(body[field])) {
      errors[field] = 'Campo requerido'
    }
  })

  // Si faltan campos, devolver errores de inmediato
  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors }
  }

  // Validaciones por campo
  // data_loader -> string no vacío
  if (strIsEmpty(body.data_loader)) {
    errors.data_loader = 'data_loader debe ser un string no vacío'
  }

  // dataset_len -> entero positivo
  if (!isPositiveInteger(body.dataset_len)) {
    errors.dataset_len = 'dataset_len debe ser un entero positivo'
  }

  // epochs -> entero positivo
  if (!isPositiveInteger(body.epochs) || isBetween(body.epochs, 1, 20) === false) {
    errors.epochs = 'epochs debe ser un entero positivo entre 1 y 20'
  }

  // chromosome -> array u objeto (no se valida más aquí)
  if (!Array.isArray(body.chromosome)) {
    errors.chromosome = 'chromosome debe ser un array u objeto válido'
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors }
  }

  // Si todo ok, devolver datos parseados (números)
  const parsed = {
    data_loader: String(body.data_loader),
    dataset_len: Number(body.dataset_len),
    epochs: Number(body.epochs),
    chromosome: body.chromosome
  }

  return { isValid: true, errors: null, parsed }
}

/**
 * Ejecuta una función de validación y valida el formato de su resultado.
 * @param {Function} validationFunction Función de validación a ejecutar.
 * @param {Object} payload Datos a validar.
 * @returns {Promise<{isValid: boolean, errors: Object|null}>}
 */
async function runValidation(validationFunction, payload) {
  if (typeof validationFunction !== 'function') {
    throw new TypeError('validationFunction debe ser una función')
  }
  const validation = await validationFunction(payload)
  // esperar objeto con isValid boolean y errors (opcional)
  if (!validation || typeof validation.isValid !== 'boolean') {
    throw new Error('validationFunction debe devolver {isValid: boolean, errors: object|null}')
  }
  return validation
}

/**
 * Lanza una excepción cuando la validación contiene errores.
 * @param {{isValid: boolean, errors?: Object}} validation Resultado de la validación.
 */
function reportValidationErrors(validation) {
  if (!validation || validation.isValid) return
  throw new Error('Errores de validación: ' + JSON.stringify(validation.errors))
}

// Exportar para que otros controladores (ej. controllers/logic.js) puedan usarlas
module.exports = {
  validateChromosome,
  validateSearchParams,
  validateTrainingParams,
  runValidation,
  reportValidationErrors
}