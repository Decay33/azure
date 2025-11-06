import {
  BlobServiceClient,
  BlobSASPermissions,
  SASProtocol,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters
} from "@azure/storage-blob";

let blobService: BlobServiceClient | null = null;
let cachedContainerName: string | null = null;

const getConnectionString = () => process.env.STORAGE_CONNECTION_STRING ?? process.env.STORAGE_CONN_STRING;

const getContainerName = () =>
  cachedContainerName ??
  (cachedContainerName = process.env.STORAGE_CONTAINER_NAME ?? process.env.AZURE_STORAGE_CONTAINER ?? "user-media");

const ensureBlobService = () => {
  if (blobService) {
    return blobService;
  }

  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error("STORAGE_CONNECTION_STRING (or STORAGE_CONN_STRING) must be set.");
  }

  blobService = BlobServiceClient.fromConnectionString(connectionString);
  return blobService;
};

const getContainerClient = () => ensureBlobService().getContainerClient(getContainerName());

const extractSharedKeyCredential = () => {
  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error("STORAGE_CONNECTION_STRING (or STORAGE_CONN_STRING) must be set.");
  }

  const match = /AccountName=([^;]+);AccountKey=([^;]+)/i.exec(connectionString);
  if (!match) {
    throw new Error("Connection string must include AccountName and AccountKey.");
  }
  const [, accountName, accountKey] = match;
  return new StorageSharedKeyCredential(accountName, accountKey);
};

const extractAccountName = () => {
  if (process.env.AZURE_STORAGE_ACCOUNT) {
    return process.env.AZURE_STORAGE_ACCOUNT;
  }

  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error("STORAGE_CONNECTION_STRING (or STORAGE_CONN_STRING) must be set.");
  }

  const match = /AccountName=([^;]+)/i.exec(connectionString);
  if (!match) {
    throw new Error("Could not determine storage account name from connection string.");
  }

  return match[1];
};

export const getBlobServiceClient = () => ensureBlobService();

export const ensureContainerExists = async () => {
  await getContainerClient().createIfNotExists({ access: "blob" });
};

export const issueWriteSas = async (blobPath: string, expiresInMinutes = 15) => {
  await ensureContainerExists();

  const credential = extractSharedKeyCredential();
  const permissions = BlobSASPermissions.parse("cw");
  const expiresOn = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  const sas = generateBlobSASQueryParameters(
    {
      containerName: getContainerName(),
      blobName: blobPath,
      permissions,
      expiresOn,
      protocol: SASProtocol.Https
    },
    credential
  ).toString();

  const account = extractAccountName();
  const blobUrl = `https://${account}.blob.core.windows.net/${getContainerName()}/${blobPath}`;

  return {
    uploadUrl: `${blobUrl}?${sas}`,
    blobUrl,
    expiresInMinutes
  };
};
