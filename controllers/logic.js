const actions = {}
const API_URL = "http://127.0.0.1:8000"

/**
 * Hace la petición al api para iniciar la búsqueda
 * @param {*} req 
 * @param {*} res 
 */
actions.api_search = async (req, res) => {
  try {
    const body = req.body
    // agregar validación
    const response = await fetch(`${API_URL}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    const data = await response.json()
    return res.json(data)
  } catch(e) {
    console.error("Error al intentar iniciar la búsqueda\n", e)
    return res.status(500).json({error: "Error al intentar iniciar la búsqueda"})
  }
}

/**
 * Hace la petición al API entrenar el cromosoma
 * @param {Object} req {chromosome, data_loader, dataset_len, epochs}
 * @param {*} res 
 */
actions.api_train = async (req, res) => {
  try {
    const body = req.body;
    const response = await fetch(
      `${API_URL}/train`,
      {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    )
    if (!response.ok) {
      throw new Error(`Solicitud fallida con código ${response.status}`)
    }
    const results = await response.json()
    return res.json(results)
  } catch (e) {
    console.error("Error al intentar entrenar la arquitectura\n", e)
    return res.status(500).json({error: "Error al intentar entrenar la arquitectura"})
  }
}

/**
 * Transforma el cromosoma a formato JSON
 * @param {Object} req Chromosome
 * @param {*} res 
 * @returns Cromosoma en formato JSON
 */
actions.api_json = async (req, res) => {
  try {
    const body = req.body;
    const response = await fetch(`${API_URL}/json`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    if (!response.ok) {
      throw new Error(`Solicitud fallida con código ${response.status}`)
    }
    const results = await response.json()
    return res.json(results)
  } catch (err) {
    console.error(err)
    return res.status(500).json({error: "Error al intentar convertir el cromosoma a JSON"})
  }
}

module.exports = actions;