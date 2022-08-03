const { User } = require("../models/user");
const { Message } = require("../models/message");

const addSecurityMessageIfNotExist = async (chatId) => {
	const MessageModel = Message(chatId);
	const hasSecurityMessage = await MessageModel.findOne({
		securityMessage: { $exists: true },
	});

	if (!hasSecurityMessage) {
		const secMessage = new MessageModel({
			securityMessage: true,
			starredBy: [],
			reactions: [],
			deleted: [],
			receipt: {
				sent: new Date().toISOString(),
				seen: [],
				received: [],
			},
		});
		await secMessage.save();
	}
};

const newChat = (_id, partnerId, chatId) =>
	User.findByIdAndUpdate(_id, {
		$push: {
			chats: {
				id: chatId,
				partnerId,
			},
		},
	});

const getChats = async (_id) => {
	const query = await User.findById(_id).select("-_id chats");
	return Promise.all(
		query.chats.toObject().map(async (chat) => {
			await addSecurityMessageIfNotExist(chat.id);
			const partnerInfo = await User.findById(chat.partnerId).select(
				"_id telephone bio dp",
			);
			const lastMessage = await Message(chat.id)
				.findOne({
					deleted: {
						$not: {
							$elemMatch: {
								types: { $in: [1] },
								_id: { $eq: _id },
							},
						},
					},
				})
				.sort({ $natural: -1 });

			return {
				...chat,
				partnerInfo,
				lastMessage,
			};
		}),
	);
};

module.exports = {
	newChat,
	getChats,
	addSecurityMessageIfNotExist,
};
