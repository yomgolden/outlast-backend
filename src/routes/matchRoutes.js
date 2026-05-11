const express = require("express");

const router = express.Router();

const activeEvents =
  require("../data/activeEvents");

const THEMES = [
  {
    name: "Mushin Nightmare",
    danger: "HIGH",
    location: "Mushin"
  },
  {
    name: "Blackout in Yaba",
    danger: "EXTREME",
    location: "Yaba"
  },
  {
    name: "Flood Escape",
    danger: "HIGH",
    location: "Makoko"
  },
  {
    name: "Ajegunle Chaos",
    danger: "MEDIUM",
    location: "Ajegunle"
  },
  {
    name: "The Last Danfo",
    danger: "HIGH",
    location: "Lagos Island"
  }
];

const randomTheme = () => {

  return THEMES[
    Math.floor(
      Math.random() *
      THEMES.length
    )
  ];
};

/*
========================================
GET ACTIVE EVENTS
========================================
*/

router.get("/events", async (req, res) => {

  try {

    const now = Date.now();

    const updated =
      activeEvents.map(event => {

        const remaining =
          Math.max(
            0,
            Math.floor(
              (
                event.startsAt - now
              ) / 1000
            )
          );

        if (
          remaining <= 0 ||
          event.players.length >=
          event.maxPlayers
        ) {

          event.status =
            "STARTED";
        }

        return {
          ...event,
          countdown:
            remaining
        };
      });

    res.json(updated);

  } catch (error) {

    res.status(500).json({
      message:
        error.message
    });
  }
});

/*
========================================
CREATE EVENT
========================================
*/

router.post("/create", async (req, res) => {

  try {

    const {
      userId,
      username
    } = req.body;

    if (!userId) {

      return res.status(400)
        .json({
          message:
            "User ID required"
        });
    }

    const waitingEvents =
      activeEvents.filter(
        event =>
          event.status ===
          "WAITING"
      );

    if (
      waitingEvents.length >= 3
    ) {

      return res.status(400)
        .json({
          message:
            "Too many active events"
        });
    }

    const theme =
      randomTheme();

    const event = {

      eventId:
        "event_" +
        Date.now(),

      host:
        username ||
        "Player",

      status:
        "WAITING",

      theme:
        theme.name,

      location:
        theme.location,

      danger:
        theme.danger,

      maxPlayers: 20,

      players: [
        {
          userId,
          username:
            username ||
            "Player",
          alive: true
        }
      ],

      startsAt:
        Date.now() + 60000
    };

    activeEvents.push(
      event
    );

    res.json(event);

  } catch (error) {

    res.status(500).json({
      message:
        error.message
    });
  }
});

/*
========================================
JOIN EVENT
========================================
*/

router.post("/join", async (req, res) => {

  try {

    const {
      eventId,
      userId,
      username
    } = req.body;

    const event =
      activeEvents.find(
        e =>
          e.eventId ===
          eventId
      );

    if (!event) {

      return res.status(404)
        .json({
          message:
            "Event not found"
        });
    }

    if (
      event.status !==
      "WAITING"
    ) {

      return res.status(400)
        .json({
          message:
            "Match already started"
        });
    }

    const exists =
      event.players.find(
        p =>
          p.userId ===
          userId
      );

    if (!exists) {

      event.players.push({
        userId,
        username:
          username ||
          "Player",
        alive: true
      });
    }

    /*
    AUTO START WHEN FULL
    */

    if (
      event.players.length >=
      event.maxPlayers
    ) {

      event.status =
        "STARTED";
    }

    res.json(event);

  } catch (error) {

    res.status(500).json({
      message:
        error.message
    });
  }
});

/*
========================================
EVENT STATUS
========================================
*/

router.get(
  "/:eventId/status",
  async (req, res) => {

    try {

      const event =
        activeEvents.find(
          e =>
            e.eventId ===
            req.params.eventId
        );

      if (!event) {

        return res.status(404)
          .json({
            message:
              "Event not found"
          });
      }

      const countdown =
        Math.max(
          0,
          Math.floor(
            (
              event.startsAt -
              Date.now()
            ) / 1000
          )
        );

      if (
        countdown <= 0
      ) {

        event.status =
          "STARTED";
      }

      res.json({
        eventId:
          event.eventId,

        theme:
          event.theme,

        location:
          event.location,

        danger:
          event.danger,

        status:
          event.status,

        countdown,

        currentPlayers:
          event.players.length,

        maxPlayers:
          event.maxPlayers,

        players:
          event.players
      });

    } catch (error) {

      res.status(500).json({
        message:
          error.message
      });
    }
  }
);

module.exports =
  router;
