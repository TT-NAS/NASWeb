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
const API_URL = "http://127.0.0.1:3000"
const start_button = document.getElementById("button-start")
const resultIou = document.getElementById("result-iou")
const resultSearchTime = document.getElementById("result-search-time")
const resultGeneration = document.getElementById("result-generation")
const resultStopReason = document.getElementById("result-stop-reason")

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

// Functions
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
  try {
    // Envía los valores al back
    const response = await fetch(`${API_URL}/api/search`, {
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


// Reactions
start_button.addEventListener("click", () => startSearch())