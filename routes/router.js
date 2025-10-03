const router = require("express").Router()
const controller = require("./../controllers/logic.js")

router.get("/start", (req, res) => res.render("start"))

router.post("/api/search", controller.api_search)

module.exports = router;