const mongoose = require("mongoose");
const { messageSchema } = require("./message");

const schema = (obj) => new mongoose.Schema(obj);

const privacySchema = schema({
	exceptions: [mongoose.Types.ObjectId],
	type: {
		type: String,
		enum: ["no-one", "contacts", "everyone", "contacts-except"],
	},
});

const usersSchema = schema({
	telephone: String,
	email: String,
	country: String,
	userName: String,
	dp: String,
	lastSeen: Date,
	wallpaper: {
		type: String,
		default: "default",
	},
	dateJoined: {
		type: Date,
		default: Date.now(),
	},
	bio: {
		type: String,
		default: "Hey there! I am using WhatsApp Clone",
	},
	notifications: schema({
		muted: [String],
		sound: String,
		pushNotifications: Boolean,
		muteReactionNotifications: Boolean,
	}),
	groups: [
		schema({
			id: String,
			left: Boolean,
			removed: schema({
				by: mongoose.Types.ObjectId,
				removed: Boolean,
			}),
		}),
	],
	chats: [
		schema({
			id: String,
			type: {
				type: String,
				enum: ["group", "private"],
				default: "private",
			},
			blocked: [mongoose.Types.ObjectId],
			muted: Boolean,
			disapearingMessages: Number,
			unread: Number,
			lastMessage: messageSchema,
			partnerInfo: schema({
				_id: mongoose.Types.ObjectId,
				userName: String,
				givenName: String,
				telephone: String,
				dp: String,
			}),
		}),
	],
	privacy: {
		lastSeen: privacySchema,
		dp: privacySchema,
		groups: privacySchema,
		readReceipts: Boolean,
		disappearingMessage: Number || Boolean,
		accountType: {
			type: String,
			default: "public",
			enum: ["public", "private"],
		},
	},
});

module.exports.User = mongoose.model("user", usersSchema);
