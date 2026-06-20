import db from "./config/database.config.ts";

async function test() {
  try {

    const interval = "6 months";
    const format = "Mon";
    const dateTrunc = "month";

    console.log("Running test query...");
    const overviewQuery = await db.raw(
      `select to_char(created_at, '${format}') as month, count(*) as count, date_trunc('${dateTrunc}', created_at) as trunc_date
       from products 
       where created_at >= now() - ?::interval 
       group by to_char(created_at, '${format}'), date_trunc('${dateTrunc}', created_at) 
       order by trunc_date`,
      [interval]
    );
    console.log("Overview query output:", overviewQuery.rows);
  } catch (err: any) {
    console.error("Test Query failed with error:", err.message);
  } finally {
    process.exit(0);
  }
}
test();
