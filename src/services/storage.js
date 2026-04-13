import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../lib/env.js';
import { logger } from '../lib/logger.js';

const s3 = env.R2_ACCOUNT_ID
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    })
  : null;

// 72 hours in seconds
const SIGNED_URL_EXPIRY = 72 * 60 * 60;

export async function uploadReport(jobId, pdfBuffer) {
  if (!s3) {
    logger.warn({ jobId }, 'R2 not configured — skipping upload, returning placeholder URL');
    return `http://localhost:3000/dev-placeholder/${jobId}.pdf`;
  }

  const key = `reports/${jobId}.pdf`;

  await s3.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
    })
  );

  const signedUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }),
    { expiresIn: SIGNED_URL_EXPIRY }
  );

  return signedUrl;
}
