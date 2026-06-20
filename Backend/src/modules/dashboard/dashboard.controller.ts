import { Request, Response } from "express";
import * as DashboardService from "./dashboard.service.ts";

// Handle request to retrieve all dashboard summary intelligence data
export async function getSummary(req: Request, res: Response) {
  try {
    const range = req.query.range ? String(req.query.range) : undefined;
    const summary = await DashboardService.getDashboardSummary(range);
    res.json({
      code: "success",
      message: "Success",
      data: summary,
    });
  } catch (error) {
    res.status(500).json({ code: "error", message: "Server error" });
  }
}
