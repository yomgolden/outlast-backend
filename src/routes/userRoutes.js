router.get("/:userId", async (req, res) => {

  try {

    let user = await User.findById(
      req.params.userId
    );

    if (!user) {

      user = {
        _id: req.params.userId,
        username:
          "Player_" +
          req.params.userId.slice(-4),
        gold: 1000,
        gems: 50,
        level: 1,
        xp: 0
      };
    }

    res.json(user);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});
