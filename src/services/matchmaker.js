const Match = require("../models/Match");
const createBots = require("./botService");
const { MATCH_SIZE, MIN_REAL_PLAYERS } = require("../utils/constants");

let queue = [];

const joinQueue = async (user) => {
  const existing = queue.find(
    (player) => player.userId === user._id.toString()
  );

  if (existing) {
    return existing.matchId;
  }

  let activeMatch = await Match.findOne({ status: "QUEUE" });

  if (!activeMatch) {
    activeMatch = await Match.create({
      players: [],
      rewards: {
        first: 250,
        second: 150,
        third: 100
      }
    });
  }

  queue.push({
    userId: user._id.toString(),
    username: user.username,
    matchId: activeMatch._id
  });

  activeMatch.players.push({
    userId: user._id.toString(),
    username: user.username
  });

  await activeMatch.save();

  return activeMatch._id;
};

const startMatchCycle = (io) => {
  setInterval(async () => {
    const match = await Match.findOne({ status: "QUEUE" });

    if (!match) return;

    const realPlayers = match.players.length;

    if (realPlayers < MIN_REAL_PLAYERS) return;

    const botsNeeded = MATCH_SIZE - realPlayers;

    if (botsNeeded > 0) {
      const bots = createBots(botsNeeded);

      match.players.push(...bots);
    }

    match.status = "STARTED";
    match.startedAt = new Date();

    await match.save();

    io.to(match._id.toString()).emit("matchStarted", {
      matchId: match._id
    });

    runSimulation(match, io);

  }, 120000);
};

const runSimulation = async (match, io) => {
  const interval = setInterval(async () => {

    if (match.currentRound >= match.totalRounds) {
      match.status = "ENDED";
      match.endedAt = new Date();

      await match.save();

      io.to(match._id.toString()).emit("matchEnded", match);

      clearInterval(interval);

      return;
    }

    match.currentRound += 1;

    const alivePlayers = match.players.filter(p => p.alive);

    const eliminateCount = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < eliminateCount; i++) {
      if (alivePlayers.length <= 3) break;

      const target =
        alivePlayers[Math.floor(Math.random() * alivePlayers.length)];

      target.alive = false;

      match.eliminations.push({
        round: match.currentRound,
        eliminatedPlayer: target.username
      });

      match.feed.push({
        message: `${target.username} was eliminated`
      });

      io.to(match._id.toString()).emit("playerEliminated", {
        player: target.username
      });
    }

    await match.save();

    io.to(match._id.toString()).emit("roundUpdate", {
      round: match.currentRound,
      feed: match.feed
    });

  }, 35000);
};

module.exports = {
  joinQueue,
  startMatchCycle
};
