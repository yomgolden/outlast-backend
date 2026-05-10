const express = require("express");
const router = express.Router();

const Leaderboard = require("../models/Leaderboard");

router.get("/", async (req, res) => {
  try {
    const leaderboard = await Leaderboard
      .find()
      .sort({ rank: 1 })
      .limit(100);

    res.json(leaderboard);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;
