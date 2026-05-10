const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const matchRoutes = require("./routes/matchRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const shopRoutes = require("./routes/shopRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("OUTLAST backend is running");
});

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/match", matchRoutes);
app.use("/leaderboard", leaderboardRoutes);
app.use("/shop", shopRoutes);

module.exports = app;
