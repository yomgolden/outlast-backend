const express = require("express");
const router = express.Router();

router.post("/telegram", async (req, res) => {

  try {

    const { id, username } = req.body;

    if (!id) {
      return res.status(400).json({
        message: "Telegram ID required"
      });
    }

    const user = {
      _id: id,
      username: username || "Player",
      gold: 1000,
      gems: 50,
      level: 1,
      xp: 0
    };

    res.json(user);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

module.exports = router;
