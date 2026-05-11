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

    res.json({
      matchId: "match_" + Date.now(),
      status: "QUEUE",
      currentRound: 1,
      totalRounds: 3,
      players: [
        {
          userId,
          alive: true
        }
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
MATCH STATUS
========================================
*/

router.get("/:matchId/status", async (req, res) => {

  try {

    const now = Date.now();

    const phase = Math.floor(now / 5000) % 3;

    let status = "QUEUE";

    if (phase === 1) {
      status = "STARTED";
    }

    if (phase === 2) {
      status = "ENDED";
    }

    res.json({
      matchId: req.params.matchId,
      status,
      round: phase + 1,
      alivePlayers:
        status === "ENDED"
          ? [
              { userId: "Shadow" }
            ]
          : [
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
