import type { ContextPack } from "../context/contextIndexer.js";

export const planningPrompt = (task: string, context: ContextPack, tokenBudget: number): string => {
  return [
    "You are the planner in a multi-agent code-change workflow.",
    `Token budget: ${tokenBudget}.`,
    "Produce a concise implementation plan with target files, test commands, risks, and handoff notes.",
    "IMPORTANT: Do NOT execute or run tests, start dev servers, or run long-running NPM/package installations during this planning phase. Simply analyze the static codebase context and produce the plan.",
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
    "IMPORTANT: Do NOT ask for approval, confirmation, or wait for the user to proceed. You are already running inside the automated execution sandbox, so proceed directly with implementing all required file and code modifications now.",
    `Task:\n${task}`,
    `Approved plan:\n${plan}`,
    "When finished, print a short implementation summary.",
    "End with AGENT_DECISION: pass and AGENT_TARGET: tester.",
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
    "End with AGENT_DECISION: pass or AGENT_DECISION: fail. If failed, also include AGENT_TARGET: coder.",
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
    "End with AGENT_DECISION: pass or AGENT_DECISION: needs_changes. If changes are needed, include AGENT_TARGET: coder.",
  ].join("\n\n");
};
