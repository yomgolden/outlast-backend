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

      /*
      =====================================
      FIND MATCH
      =====================================
      */

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
      =====================================
      ALREADY RUNNING
      =====================================
      */

      if (
        match.simulating
      ) {

        return res.json({
          started: true
        });
      }

      /*
      =====================================
      ALREADY ENDED
      =====================================
      */

      if (
        match.status ===
        "ENDED"
      ) {

        return res.json({
          started: false,
          ended: true
        });
      }

      /*
      =====================================
      LOCK MATCH
      =====================================
      */

      match.simulating =
        true;

      /*
      =====================================
      START BACKGROUND SIMULATION
      =====================================
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

          match.status =
            "ERROR";
        });

      /*
      =====================================
      INSTANT RESPONSE
      =====================================
      */

      res.json({
        started: true
      });

    } catch (error) {

      console.error(
        "START ROUTE ERROR:",
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
GET LIVE FEED
=====================================
*/

router.get(
  "/:matchId/feed",
  (
    req,
    res
  ) => {

    try {

      const match =
        activeEvents.find(
          e =>
            e.eventId ===
            req.params.matchId
        );

      /*
      =====================================
      MATCH NOT FOUND
      =====================================
      */

      if (!match) {

        return res
          .status(404)
          .json({
            error:
              "Match not found"
          });
      }

      /*
      =====================================
      RETURN LIVE DATA
      =====================================
      */

      res.json({

        status:
          match.status,

        simulating:
          match.simulating || false,

        currentRound:
          match.currentRound || 1,

        playerCount:
          match.players?.length || 0,

        feed:
          match.feed || [],

        results:
          match.results || []
      });

    } catch (error) {

      console.error(
        "FEED ROUTE ERROR:",
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

module.exports =
  router;
