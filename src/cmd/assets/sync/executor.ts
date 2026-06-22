import { ui } from '@/internal/ui/prompts.js';
import { addAssetToSource } from '@/pkg/api/index.js';
import { delay } from '@/internal/utils/helper.js';


export async function performAssetIndexing(
  apiKey: string,
  sourceId: string,
  sourceName: string,
  keysToSync: string[]
): Promise<void> {
  const confirmProceed = await ui.confirm({
    message: `Ready to index ${keysToSync.length} asset(s) into Source "${sourceName}". Proceed?`,
    initialValue: true
  });
  
  if (ui.isCancel(confirmProceed) || !confirmProceed) {
    ui.cancel('Sync aborted.');
    process.exit(0);
  }
  
  const sAdd = ui.spinner();
  sAdd.start(`Indexing ${keysToSync.length} assets...`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < keysToSync.length; i++) {
    const originPath = keysToSync[i];
    sAdd.message(`[${i + 1}/${keysToSync.length}] Indexing: ${originPath}...`);
    
    const success = await addAssetToSource(apiKey, sourceId, originPath);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    await delay(100);
  }
  
  sAdd.stop(`Indexing complete.`);
  ui.log.success(`Successfully queued/indexed: ${successCount}, Failed: ${failCount}`);
}
