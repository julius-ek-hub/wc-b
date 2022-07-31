const mongoose = require("mongoose");

module.exports.collectionExists = async (name) => {
	const allCollections = await mongoose.connection.db
		.listCollections()
		.toArray();
	return allCollections.find((collection) => collection.name === name);
};

module.exports.mongoose = mongoose;
