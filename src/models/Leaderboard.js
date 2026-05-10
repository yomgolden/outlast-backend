const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema({
  userId: String,

  rank: {
    type: Number,
    default: 0
  },

  wins: {
    type: Number,
    default: 0
  },

  topPlacements: {
    type: Number,
    default: 0
  },

  totalMatches: {
    type: Number,
    default: 0
  },

  goldEarned: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Leaderboard", leaderboardSchema);
