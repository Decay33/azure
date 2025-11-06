import { BlobServiceClient, ContainerClient, generateBlobSASQueryParameters, BlobSASPermissions, SASProtocol, StorageSharedKeyCredential } from "@azure/storage-blob";
import { config } from "../config";

let containerClient: ContainerClient | null = null;

const getContainerClient = (): ContainerClient => {
  if (containerClient) {
    return containerClient;
  }

  const { storage } = config;

  if (!storage.connectionString) {
    throw new Error("STORAGE_CONNECTION_STRING is required to access blob storage.");
  }

  const blobService = BlobServiceClient.fromConnectionString(storage.connectionString);
  containerClient = blobService.getContainerClient(storage.containerName);

  return containerClient;
};

export const ensureContainerExists = async (): Promise<void> => {
  const client = getContainerClient();
  await client.createIfNotExists({ access: "blob" });
};

export const createUploadSas = (blobName: string, expiresInMinutes = 30): string => {
  const { storage } = config;

  if (!storage.connectionString) {
    throw new Error("STORAGE_CONNECTION_STRING is required to generate SAS tokens.");
  }

  const match = storage.connectionString.match(/AccountName=([^;]+);AccountKey=([^;]+)/i);

  if (!match) {
    throw new Error("STORAGE_CONNECTION_STRING must include AccountName and AccountKey for SAS generation.");
  }

  const [, accountName, accountKey] = match;
  const credential = new StorageSharedKeyCredential(accountName, accountKey);
  const permissions = BlobSASPermissions.parse("cw");
  const expiresOn = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  return generateBlobSASQueryParameters(
    {
      containerName: storage.containerName,
      blobName,
      permissions,
      expiresOn,
      protocol: SASProtocol.Https
    },
    credential
  ).toString();
};

export const getBlobUrl = (blobName: string): string => {
  const client = getContainerClient();
  return client.getBlockBlobClient(blobName).url;
};
