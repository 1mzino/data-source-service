import dotenv from "dotenv";
dotenv.config();

import { google } from "googleapis";

function getAuth() {
  return new google.auth.GoogleAuth({
    keyFilename: process.env.DATA_SOURCE_SERVICE_CREDENTIALS,
    scopes: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"],
  });
}

export async function createSheet(name) {
  try {
    const auth = getAuth();
    const drive = google.drive({ version: "v3", auth });

    const fileMetadata = {
      name,
      mimeType: "application/vnd.google-apps.spreadsheet",
      parents: [process.env.DATA_SOURCE_DRIVE_ID],
      driveId: process.env.DATA_SOURCE_DRIVE_ID,
    };

    const createFileResponse = await drive.files.create({
      requestBody: fileMetadata,
      fields: "id, name",
      supportsAllDrives: true,
    });

    return createFileResponse.data;
  } catch (error) {
    console.error("Error creating the sheet:\n", error);
    throw error;
  }
}

export async function deleteSheet(id) {
  try {
    const auth = getAuth();
    const drive = google.drive({ version: "v3", auth });

    await drive.files.delete({
      fileId: id,
      supportsAllDrives: true,
    });
  } catch (error) {
    console.error("Error deleting the sheet file:\n", error);
    throw error;
  }
}

export async function listAllSheets(driveId) {
  try {
    const auth = getAuth();
    const drive = google.drive({ version: "v3", auth });

    const listFilesResponse = await drive.files.list({
      q: `'${driveId}' in parents and mimeType='application/vnd.google-apps.spreadsheet'`,
      fields: "files(id, name)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const bucketName = process.env.DATA_SOURCE_BUCKET_NAME;
    const sheetsData = listFilesResponse.data.files.map((file) => ({
      id: file.id,
      name: file.name,
      jsonUrl: `https://storage.googleapis.com/${bucketName}/${file.id}.json`,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
    }));

    return sheetsData;
  } catch (error) {
    console.error("Error listing sheets:\n", error);
    throw error;
  }
}
