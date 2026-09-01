/**
 * @module controllers/logic
 * @file controllers/logic.js
 * Controller actions for handling API requests.
 */

const actions = {};
const API_URL = "http://35.209.225.231/:8000"; // El firewall bloquea peticiones que no son de la web
const TRAINING_FETCH_TIMEOUT_MS = 40 * 60 * 1000;
const { Agent } = require("undici");

// Importar funciones de validación
const {
  runValidation,
  reportValidationErrors,
  validateSearchParams,
  validateTrainingParams,
  validateChromosome,
} = require("./validationData");

/**
 * Hace la petición al api para iniciar la búsqueda
 * @param {*} req
 * @param {*} res
 */
actions.api_search = async (req, res) => {
  try {
    const body = req.body;
    // agregar validación
    const validation = await runValidation(validateSearchParams, body);
    if (!validation.isValid) {
      console.error("Errores de validación en api_search:", validation.errors);
      // devolver errores al cliente con 400
      return res
        .status(400)
        .json({ error: "Validation failed", details: validation.errors });
    }

    const response = await fetch(`${API_URL}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Solicitud fallida con código ${response.status}`);
    }

    // Configurar la respuesta como stream hacia el front
    res.status(200);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    // Leer el stream de datos del API y reenviarlo al front en tiempo real
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Procesar líneas completas
      let lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Guardar la última línea incompleta
      for (const line of lines) {
        if (!line.trim()) continue; // Saltar líneas vacías
        try {
          const obj = JSON.parse(line);
          console.log("Datos recibidos del API:", obj);
          res.write(`${JSON.stringify(obj)}\n`);
        } catch (err) {
          console.error("Error al procesar la línea del API:", line, err);
          res.write(`${line}\n`);
        }
      }
    }

    if (buffer.trim()) {
      try {
        const remaining = JSON.parse(buffer);
        console.log("Datos recibidos del API:", remaining);
        res.write(`${JSON.stringify(remaining)}\n`);
      } catch (err) {
        console.error("Error al procesar la línea final del API:", buffer, err);
        res.write(`${buffer}\n`);
      }
    }
    console.log("Transmisión completada del API.");

    return res.end();
  } catch (e) {
    console.error("Error al intentar iniciar la búsqueda\n", e);
    if (res.headersSent && !res.writableEnded) {
      res.write(
        `${JSON.stringify({ error: "Error al intentar iniciar la búsqueda" })}\n`,
      );
      return res.end();
    }
    return res
      .status(500)
      .json({ error: "Error al intentar iniciar la búsqueda" });
  }
};

/**
 * Hace la petición al API entrenar el cromosoma
 * @param {Object} req {chromosome, data_loader, dataset_len, epochs}
 * @param {*} res
 */
actions.api_train = async (req, res) => {
  try {
    const body = req.body;
    // agregar validación
    const validation = await runValidation(validateTrainingParams, body);
    if (!validation.isValid) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: validation.errors });
    }

    const agent = new Agent({ headersTimeout: 0, bodyTimeout: 0 });
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      TRAINING_FETCH_TIMEOUT_MS,
    );

    let response;
    try {
      response = await fetch(`${API_URL}/train`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
        dispatcher: agent,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const fallback = await response.text().catch(() => "");
      throw new Error(
        `Solicitud fallida con código ${response.status}${fallback ? ` - ${fallback}` : ""}`,
      );
    }

    res.status(200);
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("X-Accel-Buffering", "no");
    if (typeof res.flushHeaders === "function") {
      res.flushHeaders();
    }

    const reader =
      response.body && response.body.getReader
        ? response.body.getReader()
        : null;

    if (!reader) {
      const fallback = await response.text().catch(() => "");
      if (fallback) {
        res.write(fallback);
      }
      return res.end();
    }

    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    const forwardEvent = (rawEvent) => {
      const trimmed = rawEvent.trim();
      if (!trimmed) return;

      let payload;
      if (trimmed.startsWith("data:")) {
        payload = trimmed;
      } else if (trimmed.startsWith(":")) {
        payload = trimmed;
      } else {
        payload = `data: ${trimmed}`;
      }
      res.write(`${payload}\n\n`);
      if (typeof res.flush === "function") {
        res.flush();
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      buffer += decoder.decode(value, { stream: true });
      buffer = buffer.replace(/\r\n/g, "\n");

      let delimiterIndex = buffer.indexOf("\n\n");
      while (delimiterIndex !== -1) {
        const rawEvent = buffer.slice(0, delimiterIndex);
        buffer = buffer.slice(delimiterIndex + 2);
        forwardEvent(rawEvent);
        delimiterIndex = buffer.indexOf("\n\n");
      }
    }

    buffer += decoder.decode();
    buffer = buffer.replace(/\r\n/g, "\n");
    if (buffer.trim()) {
      forwardEvent(buffer);
    }

    return res.end();
  } catch (e) {
    console.error("Error al intentar entrenar la arquitectura\n", e);
    if (res.headersSent && !res.writableEnded) {
      res.write(
        `data: ${JSON.stringify({ error: "Error al intentar entrenar la arquitectura" })}\n\n`,
      );
      return res.end();
    }
    return res
      .status(500)
      .json({ error: "Error al intentar entrenar la arquitectura" });
  }
};

/**
 * Transforma el cromosoma a formato JSON
 * @param {Object} req Chromosome
 * @param {*} res
 * @returns Cromosoma en formato JSON
 */
actions.api_json = async (req, res) => {
  try {
    const body = req.body;
    // agregar validación
    const validation = await runValidation(validateChromosome, body);
    if (!validation.isValid) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: validation.errors });
    }

    const response = await fetch(`${API_URL}/json`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Solicitud fallida con código ${response.status}`);
    }
    const results = await response.json();
    return res.json(results);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Error al intentar convertir el cromosoma a JSON" });
  }
};

/**
 * Recibe el cromosoma y hace una petición al api para obtener su binario y lo manda al front
 * @param {Object} req Cromosoma en formato real
 * @param {*} res
 * @returns Binario pkl
 */
actions.api_get_pkl = async (req, res) => {
  try {
    const body = req.body;
    // agregar validación
    const validation = await runValidation(validateChromosome, body);
    if (!validation.isValid) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: validation.errors });
    }

    const response = await fetch(`${API_URL}/download-model`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Solicitud fallida con código ${response.status}`);
    }
    // Lee el archivo como binario
    const buffer = await response.arrayBuffer();

    // Configura la respuesta HTTP para descarga
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", 'attachment; filename="model.pkl"');

    // Envía el binario al cliente (front)
    return res.send(Buffer.from(buffer));
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: "Error al intentar obtener el documento .pkl" });
  }
};

/**
 * Recibe la url a la cuál hacer la petición para descarga el ardhivo
 * @param {Object} req URL de descarga
 * @param {*} res
 * @returns Binario pkl
 */
actions.api_get_pkl_by_name = async (req, res) => {
  try {
    const { name } = req.params;
    const response = await fetch(`${API_URL}/download/${name}`);

    if (!response.ok) {
      throw new Error(`Error al descargar modelo: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();

    // Enviar al front
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${name}.pkl"`);
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al descargar el archivo .pkl" });
  }
};

actions.api_get_training_image = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "URL de imagen inválida" });
    }

    const response = await fetch(`${API_URL}/image_results/${url}`);

    if (!response.ok) {
      throw new Error(`Error al descargar imagen: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/png";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al descargar la imagen del entrenamiento" });
  }
};

module.exports = actions;
