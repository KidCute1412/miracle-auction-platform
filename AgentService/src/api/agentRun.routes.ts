import { Router } from "express";
import type { Request } from "express";
import type { AgentRunService } from "./agentRun.service.js";
import { sendSuccess } from "./response.js";
import { approveRunSchema, createRunSchema, runIdParamSchema } from "./agentRun.validation.js";
import { validate } from "./validate.js";
import type { CreateRunInput } from "../shared/types.js";
import { AppError } from "../shared/errors.js";

interface ApproveBody {
  reviewer: string;
  note: string;
}

const getRunId = (req: Request): string => {
  const id = req.params.id;
  if (typeof id !== "string") {
    throw new AppError(400, "VALIDATION_ERROR", "Run id must be a string");
  }
  return id;
};

export const createAgentRunRouter = (service: AgentRunService): Router => {
  const router = Router();

  router.post("/", validate(createRunSchema, "body"), async (req, res, next) => {
    try {
      const data = await service.createRun(req.body as CreateRunInput);
      sendSuccess(res, data, 201);
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", validate(runIdParamSchema, "params"), async (req, res, next) => {
    try {
      const data = await service.getRun(getRunId(req));
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id/artifacts", validate(runIdParamSchema, "params"), async (req, res, next) => {
    try {
      const data = await service.listArtifacts(getRunId(req));
      sendSuccess(res, data, 200, { count: data.length });
    } catch (error) {
      next(error);
    }
  });

  router.post(
    "/:id/approve",
    validate(runIdParamSchema, "params"),
    validate(approveRunSchema, "body"),
    async (req, res, next) => {
      try {
        const body = req.body as ApproveBody;
        const data = await service.approveRun(getRunId(req), body.reviewer, body.note || null);
        sendSuccess(res, data);
      } catch (error) {
        next(error);
      }
    },
  );

  router.post("/:id/cancel", validate(runIdParamSchema, "params"), async (req, res, next) => {
    try {
      const data = await service.cancelRun(getRunId(req));
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  });

  return router;
};
