const {
  strIsEmpty,
  isNum,
  isPositiveInteger,
  isBetween,
  validateSearchParams,
  validateTrainingParams,
  runValidation,
  reportValidationErrors
} = require('../public/js/start.validation')

describe("public/strIsEmpty", () => {
  test("returns true for empty strings", () => {
    expect(strIsEmpty("")).toBe(true);
  });
  test("returns false for non-empty strings", () => {
    expect(strIsEmpty("hello")).toBe(false);
  });
  test("returns false for null, undefined, and numbers", () => {
    expect(strIsEmpty(null)).toBe(false);
    expect(strIsEmpty(undefined)).toBe(false);
    expect(strIsEmpty(0)).toBe(false);
    expect(strIsEmpty(123)).toBe(false);
  });
})

describe("public/isNum", () => {
  test("returns true for valid numbers", () => { 
    expect(isNum(123)).toBe(true);
    expect(isNum("456")).toBe(true);
    expect(isNum("78.9")).toBe(true);
  });
  test("returns false for invalid numbers", () => {
    expect(isNum(NaN)).toBe(false);
    expect(isNum("abc")).toBe(false);
    expect(isNum("")).toBe(false);
  });
})

describe("public/isPositiveInteger", () => {
  test("returns true for positive integers", () => {
    expect(isPositiveInteger(1)).toBe(true);
    expect(isPositiveInteger("5")).toBe(true);
  });
  test("returns false for non-positive integers", () => {
    expect(isPositiveInteger(0)).toBe(false);
    expect(isPositiveInteger(-1)).toBe(false);
    expect(isPositiveInteger("")).toBe(false);
    expect(isPositiveInteger("abc")).toBe(false);
  });
})

describe("public/isBetween", () => {
  test("returns true for numbers within range", () => {
    expect(isBetween(5, 1, 10)).toBe(true);
    expect(isBetween("7", 5, 10)).toBe(true);
  });
  test("returns false for numbers outside range", () => {
    expect(isBetween(0, 1, 10)).toBe(false);
    expect(isBetween(11, 1, 10)).toBe(false);
    expect(isBetween("abc", 1, 10)).toBe(false);
  });
});

describe("public/validateSearchParams", () => { 
  test("returns errors when required fields are missing", () => {
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

  test("returns specific errors for invalid field values", () => {
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

  test("returns parsed numeric fields when validation passes", () => {
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

describe("public/validateTrainingParams", () => {
  test("returns errors when required fields are missing", () => {
    const result = validateTrainingParams({})

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual({
      data_loader: 'Campo requerido',
      dataset_len: 'Campo requerido',
      epochs: 'Campo requerido',
      chromosome: 'Campo requerido'
    })
  })

  test("returns field errors when constraints fail", () => {
    const result = validateTrainingParams({
      data_loader: 'loaderA',
      dataset_len: '0',
      epochs: '30',
      chromosome: 'not-array'
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual({
      dataset_len: 'dataset_len debe ser un entero positivo',
      epochs: 'epochs debe ser un entero positivo entre 1 y 20',
      chromosome: 'chromosome debe ser un array u objeto válido'
    })
  })

  test("returns parsed payload when validation passes", () => {
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

describe("public/runValidation", () => {
  test("resolves when validation function returns a valid shape", async () => {
    const validationStub = jest.fn().mockResolvedValue({ isValid: true, errors: null })

    await expect(runValidation(validationStub, { foo: 'bar' })).resolves.toEqual({ isValid: true, errors: null })
    expect(validationStub).toHaveBeenCalledWith({ foo: 'bar' })
  })

  test("rejects when validationFunction is not callable", async () => {
    await expect(runValidation(null, {})).rejects.toThrow(TypeError)
  })

  test("rejects when validation result lacks isValid flag", async () => {
    const invalidReturn = jest.fn().mockResolvedValue({ errors: {} })

    await expect(runValidation(invalidReturn, {})).rejects.toThrow('validationFunction debe devolver')
  })
})

describe("public/reportValidationErrors", () => {
  test("invokes reporter with formatted errors when validation fails", () => {
    const reporter = jest.fn()

    reportValidationErrors(
      { isValid: false, errors: { foo: 'bar', baz: 'qux' } },
      { title: 'T', okText: 'O', reporter }
    )

    expect(reporter).toHaveBeenCalledWith('T', 'foo: bar\nbaz: qux', 'O')
  })

  test("returns silently when validation is valid or falsy", () => {
    const reporter = jest.fn()

    reportValidationErrors({ isValid: true, errors: null }, { reporter })
    reportValidationErrors(null, { reporter })

    expect(reporter).not.toHaveBeenCalled()
  })
})