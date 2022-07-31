const mongoose = require("mongoose");

const schema = (obj) => new mongoose.Schema(obj);

const messageSchemaObject = {
	message: String,
	chatId: String,
	sender: schema({
		userName: String,
		telephone: String,
		bio: String,
		dp: String,
		_id: mongoose.Types.ObjectId,
	}),
	reactions: [
		schema({
			character: String,
			slug: String,
			reactors: [
				schema({
					userName: String,
					telephone: String,
					bio: String,
					dp: String,
					_id: mongoose.Types.ObjectId,
					date: {
						type: Date,
						default: Date.now(),
					},
				}),
			],
		}),
	],
	starredBy: [mongoose.Types.ObjectId],
	receipt: schema({
		sent: Date,
		received: Date,
		seen: Date,
	}),
	deleted: [
		schema({
			by: mongoose.Types.ObjectId,
			types: [Number],
		}),
	],
	file: schema({
		type: {
			type: String,
			enum: ["picture", "video", "gif", "voice", "pdf", "other"],
		},
		url: String,
		duration: Number,
	}),
};

const messageSchema = schema({
	...messageSchemaObject,
	replyingTo: schema(messageSchemaObject),
});

module.exports.messageSchema = messageSchema;
module.exports.Message = (collection) =>
	mongoose.model(collection, messageSchema);
