const mongoose = require("mongoose");

const schema = (obj) => new mongoose.Schema(obj);
const _id = mongoose.Types.ObjectId;

const messageSchemaObject = {
	message: String,
	chatId: String,
	senderId: _id,
	securityMessage: String,
	notification: schema({
		type: String,
		from: _id,
		to: _id,
	}),
	reactions: [
		schema({
			character: String,
			slug: String,
			reactors: [
				schema({
					_id,
					date: {
						type: Date,
						default: Date.now(),
					},
				}),
			],
		}),
	],
	starredBy: [_id],
	receipt: schema({
		sent: Date,
		received: [schema({ _id, date: Date })],
		seen: [schema({ _id, date: Date })],
	}),
	deleted: [schema({ _id, types: [Number] })],
	file: schema({
		type: {
			type: String,
			enum: ["image", "video", "gif", "voice", "pdf", "other"],
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
