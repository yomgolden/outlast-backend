const createBots = (count) => {
  const bots = [];

  for (let i = 0; i < count; i++) {
    bots.push({
      userId: `bot_${Date.now()}_${i}`,
      username: `Bot_${Math.floor(Math.random() * 9999)}`,
      bot: true,
      alive: true
    });
  }

  return bots;
};

module.exports = createBots;
