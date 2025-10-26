const router = require("express").Router()
const controller = require("./../controllers/logic.js")

router.get("/start", (req, res) => res.render("start"))

router.post("/api/search", controller.api_search)

router.post("/api/train", controller.api_train)

router.post("/api/json", controller.api_json)

module.exports = router;