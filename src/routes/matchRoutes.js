const express = require("express");

const router = express.Router();

/*
========================================
JOIN MATCH
========================================
*/

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

/*
========================================
MATCH STATUS
========================================
*/

router.get("/:matchId/status", async (req, res) => {

  try {

    const now = Date.now();

    let status = "QUEUE";

    if (now % 3 === 0) {

      status = "ENDED";

    } else if (now % 2 === 0) {

      status = "STARTED";
    }

    res.json({
      matchId: req.params.matchId,
      status,
      round: Math.floor(Math.random() * 6) + 1,
      alivePlayers: [
        { userId: "Shadow" },
        { userId: "Nova" },
        { userId: "Viper" }
      ]
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

/*
========================================
MATCH FEED
========================================
*/

router.get("/:matchId/feed", async (req, res) => {

  try {

    res.json([
      {
        message: "ROUND 1 STARTED"
      },
      {
        message: "Shadow attacked Nova"
      },
      {
        message: "Nova defended successfully"
      },
      {
        message: "Viper disappeared into the shadows"
      },
      {
        message: "3 players eliminated this round"
      },
      {
        message: "ROUND 2 STARTED"
      },
      {
        message: "Shadow attacked Viper"
      },
      {
        message: "Viper failed to survive the round"
      },
      {
        message: "ONLY 1 PLAYER REMAINS"
      }
    ]);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

/*
========================================
MATCH RESULTS
========================================
*/

router.post("/:matchId/result", async (req, res) => {

  try {

    res.json({
      results: [
        {
          player: "Shadow",
          placement: 1,
          goldEarned: 300,
          xpEarned: 100
        },
        {
          player: "Nova",
          placement: 2,
          goldEarned: 200,
          xpEarned: 80
        },
        {
          player: "Viper",
          placement: 3,
          goldEarned: 100,
          xpEarned: 60
        }
      ]
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

module.exports = router;
