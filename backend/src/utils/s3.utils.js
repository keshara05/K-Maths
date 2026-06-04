const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const BUCKET = process.env.AWS_S3_BUCKET;

/**
 * Generate a pre-signed URL for secure video/file access (15 min expiry)
 */
const getSignedUrl = (key, expiresIn = 900) =>
  s3.getSignedUrlPromise('getObject', {
    Bucket: BUCKET,
    Key: key,
    Expires: expiresIn,
  });

/**
 * Upload a file buffer to S3
 */
const uploadFile = async (buffer, key, contentType) => {
  const params = {
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
  };
  const result = await s3.upload(params).promise();
  return result.Location;
};

/**
 * Delete a file from S3
 */
const deleteFile = (key) =>
  s3.deleteObject({ Bucket: BUCKET, Key: key }).promise();

module.exports = { getSignedUrl, uploadFile, deleteFile, s3 };
