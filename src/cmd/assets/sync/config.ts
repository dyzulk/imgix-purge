import { ui } from '../../../internal/ui/prompts.js';
import { fetchSourceDetail } from '../../../pkg/api/index.js';

export interface BucketConfig {
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
  region: string;
  sourcePrefix: string;
}

export async function resolveBucketConfig(apiKey: string, sourceId: string): Promise<BucketConfig> {
  const s = ui.spinner();
  s.start('Fetching Source configuration details...');
  
  let sourceDetail;
  try {
    sourceDetail = await fetchSourceDetail(apiKey, sourceId);
    s.stop('Source details fetched successfully');
  } catch (error: any) {
    s.stop('Failed to fetch source details');
    ui.log.error(error.message || error);
    process.exit(1);
  }
  
  const deployment = sourceDetail.data.attributes.deployment;
  const type = deployment.type;
  
  if (type !== 's3' && type !== 's3_compatible') {
    ui.log.error(`Unsupported source deployment type: ${type}. Only S3 and S3-Compatible (R2) sources are supported for bucket sync.`);
    process.exit(1);
  }
  
  const configObj = {
    ...deployment,
    ...(deployment[type] && typeof deployment[type] === 'object' ? deployment[type] : {})
  };
  
  // Extract bucket details
  const bucketName = configObj.bucket_name || configObj.s3_bucket || configObj.bucket;
  const accessKeyId = configObj.access_key_id || configObj.s3_access_key || configObj.access_key;
  const sourcePrefix = configObj.prefix || configObj.s3_prefix || '';
  const endpoint = configObj.endpoint_url || configObj.endpoint || configObj.s3_endpoint || configObj.s3_compatible_endpoint;
  const region = configObj.region || 'auto';
  
  if (!bucketName) {
    ui.log.error('Bucket name could not be resolved from Source configuration.');
    process.exit(1);
  }
  if (!accessKeyId) {
    ui.log.error('Access Key ID could not be resolved from Source configuration.');
    process.exit(1);
  }
  
  // Resolve secret key
  let secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
  if (!secretAccessKey) {
    const inputSecret = await ui.password({
      message: `Enter AWS/R2 Secret Access Key for bucket "${bucketName}" (Access Key ID: ${accessKeyId}):`,
      validate: (val) => {
        if (!val || val.trim().length === 0) return 'Secret Access Key is required.';
      }
    });
    
    if (ui.isCancel(inputSecret)) {
      ui.cancel('Sync cancelled.');
      process.exit(0);
    }
    secretAccessKey = (inputSecret as string).trim();
  }

  return {
    bucketName,
    accessKeyId,
    secretAccessKey,
    endpoint: endpoint || undefined,
    region,
    sourcePrefix,
  };
}
