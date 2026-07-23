import { Router } from "express";
import { validate } from "@/middlewares/validate.middleware.ts";
import * as controller from "./bids.controller.ts";
import {
  auctionMutationParamsSchema,
  banBidderBodySchema,
  bidBodySchema,
  bidHistoryQuerySchema,
  buyNowBodySchema,
  cancelAuctionBodySchema,
} from "./bids.schemas.ts";
const route = Router();
route.post("/", validate(bidBodySchema, "body"), controller.playBid);
route.get("/", validate(bidHistoryQuerySchema, "query"), controller.getBidHistoryByProductId);
route.post("/purchase", validate(buyNowBodySchema, "body"), controller.buyNowProduct);
route.post("/bans", validate(banBidderBodySchema, "body"), controller.banBidder);
route.post(
  "/auctions/:product_id/cancel",
  validate(auctionMutationParamsSchema, "params"),
  validate(cancelAuctionBodySchema, "body"),
  controller.cancelAuction,
);
export default route;
