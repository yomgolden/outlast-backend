const express =
  require("express");

const router =
  express.Router();

const {
  simulateMatch
} = require(
  "../services/simulationEngine"
);

const activeEvents =
  require("../data/activeEvents");

/*
=====================================
START SIMULATION
=====================================
*/

router.post(
  "/:matchId/start",
  async (
    req,
    res
  ) => {

    try {

      const {
        matchId
      } = req.params;

      const match =
        activeEvents.find(
          e =>
            e.eventId ===
            matchId
        );

      if (!match) {

        return res
          .status(404)
          .json({
            error:
              "Match not found"
          });
      }

      /*
      ============================
      ALREADY RUNNING
      ============================
      */

      if (
        match.simulating
      ) {

        return res.json({
          started: true
        });
      }

      /*
      ============================
      LOCK
      ============================
      */

      match.simulating =
        true;

      /*
      ============================
      START IN BACKGROUND
      ============================
      */

      simulateMatch(
        matchId
      )
        .then(() => {

          console.log(
            "SIMULATION COMPLETE:",
            matchId
          );

          match.simulating =
            false;
        })
        .catch(err => {

          console.error(
            "SIMULATION ERROR:",
            err
          );

          match.simulating =
            false;
        });

      /*
      ============================
      INSTANT RESPONSE
      ============================
      */

      res.json({
        started: true
      });

    } catch (error) {

      console.error(
        error
      );

      res
        .status(500)
        .json({
          error:
            error.message
        });
    }
  }
);

/*
=====================================
GET FEED
=====================================
*/

router.get(
  "/:matchId/feed",
  (
    req,
    res
  ) => {

    const match =
      activeEvents.find(
        e =>
          e.eventId ===
          req.params.matchId
      );

    if (!match) {

      return res
        .status(404)
        .json({
          error:
            "Match not found"
        });
    }

    res.json({
      status:
        match.status,

      feed:
        match.feed || [],

      results:
        match.results || []
    });
  }
);

module.exports =
  router;
