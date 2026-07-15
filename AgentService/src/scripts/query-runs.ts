import { loadConfig } from "../config/env.js";
import { createPool } from "../storage/database.js";

const run = async () => {
  const config = loadConfig();
  const pool = createPool(config);
  try {
    const runs = await pool.query("select id, task, status, error_message, current_step, created_at from agent_runs order by created_at desc limit 1");
    console.log("RUNS:");
    console.log(JSON.stringify(runs.rows, null, 2));

    for (const r of runs.rows) {
      console.log(`\n================ RUN ${r.id} (${r.status}) ================`);
      const steps = await pool.query("select * from agent_steps where run_id = $1 order by created_at asc", [r.id]);
      console.log("STEPS:", JSON.stringify(steps.rows, null, 2));

      const audits = await pool.query("select * from agent_command_audits where run_id = $1 order by created_at asc", [r.id]);
      console.log("AUDITS:");
      for (const aud of audits.rows) {
        console.log(`  Audit: ${aud.executable} ${aud.args.join(" ")} -> exit ${aud.exit_code}`);
        if (aud.stderr_artifact_id) {
          const errArt = await pool.query("select content from agent_artifacts where id = $1", [aud.stderr_artifact_id]);
          console.log(`    Stderr: ${errArt.rows[0]?.content.trim()}`);
        }
      }
    }
  } finally {
    await pool.end();
  }
};

run().catch(console.error);
