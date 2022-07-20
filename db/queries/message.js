const { Message } = require("../models/message");
const { User } = require("../models/user");

const getAllMessages = async (chatId) => {
	if (!chatId) return [];
	try {
		return Message(String(chatId)).find();
	} catch (err) {
		return [];
	}
};

const newMessage = async ({ message, myId, chatId, partnerId }) => {
	delete message._id;

	const MessageModel = Message(chatId);
	const _newMessage = new MessageModel(message);
	await _newMessage.save();

	const updateLastMessage = (_id) => {
		return User.updateOne(
			{ _id, "chats.id": chatId },
			{ "chats.$.lastMessage": message },
		);
	};

	await updateLastMessage(partnerId);
	await updateLastMessage(myId);

	return _newMessage;
};

module.exports = {
	getAllMessages,
	newMessage,
};
