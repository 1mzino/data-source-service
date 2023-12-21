import dotenv from "dotenv";
dotenv.config();

import { Storage } from "@google-cloud/storage";
const storage = new Storage({
  keyFilename: process.env.DATA_SOURCE_SERVICE_CREDENTIALS,
});

async function getBucket(bucketName) {
  const bucket = storage.bucket(bucketName);
  const [exists] = await bucket.exists();

  if (!exists) {
    throw new Error("Bucket does not exist.");
  }

  return bucket;
}

export async function uploadJsonToBucket(json) {
  const { id, name } = JSON.parse(json);

  const fileName = `${id}.json`;
  const bucketName = process.env.DATA_SOURCE_BUCKET_NAME;
  const bucket = await getBucket(bucketName);

  const file = bucket.file(fileName);

  try {
    await file.save(json, {
      metadata: {
        cacheControl: "public, max-age=3600",
      },
    });

    const [metadata] = await file.getMetadata();

    const contents = JSON.parse(json);

    return {
      id,
      name,
      jsonUrl: `https://storage.googleapis.com/${bucketName}/${id}.json`,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${id}/edit`,
      timeCreated: metadata.timeCreated,
      contents,
    };
  } catch (error) {
    console.error("Error uploading JSON:", error);
    throw error;
  }
}

export async function getJsonFromBucket(id) {
  const fileName = `${id}.json`;
  const bucketName = process.env.DATA_SOURCE_BUCKET_NAME;
  const bucket = await getBucket(bucketName);

  const file = bucket.file(fileName);

  try {
    const [exists] = await file.exists();
    if (!exists) {
      throw new Error("File does not exist.");
    }

    const [metadata] = await file.getMetadata();
    const [fileContents] = await file.download();

    const contents = JSON.parse(fileContents.toString());
    return {
      id,
      name: contents.name,
      jsonUrl: `https://storage.googleapis.com/${bucketName}/${metadata.name}`,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${id}/edit`,
      timeCreated: metadata.timeCreated,
      contents,
    };
  } catch (error) {
    console.error("Error getting JSON:", error);
    throw error;
  }
}

export async function deleteJsonFromBucket(id) {
  try {
    const fileName = `${id}.json`;
    const bucketName = process.env.DATA_SOURCE_BUCKET_NAME;
    const bucket = await getBucket(bucketName);

    const file = bucket.file(fileName);

    const [exists] = await file.exists();
    if (!exists) {
      throw new Error("File does not exist.");
    }

    await file.delete();
  } catch (error) {
    console.error("Error deleting JSON:", error);
    throw error;
  }
}
