const express = require("express");

const router = express.Router();

const User = require("../models/User");

router.post("/telegram", async (req, res) => {

  try {

    const {
      telegramId,
      username
    } = req.body;

    let user =
      await User.findOne({
        telegramId
      });

    if (!user) {

      user =
        await User.create({

          telegramId,

          username,

          gold: 1000,

          gems: 0,

          xp: 0,

          level: 1,

          playstyle: "BALANCED",

          equippedTools: []

        });
    }

    res.json(user);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;
