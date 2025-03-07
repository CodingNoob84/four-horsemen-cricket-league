import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.daily(
  "run-10-utc",
  {
    hourUTC: 10,
    minuteUTC: 0,
  },
  internal.common.updateMatchStatus
);

crons.daily(
  "run-14-utc",
  {
    hourUTC: 14,
    minuteUTC: 0,
  },
  internal.common.updateMatchStatus
);
export default crons;
