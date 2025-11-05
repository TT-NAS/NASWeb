/** @jest-environment jsdom */

const baseDOM = () => `
	<main>
		<input id="range-population-size" type="range" value="5" />
		<output id="range-population-size-value"></output>
		<input id="range-f" type="range" value="0.5" />
		<output id="range-f-value"></output>
		<input id="range-crossover" type="range" value="0.7" />
		<output id="range-crossover-value"></output>
		<input id="range-mutation" type="range" value="0.2" />
		<output id="range-mutation-value"></output>
		<input id="range-generations" type="range" value="20" />
		<output id="range-generations-value"></output>

		<button id="button-start"></button>
		<div id="result-iou"></div>
		<div id="result-search-time"></div>
		<div id="result-generation"></div>
		<div id="result-stop-reason"></div>

		<button id="button-download"></button>
		<a id="a-download-json"></a>
		<a id="a-download-pickle"></a>

		<button id="button-training"></button>
		<button id="button-parameters_train"></button>
		<button id="button-results_train"></button>
		<section id="container-train-parameters" class="glass-card"></section>
		<section id="container-train-results" class="glass-card"></section>

		<input id="file-chromosoma" type="file" />
		<button id="button-load_architecture"></button>

		<section id="animation"></section>
		<canvas id="canvas-chart"></canvas>
		<button id="navbutton-architecture"></button>
		<button id="navbutton-chart"></button>
	</main>
`

const createModule = () => {
	jest.resetModules()
	document.body.innerHTML = baseDOM()

	global.Notiflix = {
		Loading: { pulse: jest.fn(), dots: jest.fn(), remove: jest.fn() },
		Report: { failure: jest.fn() }
	}

	global.Chart = jest.fn().mockImplementation(() => ({
		destroy: jest.fn()
	}))

	return require('../public/js/start.form')
}

describe('public/start.form utilities', () => {
	afterEach(() => {
		jest.restoreAllMocks()
	})

	test('setupRange syncs value changes to output', () => {
		const startForm = createModule()
		const slider = document.createElement('input')
		slider.id = 'custom-range'
		slider.type = 'range'
		slider.value = '3'
		const output = document.createElement('output')
		output.id = 'custom-output'
		document.body.append(slider, output)

		startForm.setupRange('custom-range', 'custom-output')

		expect(output.textContent).toBe('3')

		slider.value = '9'
		slider.dispatchEvent(new Event('input'))

		expect(output.textContent).toBe('9')
	})

	test('normalizeValue formats numbers and fallbacks', () => {
		const { normalizeValue } = createModule()

		expect(normalizeValue(null)).toBe('--')
		expect(normalizeValue('')).toBe('--')
		expect(normalizeValue(5)).toBe('5')
		expect(normalizeValue(3.14159, { decimals: 2 })).toBe('3.14')
		expect(normalizeValue('text')).toBe('text')
	})

	test('renderResults populates UI metrics with formatting', () => {
		const { renderResults } = createModule()
		renderResults({
			results: {
				predicted_iou: 0.123456,
				search_time: 8.4567,
				stop_gen: 7,
				stop_reason: 'max'
			}
		})

		expect(document.getElementById('result-iou').textContent).toBe('0.1235')
		expect(document.getElementById('result-search-time').textContent).toBe('8.46')
		expect(document.getElementById('result-generation').textContent).toBe('7')
		expect(document.getElementById('result-stop-reason').textContent).toBe('max')

		renderResults()
		expect(document.getElementById('result-iou').textContent).toBe('--')
		expect(document.getElementById('result-search-time').textContent).toBe('--')
	})

	test('changeTrainingDisplay toggles visibility and classes', () => {
		const { changeTrainingDisplay } = createModule()
		const parametersButton = document.getElementById('button-parameters_train')
		const resultsButton = document.getElementById('button-results_train')
		const containerParams = document.getElementById('container-train-parameters')
		const containerResults = document.getElementById('container-train-results')
		const dispatchSpy = jest.spyOn(window, 'dispatchEvent')

		changeTrainingDisplay(true, 'results')
		expect(containerResults.style.display).toBe('block')
		expect(containerParams.style.display).toBe('none')
		expect(parametersButton.classList.contains('active')).toBe(true)
		expect(resultsButton.classList.contains('active')).toBe(true)
		expect(dispatchSpy).toHaveBeenCalled()

		dispatchSpy.mockClear()
		changeTrainingDisplay(false, 'parameters')
		expect(containerResults.style.display).toBe('none')
		expect(containerParams.style.display).toBe('block')
		expect(parametersButton.classList.contains('active')).toBe(false)
		expect(resultsButton.classList.contains('active')).toBe(false)
		expect(dispatchSpy).toHaveBeenCalled()
	})

	test('changeViewsNav switches panels and classes', () => {
		const { changeViewsNav } = createModule()
		const animation = document.getElementById('animation')
		const canvas = document.getElementById('canvas-chart')
		const navArchitecture = document.getElementById('navbutton-architecture')
		const navChart = document.getElementById('navbutton-chart')
		const dispatchSpy = jest.spyOn(window, 'dispatchEvent')

		animation.style.display = 'flex'
		canvas.style.display = 'none'
		navArchitecture.classList.add('active')
		changeViewsNav(true, 'chart')

		expect(animation.style.display).toBe('none')
		expect(canvas.style.display).toBe('block')
		expect(navArchitecture.classList.contains('active')).toBe(false)
		expect(navChart.classList.contains('active')).toBe(true)
		expect(dispatchSpy).toHaveBeenCalled()

		dispatchSpy.mockClear()
		canvas.style.display = 'block'
		animation.style.display = 'none'
		navChart.classList.add('active')
		navArchitecture.classList.remove('active')

		changeViewsNav(false, 'animation')

		expect(animation.style.display).toBe('flex')
		expect(canvas.style.display).toBe('none')
		expect(navArchitecture.classList.contains('active')).toBe(true)
		expect(navChart.classList.contains('active')).toBe(false)
		expect(dispatchSpy).toHaveBeenCalled()
	})
})
