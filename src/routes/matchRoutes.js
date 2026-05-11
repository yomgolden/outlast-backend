const express = require("express");
const router = express.Router();

const Match = require("../models/Match");
const User = require("../models/User");

const { joinQueue } = require("../services/matchmaker");

router.post("/join", async (req, res) => {

  try {

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID required"
      });
    }

    const match = {
      matchId: "match_" + Date.now(),
      status: "QUEUE",
      currentRound: 0,
      totalRounds: 6,
      players: [
        {
          userId,
          alive: true
        }
      ]
    };

    res.json(match);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

router.get("/:matchId/status", async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);

    const alivePlayers = match.players.filter(p => p.alive);

    res.json({
      round: match.currentRound,
      status: match.status,
      alivePlayers,
      eliminations: match.eliminations
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

router.get("/:matchId/feed", async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);

    res.json(match.feed);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

router.post("/:matchId/result", async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);

    res.json({
      status: match.status,
      rewards: match.rewards,
      eliminations: match.eliminations
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;
