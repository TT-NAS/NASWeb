/**
 * @module public/js/validationData
 * @file public/js/validationData.js
 * @namespace public
 * Utility functions for validating request payloads.
 */

/**
 * Verifica si una cadena está vacía
 * @param {string} text
 * @returns {boolean}
 */
function strIsEmpty(text) {
  return text === ""
}

function isNum(num) {
  // Acepta números en formato string o number
  return num !== "" && !Number.isNaN(Number(num));
}

function isPositiveInteger(value) {
  const n = Number(value)
  return Number.isInteger(n) && n > 0
}

function isBetween(value, min, max) {
  const n = Number(value)
  if (Number.isNaN(n) || !Number.isFinite(n)) return false
  return n >= min && n <= max
}


// validation functions
/**
 * Valida que los parámetros del entrenamiento sean correctos
 * @param {Object} body {population_size, f, crossover_rate, mutation_rate, generations}
 */
function validateSearchParams(body) {
  const errors = {}

  // Campos esperados
  const fields = [
    'n_pop',
    //'f', // opcional según algoritmo
    'crossover_rate',
    //'mutation_rate', // opcional según algoritmo
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
  // n_pop -> entero positivo (>=2 & <=100)
  if (!isPositiveInteger(body.n_pop) || Number(body.n_pop) < 2 || Number(body.n_pop) > 100) {
    errors.n_pop = 'n_pop debe ser un entero >= 2 y <= 100'
  }

  // f -> número real > 0 (acepta decimales)
  if (!isNum(body?.f ?? 0.1) || Number(body?.f ?? 0.1) <= 0) {
    console.log("FF: ", body?.f);
    errors.f = 'f debe ser un número > 0'
  }

  // f -> [0,1]
  if (!isBetween(body?.f ?? 0.1, 0.1, 1)) {
    console.log(body?.f);
    errors.f = 'f debe estar entre 0.1 y 1'
  }

  // crossover_rate -> [0,1]
  if (!isBetween(body.crossover_rate, 0, 1)) {
    errors.crossover_rate = 'crossover_rate debe estar entre 0 y 1'
  }

  // mutation_rate -> [0,1]
  if (!isBetween(body?.mutation_rate ?? 0.1, 0, 1)) {
    errors.mutation_rate = 'mutation_rate debe estar entre 0 y 1'
  }

  // max_gen -> entero positivo
  if (!isPositiveInteger(body.max_gen) || Number(body.max_gen) < 2) {
    errors.max_gen = 'max_gen debe ser un entero >= 2'
  }

  // max_gen -> [2, 100]
  if (!isBetween(body.max_gen, 2, 100)) {
    errors.max_gen = 'max_gen debe estar entre 2 y 100'
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
 * Valida los parámetros de entrenamiento
 * @param {Object} body {data_loader, dataset_len, epochs, chromosome}
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
 * Valida que los datos usando una función de validación dada sean correctos
 * @param {function} validationFunction función de validación
 * @param {Object} payload datos a validar
 * @returns datos validados
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

// Función que reporta (separada) — inyectable para tests
function reportValidationErrors(validation, { title = 'Datos inválidos', okText = 'De acuerdo', reporter = Notiflix.Report.failure } = {}) {
  if (!validation || validation.isValid) return
  const errs = validation.errors
  const lines = []
  if (errs && typeof errs === 'object') {
    for (const [k, v] of Object.entries(errs)) {
      lines.push(`${k}: ${v}`)
    }
  } else if (typeof errs === 'string') {
    lines.push(errs)
  } else {
    lines.push('Errores de validación')
  }
  reporter(title, lines.join('\n'), okText)
}

// Hacer accesible globalmente para usar desde otros scripts
if (typeof window !== 'undefined') {
  window.validateSearchParams = validateSearchParams
}

const validationUtils = {
  strIsEmpty,
  isNum,
  isPositiveInteger,
  isBetween,
  validateSearchParams,
  validateTrainingParams,
  runValidation,
  reportValidationErrors
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = validationUtils
}

if (typeof window !== 'undefined') {
  window.startValidation = validationUtils
}