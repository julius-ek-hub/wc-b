const db = require("../db");
const user = require("../db/queries/user");
const chat = require("../db/queries/chat");
const message = require("../db/queries/message");

const { unsignToken, ignoreError } = require("../utils");

module.exports = (io) => {
	const live = io.of("/live");

	live.use(db);

	live.use((socket, next) => {
		const payload = unsignToken(socket.handshake.auth.token);
		if (!payload) return next(new Error("Invalid token"));
		socket.payload = payload;
		next();
	});

	live.on("connection", (socket) => {
		const me = socket.payload;

		socket.on("messages", (data, success) =>
			ignoreError(async () => {
				success(await message.getAllMessages(data.chatId));
			}),
		);

		socket.on("new-message", (data, success) =>
			ignoreError(async () => {
				const myId = me._id;
				_arrChatId = data.chatId.split("_and_");
				let partnerId = _arrChatId[0];
				if (myId == partnerId) partnerId = _arrChatId[1];

				const newMessage = await message.newMessage({
					...data,
					myId: me._id,
					partnerId,
				});
				success(newMessage);
				live.emit("receive-message-" + partnerId, {
					message: newMessage,
					chatId: data.chatId,
				});
			}),
		);

		socket.on("public-contacts", (query, success) =>
			ignoreError(async () => {
				success(await user.getPublicAccounts(query, me));
			}),
		);

		socket.on("new-chat", (data, success) =>
			ignoreError(async () => {
				const result = await chat.newChat(me, data);
				success(result);
				live.emit(`new-chat-${data._id.split("_and_")[1]}`, result);
			}),
		);
	});
};
