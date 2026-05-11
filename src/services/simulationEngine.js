const Match = require("../models/Match");
const User = require("../models/User");

const ACTIONS = {
  HIDE: {
    survival: 0.7,
    elimination: 0
  },

  ATTACK: {
    survival: 0.4,
    elimination: 0.3
  },

  DEFEND: {
    survival: 0.8,
    elimination: 0
  },

  STEAL: {
    survival: 0.5,
    elimination: 0
  }
};

const PLAYSTYLE_WEIGHTS = {
  AGGRESSIVE: [
    { action: "ATTACK", weight: 60 },
    { action: "HIDE", weight: 20 },
    { action: "DEFEND", weight: 20 }
  ],

  DEFENSIVE: [
    { action: "DEFEND", weight: 60 },
    { action: "HIDE", weight: 30 },
    { action: "ATTACK", weight: 10 }
  ],

  STEALTH: [
    { action: "HIDE", weight: 70 },
    { action: "DEFEND", weight: 20 },
    { action: "ATTACK", weight: 10 }
  ],

  BALANCED: [
    { action: "HIDE", weight: 25 },
    { action: "ATTACK", weight: 25 },
    { action: "DEFEND", weight: 25 },
    { action: "STEAL", weight: 25 }
  ]
};

const randomChance = (percent) => {
  return Math.random() < percent;
};

const weightedAction = (playstyle = "BALANCED") => {
  const weights = PLAYSTYLE_WEIGHTS[playstyle];

  const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);

  let random = Math.random() * totalWeight;

  for (const item of weights) {
    if (random < item.weight) {
      return item.action;
    }

    random -= item.weight;
  }

  return "HIDE";
};

const getToolBonus = (player, action) => {
  if (!player.equippedTools) return 0;

  if (
    action === "ATTACK" &&
    player.equippedTools.includes("Knife")
  ) {
    return 0.2;
  }

  if (
    action === "DEFEND" &&
    player.equippedTools.includes("Shield")
  ) {
    return 0.2;
  }

  if (
    action === "HIDE" &&
    player.equippedTools.includes("Smoke")
  ) {
    return 0.2;
  }

  return 0;
};

const generateNarration = ({
  attacker,
  target,
  action,
  tool
}) => {

  if (action === "ATTACK") {
    return `${attacker} attacked ${target}${tool ? ` using ${tool}` : ""}`;
  }

  if (action === "DEFEND") {
    return `${attacker} defended successfully`;
  }

  if (action === "HIDE") {
    return `${attacker} disappeared into the shadows`;
  }

  if (action === "STEAL") {
    return `${attacker} attempted to steal resources`;
  }

  return `${attacker} survived the round`;
};

const simulateMatch = async (matchId) => {

  const match = await Match.findById(matchId);

  if (!match) {
    throw new Error("Match not found");
  }

  if (match.status === "ENDED") {
    return match;
  }

  match.feed = [];
  match.eliminations = [];
  match.currentRound = 0;
  match.status = "STARTED";

  const totalRounds = Math.floor(Math.random() * 2) + 5;

  match.totalRounds = totalRounds;

  let alivePlayers = [...match.players];

  const placementOrder = [];

  for (let round = 1; round <= totalRounds; round++) {

    if (alivePlayers.length <= 3) {
      break;
    }

    match.currentRound = round;

    match.feed.push({
      message: `ROUND ${round} STARTED`
    });

    const roundEliminations = [];

    for (const player of alivePlayers) {

      if (!player.alive) continue;

      const user =
        !player.bot
          ? await User.findById(player.userId)
          : null;

      const playstyle =
        user?.playstyle || "BALANCED";

      const equippedTools =
        user?.equippedTools || [];

      player.equippedTools = equippedTools;

      const action = weightedAction(playstyle);

      const toolBonus = getToolBonus(player, action);

      const actionStats = ACTIONS[action];

      const survivalChance =
        actionStats.survival + toolBonus;

      const narration = generateNarration({
        attacker: player.username,
        target:
          alivePlayers[
            Math.floor(Math.random() * alivePlayers.length)
          ]?.username,
        action,
        tool: equippedTools[0]
      });

      match.feed.push({
        message: narration
      });

      if (action === "ATTACK") {

        const targets = alivePlayers.filter(
          p =>
            p.userId !== player.userId &&
            p.alive
        );

        if (targets.length > 0) {

          const target =
            targets[
              Math.floor(Math.random() * targets.length)
            ];

          const targetUser =
            !target.bot
              ? await User.findById(target.userId)
              : null;

          const targetPlaystyle =
            targetUser?.playstyle || "BALANCED";

          const targetAction =
            weightedAction(targetPlaystyle);

          const attackSuccess =
            ACTIONS.ATTACK.elimination + toolBonus;

          if (
            targetAction === "HIDE" &&
            randomChance(attackSuccess)
          ) {

            target.alive = false;

            roundEliminations.push(target.username);

            placementOrder.unshift(target);

            match.feed.push({
              message: `${target.username} was eliminated while hiding`
            });
          }

          if (
            targetAction === "DEFEND" &&
            !randomChance(survivalChance)
          ) {

            player.alive = false;

            roundEliminations.push(player.username);

            placementOrder.unshift(player);

            match.feed.push({
              message: `${player.username} failed attacking a defending player`
            });
          }
        }
      }

      if (
        action === "STEAL" &&
        randomChance(0.4)
      ) {

        match.feed.push({
          message: `${player.username} successfully stole supplies`
        });
      }

      if (
        !randomChance(survivalChance)
      ) {

        if (player.alive) {

          player.alive = false;

          roundEliminations.push(player.username);

          placementOrder.unshift(player);

          match.feed.push({
            message: `${player.username} failed to survive the round`
          });
        }
      }

      if (
        randomChance(0.05) &&
        player.alive
      ) {

        player.alive = false;

        roundEliminations.push(player.username);

        placementOrder.unshift(player);

        match.feed.push({
          message: `${player.username} was caught in a random hazard`
        });
      }
    }

    alivePlayers = alivePlayers.filter(
      p => p.alive
    );

    match.eliminations.push({
      round,
      eliminatedPlayer: roundEliminations.join(", ")
    });

    match.feed.push({
      message: `${roundEliminations.length} players eliminated this round`
    });

    if (alivePlayers.length <= 3) {

      match.feed.push({
        message: "ONLY 3 PLAYERS REMAIN"
      });

      break;
    }
  }

  const finalPlayers = alivePlayers;

  placementOrder.push(...finalPlayers.reverse());

  const placements = placementOrder.reverse();

  const rewards = {
    1: 250,
    2: 150,
    3: 100
  };

  const results = [];

  for (let i = 0; i < placements.length; i++) {

    const player = placements[i];

    const place = i + 1;

    let gold = 20;

    if (rewards[place]) {
      gold += rewards[place];
    }

    const xp = Math.max(10, 100 - (place * 3));

    if (!player.bot) {

      const user = await User.findById(player.userId);

      if (user) {

        user.gold += gold;
        user.xp += xp;

        if (user.xp >= user.level * 500) {
          user.level += 1;
        }

        await user.save();
      }
    }

    results.push({
      player: player.username,
      placement: place,
      goldEarned: gold,
      xpEarned: xp
    });
  }

  match.status = "ENDED";
  match.endedAt = new Date();

  await match.save();

  return {
    matchId: match._id,
    totalRounds,
    feed: match.feed,
    results
  };
};

module.exports = {
  simulateMatch
};
