const {
	validateChromosome,
	validateSearchParams,
	validateTrainingParams,
	runValidation,
	reportValidationErrors
} = require('../controllers/validationData')

describe('validateChromosome', () => {
	test('returns valid result when chromosome is an array', () => {
		const result = validateChromosome({ chromosome: [1, 2, 3] })

		expect(result).toEqual({ isValid: true, errors: null })
	})

	test('returns error when chromosome is not an array', () => {
		const result = validateChromosome({ chromosome: 'invalid' })

		expect(result.isValid).toBe(false)
		expect(result.errors).toEqual({ chromosome: 'chromosome debe ser un array u objeto válido' })
	})
})

describe('validateSearchParams', () => {
	test('returns errors when required fields are missing', () => {
		const result = validateSearchParams({})

		expect(result.isValid).toBe(false)
		expect(result.errors).toEqual({
			population_size: 'Campo requerido',
			f: 'Campo requerido',
			crossover_rate: 'Campo requerido',
			mutation_rate: 'Campo requerido',
			generations: 'Campo requerido'
		})
	})

	test('returns specific errors for invalid field values', () => {
		const result = validateSearchParams({
			population_size: '1',
			f: '0',
			crossover_rate: '1.5',
			mutation_rate: '-0.1',
			generations: '0'
		})

		expect(result.isValid).toBe(false)
		expect(result.errors).toEqual({
			population_size: 'population_size debe ser un entero >= 2',
			f: 'f debe ser un número > 0',
			crossover_rate: 'crossover_rate debe estar entre 0 y 1',
			mutation_rate: 'mutation_rate debe estar entre 0 y 1',
			generations: 'generations debe ser un entero >= 1'
		})
	})

	test('returns parsed numeric fields when validation passes', () => {
		const result = validateSearchParams({
			population_size: '5',
			f: '0.8',
			crossover_rate: '0.7',
			mutation_rate: '0.2',
			generations: '10'
		})

		expect(result.isValid).toBe(true)
		expect(result.errors).toBeNull()
		expect(result.parsed).toEqual({
			population_size: 5,
			f: 0.8,
			crossover_rate: 0.7,
			mutation_rate: 0.2,
			generations: 10
		})
	})
})

describe('validateTrainingParams', () => {
	test('returns errors when required fields are missing', () => {
		const result = validateTrainingParams({})

		expect(result.isValid).toBe(false)
		expect(result.errors).toEqual({
			data_loader: 'Campo requerido',
			dataset_len: 'Campo requerido',
			epochs: 'Campo requerido',
			chromosome: 'Campo requerido'
		})
	})

	test('returns errors when numeric constraints are not satisfied', () => {
		const result = validateTrainingParams({
			data_loader: 'loaderA',
			dataset_len: '0',
			epochs: '21',
			chromosome: 'invalid'
		})

		expect(result.isValid).toBe(false)
		expect(result.errors).toEqual({
			dataset_len: 'dataset_len debe ser un entero positivo',
			epochs: 'epochs debe ser un entero positivo entre 1 y 20',
			chromosome: 'chromosome debe ser un array u objeto válido'
		})
	})

	test('returns parsed fields when payload is valid', () => {
		const chromosome = [1, 2, 3]
		const result = validateTrainingParams({
			data_loader: 'loaderA',
			dataset_len: '25',
			epochs: '12',
			chromosome
		})

		expect(result.isValid).toBe(true)
		expect(result.errors).toBeNull()
		expect(result.parsed).toEqual({
			data_loader: 'loaderA',
			dataset_len: 25,
			epochs: 12,
			chromosome
		})
	})
})

describe('runValidation', () => {
	test('executes the validation function and resolves its result', async () => {
		const validationStub = jest.fn().mockResolvedValue({ isValid: true, errors: null })
		const payload = { sample: true }

		await expect(runValidation(validationStub, payload)).resolves.toEqual({ isValid: true, errors: null })
		expect(validationStub).toHaveBeenCalledWith(payload)
	})

	test('throws when validationFunction is not a function', async () => {
		await expect(runValidation(null, {})).rejects.toThrow(TypeError)
	})

	test('throws when validation result does not include isValid', async () => {
		const invalidReturn = jest.fn().mockResolvedValue({ errors: null })

		await expect(runValidation(invalidReturn, {})).rejects.toThrow('validationFunction debe devolver')
	})
})

describe('reportValidationErrors', () => {
	test('throws when validation is invalid', () => {
		expect(() => reportValidationErrors({ isValid: false, errors: { field: 'error' } }))
			.toThrow('Errores de validación')
	})

	test('does not throw when validation is valid', () => {
		expect(() => reportValidationErrors({ isValid: true, errors: null })).not.toThrow()
	})

	test('does not throw when validation is falsy', () => {
		expect(() => reportValidationErrors(null)).not.toThrow()
	})
})
