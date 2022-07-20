const jwt = require("jsonwebtoken");

const env = (key) => process.env[key + "_" + process.env.NODE_ENV];

module.exports.unsignToken = (token) => {
	try {
		return jwt.verify(token, env("JWT_SECRET"));
	} catch (error) {
		return null;
	}
};

module.exports.signToken = (payload) => jwt.sign(payload, env("JWT_SECRET"));

module.exports.getEnv = env;

module.exports.ignoreError = (call) => {
	try {
		return call();
	} catch (error) {
		console.log(error);
	}
};
