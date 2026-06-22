import { S3Client, ListObjectsV2Command, ListObjectsV2CommandOutput } from '@aws-sdk/client-s3';

export interface S3ScanOptions {
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
  region?: string;
  prefix?: string;
}

/**
 * Lists all keys (objects) in an S3 or S3-compatible bucket matching a prefix.
 * Excludes directories and empty paths.
 */
export async function scanBucketObjects(options: S3ScanOptions): Promise<string[]> {
  const {
    bucketName,
    accessKeyId,
    secretAccessKey,
    endpoint,
    region = 'auto',
    prefix,
  } = options;

  const s3 = new S3Client({
    region,
    endpoint: endpoint || undefined,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const keys: string[] = [];
  let isTruncated = true;
  let nextContinuationToken: string | undefined = undefined;

  while (isTruncated) {
    const command: ListObjectsV2Command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix || undefined,
      ContinuationToken: nextContinuationToken,
    });

    const response = (await s3.send(command)) as ListObjectsV2CommandOutput;
    if (response.Contents) {
      for (const item of response.Contents) {
        if (item.Key) {
          // Exclude directories (keys ending with /) or empty keys
          if (!item.Key.endsWith('/') && item.Key.trim().length > 0) {
            keys.push(item.Key);
          }
        }
      }
    }
    isTruncated = !!response.IsTruncated;
    nextContinuationToken = response.NextContinuationToken;
  }

  return keys;
}
