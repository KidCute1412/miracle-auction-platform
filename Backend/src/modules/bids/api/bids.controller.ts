import type { Response } from "express";
import type { BanBidderRequest, BidHistoryQuery, BidRequest, BuyNowRequest } from "api-contracts";
import { requireAuthenticatedUser, type AccountRequest } from "@/interfaces/request.interface.ts";
import { BanBidderUseCase } from "../application/ban-bidder.use-case.ts";
import { BuyNowUseCase } from "../application/buy-now.use-case.ts";
import { GetBidHistoryUseCase } from "../application/get-bid-history.use-case.ts";
import { PlaceBidUseCase } from "../application/place-bid.use-case.ts";
import { BidDomainError } from "../domain/bid.errors.ts";

const body = <T>(res: Response): T => res.locals.validated?.body as T;
const query = <T>(res: Response): T => res.locals.validated?.query as T;
function legacyError(res: Response, error: unknown, fallback: string): Response {
  const status = error instanceof BidDomainError ? error.statusCode : 500;
  if (status === 500) console.error(error);
  return res.status(status).json({ status: "error", message: status === 500 ? fallback : (error as Error).message });
}
export async function playBid(req: AccountRequest, res: Response): Promise<Response> {
  try {
    const account = requireAuthenticatedUser(req);
    const input = body<BidRequest>(res);
    return res.status(200).json(
      await new PlaceBidUseCase().execute({
        userId: account.user_id,
        productId: input.product_id,
        maxPrice: input.max_price,
        idempotencyKey: req.header("Idempotency-Key") ?? undefined,
      }),
    );
  } catch (error) {
    return legacyError(res, error, "Server error");
  }
}
export async function buyNowProduct(req: AccountRequest, res: Response): Promise<Response> {
  try {
    const account = requireAuthenticatedUser(req);
    const input = body<BuyNowRequest>(res);
    return res.status(200).json(
      await new BuyNowUseCase().execute({
        userId: account.user_id,
        productId: input.product_id,
        buyPrice: input.buy_price,
        idempotencyKey: req.header("Idempotency-Key") ?? undefined,
      }),
    );
  } catch (error) {
    return legacyError(res, error, "Server error on buy now");
  }
}
export async function getBidHistoryByProductId(req: AccountRequest, res: Response): Promise<Response> {
  try {
    const account = requireAuthenticatedUser(req);
    const input = query<BidHistoryQuery>(res);
    const result = await new GetBidHistoryUseCase().execute(input.product_id, account.user_id);
    return res.status(200).json({ status: "success", data: result.bidHistory, isSeller: result.isSeller });
  } catch (error) {
    return legacyError(res, error, "Server error");
  }
}
export async function banBidder(req: AccountRequest, res: Response): Promise<Response> {
  try {
    const account = requireAuthenticatedUser(req);
    const input = body<BanBidderRequest>(res);
    return res
      .status(200)
      .json(
        await new BanBidderUseCase().execute(
          { userId: account.user_id, role: account.role },
          input.product_id,
          input.banned_user_id,
          input.reason,
        ),
      );
  } catch (error) {
    return legacyError(res, error, "Server error banning bidder");
  }
}
