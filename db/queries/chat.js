const { User } = require("../models/user");

const updateChats = (userId, chatInfo) => {
	return User.findByIdAndUpdate(userId, {
		$push: { chats: chatInfo },
	});
};

const getBasicAccountInfo = async (_id) =>
	User.findById(_id).select("_id userName userName telephone");

const newChat = async ({ myId, partnerId, chatId }) => {
	const myInfo = await getBasicAccountInfo(myId);
	const partnerInfo = await getBasicAccountInfo(partnerId);

	const myUpdate = {
		id: chatId,
		partnerInfo,
	};

	const partnerUpdate = {
		id: chatId,
		partnerInfo: myInfo,
		unread: 1,
	};

	await updateChats(myId, myUpdate);
	await updateChats(partnerId, partnerUpdate);

	return myUpdate;
};

module.exports = {
	newChat,
};
