# Bulk Purge Solutions in imgix

This document explains the alternative solutions and methods to delete/clear the cache of all assets in imgix in bulk, without having to do so individually for each URL.

---

## Why is there no "Purge Entire Source" button?
By default, imgix does not provide a one-click dashboard button to clear the entire Source cache. This is because such an operation is highly resource-intensive and can drastically degrade CDN performance when imgix is forced to refetch all new images from your origin storage.

However, there are three solutions you can use as alternatives:

---

## Solution 1: Contact imgix Support
If you have an urgent need to clear the entire cache of a Source:
1. Send an email to **support@imgix.com** using your account's registered email.
2. Include your **Source ID** (which can be found in the imgix dashboard under Source settings).
3. Provide the reason why you need a full cache flush (e.g., the origin R2 storage has been permanently deleted).
4. The imgix support team will manually perform a full cache flush for your Source on their server side.

---

## Solution 2: Delete and Recreate the Source in the Dashboard
This method is the fastest and most efficient way if you plan to change storage providers or will no longer use the old bucket:
1. Log in to the **imgix** dashboard and select your Source.
2. Click the **Source Settings** button at the top right.
3. Scroll to the bottom of the page and click **Delete** to remove the Source.
4. Create a new Source (even if you point it to a new empty storage or replacement storage).
5. By deleting the old Source, all cached URLs associated with it will automatically be discarded permanently.

---

## Solution 3: Automation via API Script (Batch Purge)
You can use this `imgix-purge` Node.js project to write an automation script that retrieves the entire list of assets and sends a purge request for each of those assets sequentially.

Implementation steps:
1. **Get an API Key**: Log in to the imgix dashboard, navigate to the API Keys menu, and create a new API Key with the following permissions:
   - `Asset Manager Browse` (to retrieve the file list).
   - `Purge` (to clear the cache).
2. **Fetch the Asset List (Browse Assets)**:
   - Use the Management API to retrieve the list of assets:
     ```http
     GET https://api.imgix.com/api/v1/sources/<YOUR_SOURCE_ID>/assets
     Headers:
       Authorization: Bearer <YOUR_API_KEY>
       Accept: application/vnd.api+json
     ```
3. **Send Purge Requests**:
   - For each asset retrieved in step 2, send purge requests in batches:
     ```http
     POST https://api.imgix.com/api/v1/purge
     Headers:
       Authorization: Bearer <YOUR_API_KEY>
       Content-Type: application/vnd.api+json
     Body:
       {
         "data": {
           "attributes": {
             "url": "https://your-source.imgix.net/path/to/image.jpg"
           },
           "type": "purges"
         }
       }
     ```
