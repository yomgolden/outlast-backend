const activeEvents = require("../data/activeEvents");
const User = require("../models/User");
const EventEngine = require("./EventEngine");
const { randomNumber, randomItem } = require("../utils/randomizer");
const createBots = require("./botGenerator");

const MAX_PLAYERS = 20;

const simulateMatch = async (matchId, io = null) => {

  console.log("SIMULATE CALLED:", matchId);

  const match = activeEvents.find(e => e.eventId === matchId);

  if (!match) {
    throw new Error("Match not found");
  }

  if (match.status === "ENDED") {
    return match;
  }

  match.feed = [];
  match.eliminations = [];

  let alivePlayers = [...match.players];

  if (alivePlayers.length < MAX_PLAYERS) {
    const bots = createBots(MAX_PLAYERS - alivePlayers.length);
    alivePlayers.push(...bots);
  }

  alivePlayers = alivePlayers.map(p => ({ ...p, alive: true }));
  match.players = alivePlayers;
  match.status = "STARTED";

  const rounds = randomNumber(5, 6);
  const placements = [];

  for (let round = 1; round <= rounds; round++) {

    if (alivePlayers.length <= 3) break;

    match.feed.push({
      type: "ROUND_START",
      round,
      aliveCount: alivePlayers.length,
      message: `ROUND ${round} STARTED`
    });

    const narratorEvent = EventEngine.generateEvent({
      victim: "", killer: "", tool: "", round,
      location: randomItem(["Yaba","Mushin","Ajegunle","Makoko","Ibadan","Aba"])
    });

    if (narratorEvent.type === "NARRATOR") {
      match.feed.push({
        type: "NARRATOR",
        round,
        aliveCount: alivePlayers.length,
        message: narratorEvent.text
      });
    }

    const eventCount = randomNumber(3, 6);
    const eliminated = [];

    for (let i = 0; i < eventCount; i++) {

      const available = alivePlayers.filter(p => p.alive);
      if (available.length <= 1) break;

      const victim = randomItem(available);
      if (!victim) continue;

      const possibleKillers = available.filter(p => p.userId !== victim.userId);
      if (possibleKillers.length === 0) continue;

      const killer = randomItem(possibleKillers);

      const event = EventEngine.generateEvent({
        victim: victim.username,
        killer: killer.username,
        tool: randomItem(["Knife","Smoke","Charm","Juju"]),
        round,
        location: randomItem(["Yaba","Mushin","Ajegunle","Makoko","Ibadan","Aba"])
      });

      if (event.lethal === false) {
        match.feed.push({
          type: event.type,
          round,
          aliveCount: alivePlayers.filter(p => p.alive).length,
          message: event.text
        });
        continue;
      }

      victim.alive = false;
      eliminated.push(victim);

      match.feed.push({
        type: event.type,
        round,
        aliveCount: alivePlayers.filter(p => p.alive).length,
        message: event.text
      });
    }

    alivePlayers = alivePlayers.filter(p => p.alive);
    placements.unshift(...eliminated);

    match.feed.push({
      type: "ROUND_SUMMARY",
      round,
      aliveCount: alivePlayers.length,
      message: `${eliminated.length} players eliminated this round`
    });

    match.feed.push({
      type: "REMAINING",
      round,
      aliveCount: alivePlayers.length,
      message: `${alivePlayers.length} PLAYERS REMAIN`
    });

    match.currentRound = round;
  }

  placements.unshift(...alivePlayers);

  const rewards = { 1: 250, 2: 150, 3: 100 };
  const finalResults = [];

  console.log("STARTING REWARDS");

  for (let i = 0; i < placements.length; i++) {
    const player = placements[i];
    const placement = i + 1;
    const gold = rewards[placement] || 20;
    const xp = Math.max(20, 120 - placement * 4);

    if (
      !player.bot &&
      player.userId &&
      typeof player.userId === "string" &&
      player.userId.length === 24
    ) {
      try {
        const user = await User.findById(player.userId);
        if (user) {
          user.gold += gold;
          user.xp += xp;
          if (user.xp >= user.level * 500) user.level += 1;
          await user.save();
        }
      } catch (err) {
        console.log("REWARD ERROR:", err.message);
      }
    }

    finalResults.push({
      player: player.username,
      placement,
      goldEarned: gold,
      xpEarned: xp
    });
  }

  console.log("REWARDS COMPLETE");

  match.status = "ENDED";
  match.endedAt = new Date();
  match.finalResults = finalResults;

  match.feed.push({
    type: "MATCH_END",
    aliveCount: 0,
    message: "MATCH COMPLETE"
  });

  if (io) {
    io.to(matchId).emit("matchEnded", finalResults);
  }

  console.log("MATCH COMPLETE:", matchId);

  return { matchId, feed: match.feed, results: finalResults };
};

module.exports = { simulateMatch };
