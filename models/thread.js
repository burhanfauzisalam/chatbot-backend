const mongoose = require("mongoose");

const threadID = new mongoose.Schema({
  threadID: {
    type: String,
    unique: true,
  },
  dateCreated: {
    type: Date,
  },
});

module.exports = mongoose.model("thread", threadID);
