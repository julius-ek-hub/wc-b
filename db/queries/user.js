const { User } = require("../models/user");
const { unsignToken, signToken } = require("../../utils");

const $or = ({ telephone, email }) => ({ $or: [{ telephone }, { email }] });

const get = (details) => User.findOne($or(details));

const getPublicAccounts = async (query, { _id }) => {
	const existingChats = await User.findById(_id).select("-_id chats");

	// await Account.findByIdAndUpdate(_id, {
	// 	$pop: { chats: -1 },
	// });

	const existingPartners_ids = existingChats
		.toObject()
		.chats.map((chat) => chat.partnerInfo._id);

	const accounts = await User.find({
		_id: { $nin: existingPartners_ids, $ne: _id },
		"privacy.accountType": { $ne: "private" },
	}).select("_id telephone bio dp");

	return accounts;
};

const add = async (details) => {
	const exists = await get(details);
	if (exists) await User.findOneAndRemove($or(details));

	const account = new User(details);
	await account.save();
	return {
		account,
		token: signToken({ ...details, _id: account._id }),
	};
};

const verify = async (token) => {
	try {
		const payload = unsignToken(token);
		if (!payload) return null;
		return await get(payload);
	} catch (err) {
		console.log(err);
	}
};

const leave = async (_id) =>
	User.findByIdAndUpdate(
		_id,
		{ lastSeen: new Date().toISOString() },
		{ new: true },
	);

const getLatsSeen = (_id) => User.findById(_id).select("-_id lastSeen");

module.exports = {
	get,
	add,
	verify,
	leave,
	getLatsSeen,
	getPublicAccounts,
};
