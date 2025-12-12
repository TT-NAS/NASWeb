/**
 * @module public/js/start.form
 * @file public/js/start.form.js
 * @namespace public
 * JavaScript para la gestión del formulario de inicio y la interacción con la API.
 */

// Defaults
// Este script vincula los controles de tipo 'range' del formulario con sus salidas <output>,
// mostrando dinámicamente el valor seleccionado por el usuario en cada control.
// Facilita la visualización en tiempo real de los parámetros configurados en el formulario.
/**
 * Sincroniza el valor de un control de tipo range con su elemento <output> asociado.
 * @param {string} idInput - Identificador del elemento <input type="range">.
 * @param {string} idOutput - Identificador del elemento <output> que mostrará el valor.
 */
function setupRange(idInput, idOutput) {
  const input = document.getElementById(idInput);
  const output = document.getElementById(idOutput);
  if (!input || !output) return;

  output.textContent = input.value;
  input.addEventListener("input", () => {
    output.textContent = input.value;
  });
}

setupRange("range-population-size", "range-population-size-value");
setupRange("range-f", "range-f-value");
setupRange("range-crossover", "range-crossover-value");
setupRange("range-mutation", "range-mutation-value");
setupRange("range-generations", "range-generations-value");

// Definitions
// Search
const start_button = document.getElementById("button-start")
const resultIou = document.getElementById("result-iou")
const resultSearchTime = document.getElementById("result-search-time")
const resultGeneration = document.getElementById("result-generation")
const resultStopReason = document.getElementById("result-stop-reason")
const selectSearchAlgorithm = document.getElementById("select-algorithm-search")
// download
const downloadButton = document.getElementById("button-download")
const downloadJsonButton = document.getElementById("a-download-json")
const downloadPklButton = document.getElementById("a-download-pickle")
// training
const trainingButton = document.getElementById("button-training")
const parametersButton = document.getElementById("button-parameters_train")
const resultsTrainButton = document.getElementById("button-results_train")
const containerTrainParameters = document.getElementById("container-train-parameters")
const containerTrainResults = document.getElementById("container-train-results")
// load file
const fileChromosoma = document.getElementById("file-chromosoma")
const buttonLoadArchitecture = document.getElementById("button-load_architecture")
// chart
const canvasChart = document.getElementById("canvas-chart")
const animation = document.getElementById("animation")
const navButtonArchitecture = document.getElementById("navbutton-architecture")
const navButtonChart = document.getElementById("navbutton-chart")

const elevateNProgressBar = () => {
  const nprogressRoot = document.getElementById("nprogress")
  if (!nprogressRoot) return

  nprogressRoot.style.position = "fixed"
  nprogressRoot.style.top = "0"
  nprogressRoot.style.left = "0"
  nprogressRoot.style.width = "100%"
  nprogressRoot.style.zIndex = "1000001"
  nprogressRoot.style.pointerEvents = "none"

  const bar = nprogressRoot.querySelector(".bar")
  if (bar) {
    bar.style.height = "4px"
    bar.style.background = "#773ec7"
    bar.style.boxShadow = "0 0 12px rgba(119, 62, 199, 0.6)"
  }

  const peg = nprogressRoot.querySelector(".peg")
  if (peg) {
    peg.style.boxShadow = "0 0 10px #773ec7, 0 0 5px #773ec7"
  }
}

const scheduleNProgressBarElevation = () => {
  const scheduler = typeof requestAnimationFrame === "function"
    ? requestAnimationFrame
    : (fn) => setTimeout(fn, 0)

  scheduler(() => {
    elevateNProgressBar()
    setTimeout(elevateNProgressBar, 50)
  })
}

const queueBackgroundResize = (delays = [150, 350]) => {
  if (typeof window === "undefined") return

  const execute = () => {
    if (window.vantaDotsEffect && typeof window.vantaDotsEffect.resize === "function") {
      window.vantaDotsEffect.resize()
    } else {
      window.dispatchEvent(new Event("resize"))
    }
  }

  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(execute)
  } else {
    execute()
  }

  delays.forEach((delay) => {
    setTimeout(execute, delay)
  })
}

const hasTrainingMetrics = (payload) => {
  if (!payload || typeof payload !== "object") return false
  return [
    "training_iou",
    "validation_iou",
    "training_time",
    "last_epoch",
    "epoch",
    "current_epoch",
    "progress_epoch"
  ].some((key) => key in payload)
}

const unwrapTrainingPayload = (payload) => {
  if (!payload || typeof payload !== "object") return null
  let current = payload
  let guard = 0
  const unwrapOrder = ["progress", "register", "metrics", "payload", "data"]

  while (current && typeof current === "object" && !hasTrainingMetrics(current) && guard < 6) {
    const nextKey = unwrapOrder.find((key) => current[key] && typeof current[key] === "object")
    if (!nextKey) break
    current = current[nextKey]
    guard += 1
  }

  return current && typeof current === "object" ? current : payload
}

const coerceEpochNumber = (value) => {
  if (value === null || value === undefined) return null
  const numeric = Number(value)
  if (Number.isFinite(numeric)) return numeric
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

const collectArtifacts = (...sources) => {
  const artifacts = {}
  sources.forEach((src) => {
    if (!src || typeof src !== "object") return
    if (typeof src.pickle_url === "string" && src.pickle_url.trim()) {
      artifacts.pickle_url = src.pickle_url.trim()
    }
    if (typeof src.image_url === "string" && src.image_url.trim()) {
      artifacts.image_url = src.image_url.trim()
    }
    if (src.metrics && typeof src.metrics === "object") {
      if (typeof src.metrics.pickle_url === "string" && src.metrics.pickle_url.trim()) {
        artifacts.pickle_url = src.metrics.pickle_url.trim()
      }
      if (typeof src.metrics.image_url === "string" && src.metrics.image_url.trim()) {
        artifacts.image_url = src.metrics.image_url.trim()
      }
    }
  })
  return artifacts
}

let lastTrainingImageObjectUrl = null

const downloadAndShowImage = async (imageUrl, imgElement) => {
  if (!imgElement) return
  const container = imgElement.closest("[data-trained-image-container]")

  const observeTransition = () => {
    if (!container) return

    const handleTransitionEnd = () => {
      queueBackgroundResize()
    }

    container.addEventListener("transitionend", handleTransitionEnd, { once: true })
  }

  const hideImage = () => {
    if (container) {
      container.classList.remove("image-visible")
      container.classList.add("image-hidden")
    }
    if (!imgElement.classList.contains("d-none")) {
      imgElement.classList.add("d-none")
    }
    imgElement.removeAttribute("src")
    queueBackgroundResize()
  }

  if (!imageUrl) {
    if (lastTrainingImageObjectUrl) {
      URL.revokeObjectURL(lastTrainingImageObjectUrl)
      lastTrainingImageObjectUrl = null
    }
    hideImage()
    return
  }

  try {
    const endpoint = `/api/download/image?url=${imageUrl}`
    const response = await fetch(endpoint)

    if (!response.ok) {
      throw new Error(`Solicitud fallida con código ${response.status}`)
    }

    const blob = await response.blob()

    if (lastTrainingImageObjectUrl) {
      URL.revokeObjectURL(lastTrainingImageObjectUrl)
      lastTrainingImageObjectUrl = null
    }

    const objectUrl = URL.createObjectURL(blob)
    lastTrainingImageObjectUrl = objectUrl

    imgElement.src = objectUrl
    imgElement.alt = "Segmentación entrenada"
    imgElement.classList.remove("d-none")
    if (container) {
      container.classList.add("image-visible")
      container.classList.remove("image-hidden")
      observeTransition()
    }

    const handleLoad = () => {
      queueBackgroundResize()
    }

    if (imgElement.complete && imgElement.naturalWidth) {
      queueBackgroundResize()
    } else {
      imgElement.addEventListener("load", handleLoad, { once: true })
    }
  } catch (error) {
    console.error("No se pudo descargar la imagen del entrenamiento", error)
    if (typeof Notiflix?.Notify?.warning === "function") {
      Notiflix.Notify.warning("No se pudo cargar la imagen del entrenamiento")
    }
    if (lastTrainingImageObjectUrl) {
      URL.revokeObjectURL(lastTrainingImageObjectUrl)
      lastTrainingImageObjectUrl = null
    }
    hideImage()
  }
}

//Functions 

/**
 * Normaliza un valor para su visualización en la interfaz, aplicando formato numérico cuando procede.
 * @param {*} value - Valor recibido desde la API.
 * @param {{decimals?: number}} [options] - Opciones de formateo; permite indicar decimales.
 * @returns {string} Valor listo para ser mostrado en pantalla.
 */
const normalizeValue = (value, { decimals } = {}) => {
  if (value === null || value === undefined || value === "") return "--"
  if (typeof value === "number" && Number.isFinite(value)) {
    if (typeof decimals === "number") {
      return value.toFixed(decimals)
    }
    return value.toString()
  }
  return String(value)
}

/**
 * Presenta los resultados del backend en los elementos de la interfaz.
 * Soporta respuestas anidadas dentro de las propiedades `metrics` o `result`.
 * @param {Object} [payload={}] - Datos retornados por la API.
 */
const renderResults = (payload = {}, { preserveExisting = false } = {}) => {
  const source = payload?.results ?? payload ?? {}
  const metrics = {
    iou: source?.predicted_iou ?? source?.iou,
    search_time: source?.search_time,
    generation: source?.stop_gen ?? source?.generation,
    stop_reason: source?.stop_reason
  }

  if (resultIou && (!preserveExisting || metrics.iou !== undefined)) {
    resultIou.textContent = normalizeValue(metrics.iou, { decimals: 4 })
  }
  if (resultSearchTime && (!preserveExisting || metrics.search_time !== undefined)) {
    resultSearchTime.textContent = normalizeValue(metrics.search_time, { decimals: 2 })
  }
  if (resultGeneration && (!preserveExisting || metrics.generation !== undefined)) {
    resultGeneration.textContent = normalizeValue(metrics.generation)
  }
  if (resultStopReason && (!preserveExisting || metrics.stop_reason !== undefined)) {
    resultStopReason.textContent = normalizeValue(metrics.stop_reason)
  }
}

let chartInstance;
/**
 * crea una grafica de linea y muestra la convergencia del algoritmo
 * @param {vector} vector 
 */
function loadChart(vector = [9,8,7,6,5,4,3,2,1]) {
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(canvasChart, {
    type: 'line',
    data: {
      labels: vector.map((_, i) => i + 1), // genera 1, 2, 3...
      datasets: [{
        label: 'Generación',
        data: vector,
        fill: false,
        borderColor: 'rgb(119, 62, 199)',
        tension: 0.2
      }]
    }
  });

  queueBackgroundResize();
}

/**
 * Transforma un cromosoma en formato de lista a formato json y lo muestra en la vista
 * Usa los datos de la sesión, almacenados después de la búsqueda
 */
async function showArchitecture() {
  const chromosome = JSON.parse(sessionStorage.getItem("best_chromosome")).real_codification
  try {
    // Hace una petición al end point
    const res = await fetch("/api/json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({chromosome})
    })

    if (!res.ok) {
      throw new Error(`Solicitud fallida con código ${res.status}`)
    }

    const json_chromosome = await res.json()
    // Muestra el cromosoma
    console.log(json_chromosome)
    if (json_chromosome?.unet) {
      applyUNetConfig(json_chromosome)
      applyArrowsConfig(json_chromosome.unet)
      scheduleLinePosition()
    } else {
      throw new Error("Error con el formato de la arquitectura, no hay .unet")
    }
  
  } catch (e) {
    console.error(e)
    Notiflix.Report.failure(
        "Error",
        "Ocurrió un error al reconocer el cromosoma",
        "De acuerdo"
      )
  }
}

/**
 * Gestiona estados de carga y errores para ofrecer retroalimentación al usuario.
 */
const startSearch = async () => {
  // Obtener valores de los inputs
  const population_size = Number(document.getElementById("range-population-size").value.trim());
  const f = Number(document.getElementById("range-f").value.trim());
  const crossover_rate = Number(document.getElementById("range-crossover").value.trim());
  const mutation_rate = Number(document.getElementById("range-mutation").value.trim());
  const generations = Number(document.getElementById("range-generations").value.trim());

  const body = {
    population_size,
    f,
    crossover_rate,
    mutation_rate,
    generations
  }
  //console.log(body);
  // Validar parámetros antes de enviar
  const validation = await runValidation(validateSearchParams, body)
  if (!validation.isValid) return reportValidationErrors(validation)
  // Muestra el cargando
  Notiflix.Loading.pulse("Buscando la mejor arquitectura...");
  // Mueve scroll hasta arriba
  window.scrollTo({ top: 0, behavior: "smooth" });
  // Muestra el cambio de arquitecturas
  startLoop()
  if (downloadButton) downloadButton.disabled = true
  if (trainingButton) trainingButton.disabled = true

  let resultsProcessed = false
  let latestPayload = null
  let searchProgressActive = false
  const totalGenerations = Number.isFinite(generations) && generations > 0 ? generations : null
  let lastReportedGeneration = 0

  if (typeof NProgress?.start === "function") {
    NProgress.start()
    NProgress.set(0)
    searchProgressActive = true
    scheduleNProgressBarElevation()
  }

  const processResults = (results, message) => {
    if (!results || resultsProcessed) return

    renderResults({ results })
    console.log("Resultado final de /api/search:", results)

    if (navButtonChart) {
      navButtonChart.click()
    }
    if (Array.isArray(results.vector) && results.vector.length > 0) {
      loadChart(results.vector)
    }

    sessionStorage.setItem("best_chromosome", JSON.stringify(results, null, 2))

    if (downloadButton) downloadButton.disabled = false
    if (trainingButton) trainingButton.disabled = false

    if (message) {
      Notiflix.Notify.success(message)
    }

    stopLoop()
    if (results.real_codification) {
      showArchitecture()
    }

    if (searchProgressActive && typeof NProgress?.done === "function") {
      NProgress.done()
      searchProgressActive = false
    }

    resultsProcessed = true
  }

  const handleProgress = (entry) => {
    if (resultsProcessed) return

    const partialResults = {}

    if (typeof entry.best_fitness === "number" && Number.isFinite(entry.best_fitness)) {
      partialResults.predicted_iou = entry.best_fitness
    }

    const hasGeneration = entry.generation !== undefined && entry.generation !== null
    if (hasGeneration) {
      partialResults.stop_gen = entry.generation
    }

    if (typeof entry.generation === "number" && Number.isFinite(entry.generation)) {
      const currentGen = entry.generation
      if (currentGen !== lastReportedGeneration) {
        lastReportedGeneration = currentGen

        if (searchProgressActive && typeof NProgress?.set === "function") {
          const denominator = totalGenerations ?? Math.max(currentGen, 1)
          const normalized = Math.max(0, Math.min(1, currentGen / denominator))
          NProgress.set(normalized)
        }

        if (typeof Notiflix?.Loading?.change === "function") {
          const suffix = totalGenerations
            ? ` (${currentGen}/${totalGenerations})`
            : ` (${currentGen})`
          Notiflix.Loading.change(`Buscando la mejor arquitectura...${suffix}`)
        }
      }
    }

    if (Object.keys(partialResults).length === 0) return

    renderResults({ results: partialResults }, { preserveExisting: true })
  }

  const coerceJSONValue = (value) => {
    let current = value
    let guard = 0

    while (typeof current === "string" && guard < 3) {
      const trimmed = current.trim()
      if (!trimmed) break
      const first = trimmed[0]
      if (first !== "{" && first !== "[" && first !== '"') break
      try {
        current = JSON.parse(trimmed)
      } catch (err) {
        console.warn("No se pudo analizar el chunk del stream como JSON:", trimmed, err)
        break
      }
      guard += 1
    }

    return current
  }

  try {
    // Envía los valores al back
    const response = await fetch(`/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    if (!response.ok) {
      throw new Error(`Solicitud fallida con código ${response.status}`)
    }

    const reader = response.body && response.body.getReader ? response.body.getReader() : null

    const handleEntry = (entry) => {
      const normalized = coerceJSONValue(entry)
      if (!normalized || typeof normalized !== "object") return

      latestPayload = normalized

      if (normalized.type === "result" && normalized.results) {
        processResults(normalized.results, normalized.message)
      } else if (normalized.type === "progress") {
        console.log("Stream progreso /api/search:", normalized)
        handleProgress(normalized)
      } else if (normalized.message) {
        console.log("Stream mensaje /api/search:", normalized.message)
      }
    }

    if (!reader) {
      const data = await response.json()
      handleEntry(data)
    } else {
      const decoder = new TextDecoder("utf-8")
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue

          const parsed = coerceJSONValue(trimmed)
          if (!parsed || typeof parsed !== "object") {
            console.error("Error al procesar el chunk del stream:", line)
            continue
          }

          handleEntry(parsed)
        }
      }

      if (buffer.trim()) {
        const parsed = coerceJSONValue(buffer)
        if (!parsed || typeof parsed !== "object") {
          console.error("Error al procesar el último chunk del stream:", buffer)
        } else {
          handleEntry(parsed)
        }
      }
    }

    if (!resultsProcessed) {
      stopLoop()
    }
  } catch (e) {
    console.error(e)
    stopLoop()
    Notiflix.Report.failure(
      "Error",
      "Ocurrió un error al procesar la petición",
      "De acuerdo"
    )
    renderResults()
    if (searchProgressActive && typeof NProgress?.done === "function") {
      NProgress.done()
      searchProgressActive = false
    }
  } finally {
    Notiflix.Loading.remove();
    if (searchProgressActive && typeof NProgress?.done === "function") {
      NProgress.done()
      searchProgressActive = false
    }
  }
}

/**
 * Crea un dcoumento json con los datos del cromosoma encontrado y lo descarga
 */
function downloadJson() {
  const json_data = sessionStorage.getItem("best_chromosome")
  const blob = new Blob([json_data], { type: "application/json" })
  // crea una url temporal
  const url = URL.createObjectURL(blob)
  // crea un enlace invisible
  const a = document.createElement("a")
  a.href = url
  a.download = "cromosoma.json" //nombre del archivo
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // liberar memoria
  URL.revokeObjectURL(url)
}

/**
 * hace la petición al servidor para obtener el cromosoma en formato .pkl y lo descarga
 */
async function downloadPkl() {
  try {
    const json_data = JSON.parse(sessionStorage.getItem("best_chromosome"))
    const res = await fetch(`/api/download/pkl`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({chromosome: json_data.real_codification})
    })
    // Comprueba la descarga
    if (!res.ok) {
      throw new Error(`Solicitud fallida con código ${response.status}`)
    }
    // Descarga documento
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url;
    a.download = "model.pkl"
    document.body.appendChild(a);
    a.click()
    // Elimina los restos
    document.body.removeChild(a);
    // liberar memoria
    URL.revokeObjectURL(url)
  } catch (e) {
    console.error(e)
    Notiflix.Report.failure(
      "Error",
      "Ocurrió un error al intentar descargar el documento",
      "De acuerdo"
    )
  }
}

/**
 * Descarga un archivo .pkl desde el servidor usando su nombre.
 * @param {string} name - Nombre del archivo (sin extensión .pkl)
 */
async function downloadPklByName(name) {
  try {
    // Validar el parámetro
    if (!name) {
      throw new Error("No se especificó el nombre del archivo.");
    }

    let new_name = name.split("/")
    new_name = new_name[new_name.length-1]

    // Hacer la petición GET
    const res = await fetch(`/api/download/pkl-url/${encodeURIComponent(new_name)}`, {
      method: "GET",
    });

    // Verificar la respuesta
    if (!res.ok) {
      throw new Error(`Solicitud fallida con código ${res.status}`);
    }

    // Convertir la respuesta a binario
    const blob = await res.blob();

    // Crear URL temporal para descarga
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `model_trained.pkl`;
    document.body.appendChild(a);
    a.click();

    // Limpieza
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error(e);
    Notiflix.Report.failure(
      "Error",
      "Ocurrió un error al intentar descargar el documento .pkl",
      "De acuerdo"
    );
  }
}


const extractLatestValue = (value) => {
  if (Array.isArray(value)) {
    return value.length > 0 ? value[value.length - 1] : undefined
  }
  return value
}

function updateTrainingMetrics(progress = {}) {
  const iouTrainEl = document.getElementById("result-train-iou")
  const iouValEl = document.getElementById("result-train-iou_val")
  const timeEl = document.getElementById("result-train-time")
  const epochEl = document.getElementById("result-train-epoch")

  const latestTrain = extractLatestValue(progress.training_iou)
  const latestVal = extractLatestValue(progress.validation_iou)
  const epochValue = progress.last_epoch ?? progress.current_epoch ?? progress.epoch ?? progress.progress_epoch
  const timeValue = progress.training_time ?? progress.elapsed_time ?? progress.total_time

  if (iouTrainEl) {
    iouTrainEl.textContent = normalizeValue(latestTrain, { decimals: 4 })
  }
  if (iouValEl) {
    iouValEl.textContent = normalizeValue(latestVal, { decimals: 4 })
  }
  if (timeEl) {
    timeEl.textContent = normalizeValue(timeValue, { decimals: 2 })
  }
  if (epochEl) {
    epochEl.textContent = normalizeValue(epochValue)
  }
}

/**
 * Muestra los resultados del entrenamiento en contenedor
 * @param {Object} results Resultados del entrenamiento de la arquitectura
 * @param {String} pkl_url URL de descarga del documento pkl
 * @param {String} image_url URL de descarga de la imagen de la segmentación entrenada
 */
function showTrainingResultsAndDownload(results, pkl_url, image_url) {
  const iou_train = document.getElementById("result-train-iou")
  const iou_val = document.getElementById("result-train-iou_val")
  const time = document.getElementById("result-train-time")
  const epoch = document.getElementById("result-train-epoch")
  const imageSegmentation = document.getElementById("image-trained-segmentation")

  // Muestra los resultados
  iou_train.textContent = normalizeValue(results?.training_iou ?? "Error de carga", {decimals: 4});
  iou_val.textContent = normalizeValue(results?.validation_iou ?? "Error de carga", {decimals: 4});
  time.textContent = normalizeValue(results?.training_time ?? "Error de carga", {decimals: 4});
  epoch.textContent = normalizeValue(results?.last_epoch ?? "Error de carga");
  // Activa el display
  resultsTrainButton.click();
  // Descarga el documento entrenado
  downloadPklByName(pkl_url)
  // Descarga la imagen de la segmentación entrenada
  downloadAndShowImage(image_url, imageSegmentation)

  // Redimensiona el fondo si es necesario
  queueBackgroundResize();
}

/**
 * Inicia el entrenamiento de la arquitectura en la sessión
 */
async function startTraining() {
  const data_loader = document.getElementById("select-dataset").value
  const dataset_len = document.getElementById("number-dataset-size").value
  const epochs = document.getElementById("number-epochs").value
  const storedChromosome = sessionStorage.getItem("best_chromosome")
  const chromosome = storedChromosome ? JSON.parse(storedChromosome).real_codification : null

  if (!chromosome) {
    Notiflix.Report.warning(
      "Cromosoma no encontrado",
      "Debes ejecutar primero la búsqueda o cargar una arquitectura antes de entrenar.",
      "Entendido"
    )
    return
  }

  Notiflix.Loading.dots("Entrenando la arquitectura...")
  const imageSegmentation = document.getElementById("image-trained-segmentation")
  downloadAndShowImage(null, imageSegmentation)
  if (typeof NProgress?.start === "function") {
    NProgress.start()
    NProgress.set(0)
    scheduleNProgressBarElevation()
  }

  const body = {
    data_loader,
    dataset_len,
    epochs,
    chromosome
  }

  const validation = await runValidation(validateTrainingParams, body)
  if (!validation.isValid) {
    Notiflix.Loading.remove()
    return reportValidationErrors(validation)
  }

  let latestProgress = null
  let latestArtifacts = {}
  let resultsViewShown = false
  const trainingPayload = validation.parsed ? validation.parsed : body
  let totalEpochs = Number.isFinite(trainingPayload?.epochs) ? Number(trainingPayload.epochs) : Number(epochs)
  let lastReportedEpoch = 0

  const showResultsView = () => {
    try {
      if (trainingPageIsActive) {
        changeTrainingDisplay(trainingPageIsActive, "results")
      } else {
        queueBackgroundResize()
      }
    } catch (_) {
      if (resultsTrainButton && !resultsTrainButton.classList.contains("active")) {
        resultsTrainButton.click()
      }
      queueBackgroundResize()
    }
  }

  const ensureResultsView = () => {
    if (resultsViewShown) return
    showResultsView()
    resultsViewShown = true
  }

  showResultsView()

  const handleProgressPayload = (payload) => {
    if (!payload || typeof payload !== "object") return
    if (payload.error) {
      throw new Error(payload.error)
    }

    const normalizedPayload = unwrapTrainingPayload(payload)
    if (!normalizedPayload || typeof normalizedPayload !== "object") {
      return
    }

    latestProgress = {
      ...(latestProgress || {}),
      ...normalizedPayload
    }

    const artifactCandidates = collectArtifacts(
      payload,
      payload?.payload,
      payload?.data,
      payload?.register,
      payload?.metrics,
      payload?.progress,
      normalizedPayload
    )
    if (Object.keys(artifactCandidates).length > 0) {
      latestArtifacts = {
        ...latestArtifacts,
        ...artifactCandidates
      }
    }

    ensureResultsView()
    updateTrainingMetrics(latestProgress)

    const epochCandidate = coerceEpochNumber(
      normalizedPayload.last_epoch ??
      normalizedPayload.current_epoch ??
      normalizedPayload.epoch ??
      normalizedPayload.progress_epoch ??
      normalizedPayload.step
    )

    const timeCandidate = normalizedPayload.training_time ?? normalizedPayload.elapsed_time ?? normalizedPayload.total_time

    if (epochCandidate !== null && Notiflix?.Loading?.change) {
      const epochSuffix = Number.isFinite(totalEpochs) && totalEpochs > 0
        ? `/${totalEpochs}`
        : ""
      Notiflix.Loading.change(`Entrenando la arquitectura... (época ${epochCandidate}${epochSuffix})`)
    } else if (timeCandidate !== undefined && Notiflix?.Loading?.change) {
      Notiflix.Loading.change(
        `Entrenando la arquitectura... (${normalizeValue(timeCandidate, { decimals: 2 })} s)`
      )
    }

    if (epochCandidate !== null) {
      const currentEpoch = epochCandidate
      latestProgress.last_epoch = currentEpoch
      if (currentEpoch !== lastReportedEpoch) {
        lastReportedEpoch = currentEpoch
        const denominator = Number.isFinite(totalEpochs) && totalEpochs > 0 ? totalEpochs : currentEpoch || 1
        const normalizedProgress = Math.max(0, Math.min(1, currentEpoch / denominator))
        if (typeof NProgress?.set === "function") {
          NProgress.set(normalizedProgress)
        }
      }
    }
  }

  try {
    const res = await fetch("/api/train", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trainingPayload)
    })

    if (!res.ok) {
      const fallbackText = await res.text().catch(() => "")
      throw new Error(
        `Solicitud fallida con código ${res.status}${fallbackText ? ` - ${fallbackText}` : ""}`
      )
    }

    const reader = res.body && res.body.getReader ? res.body.getReader() : null

    if (!reader) {
      const results = await res.json()
      ensureResultsView()
      showTrainingResultsAndDownload(results.register, results.pickle_url, results.image_url)
      Notiflix.Notify.success("Entrenamiento completado")
      return
    }

    const decoder = new TextDecoder("utf-8")
    let buffer = ""

    const handleStreamLine = (line) => {
      const trimmed = (line || "").trim()
      if (!trimmed) return

      const payloadText = trimmed.startsWith("data:")
        ? trimmed.slice(5).trim()
        : trimmed

      if (!payloadText) return

      try {
        const parsed = JSON.parse(payloadText)
        handleProgressPayload(parsed)
      } catch (err) {
        console.error("No se pudo analizar la línea del stream de entrenamiento:", payloadText, err)
      }
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value) continue

      buffer += decoder.decode(value, { stream: true })
      buffer = buffer.replace(/\r\n/g, "\n")

      const lines = buffer.split("\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        handleStreamLine(line)
      }
    }

    buffer += decoder.decode()
    buffer = buffer.replace(/\r\n/g, "\n")
    if (buffer.trim()) {
      handleStreamLine(buffer)
    }

    if (latestProgress) {
      ensureResultsView()
      const finalRegister = {
        training_iou: extractLatestValue(latestProgress.training_iou),
        validation_iou: extractLatestValue(latestProgress.validation_iou),
        training_time: latestProgress.training_time ?? latestProgress.elapsed_time ?? latestProgress.total_time,
        last_epoch: latestProgress.last_epoch ?? latestProgress.current_epoch ?? latestProgress.epoch
      }

      const resolvedPickleUrl = latestArtifacts.pickle_url ?? latestProgress.pickle_url
      const resolvedImageUrl = latestArtifacts.image_url ?? latestProgress.image_url

      if (resolvedPickleUrl) {
        showTrainingResultsAndDownload(finalRegister, resolvedPickleUrl, resolvedImageUrl)
      } else {
        updateTrainingMetrics(finalRegister)
        if (resolvedImageUrl) {
          const imageSegmentation = document.getElementById("image-trained-segmentation")
          downloadAndShowImage(resolvedImageUrl, imageSegmentation)
        }
      }

      Notiflix.Notify.success("Entrenamiento completado")
      if (typeof NProgress?.done === "function") {
        NProgress.done()
      }
    } else {
      Notiflix.Notify.info("Entrenamiento completado")
    }
  } catch (e) {
    console.error(e)
    Notiflix.Report.failure(
      "Error",
      "Ocurrió un error al procesar la petición",
      "De acuerdo"
    )
    downloadAndShowImage(null, imageSegmentation)
  } finally {
    Notiflix.Loading.remove()
    if (typeof NProgress?.done === "function") {
      NProgress.done()
    }
    // Redimensiona el fondo si es necesario
    queueBackgroundResize();
  }
}

/**
 * Cambia entre la vista de resultados y parámetros de búsqueda
 * @param {string} toActive Dice que contenedor se debe mostrar
 */
function changeTrainingDisplay(trainingIsActive, toActive) {
  if (toActive === "results" && trainingIsActive) {
    if (containerTrainResults) {
      containerTrainResults.style.display = "block"
    }
    if (containerTrainParameters) {
      containerTrainParameters.style.display = "none"
    }

    if (parametersButton) {
      parametersButton.classList.toggle("active")
    }
    if (resultsTrainButton) {
      resultsTrainButton.classList.toggle("active")
    }
    queueBackgroundResize();

    trainingPageIsActive = false
  } else if (toActive === "parameters" && !trainingIsActive) {
    if (containerTrainResults) {
      containerTrainResults.style.display = "none"
    }
    if (containerTrainParameters) {
      containerTrainParameters.style.display = "block"
    }

    if (parametersButton) {
      parametersButton.classList.toggle("active")
    }
    if (resultsTrainButton) {
      resultsTrainButton.classList.toggle("active")
    }
    queueBackgroundResize();

    trainingPageIsActive = true
  }
}

/**
 * Cambia entre las vistas de animación y grafica de convergencia
 * @param {string} toActive Dice el contenedor que debe mostrar
 */
function changeViewsNav(animationIsActive, toActive) {
  if (toActive === "animation" && !animationIsActive) {
    if (animation) {
      animation.style.display = "flex"
    }
    if (canvasChart) {
      canvasChart.style.display = "none"
    }

    if (navButtonArchitecture) {
      navButtonArchitecture.classList.toggle("active")
    }
    if (navButtonChart) {
      navButtonChart.classList.toggle("active")
    }
    queueBackgroundResize();

    animationPageIsActive = true
  } else if (toActive === "chart" && animationIsActive) {
    if (animation) {
      animation.style.display = "none"
    }
    if (canvasChart) {
      canvasChart.style.display = "block"
    }

    if (navButtonArchitecture) {
      navButtonArchitecture.classList.toggle("active")
    }
    if (navButtonChart) {
      navButtonChart.classList.toggle("active")
    }
    queueBackgroundResize();

    animationPageIsActive = false
  }
}

/**
 * Se ejecuta cuándo se seleccióna un archivo, carga el cromosoma en la sesión
 * @returns null 
 */
function loadFile() {
  if (fileChromosoma.files.length === 0) return;

  const file = fileChromosoma.files[0]
  const lector = new FileReader();

  lector.onload = (evento) => {
    try {
      const contenido = evento.target.result;
      const data = JSON.parse(contenido);

      // Acceder al cromosoma
      if ("real_codification" in data) {
        // Guarda en la sesión
        sessionStorage.setItem("best_chromosome", JSON.stringify(data, null, 2))
        // activa la descarga y el entrenamiento
        downloadButton.disabled = false
        trainingButton.disabled = false
      } else {
        console.error("No hay codificación")
        Notiflix.Report.failure(
          "Error",
          "El documento no tiene la codificación",
          "De acuerdo"
        )
      }
    } catch (e) {
      console.error(e)
      Notiflix.Report.failure(
        "Error",
        "Error al leer el JSON",
        "De acuerdo"
      )
    }
  }

  lector.readAsText(file)
}

/**
 * Detecta el cambio de algoritmo de búsqueda y muestra/oculta los parámetros de búsqueda correspondientes
 * (factor f o tasa de mutación)
 * @param {Object} event Evento
 */
function changeSearchParamsVisibility(event) {
  let algorithm = event.target.value;
    let f = document.getElementById("input-f-search");
    let mutation_rate = document.getElementById("input-mutation-rate");
    // si algoritmo == de entonces desactiva mutation_rate sino desactiva f
    if (algorithm === "de") {
      mutation_rate.style.display = "none";
      f.style.display = "block";
    } else {
      mutation_rate.style.display = "block";
      f.style.display = "none";
    }
}

let animationPageIsActive = true
let trainingPageIsActive = true
// ------------------- Reactions ----------------------
if (start_button) {
  start_button.addEventListener("click", () => startSearch())
}
if (downloadJsonButton) {
  downloadJsonButton.addEventListener("click", () => downloadJson())
}
if (trainingButton) {
  trainingButton.addEventListener("click", () => startTraining())
}
if (parametersButton) {
  parametersButton.addEventListener("click", () => changeTrainingDisplay(trainingPageIsActive, "parameters"))
}
if (resultsTrainButton) {
  resultsTrainButton.addEventListener("click", () => changeTrainingDisplay(trainingPageIsActive, "results"))
}
if (buttonLoadArchitecture && fileChromosoma) {
  buttonLoadArchitecture.addEventListener("click", () => fileChromosoma.click())
}
if (fileChromosoma) {
  fileChromosoma.addEventListener("change", () => loadFile())
}
if (navButtonArchitecture) {
  navButtonArchitecture.addEventListener("click", () => changeViewsNav(animationPageIsActive, "animation"))
}
if (navButtonChart) {
  navButtonChart.addEventListener("click", () => changeViewsNav(animationPageIsActive, "chart"))
}
if (downloadPklButton) {
  downloadPklButton.addEventListener("click", () => downloadPkl())
}
if (selectSearchAlgorithm) {
  selectSearchAlgorithm.addEventListener("change", (event) => changeSearchParamsVisibility(event));
}

// Eleva la tarjeta de resultados cuando su dropdown está abierto para evitar que quede oculta.
document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach((toggle) => {
  const targetCard = toggle.closest(".glass-card");
  if (!targetCard) return;
  toggle.addEventListener("show.bs.dropdown", () => {
    targetCard.classList.add("dropdown-open");
  });
  toggle.addEventListener("hide.bs.dropdown", () => {
    targetCard.classList.remove("dropdown-open");
  });
});


// Defaults
document.addEventListener("DOMContentLoaded", () => {
  (() => {
    loadChart();

    if (containerTrainResults) {
      containerTrainResults.style.display = "none";
    }
    if (canvasChart) {
      canvasChart.style.display = "none";
    }

    // Set initial search params visibility
    let f = document.getElementById("input-f-search");
    let mutation_rate = document.getElementById("input-mutation-rate");

    mutation_rate.style.display = "none";
    f.style.display = "block";

    // Resize
    queueBackgroundResize();
  })();
});

const startFormExports = {
  setupRange,
  normalizeValue,
  renderResults,
  loadChart,
  showArchitecture,
  startSearch,
  downloadJson,
  downloadPkl,
  downloadPklByName,
  downloadAndShowImage,
  showTrainingResultsAndDownload,
  startTraining,
  changeTrainingDisplay,
  changeViewsNav,
  loadFile
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = startFormExports
}

if (typeof window !== 'undefined') {
  window.startForm = startFormExports
}