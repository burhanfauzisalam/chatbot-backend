const express = require("express");
const controller = require("./controller");

const router = express.Router();

router.post("/chat", controller.askNewQuestion);

module.exports = router;
