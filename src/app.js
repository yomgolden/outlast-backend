const express =
  require("express");

const cors =
  require("cors");

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

const app =
  express();

/*
=================================
MIDDLEWARE
=================================
*/

app.use(cors());

app.use(
  express.json({
    limit: "2mb"
  })
);

/*
=================================
REQUEST LOGGER
=================================
*/

app.use(
  (
    req,
    res,
    next
  ) => {

    console.log(
      `${req.method} ${req.originalUrl}`
    );

    next();
  }
);

/*
=================================
HEALTH CHECK
=================================
*/

app.get(
  "/health",
  (
    req,
    res
  ) => {

    res
      .status(200)
      .json({
        status:
          "healthy",

        uptime:
          process.uptime(),

        timestamp:
          Date.now()
      });
  }
);

/*
=================================
ROOT
=================================
*/

app.get(
  "/",
  (
    req,
    res
  ) => {

    res.json({
      status:
        "OUTLAST backend online"
    });
  }
);

/*
=================================
ROUTES
=================================
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

/*
=================================
404 HANDLER
=================================
*/

app.use(
  (
    req,
    res
  ) => {

    res
      .status(404)
      .json({
        error:
          "Route not found"
      });
  }
);

/*
=================================
GLOBAL ERROR HANDLER
=================================
*/

app.use(
  (
    err,
    req,
    res,
    next
  ) => {

    console.error(
      "SERVER ERROR:",
      err
    );

    res
      .status(500)
      .json({
        error:
          "Internal server error"
      });
  }
);

module.exports =
  app;
