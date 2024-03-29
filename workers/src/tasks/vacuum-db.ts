import { Task } from "graphile-worker";

const vacuumDb: Task = async function (_job, helpers) {
  helpers.query("VACUUM graphile_worker.jobs");
};

export default vacuumDb;
