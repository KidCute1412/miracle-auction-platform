import { BidRepository } from "../infrastructure/bid.repository.ts";
const bids = new BidRepository();
export class GetBidHistoryUseCase {
  async execute(productId: number, userId: number): Promise<{ isSeller: boolean; bidHistory: unknown[] }> {
    return { isSeller: (await bids.sellerId(productId)) === userId, bidHistory: await bids.history(productId) };
  }
}
