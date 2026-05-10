const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  players: [{
    userId: String,
    username: String,
    bot: {
      type: Boolean,
      default: false
    },
    alive: {
      type: Boolean,
      default: true
    }
  }],

  status: {
    type: String,
    enum: ["QUEUE", "STARTED", "ENDED"],
    default: "QUEUE"
  },

  currentRound: {
    type: Number,
    default: 0
  },

  totalRounds: {
    type: Number,
    default: 6
  },

  eliminations: [{
    round: Number,
    eliminatedPlayer: String
  }],

  feed: [{
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],

  rewards: {
    first: Number,
    second: Number,
    third: Number
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  startedAt: Date,

  endedAt: Date
});

module.exports = mongoose.model("Match", matchSchema);
