require("dotenv").config();

process.on("unhandledRejection", console.log);
process.on("uncaughtException", console.log);

const live = require("./io/live");
const auth = require("./io/auth");

const io = require("socket.io")(process.env.PORT || 4000, {
	cors: { origin: "*" },
});

auth(io);
live(io);
