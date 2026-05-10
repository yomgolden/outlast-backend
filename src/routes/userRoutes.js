const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Tool = require("../models/Tool");

router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    res.json(user);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

router.post("/:userId/equip", async (req, res) => {
  try {
    const { tools } = req.body;

    const user = await User.findById(req.params.userId);

    const selectedTools = await Tool.find({
      name: { $in: tools }
    });

    const totalCost = selectedTools.reduce(
      (acc, tool) => acc + tool.cost,
      0
    );

    if (user.gold < totalCost) {
      return res.status(400).json({
        error: "Not enough gold"
      });
    }

    user.gold -= totalCost;

    user.equippedTools = tools;

    await user.save();

    res.json({
      loadout: user.equippedTools,
      remainingGold: user.gold
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;
