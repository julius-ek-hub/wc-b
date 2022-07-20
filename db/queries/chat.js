const monoose = require("mongoose");
const { Message } = require("../models/message");
const { User } = require("../models/user");

const collectionExists = async (name) => {
	const allCollections = await monoose.connection.db
		.listCollections()
		.toArray();
	return allCollections.find((collection) => collection.name === name);
};

const getBasicAccountInfo = async (_id) =>
	User.findById(_id).select("_id userName userName telephone");

const newChat = async ({ _id }, data) => {
	const chatId = data._id;
	const exists = await collectionExists(chatId);
	if (exists) await monoose.connection.db.dropCollection(chatId);

	const partnerId = chatId.split("_and_")[1];
	const message = data.message || {};
	delete message._id;
	const MessageModel = Message(chatId);
	const lastMessage = new MessageModel(message);
	await lastMessage.save();

	const myInfo = await getBasicAccountInfo(_id);
	const partnerInfo = await getBasicAccountInfo(partnerId);

	const myUpdate = {
		id: chatId,
		lastMessage,
		partnerInfo,
	};
	const partnerUpdate = {
		id: chatId,
		lastMessage,
		partnerInfo: myInfo,
		unread: 1,
	};

	await User.findByIdAndUpdate(_id, {
		$push: { chats: myUpdate },
	});

	await User.findByIdAndUpdate(partnerId, {
		$push: { chats: partnerUpdate },
	});

	return myUpdate;
};

module.exports = {
	newChat,
};
