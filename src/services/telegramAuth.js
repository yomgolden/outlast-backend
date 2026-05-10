const User = require("../models/User");

const authenticateTelegram = async (telegramData) => {
  const telegramId = telegramData.id;
  const username = telegramData.username || "Player";

  let user = await User.findOne({ telegramId });

  if (!user) {
    user = await User.create({
      telegramId,
      username
    });
  }

  user.lastActive = new Date();

  await user.save();

  return user;
};

module.exports = authenticateTelegram;
