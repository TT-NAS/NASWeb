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

module.exports = actions;