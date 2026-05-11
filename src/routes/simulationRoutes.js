const express = require("express");

const router = express.Router();

const {
  simulateMatch
} = require("../services/simulationEngine");

router.post("/:matchId/simulate", async (req, res) => {

  try {

    const results = await simulateMatch(
      req.params.matchId
    );

    res.json(results);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;
