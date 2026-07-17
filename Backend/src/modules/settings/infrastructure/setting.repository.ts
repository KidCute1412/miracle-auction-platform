import { prisma } from "@/infrastructure/database/prisma.client.ts";

// Fetch the automatic bidding extension settings
export async function getAutoExtendTimeSetting() {
  return prisma.extend_bidding_time.findFirst({
    select: { extend_time: true, threshold_time: true },
  });
}
