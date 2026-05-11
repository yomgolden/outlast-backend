const event =
  EventEngine.generateEvent(
    {
      victim:
        victim.username,

      killer:
        randomItem(
          alivePlayers
        )?.username,

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
