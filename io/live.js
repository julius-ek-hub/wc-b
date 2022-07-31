const db = require("../db");
const user = require("../db/queries/user");
const chat = require("../db/queries/chat");
const message = require("../db/queries/message");
const rtc = require("./rtc");

const ss = require("socket.io-stream");

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

		live.emit(`connected-${me._id}`);

		socket.on("messages", (data, success) =>
			ignoreError(async () => {
				success(await message.getAllMessages(data.chatId));
			}),
		);

		socket.on("new-message", (data, success) =>
			ignoreError(async () => {
				const newMessage = await message.newMessage({
					...data,
					myId: me._id,
				});

				success(newMessage);

				live.emit("receive-message-" + data.partnerId, {
					message: newMessage,
					chatId: data.chatId,
				});
			}),
		);

		socket.on("update-message", (data, success) =>
			ignoreError(async () => {
				const newMessage = await message.updateMessage({
					...data,
					myId: me._id,
				});

				success(newMessage);

				live.emit("message-updated-" + data.partnerId, {
					message: newMessage,
					chatId: data.chatId,
				});
			}),
		);

		socket.on("delete-message", (data, success) =>
			ignoreError(async () => {
				const newMessage = await message.newMessage({
					...data,
					myId: me._id,
				});

				success(newMessage);

				live.emit("message-deletd-" + data.partnerId, {
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

		socket.on("last-seen", (_id, success) =>
			ignoreError(async () => {
				success(await user.getLatsSeen(_id));
				live.emit("are-you-online-" + _id);
			}),
		);

		socket.on("rtc-token", (data, success) =>
			ignoreError(() => {
				success(rtc.generateRTCToken(data));
			}),
		);

		socket.on("call", (data, success) =>
			ignoreError(async () => {
				success();
				live.emit("join-call-" + data.to._id, data);
			}),
		);

		socket.on("declined", (_id, success) =>
			ignoreError(async () => {
				live.emit("declined-" + _id);
				success();
			}),
		);

		socket.on("i-am-online", () =>
			ignoreError(() => live.emit(`connected-${me._id}`)),
		);

		socket.on("callee-busy", (to) =>
			ignoreError(async () => {
				live.emit("callee-busy-" + to);
			}),
		);

		socket.on("new-chat", (data, success) =>
			ignoreError(async () => {
				const result = await chat.newChat(me, data);
				success(result);
				live.emit(`new-chat-${data.partnerId}`, result);
			}),
		);

		socket.on("join-room", (roomId, success) =>
			ignoreError(async () => {
				socket.join(roomId);
				success();
			}),
		);
		socket.on("leave-room", (roomId, success) =>
			ignoreError(async () => {
				socket.leave(roomId);
				success();
			}),
		);

		socket.on("disconnect", () => {
			ignoreError(async () => {
				const result = await user.leave(me._id);
				live.emit(`disconnected-${me._id}`, result.lastSeen);
			});
		});
	});
};
