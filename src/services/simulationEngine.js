const activeEvents =
  require("../data/activeEvents");

const User =
  require("../models/User");

const EventEngine =
  require("./EventEngine");

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

    console.log(
      "SIMULATE CALLED:",
      matchId
    );

    console.log(
      "ACTIVE EVENTS:",
      activeEvents.map(
        e => e.eventId
      )
    );

    /*
    =================================
    FIND EVENT
    =================================
    */

    const match =
      activeEvents.find(
        e =>
          e.eventId ===
          matchId
      );

    console.log(
      "MATCH FOUND:",
      match ? "YES" : "NO"
    );

    if (!match) {

      throw new Error(
        "Match not found"
      );
    }

    /*
    =================================
    ALREADY ENDED
    =================================
    */

    if (
      match.status ===
      "ENDED"
    ) {

      return match;
    }

    /*
    =================================
    RESET MATCH
    =================================
    */

    match.feed = [];

    match.eliminations = [];

    let alivePlayers =
      [...match.players];

    /*
    =================================
    ADD BOTS
    =================================
    */

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

    /*
    =================================
    RESET ALIVE STATE
    =================================
    */

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

    const rounds =
      randomNumber(5, 6);

    const placements =
      [];

    console.log(
      "MATCH STARTED"
    );

    /*
    =================================
    ROUND LOOP
    =================================
    */

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

      console.log(
        `ROUND ${round}`
      );

      /*
      =================================
      ROUND START
      =================================
      */

      const roundStart = {

        type:
          "ROUND_START",

        round,

        aliveCount:
          alivePlayers.length,

        message:
          `ROUND ${round} STARTED`
      };

      match.feed.push(
        roundStart
      );

      /*
      =================================
      NARRATOR EVENT
      =================================
      */

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
                "Makoko",
                "Ibadan",
                "Aba"
              ])
          }
        );

      if (
        narratorEvent.type ===
        "NARRATOR"
      ) {

        match.feed.push({

          type:
            "NARRATOR",

          round,

          aliveCount:
            alivePlayers.length,

          message:
            narratorEvent.text
        });
      }

      /*
      =================================
      EVENTS
      =================================
      */

      const eventCount =
        randomNumber(
          3,
          6
        );

      const eliminated =
        [];

      for (
        let i = 0;
        i < eventCount;
        i++
      ) {

        const availablePlayers =
          alivePlayers.filter(
            p => p.alive
          );

        if (
          availablePlayers.length <= 1
        ) {

          break;
        }

        /*
        =================================
        VICTIM
        =================================
        */

        const victim =
          randomItem(
            availablePlayers
          );

        if (!victim) {
          continue;
        }

        /*
        =================================
        KILLER
        =================================
        */

        const possibleKillers =
          availablePlayers.filter(
            p =>
              p.userId !==
              victim.userId
          );

        if (
          possibleKillers.length === 0
        ) {

          continue;
        }

        const killer =
          randomItem(
            possibleKillers
          );

        /*
        =================================
        GENERATE EVENT
        =================================
        */

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
                  "Makoko",
                  "Ibadan",
                  "Aba"
                ])
            }
          );

        /*
        =================================
        NON-LETHAL
        =================================
        */

        if (
          event.lethal === false
        ) {

          match.feed.push({

            type:
              event.type,

            round,

            aliveCount:
              alivePlayers.filter(
                p => p.alive
              ).length,

            message:
              event.text
          });

          continue;
        }

        /*
        =================================
        ELIMINATION
        =================================
        */

        victim.alive =
          false;

        eliminated.push(
          victim
        );

        const aliveCount =
          alivePlayers.filter(
            p => p.alive
          ).length;

        match.feed.push({

          type:
            event.type,

          round,

          aliveCount,

          message:
            event.text
        });
      }

      /*
      =================================
      FILTER SURVIVORS
      =================================
      */

      alivePlayers =
        alivePlayers.filter(
          p => p.alive
        );

      placements.unshift(
        ...eliminated
      );

      /*
      =================================
      ROUND SUMMARY
      =================================
      */

      match.feed.push({

        type:
          "ROUND_SUMMARY",

        round,

        aliveCount:
          alivePlayers.length,

        message:
          `${eliminated.length} players eliminated this round`
      });

      /*
      =================================
      REMAINING
      =================================
      */

      match.feed.push({

        type:
          "REMAINING",

        round,

        aliveCount:
          alivePlayers.length,

        message:
          `${alivePlayers.length} PLAYERS REMAIN`
      });

      match.currentRound =
        round;
    }

    /*
    =================================
    FINAL SURVIVORS
    =================================
    */

    placements.unshift(
      ...alivePlayers
    );

    console.log(
      "STARTING REWARDS"
    );

    /*
    =================================
    REWARDS
    =================================
    */

    const rewards = {
      1: 250,
      2: 150,
      3: 100
    };

    const finalResults =
      [];

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
        rewards[
          placement
        ] || 20;

      const xp =
        Math.max(
          20,
          120 -
          placement * 4
        );

      /*
      =================================
      REAL USER REWARDS ONLY
      =================================
      */

      if (
        !player.bot &&
        player.userId &&
        typeof player.userId ===
          "string" &&
        player.userId.length === 24
      ) {

        try {

          const user =
            await User.findById(
              player.userId
            );

          if (user) {

            user.gold +=
              gold;

            user.xp +=
              xp;

            if (
              user.xp >=
              user.level * 500
            ) {

              user.level += 1;
            }

            await user.save();
          }

        } catch (err) {

          console.log(
            "REWARD ERROR:",
            err.message
          );
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

    console.log(
      "REWARDS COMPLETE"
    );

    /*
    =================================
    MATCH END
    =================================
    */

    match.status =
      "ENDED";

    match.endedAt =
      new Date();

    match.feed.push({

      type:
        "MATCH_END",

      aliveCount: 0,

      message:
        "MATCH COMPLETE"
    });

    console.log(
      "MATCH COMPLETE:",
      matchId
    );

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
