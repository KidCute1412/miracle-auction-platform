import type { ContextPack } from "../context/contextIndexer.js";

export const planningPrompt = (task: string, context: ContextPack, tokenBudget: number): string => {
  return [
    "You are the planner in a multi-agent code-change workflow.",
    `Token budget: ${tokenBudget}.`,
    "Produce a concise implementation plan with target files, test commands, risks, and handoff notes.",
    `Task:\n${task}`,
    `Context summary:\n${context.summary}`,
    `Package scripts:\n${JSON.stringify(context.packageScripts, null, 2)}`,
    `File manifest:\n${context.files.map((file) => `${file.path} (${file.bytes} bytes)`).join("\n")}`,
  ].join("\n\n");
};

export const implementationPrompt = (task: string, plan: string, tokenBudget: number): string => {
  return [
    "You are the implementer in a multi-agent code-change workflow.",
    `Token budget: ${tokenBudget}.`,
    "Apply the requested code changes inside this workspace. Keep changes scoped to the approved plan.",
    `Task:\n${task}`,
    `Approved plan:\n${plan}`,
    "When finished, print a short implementation summary.",
  ].join("\n\n");
};

export const testingPrompt = (task: string, plan: string, tokenBudget: number): string => {
  return [
    "You are the tester in a multi-agent code-change workflow.",
    `Token budget: ${tokenBudget}.`,
    "Run focused verification, starting with npm run build for the affected package when available.",
    `Task:\n${task}`,
    `Plan:\n${plan}`,
    "Return commands, pass/fail status, and relevant failure excerpts only.",
  ].join("\n\n");
};

export const reviewPrompt = (task: string, plan: string, testReport: string, tokenBudget: number): string => {
  return [
    "You are the reviewer in a multi-agent code-change workflow.",
    `Token budget: ${tokenBudget}.`,
    "Review the final diff, plan adherence, risks, and test evidence. Lead with blocking findings.",
    `Task:\n${task}`,
    `Plan:\n${plan}`,
    `Test report:\n${testReport}`,
  ].join("\n\n");
};
