import { createSheet, deleteSheet, listAllSheets } from "./sheetsModule.js";
import { uploadJsonToBucket, getJsonFromBucket, deleteJsonFromBucket } from "./storageModule.js";

export async function handleCreateDataSource(name) {
  try {
    const { id } = await createSheet(name);
    const jsonPayload = JSON.stringify({
      id,
      name,
    });

    const uploadJsonResponse = await uploadJsonToBucket(jsonPayload);
    console.log(uploadJsonResponse);
  } catch (error) {
    console.error("Error creating data source:", error);
    throw error;
  }
}

export async function handleDeleteDataSource(id) {
  try {
    await Promise.all([deleteSheet(id), deleteJsonFromBucket(id)]);
    console.log("Successfully deleted dataSource");
  } catch (error) {
    console.error("Error deleting data source:", error);
    throw error;
  }
}

export async function handleGetDataSource(id) {
  try {
    const dataSourceJSON = await getJsonFromBucket(id);
    console.log(dataSourceJSON);
  } catch (error) {
    console.error("Error reading data source:", error);
    throw error;
  }
}

export async function handleListAllDataSources() {
  try {
    const driveId = process.env.DATA_SOURCE_DRIVE_ID;
    const dataSources = await listAllSheets(driveId);
    console.log(dataSources);
  } catch (error) {
    console.error("Error listing data sources:", error);
    throw error;
  }
}
