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

  const used =
    new Set();

  while (
    bots.length < count
  ) {

    let name =
      randomItem(
        botNames
      );

    while (
      used.has(name)
    ) {

      name =
        randomItem(
          botNames
        );
    }

    used.add(name);

    bots.push({
      userId:
        `bot_${Date.now()}_${bots.length}`,

      username:
        name,

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

module.exports =
  createBots;
