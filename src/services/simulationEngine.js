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

    /*
    ===================================
    DEBUG LOGS
    ===================================
    */

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
    ===================================
    FIND MATCH
    ===================================
    */

    const match =
      activeEvents.find(
        e =>
          e.eventId ===
          matchId
      );

    console.log(
      "MATCH FOUND:",
      match
    );

    /*
    ===================================
    MATCH CHECK
    ===================================
    */

    if (!match) {

      console.log(
        "MATCH NOT FOUND ERROR"
      );

      throw new Error(
        "Match not found"
      );
    }

    /*
    ===================================
    ALREADY ENDED
    ===================================
    */

    if (
      match.status ===
      "ENDED"
    ) {

      console.log(
        "MATCH ALREADY ENDED"
      );

      return match;
    }

    /*
    ===================================
    RESET MATCH
    ===================================
    */

    match.feed = [];

    match.eliminations = [];

    let alivePlayers =
      [...match.players];

    console.log(
      "PLAYERS BEFORE BOTS:",
      alivePlayers.length
    );

    /*
    ===================================
    FILL WITH BOTS
    ===================================
    */

    if (
      alivePlayers.length <
      MAX_PLAYERS
    ) {

      const botsNeeded =
        MAX_PLAYERS -
        alivePlayers.length;

      console.log(
        "ADDING BOTS:",
        botsNeeded
      );

      const bots =
        createBots(
          botsNeeded
        );

      alivePlayers.push(
        ...bots
      );
    }

    console.log(
      "TOTAL PLAYERS:",
      alivePlayers.length
    );

    /*
    ===================================
    RESET PLAYERS
    ===================================
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

    /*
    ===================================
    ROUNDS
    ===================================
    */

    const rounds =
      randomNumber(5, 6);

    console.log(
      "TOTAL ROUNDS:",
      rounds
    );

    const placements = [];

    /*
    ===================================
    MATCH LOOP
    ===================================
    */

    for (
      let round = 1;
      round <= rounds;
      round++
    ) {

      console.log(
        "ROUND START:",
        round
      );

      if (
        alivePlayers.length <= 3
      ) {

        console.log(
          "ENDING EARLY - ONLY 3 LEFT"
        );

        break;
      }

      /*
      ===================================
      ROUND START EVENT
      ===================================
      */

      const roundStart = {
        type:
          "ROUND_START",

        round,

        message:
          `ROUND ${round} STARTED`
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

      /*
      ===================================
      NARRATOR
      ===================================
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

      console.log(
        "NARRATOR EVENT:",
        narratorEvent
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

      /*
      ===================================
      ROUND EVENTS
      ===================================
      */

      const eventCount =
        randomNumber(
          3,
          6
        );

      console.log(
        "EVENT COUNT:",
        eventCount
      );

      const eliminated =
        [];

      for (
        let i = 0;
        i < eventCount;
        i++
      ) {

        if (
          alivePlayers.length <= 3
        ) {

          console.log(
            "STOPPING EVENTS - 3 LEFT"
          );

          break;
        }

        const availablePlayers =
          alivePlayers.filter(
            player =>
              player.alive
          );

        console.log(
          "AVAILABLE PLAYERS:",
          availablePlayers.length
        );

        const victim =
          randomItem(
            availablePlayers
          );

        console.log(
          "VICTIM:",
          victim
        );

        if (!victim) {

          console.log(
            "NO VICTIM FOUND"
          );

          continue;
        }

        let killer =
          randomItem(
            availablePlayers.filter(
              player =>
                player.userId !==
                victim.userId
            )
          );

        if (!killer) {
          killer = victim;
        }

        console.log(
          "KILLER:",
          killer
        );

        /*
        ===================================
        EVENT
        ===================================
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

        console.log(
          "EVENT GENERATED:",
          event
        );

        /*
        ===================================
        NON-LETHAL
        ===================================
        */

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

        /*
        ===================================
        ELIMINATION
        ===================================
        */

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

      /*
      ===================================
      FILTER ALIVE
      ===================================
      */

      alivePlayers =
        alivePlayers.filter(
          player =>
            player.alive
        );

      console.log(
        "PLAYERS LEFT:",
        alivePlayers.length
      );

      placements.unshift(
        ...eliminated
      );

      /*
      ===================================
      ROUND SUMMARY
      ===================================
      */

      const summary = {
        type:
          "ROUND_SUMMARY",

        round,

        message:
          `${eliminated.length} players eliminated this round`
      };

      match.feed.push(
        summary
      );

      await wait(3000);

      /*
      ===================================
      REMAINING
      ===================================
      */

      const remainText = {
        type:
          "REMAINING",

        round,

        message:
          `${alivePlayers.length} PLAYERS REMAIN`
      };

      match.feed.push(
        remainText
      );

      await wait(5000);

      match.currentRound =
        round;
    }

    /*
    ===================================
    FINAL PLAYERS
    ===================================
    */

    placements.unshift(
      ...alivePlayers
    );

    console.log(
      "FINAL PLACEMENTS:",
      placements.length
    );

    const rewards = {
      1: 250,
      2: 150,
      3: 100
    };

    const finalResults = [];

    /*
    ===================================
    REWARDS
    ===================================
    */

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

      console.log(
        "REWARDING:",
        player.username
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

    /*
    ===================================
    MATCH END
    ===================================
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

    console.log(
      "MATCH COMPLETE"
    );

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
