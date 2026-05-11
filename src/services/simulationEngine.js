const match =
  await Match.findById(matchId);

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

    const match =
      await Match.findById(
        matchId
      );

    if (!match) {

      throw new Error(
        "Match not found"
      );
    }

    if (
      match.status ===
      "ENDED"
    ) {

      return match;
    }

    match.feed = [];

    match.eliminations = [];

    let alivePlayers =
      [...match.players];

    /*
    ================================
    FILL WITH BOTS
    ================================
    /

    if (
      alivePlayers.length <
      MAX_PLAYERS
    ) {

      const botsNeeded =
        MAX_PLAYERS -
        alivePlayers.length;

      const bots =
        createBots(
          botsNeeded
        );

      alivePlayers.push(
        ...bots
      );
    }

    /
    ================================
    RESET PLAYERS
    ================================
    /

    alivePlayers =
      alivePlayers.map(
        player => ({
          ...player,
          alive: true
        })
      );

    match.players =
      alivePlayers;

    match.status =
      "STARTED";

    await match.save();

    const rounds =
      randomNumber(5, 6);

    const placements = [];

    /
    ================================
    MATCH ROUNDS
    ================================
    /

    for (
      let round = 1;
      round <= rounds;
      round++
    ) {

      if (
        alivePlayers.length <= 3
      ) {

        break;
      }

      /
      ================================
      ROUND START
      ================================
      /

      const roundStart = {
        type:
          "ROUND_START",

        message:
          ROUND ${round} STARTED
      };

      match.feed.push(
        roundStart
      );

      if (io) {

        io.to(
          matchId
        ).emit(
          "feedUpdate",
          roundStart
        );
      }

      await wait(
        randomNumber(
          2000,
          3000
        )
      );

      /
      ================================
      NARRATOR EVENT
      ================================
      /

      const narratorEvent =
        EventEngine.generateEvent(
          {
            victim: "",
            killer: "",
            tool: "",
            round,
            location:
              randomItem([
                "Yaba",
                "Mushin",
                "Ajegunle",
                "Lagos Island",
                "Ibadan",
                "Aba"
              ])
          }
        );

      if (
        narratorEvent.type ===
        "NARRATOR"
      ) {

        const narratorFeed = {
          type:
            "NARRATOR",

          round,

          message:
            narratorEvent.text
        };

        match.feed.push(
          narratorFeed
        );

        if (io) {

          io.to(
            matchId
          ).emit(
            "feedUpdate",
            narratorFeed
          );
        }

        await wait(
          randomNumber(
            2000,
            3000
          )
        );
      }

      /
      ================================
      ROUND ELIMINATIONS
      ================================
      /

      const eliminationCount =
        randomNumber(
          2,
          5
        );

      const eliminated =
        [];

      for (
        let i = 0;
        i <
        eliminationCount;
        i++
      ) {

        if (
          alivePlayers.length <= 3
        ) {

          break;
        }

        /
        ================================
        SELECT VICTIM
        ================================
        /

        const victim =
          randomItem(
            alivePlayers.filter(
              player =>
                player.alive
            )
          );

        if (!victim) {
          continue;
        }

        /
        ================================
        SELECT KILLER
        ================================
        /

        let killer =
          randomItem(
            alivePlayers.filter(
              player =>
                player.userId !==
                victim.userId &&
                player.alive
            )
          );

        if (!killer) {
          killer = victim;
        }

        /
        ================================
        GENERATE EVENT
        ================================
        /

        const event =
          EventEngine.generateEvent(
            {
              victim:
                victim.username,

              killer:
                killer.username,

              tool:
                randomItem([
                  "Knife",
                  "Smoke",
                  "Charm",
                  "Juju"
                ]),

              round,

              location:
                randomItem([
                  "Yaba",
                  "Mushin",
                  "Ajegunle",
                  "Lagos Island",
                  "Ibadan",
                  "Aba"
                ])
            }
          );

        /
        ================================
        NON-LETHAL EVENT
        ================================
        /

        if (
          event.lethal === false
        ) {

          const harmlessFeed = {
            type:
              event.type,

            round,

            message:
              event.text
          };

          match.feed.push(
            harmlessFeed
          );

          if (io) {

            io.to(
              matchId
            ).emit(
              "feedUpdate",
              harmlessFeed
            );
          }

          await wait(
            randomNumber(
              2000,
              3000
            )
          );

          continue;
        }

        /
        ================================
        ELIMINATION
        ================================
        /

        victim.alive =
          false;

        eliminated.push(
          victim
        );

        const feedItem = {
          type:
            event.type,

          round,

          message:
            event.text
        };

        match.feed.push(
          feedItem
        );

        if (io) {

          io.to(
            matchId
          ).emit(
            "feedUpdate",
            feedItem
          );
        }

        await wait(
          randomNumber(
            2000,
            3000
          )
        );
      }

      /
      ================================
      FILTER SURVIVORS
      ================================
      /

      alivePlayers =
        alivePlayers.filter(
          player =>
            player.alive
        );

      placements.unshift(
        ...eliminated
      );

      /
      ================================
      ROUND SUMMARY
      ================================
      /

      const summary = {
        type:
          "ROUND_SUMMARY",

        message:
          ${eliminated.length} players eliminated this round
      };

      match.feed.push(
        summary
      );

      if (io) {

        io.to(
          matchId
        ).emit(
          "feedUpdate",
          summary
        );
      }

      await wait(3000);

      /
      ================================
      REMAINING PLAYERS
      ================================
      /

      const remainText = {
        type:
          "REMAINING",

        message:
          ${alivePlayers.length} PLAYERS REMAIN
      };

      match.feed.push(
        remainText
      );

      if (io) {

        io.to(
          matchId
        ).emit(
          "feedUpdate",
          remainText
        );
      }

      /
      ================================
      ROUND PAUSE
      ================================
      /

      await wait(5000);

      match.currentRound =
        round;

      await match.save();
    }

    /
    ================================
    FINAL SURVIVORS
    ================================
    /

    placements.unshift(
      ...alivePlayers
    );

    const rewards = {
      1: 250,
      2: 150,
      3: 100
    };

    const finalResults = [];

    /
    ================================
    REWARDS
    ================================
    /

    for (
      let i = 0;
      i < placements.length;
      i++
    ) {

      const player =
        placements[i];

      const placement =
        i + 1;

      const gold =
        (
          rewards[
            placement
          ] || 20
        );

      const xp =
        Math.max(
          20,
          120 -
          placement * 4
        );

      if (!player.bot) {

        const user =
          await User.findById(
            player.userId
          );

        if (user) {

          user.gold +=
            gold;

          user.xp += xp;

          if (
            user.xp >=
            user.level * 500
          ) {

            user.level += 1;
          }

          await user.save();
        }
      }

      finalResults.push({
        player:
          player.username,

        placement,

        goldEarned:
          gold,

        xpEarned:
          xp
      });
    }

    /
    ================================
    MATCH END
    ================================
    */

    match.status =
      "ENDED";

    match.endedAt =
      new Date();

    const endMessage = {
      type:
        "MATCH_END",

      message:
        "MATCH COMPLETE"
    };

    match.feed.push(
      endMessage
    );

    await match.save();

    if (io) {

      io.to(
        matchId
      ).emit(
        "matchEnded",
        finalResults
      );
    }

    return {
      matchId,

      feed:
        match.feed,

      results:
        finalResults
    };
};

module.exports = {
  simulateMatch
};
