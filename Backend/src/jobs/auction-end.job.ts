import { createComponentLogger } from "@/infrastructure/observability/logger.ts";

const log = createComponentLogger("auction-end.job");

import cron from "node-cron";
import {
  getExpiredProductsNeedingEmail,
  processAuctionEndNotification,
  markAuctionEmailSent,
} from "@/modules/products/application/auction-end-mail.use-case.ts";

// Track if job is running to prevent overlapping
let isJobRunning = false;

// Main cron job function
const runAuctionEndEmailJob = async () => {
  // Prevent overlapping jobs
  if (isJobRunning) {
    log.info("[CRON] Previous job still running, skipping...");
    return;
  }

  isJobRunning = true;
  const startTime = new Date();
  log.info(`\n${"=".repeat(70)}`);
  log.info(`[CRON] Auction End Email Job Started: ${startTime.toLocaleString("vi-VN")}`);
  log.info("=".repeat(70));

  try {
    // Get expired products that need email notification
    const expiredProducts = await getExpiredProductsNeedingEmail(50);

    if (expiredProducts.length === 0) {
      log.info("[INFO] No expired products need email notification");
      return;
    }

    log.info(`[INFO] Found ${expiredProducts.length} expired products to process\n`);

    let successCount = 0;
    let failedCount = 0;

    // Process each product
    for (let i = 0; i < expiredProducts.length; i++) {
      const product = expiredProducts[i];

      //   log.info(`[${i + 1}/${expiredProducts.length}] Processing product: ${product.product_name} (ID: ${product.product_id})`);

      try {
        // Send auction end notifications
        const success = await processAuctionEndNotification(product);

        if (success) {
          // Mark as email sent
          await markAuctionEmailSent(product.product_id);
          successCount++;
          log.info(`[✓] Successfully processed product ${product.product_id}`);
        } else {
          failedCount++;
          log.info(`[✗] Failed to process product ${product.product_id}`);
        }

        // Rate limiting: delay between products (increased to 2 seconds)
        if (i < expiredProducts.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        failedCount++;
        log.error(`[ERROR] Error processing product ${product.product_id}:`, error);
      }
    }

    // Summary
    const endTime = new Date();
    const duration = ((endTime.getTime() - startTime.getTime()) / 1000).toFixed(2);

    log.info("=".repeat(70));
    log.info("[SUMMARY] Auction End Email Job Completed");
    log.info("-".repeat(70));
    log.info(`Total products processed: ${expiredProducts.length}`);
    log.info(`Successful: ${successCount}`);
    log.info(`Failed: ${failedCount}`);
    log.info(`Duration: ${duration}s`);
    log.info(`Completed at: ${endTime.toLocaleString("vi-VN")}`);
    log.info("=".repeat(70) + "\n");
  } catch (error) {
    log.error("[ERROR] Auction end email job failed:", error);
  } finally {
    isJobRunning = false;
  }
};

// Start the cron job
export const startAuctionEndEmailJob = () => {
  // Run every 2 minutes
  // Cron format: */2 * * * * (every 2 minutes)
  // For production, adjust to: */5 * * * * (every 5 minutes)

  const cronSchedule = "*/1 * * * *"; // Every 1 minutes

  cron.schedule(cronSchedule, runAuctionEndEmailJob, {
    timezone: "Asia/Ho_Chi_Minh",
  });

  log.info("\n" + "=".repeat(70));
  log.info("[CRON] Auction End Email Job Initialized");
  log.info("-".repeat(70));
  log.info(`Schedule: Every 1 minutes`);
  log.info(`Timezone: Asia/Ho_Chi_Minh`);
  log.info(`Status: Active`);
  log.info("=".repeat(70) + "\n");
};

// Export for manual testing
export const runAuctionEndEmailJobManually = runAuctionEndEmailJob;
