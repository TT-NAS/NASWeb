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

/**
 * Recibe el cromosoma y hace una petición al api para obtener su binario y lo manda al front
 * @param {Object} req Cromosoma en formato real
 * @param {*} res 
 * @returns Binario pkl
 */
actions.api_get_pkl = async (req, res) => {
  try {
    const body = req.body;
    console.log(body)
    const response = await fetch(`${API_URL}/download-model`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    if (!response.ok) {
      throw new Error(`Solicitud fallida con código ${response.status}`)
    }
    // Lee el archivo como binario
    const buffer = await response.arrayBuffer();

    // Configura la respuesta HTTP para descarga
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", 'attachment; filename="model.pkl"');

    // Envía el binario al cliente (front)
    return res.send(Buffer.from(buffer));
  } catch (e) {
    console.error(e)
    return res.status(500).json({error: "Error al intentar obtener el documento .pkl"})
  }
}

module.exports = actions;