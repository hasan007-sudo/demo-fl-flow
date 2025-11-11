import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
});

/**
 * Generate a presigned URL for accessing a private S3 object
 * @param key - The S3 object key (e.g., "sessions/sessionId.mp4")
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Presigned URL that can be used to access the object
 */
export async function generatePresignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
  });

  const presignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn,
  });

  return presignedUrl;
}

/**
 * Extract S3 key from a full S3 URL
 * @param url - Full S3 URL (e.g., "https://bucket.s3.region.amazonaws.com/path/to/file.mp4")
 * @returns S3 key (e.g., "path/to/file.mp4")
 */
export function extractS3Key(url: string): string {
  try {
    const urlObj = new URL(url);

    // Handle path-style URLs: https://s3.region.amazonaws.com/bucket/key
    if (urlObj.hostname.startsWith('s3.') || urlObj.hostname === process.env.S3_ENDPOINT?.replace('https://', '')) {
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      // Remove bucket name and get the rest as key
      return pathParts.slice(1).join('/');
    }

    // Handle virtual-hosted-style URLs: https://bucket.s3.region.amazonaws.com/key
    // Just remove the leading slash from pathname
    return urlObj.pathname.startsWith('/')
      ? urlObj.pathname.slice(1)
      : urlObj.pathname;
  } catch (error) {
    console.error('Error extracting S3 key from URL:', error);
    throw new Error('Invalid S3 URL format');
  }
}

/**
 * Generate presigned URL from a full S3 URL
 * @param s3Url - Full S3 URL stored in database
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Presigned URL
 */
export async function generatePresignedUrlFromS3Url(
  s3Url: string,
  expiresIn: number = 3600
): Promise<string> {
  const key = extractS3Key(s3Url);
  return generatePresignedUrl(key, expiresIn);
}
