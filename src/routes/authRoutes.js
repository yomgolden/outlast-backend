const express = require("express");
const router = express.Router();

const authenticateTelegram = require("../services/telegramAuth");

router.post("/telegram", async (req, res) => {
  try {
    const user = await authenticateTelegram(req.body);

    res.json(user);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;
