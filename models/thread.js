const mongoose = require("mongoose");

const threadID = new mongoose.Schema({
  threadID: {
    type: String,
  },
});

module.exports = mongoose.model("thread", threadID);
