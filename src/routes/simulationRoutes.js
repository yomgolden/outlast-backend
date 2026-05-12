const express = require("express");
const router = express.Router();
const { simulateMatch } = require("../services/simulationEngine");
const activeEvents = require("../data/activeEvents");

router.post("/:matchId/start", async (req, res) => {
  try {
    const { matchId } = req.params;

    console.log("START CALLED:", matchId);
    console.log("ACTIVE EVENTS:", activeEvents.map(e => e.eventId));

    const match = activeEvents.find(e => e.eventId === matchId);

    if (!match) {
      console.log("MATCH NOT FOUND:", matchId);
      return res.status(404).json({ error: "Match not found" });
    }

    if (match.simulating) {
      return res.json({ started: true });
    }

    if (match.status === "ENDED") {
      return res.json({ started: false, ended: true });
    }

    match.simulating = true;

    simulateMatch(matchId)
      .then(() => {
        console.log("SIMULATION COMPLETE:", matchId);
        match.simulating = false;
      })
      .catch(err => {
        console.error("SIMULATION ERROR:", err);
        match.simulating = false;
        match.status = "ERROR";
      });

    res.json({ started: true });

  } catch (error) {
    console.error("START ROUTE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:matchId/feed", (req, res) => {
  try {
    const match = activeEvents.find(
      e => e.eventId === req.params.matchId
    );

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    res.json({
      status: match.status || "WAITING",
      simulating: match.simulating || false,
      currentRound: match.currentRound || 1,
      aliveCount: match.players?.filter(p => p.alive).length || 0,
      feed: match.feed || [],
      results: match.finalResults || []
    });

  } catch (error) {
    console.error("FEED ROUTE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
