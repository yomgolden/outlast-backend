require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const app = require("./app");
const socketHandler = require("./socket/socket");
const { startMatchCycle } = require("./services/matchmaker");

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

socketHandler(io);
startMatchCycle(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
