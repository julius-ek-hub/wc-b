const { RtcRole, RtcTokenBuilder } = require("agora-access-token");

module.exports.generateRTCToken = (data) => {
	const expireTime = 3600;
	const currentTime = Math.floor(Date.now() / 1000);
	const privilegeExpireTime = currentTime + expireTime;
	const role =
		data.role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

	return RtcTokenBuilder.buildTokenWithUid(
		process.env.RTC_APPID,
		process.env.RTC_CERT,
		data.cname,
		data.uid,
		role,
		privilegeExpireTime,
	);
};
