const mongoose = require("mongoose");

module.exports = async (socket, next) => {
	try {
		await mongoose.connect(require("../utils").getEnv("DB_CONNECTION_STRING"));
		next();
	} catch (error) {
		next(new Error(error.message));
	}
};
