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
  if (input && output) {
    output.textContent = input.value;
    input.addEventListener("input", () => {
      output.textContent = input.value;
    });
  }
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
// download
const downloadButton = document.getElementById("button-download")
const downloadJsonButton = document.getElementById("a-download-json")
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
const renderResults = (payload = {}) => {
  const metrics = {
    iou:
      payload?.results?.predicted_iou ??
      payload?.iou ??
      payload?.metrics?.iou ??
      payload?.result?.iou,
    search_time:
      payload?.results?.search_time ??
      payload?.search_time ??
      payload?.metrics?.search_time ??
      payload?.result?.search_time,
    generation:
      payload?.results?.stop_gen ??
      payload?.generation ??
      payload?.metrics?.generation ??
      payload?.result?.generation,
    stop_reason:
      payload?.results?.stop_reason ??
      payload?.stop_reason ??
      payload?.metrics?.stop_reason ??
      payload?.result?.stop_reason
  }

  if (resultIou) {
    resultIou.textContent = normalizeValue(metrics.iou, { decimals: 4 })
  }
  if (resultSearchTime) {
    resultSearchTime.textContent = normalizeValue(metrics.search_time, { decimals: 2 })
  }
  if (resultGeneration) {
    resultGeneration.textContent = normalizeValue(metrics.generation)
  }
  if (resultStopReason) {
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

  window.dispatchEvent(new Event('resize'));
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
 * Recoge los parámetros del formulario, inicia la búsqueda en el backend y actualiza los resultados mostrados.
 * Gestiona estados de carga y errores para ofrecer retroalimentación al usuario.
 */
const startSearch = async () => {
  // Obtener valores de los inputs
  const population_size = document.getElementById("range-population-size");
  const f = document.getElementById("range-f");
  const crossover_rate = document.getElementById("range-crossover");
  const mutation_rate = document.getElementById("range-mutation");
  const generations = document.getElementById("range-generations");
  const train_final_arch = document.getElementById("checkbox");
  
  const body = {
    population_size: population_size.value,
    f: f.value,
    crossover_rate: crossover_rate.value,
    mutation_rate: mutation_rate.value,
    generations: generations.value,
    train_final_arch: Boolean(train_final_arch?.checked)
  }
  // Muestra el cargando
  Notiflix.Loading.pulse("Buscando la mejor arquitectura...");
  // Muestra el cambio de arquitecturas
  startLoop()
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
    const data = await response.json();
    // Muestra los resultados
    renderResults(data)
    console.log(data);
    // Muestra la gráfica
    navButtonChart.click()
    loadChart(data.results.vector)
    // Guarda el cromosoma en la sesión
    sessionStorage.setItem("best_chromosome", JSON.stringify(data.results, null, 2))
    // activa la descarga y el entrenamiento
    downloadButton.disabled = false
    trainingButton.disabled = false
    // Detiene la animación de arquitecturas
    stopLoop()
    // Muestra la arquitectura
    showArchitecture()
  } catch (e) {
    console.error(e)
    Notiflix.Report.failure(
      "Error",
      "Ocurrió un error al procesar la petición",
      "De acuerdo"
    )
    renderResults()
  } finally {
    Notiflix.Loading.remove();
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
 * Muestra los resultados del entrenamiento en contenedor
 * @param {Object} results Resultados del entrenamiento de la arquitectura
 */
function showTrainingResults(results) {
  const iou_train = document.getElementById("result-train-iou")
  const iou_val = document.getElementById("result-train-iou_val")
  const time = document.getElementById("result-train-time")
  const epoch = document.getElementById("result-train-epoch")

  iou_train.textContent = normalizeValue(results?.training_iou ?? "Error de carga", {decimals: 4});
  iou_val.textContent = normalizeValue(results?.validation_iou ?? "Error de carga", {decimals: 4});
  time.textContent = normalizeValue(results?.training_time ?? "Error de carga", {decimals: 4});
  epoch.textContent = normalizeValue(results?.last_epoch ?? "Error de carga");

  resultsTrainButton.click();
}

async function startTraining() {
  // toma los valores de los input
  const data_loader = document.getElementById("select-dataset").value
  const dataset_len = document.getElementById("number-dataset-size").value
  const epochs = document.getElementById("number-epochs").value
  const chromosome = JSON.parse(sessionStorage.getItem("best_chromosome")).real_codification
  // Muestra el cargando
  Notiflix.Loading.dots("Entrenando la arquitectura arquitectura...");
  try {
    // Envía la petición al servidor
    const res = await fetch("/api/train", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data_loader,
        dataset_len,
        epochs,
        chromosome
      })
    })
    if (!res.ok) {
      throw new Error(`Solicitud fallida con código ${res.status}`)
    }
    const results = await res.json()
    // muestra los resultados
    showTrainingResults(results)
    console.log(results)
  } catch (e) {
    console.error(e)
    Notiflix.Report.failure(
      "Error",
      "Ocurrió un error al procesar la petición",
      "De acuerdo"
    )
  } finally {
    Notiflix.Loading.remove();
  }
}

/**
 * Cambia entre la vista de resultados y parámetros de búsqueda
 * @param {string} toActive Dice que contenedor se debe mostrar
 */
function changeTrainingDisplay(toActive) {
  if (toActive === "results") {
    containerTrainResults.style.display = "block"
    containerTrainParameters.style.display = "none"
  } else if (toActive === "parameters") {
    containerTrainResults.style.display = "none"
    containerTrainParameters.style.display = "block"
  }
  parametersButton.classList.toggle("active")
  resultsTrainButton.classList.toggle("active")
  window.dispatchEvent(new Event('resize'));
}

/**
 * Cambia entre las vistas de animación y grafica de convergencia
 * @param {string} toActive Dice el contenedor que debe mostrar
 */
function changeViewsNav(toActive) {
  if (toActive === "animation") {
    animation.style.display = "flex"
    canvasChart.style.display = "none"
  } else if (toActive === "chart") {
    animation.style.display = "none"
    canvasChart.style.display = "block"
  }
  navButtonArchitecture.classList.toggle("active")
  navButtonChart.classList.toggle("active")
  window.dispatchEvent(new Event('resize'));
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

// Reactions
start_button.addEventListener("click", () => startSearch())
downloadJsonButton.addEventListener("click", () => downloadJson())
trainingButton.addEventListener("click", () => startTraining())
parametersButton.addEventListener("click", () => changeTrainingDisplay("parameters"))
resultsTrainButton.addEventListener("click", () => changeTrainingDisplay("results"))
buttonLoadArchitecture.addEventListener("click", () => fileChromosoma.click())
fileChromosoma.addEventListener("change", () => loadFile())
navButtonArchitecture.addEventListener("click", () => changeViewsNav("animation"))
navButtonChart.addEventListener("click", () => changeViewsNav("chart"))

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

    containerTrainResults.style.display = "none";
    canvasChart.style.display = "none";

    // Resize
    window.dispatchEvent(new Event('resize'));
  })();
});