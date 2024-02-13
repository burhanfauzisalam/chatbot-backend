const express = require("express");
const cors = require("cors");
const router = require("./router");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use("/", router);

app.listen(port, () => {
  console.log(`Chatbot is online on port ${port}`);
});
