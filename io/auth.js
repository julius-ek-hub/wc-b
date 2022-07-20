const db = require("../db");
const user = require("../db/queries/user");

const { ignoreError } = require("../utils");

module.exports = (io) => {
	const auth = io.of("/auth");
	auth.use(db);

	auth.on("connection", (socket) => {
		socket.on("new-account", (data, success) =>
			ignoreError(async () => {
				success(await user.add(data));
			}),
		);

		socket.on("login", (data, success) =>
			ignoreError(async () => {
				success(await user.get(data));
			}),
		);

		socket.on("verify", (token, success) =>
			ignoreError(async () => {
				success(await user.verify(token));
			}),
		);
	});
};
