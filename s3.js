const aws = require("aws-sdk");
const { promisify } = require("util");
const crypto = require("crypto");

const randomBytes = promisify(crypto.randomBytes);
const env = (key) => process.env[key];

const bucketName = "247-dev-files";

const s3 = new aws.S3({
	region: "ap-northeast-1",
	bucketName,
	accessKeyId: env("AWS_S3_ACCESS_KEY_ID"),
	secretAccessKey: env("AWS_S3_SECRET_ACCESS_KEY"),
	signatureVersion: "v4",
});

const deleteFile = promisify(s3.deleteObject);

module.exports.generateS3URL = async ({ ext, folder }) => {
	const rawBytes = await randomBytes(16);
	const imgName = `${rawBytes.toString("hex")}`;
	const params = {
		Bucket: bucketName,
		Key: "wc/" + folder + imgName + "." + ext,
		Expires: 60,
	};

	const uploadURL = await s3.getSignedUrlPromise("putObject", params);
	return uploadURL;
};
module.exports.deleteFile = async ({ ext, folder }) => {
	await deleteFile();
};
