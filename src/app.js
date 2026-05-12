const express = require("express");
const cors = require("cors");

const authRoutes =
  require("./routes/authRoutes");

const userRoutes =
  require("./routes/userRoutes");

const matchRoutes =
  require("./routes/matchRoutes");

const leaderboardRoutes =
  require("./routes/leaderboardRoutes");

const shopRoutes =
  require("./routes/shopRoutes");

const simulationRoutes =
  require("./routes/simulationRoutes");

const app = express();

/*
=====================================
CORS
=====================================
*/

app.use(cors({
  origin: "*",
  methods: [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "OPTIONS"
  ],
  allowedHeaders: [
    "Content-Type",
    "Authorization"
  ]
}));

/*
=====================================
PREFLIGHT
=====================================
*/

app.options("*", cors());

/*
=====================================
BODY PARSER
=====================================
*/

app.use(express.json());

/*
=====================================
HEALTH CHECK
=====================================
*/

app.get("/", (req, res) => {

  res.json({
    status: "OUTLAST backend online"
  });

});

/*
=====================================
ROUTES
=====================================
*/

app.use(
  "/auth",
  authRoutes
);

app.use(
  "/user",
  userRoutes
);

app.use(
  "/match",
  matchRoutes
);

app.use(
  "/leaderboard",
  leaderboardRoutes
);

app.use(
  "/shop",
  shopRoutes
);

app.use(
  "/simulation",
  simulationRoutes
);

module.exports = app;
