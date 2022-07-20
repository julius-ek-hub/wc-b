const mongoose = require("mongoose");

const schema = (obj) => new mongoose.Schema(obj);

const messageSchemaObject = {
	message: String,
	chatId: String,
	sender: schema({
		userName: String,
		telephone: String,
		givenName: String,
		dp: String,
		_id: mongoose.Types.ObjectId,
	}),
	receipt: schema({
		sent: Date,
		received: Date,
		seen: Date,
	}),
	file: schema({
		type: {
			type: String,
			enum: ["picture", "video", "gif", "voice", "pdf", "other"],
			url: String,
		},
	}),
};

const messageSchema = schema({
	...messageSchemaObject,
	replyingTo: schema(messageSchemaObject),
});

module.exports.messageSchema = messageSchema;
module.exports.Message = (collection) =>
	mongoose.model(collection, messageSchema);
