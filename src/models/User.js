const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true
  },

  username: {
    type: String,
    default: "Player"
  },

  gold: {
    type: Number,
    default: 500
  },

  gems: {
    type: Number,
    default: 0
  },

  level: {
    type: Number,
    default: 1
  },

  xp: {
    type: Number,
    default: 0
  },

  playstyle: {
    type: String,
    enum: ["AGGRESSIVE", "DEFENSIVE", "STEALTH", "BALANCED"],
    default: "BALANCED"
  },

  equippedTools: [{
    type: String
  }],

  createdAt: {
    type: Date,
    default: Date.now
  },

  lastActive: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);
