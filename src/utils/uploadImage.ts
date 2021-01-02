import fetch from "isomorphic-fetch";
import aws from "aws-sdk";
import { v4 as uuid } from "uuid";
import ImageModel from "../models/image.model";

const S3_PATH_PREFIX = process.env.S3_PATH_PREFIX;

export const s3Client = new aws.S3({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
  region: process.env.AWS_REGION,
  s3ForcePathStyle: true,
});

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export function uploadToCloudinary(fileUrl) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      fileUrl,
      { folder: process.env.CLOUDINARY_FOLDER, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result.secure_url);
      }
    );
  });
}

/**
 *
 * @param {string} fileUrl The url of the file to be uploaded
 * @param {string} newFileName The name of the file on AWS
 * @param {string} mimeType mimeType of the file
 *
 * uploads the given file to AWS
 */
export const uploadToAWSFromUrl = async ({
  fileUrl,
  mimeType,
}: {fileUrl: string, mimeType?: string}) => {
  const res = await fetch(fileUrl);
  const buffer = await res.buffer();

  return new Promise((resolve, reject) => {
    s3Client.upload(
      {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${S3_PATH_PREFIX}${uuid()}.jpg`,
        ContentType: mimeType || res.headers.get("content-type"),
        ContentLength: res.headers.get("content-length"),
        Body: buffer,
      },
      (err, res) => {
        if (err) return reject(err);
        return resolve(res.Key);
      }
    );
  });
};

export async function uploadImage({ fileUrl, entityType }) {
  const [cloudinaryUrl, s3Url] = await Promise.all([
    uploadToCloudinary(fileUrl),
    uploadToAWSFromUrl({ fileUrl }),
  ]);

  const xx = await ImageModel.create({ cloudinaryUrl, s3Url, entityType });
  return xx;
}