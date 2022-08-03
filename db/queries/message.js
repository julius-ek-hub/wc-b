const { Message } = require("../models/message");
const { User } = require("../models/user");
const { newChat, addSecurityMessageIfNotExist } = require("./chat");

const getAllMessages = async (chatId) => {
	try {
		await addSecurityMessageIfNotExist(chatId);
		return Message(chatId).find();
	} catch (e) {
		return [];
	}
};

const addChatIfNotExists = async (user1, user2, chatId) => {
	const find = (_id) => User.findById(_id).select("-_id chats");
	const exists = (chats) => chats.chats.find((chat) => chat.id === chatId);

	const chats1 = await find(user1);
	const chats2 = await find(user1);

	const exists1 = exists(chats1);
	const exists2 = exists(chats2);

	if (!exists1) await newChat(user1, user2, chatId);
	if (!exists2) await newChat(user2, user1, chatId);

	return Boolean(!exists1) || Boolean(!exists2);
};

const newMessage = async ({ message: m, myId, partnerId }) => {
	delete m._id;
	delete m._new;
	const chatId = m.chatId;

	const isNewChat = await addChatIfNotExists(myId, partnerId, chatId);

	const MessageModel = Message(chatId);
	const message = new MessageModel(m);
	await message.save();

	return {
		message,
		isNewChat,
	};
};

const updateMessage = async ({ messageId, update, chatId }) => {
	const MessageModel = Message(chatId);
	const message = await MessageModel.findByIdAndUpdate(messageId, update, {
		new: true,
	});
	return message;
};

module.exports = {
	getAllMessages,
	newMessage,
	updateMessage,
};
