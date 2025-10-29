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
app.use((req, res) => {
  res.status(404);
  res.send("Error 404 :(")
})

// Start server
app.listen(app.get("port"), () => {
  console.log('listen on port: ', app.get('port'));
})