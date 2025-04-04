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

crons.daily(
  "run-1-utc",
  {
    hourUTC: 6,
    minuteUTC: 53,
  },
  internal.betting.dailySetBots
);
crons.daily(
  "run-105-utc",
  {
    hourUTC: 10,
    minuteUTC: 1,
  },
  internal.betting.updateBettingTeams
);

crons.daily(
  "run-145-utc",
  {
    hourUTC: 14,
    minuteUTC: 1,
  },
  internal.betting.updateBettingTeams
);
export default crons;
