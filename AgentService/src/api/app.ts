import cors from "cors";
import express from "express";
import type { AgentServiceConfig } from "../config/env.js";
import type { Queryable } from "../storage/database.js";
import { checkDatabase } from "../storage/database.js";
import { AgentRepository } from "../storage/agent.repository.js";
import { AgentRunService } from "./agentRun.service.js";
import { createAgentRunRouter } from "./agentRun.routes.js";
import { createErrorMiddleware } from "./error.middleware.js";
import { requestIdMiddleware } from "./requestId.middleware.js";
import { sendSuccess } from "./response.js";

export const createApp = (
  db: Queryable,
  nodeEnvOrConfig: string | AgentServiceConfig = "development",
): express.Express => {
  const app = express();
  const repository = new AgentRepository(db);
  const nodeEnv = typeof nodeEnvOrConfig === "string" ? nodeEnvOrConfig : nodeEnvOrConfig.nodeEnv;
  const service =
    typeof nodeEnvOrConfig === "string"
      ? new AgentRunService(repository)
      : new AgentRunService(repository, nodeEnvOrConfig.repoRoot, nodeEnvOrConfig.maxChangedFiles);

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(requestIdMiddleware);

  app.get("/health", (_req, res) => {
    sendSuccess(res, {
      status: "ok",
      service: "agent-service",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/ready", async (_req, res, next) => {
    try {
      await checkDatabase(db);
      sendSuccess(res, {
        status: "ready",
        dependencies: {
          postgres: "ok",
        },
      });
    } catch (error) {
      next(error);
    }
  });

  app.use("/api/agent-runs", createAgentRunRouter(service));
  app.use(createErrorMiddleware(nodeEnv === "production"));

  return app;
};
