const { Message } = require("../models/message");
const { User } = require("../models/user");
const { newChat } = require("./chat");
const { collectionExists } = require(".");

const getAllMessages = async (chatId) => {
	if (!chatId) return [];
	try {
		return Message(String(chatId)).find();
	} catch (err) {
		return [];
	}
};

const updateLastMessage = (userId, chatId, message) => {
	return User.updateOne(
		{ _id: userId, "chats.id": chatId },
		{ "chats.$.lastMessage": message },
	);
};

const newMessage = async ({ message, myId, chatId, partnerId }) => {
	delete message._id;
	delete message._new;

	const exists = await collectionExists(chatId);
	if (!exists) await newChat({ chatId, myId, partnerId });

	const MessageModel = Message(chatId);
	const _newMessage = new MessageModel(message);
	await _newMessage.save();

	await updateLastMessage(partnerId, chatId, message);
	await updateLastMessage(myId, chatId, message);

	return _newMessage;
};

const updateMessage = async ({
	messageId,
	update,
	myId,
	chatId,
	partnerId,
}) => {
	const MessageModel = Message(chatId);
	const message = await MessageModel.findByIdAndUpdate(messageId, update, {
		new: true,
	});

	// await updateLastMessage(partnerId, chatId, message);
	// await updateLastMessage(myId, chatId, message);

	return message;
};

module.exports = {
	getAllMessages,
	newMessage,
	updateMessage,
};
