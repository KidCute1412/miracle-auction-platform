import { Router } from "express";
import * as settingsController from "./settings.controller.ts";

const route = Router();

// Get auto-extend time configuration
route.get("/auto-extend-time", settingsController.getAutoExtendTimeSetting);

export default route;
