const express =
  require("express");

const router =
  express.Router();

/*
=====================================
IMPORT ENGINE
=====================================
*/

const simulationEngine =
  require(
    "../services/simulationEngine"
  );

const activeEvents =
  require(
    "../data/activeEvents"
  );

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
      MATCH ALREADY ENDED
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

      match.status =
        "STARTING";

      /*
      =====================================
      START IN BACKGROUND
      =====================================
      */

      simulationEngine
        .simulateMatch(
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
      RETURN IMMEDIATELY
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
      NOT FOUND
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
          match.status ||

          "WAITING",

        simulating:
          match.simulating ||
          false,

        currentRound:
          match.currentRound ||
          1,

        playerCount:
          match.players
            ?.length || 0,

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
