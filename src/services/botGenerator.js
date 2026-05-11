const {
  randomItem
} = require("../utils/randomizer");

const botNames = [
  "BigSapa",
  "BabaFlex",
  "AreaFather",
  "NoGree4Anybody",
  "GhostOfYaba",
  "LagosWizard",
  "SapaGeneral",
  "FearWomen",
  "DanfoKing",
  "AbokiSniper",
  "Chairman",
  "SoftLifeGone",
  "YahooProtector",
  "StreetOracle",
  "EkoBandit",
  "IjebuLord"
];

const createBots = (
  count
) => {

  const bots = [];

  for (
    let i = 0;
    i < count;
    i++
  ) {

    bots.push({
      userId:
        `bot_${Date.now()}_${i}`,

      username:
        randomItem(botNames),

      bot: true,

      alive: true,

      playstyle:
        randomItem([
          "AGGRESSIVE",
          "DEFENSIVE",
          "STEALTH",
          "BALANCED"
        ])
    });
  }

  return bots;
};

module.exports = createBots;
