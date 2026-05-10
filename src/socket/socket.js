const socketHandler = (io) => {

  io.on("connection", (socket) => {

    console.log("User Connected:", socket.id);

    socket.on("joinMatch", (matchId) => {
      socket.join(matchId);
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected:", socket.id);
    });

  });

};

module.exports = socketHandler;
