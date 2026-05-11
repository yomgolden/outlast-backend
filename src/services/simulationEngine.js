const activeEvents =
  require("../data/activeEvents");

const User =
  require("../models/User");

const EventEngine =
  require("./EventEngine");

const {
  wait
} = require("./pacingEngine");

const {
  randomNumber,
  randomItem
} = require("../utils/randomizer");

const createBots =
  require("./botGenerator");

const MAX_PLAYERS = 20;

const simulateMatch =
  async (
    matchId,
    io = null
  ) => {

    console.log("SIMULATE CALLED:", matchId);
    console.log("ACTIVE EVENTS:", activeEvents.map(e => e.eventId));

    const match =
      activeEvents.find(
        e => e.eventId === matchId
      );

    console.log("MATCH FOUND:", match ? "YES" : "NO");

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
      const botsNeeded = MAX_PLAYERS - alivePlayers.length;
      const bots = createBots(botsNeeded);
      alivePlayers.push(...bots);
    }

    alivePlayers = alivePlayers.map(player => ({
      ...player,
      alive: true
    }));

    match.players = alivePlayers;
    match.status = "STARTED";

    const rounds = randomNumber(5, 6);
    const placements = [];

    for (let round = 1; round <= rounds; round++) {

      if (alivePlayers.length <= 3) break;

      const roundStart = {
        type: "ROUND_START",
        round,
        aliveCount: alivePlayers.length,
        message: `ROUND ${round} STARTED`
      };

      match.feed.push(roundStart);
      if (io) io.to(matchId).emit("feedUpdate", roundStart);

      await wait(200);

      const narratorEvent = EventEngine.generateEvent({
        victim: "",
        killer: "",
        tool: "",
        round,
        location: randomItem([
          "Yaba", "Mushin", "Ajegunle",
          "Makoko", "Ibadan", "Aba"
        ])
      });

      if (narratorEvent.type === "NARRATOR") {
        const narratorFeed = {
          type: "NARRATOR",
          round,
          aliveCount: alivePlayers.length,
          message: narratorEvent.text
        };
        match.feed.push(narratorFeed);
        if (io) io.to(matchId).emit("feedUpdate", narratorFeed);
        await wait(200);
      }

      const eventCount = randomNumber(3, 6);
      const eliminated = [];

      for (let i = 0; i < eventCount; i++) {

        if (alivePlayers.length <= 3) break;

        const availablePlayers =
          alivePlayers.filter(p => p.alive);

        const victim = randomItem(availablePlayers);
        if (!victim) continue;

        let killer = randomItem(
          availablePlayers.filter(p => p.userId !== victim.userId)
        );
        if (!killer) killer = victim;

        const event = EventEngine.generateEvent({
          victim: victim.username,
          killer: killer.username,
          tool: randomItem(["Knife", "Smoke", "Charm", "Juju"]),
          round,
          location: randomItem([
            "Yaba", "Mushin", "Ajegunle",
            "Makoko", "Ibadan", "Aba"
          ])
        });

        if (event.lethal === false) {
          const harmlessFeed = {
            type: event.type,
            round,
            aliveCount: alivePlayers.length,
            message: event.text
          };
          match.feed.push(harmlessFeed);
          if (io) io.to(matchId).emit("feedUpdate", harmlessFeed);
          await wait(200);
          continue;
        }

        victim.alive = false;
        eliminated.push(victim);

        const feedItem = {
          type: event.type,
          round,
          aliveCount: alivePlayers.filter(p => p.alive).length,
          message: event.text
        };
        match.feed.push(feedItem);
        if (io) io.to(matchId).emit("feedUpdate", feedItem);
        await wait(200);
      }

      alivePlayers = alivePlayers.filter(p => p.alive);
      placements.unshift(...eliminated);

      const summary = {
        type: "ROUND_SUMMARY",
        round,
        aliveCount: alivePlayers.length,
        message: `${eliminated.length} players eliminated this round`
      };
      match.feed.push(summary);
      await wait(200);

      const remainText = {
        type: "REMAINING",
        round,
        aliveCount: alivePlayers.length,
        message: `${alivePlayers.length} PLAYERS REMAIN`
      };
      match.feed.push(remainText);
      await wait(200);

      match.currentRound = round;
    }

    placements.unshift(...alivePlayers);

    const rewards = { 1: 250, 2: 150, 3: 100 };
    const finalResults = [];

    for (let i = 0; i < placements.length; i++) {
      const player = placements[i];
      const placement = i + 1;
      const gold = rewards[placement] || 20;
      const xp = Math.max(20, 120 - placement * 4);

      if (!player.bot) {
        const user = await User.findById(player.userId);
        if (user) {
          user.gold += gold;
          user.xp += xp;
          if (user.xp >= user.level * 500) user.level += 1;
          await user.save();
        }
      }

      finalResults.push({
        player: player.username,
        placement,
        goldEarned: gold,
        xpEarned: xp
      });
    }

    match.status = "ENDED";
    match.endedAt = new Date();

    const endMessage = {
      type: "MATCH_END",
      aliveCount: 0,
      message: "MATCH COMPLETE"
    };
    match.feed.push(endMessage);

    if (io) io.to(matchId).emit("matchEnded", finalResults);

    console.log("MATCH COMPLETE:", matchId);

    return {
      matchId,
      feed: match.feed,
      results: finalResults
    };
};

module.exports = { simulateMatch };
