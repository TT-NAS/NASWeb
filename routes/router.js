const router = require("express").Router()
const controller = require("./../controllers/logic.js")

router.get("/start", (req, res) => res.render("start"))

router.post("/api/search", controller.api_search)

router.post("/api/train", controller.api_train)

router.post("/api/json", controller.api_json)

router.post("/api/download/pkl", controller.api_get_pkl)

router.get("/api/download/pkl-url/:name", controller.api_get_pkl_by_name)

router.get("/api/download/image", controller.api_get_training_image)

module.exports = router;