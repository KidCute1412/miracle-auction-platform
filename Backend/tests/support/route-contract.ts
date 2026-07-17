import express, { type Express, type Router } from "express";
import request from "supertest";

export type ContractMethod = "get" | "post" | "put" | "patch" | "delete";

export interface RouteContract {
  method: ContractMethod;
  path: string;
  handler: string;
  body?: Record<string, unknown>;
}

export function createRouteContractApp(mountPath: string, router: Router): Express {
  const app = express();
  app.use(express.json());
  app.use(mountPath, router);
  return app;
}

export async function callRoute(app: Express, contract: RouteContract) {
  let call = request(app)[contract.method](contract.path);
  if (contract.body) call = call.send(contract.body);
  return call;
}
