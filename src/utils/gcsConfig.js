const { Storage } = require('@google-cloud/storage');
require('dotenv').config();

// Helper to decode base64 credentials
function getCredentialsFromBase64() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) return null;

  try {
    const decoded = Buffer.from(
      process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64,
      'base64'
    ).toString('utf-8');

    return JSON.parse(decoded);
  } catch (err) {
    console.error('Failed to parse base64 credentials:', err.message);
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
let storage = null;
let bucket = null;

try {
  const gcs = initializeGCS();
  storage = gcs.storage;
  bucket = gcs.bucket;
} catch (err) {
  console.error('GCS Initialization Error:', err.message);
  console.log('Server will continue without GCS functionality');
}

module.exports = { storage, bucket, initializeGCS };
