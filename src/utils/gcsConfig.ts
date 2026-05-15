import { Storage, type Bucket } from '@google-cloud/storage';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

type GcsCredentials = {
  client_email?: string;
  private_key?: string;
  project_id?: string;
};

// Helper to decode base64 credentials
function getCredentialsFromBase64(): GcsCredentials | null {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) return null;

  try {
    const decoded = Buffer.from(
      process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64,
      'base64'
    ).toString('utf-8');

    return JSON.parse(decoded) as GcsCredentials;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Failed to parse base64 credentials:', message);
    return null;
  }
}

// Initialize Google Cloud Storage
function initializeGCS() {
  if (!process.env.BUCKET_NAME) {
    throw new Error('BUCKET_NAME environment variable is required');
  }

  const credentials = getCredentialsFromBase64();

  if (credentials) {
    console.log('GCS initialized using base64 encoded credentials');
    const storage = new Storage({ credentials });
    return { storage, bucket: storage.bucket(process.env.BUCKET_NAME) };
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log('GCS initialized using service account key file');
    const storage = new Storage({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    return { storage, bucket: storage.bucket(process.env.BUCKET_NAME) };
  }

  throw new Error(
    'No valid GCS credentials found. Please check your environment variables.'
  );
}

// Export initialized instances or null on failure
let storage: Storage | null = null;
let bucket: Bucket | null = null;

const initializeLazyGCS = () => {
  if (storage && bucket) return { storage, bucket };
  try {
    const gcs = initializeGCS();
    storage = gcs.storage;
    bucket = gcs.bucket;
    return { storage, bucket };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('GCS Initialization Error:', message);
    return { storage: null, bucket: null };
  }
};

export { bucket, initializeGCS, storage, initializeLazyGCS };
