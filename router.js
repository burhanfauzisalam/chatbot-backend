const express = require("express");
const controller = require("./controller");

const router = express.Router();

router.get("/try", controller.try);
router.post("/chat", controller.askNewQuestion);

module.exports = router;
