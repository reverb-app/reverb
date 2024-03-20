import { Task } from "graphile-worker";

const vacuum_db: Task = async function (_job, helpers) {
  helpers.query("VACUUM graphile_worker.jobs");
};

export default vacuum_db;
