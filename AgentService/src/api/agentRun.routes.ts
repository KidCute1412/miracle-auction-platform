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

  router.get("/", async (req, res, next) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const data = await service.listRecentRuns(limit);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  });

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

  router.get("/:id/messages", validate(runIdParamSchema, "params"), async (req, res, next) => {
    try {
      const data = await service.listMessages(getRunId(req));
      sendSuccess(res, data, 200, { count: data.length });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id/events", validate(runIdParamSchema, "params"), async (req, res, next) => {
    try {
      const after = req.query.after ? Number(req.query.after) : 0;
      const data = await service.listEvents(getRunId(req), Number.isFinite(after) ? after : 0);
      sendSuccess(res, data, 200, { count: data.length });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id/events/stream", validate(runIdParamSchema, "params"), async (req, res, next) => {
    try {
      const runId = getRunId(req);
      await service.getRun(runId);
      let after = req.query.after ? Number(req.query.after) : 0;
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      const writeEvents = async (): Promise<void> => {
        const events = await service.listEvents(runId, Number.isFinite(after) ? after : 0);
        for (const event of events) {
          after = event.sequence;
          res.write(`id: ${event.sequence}\n`);
          res.write(`event: ${event.eventType}\n`);
          res.write(`data: ${JSON.stringify(event)}\n\n`);
        }
      };

      await writeEvents();
      const interval = setInterval(() => {
        void writeEvents().catch(() => {
          clearInterval(interval);
          res.end();
        });
      }, 1000);
      req.on("close", () => {
        clearInterval(interval);
      });
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
