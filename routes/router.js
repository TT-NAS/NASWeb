const router = require("express").Router()

router.get("/start", (req, res) => res.render("start"))

module.exports = router;