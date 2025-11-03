const express = require("express");
const morgan = require("morgan");
const path = require("path")

app = express();

// Config
app.set("port", process.env.PORT || 3000)
app.set("view engine", 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))
app.use("/js", express.static(path.join(__dirname, "node_modules/notiflix/dist")))
app.use("/js", express.static(path.join(__dirname, "node_modules/animejs/dist")))
app.use("/js", express.static(path.join(__dirname, "node_modules/leader-line")))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(morgan('dev'))

// Routes
const router = require("./routes/router.js")
app.use(router)
app.get("/", (req, res) => {
  res.render("home")
})

// Errors
// 404 handler -> renderizar página de error
app.use((req, res) => {
  res.status(404)
  res.render('error', { status: 404, message: 'Página no encontrada' })
})

// Error handler -> captura errores internos y muestra la vista de error
app.use((err, req, res, next) => {
  console.error(err)
  const status = err.status || 500
  const message = err.message || 'Error interno del servidor'
  res.status(status)
  // Si la petición es JSON (API), devolver JSON
  if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
    return res.json({ error: message })
  }
  res.render('error', { status, message })
})

// Start server
app.listen(app.get("port"), () => {
  console.log('listen on port: ', app.get('port'));
})