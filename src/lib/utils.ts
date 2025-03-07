import { UpcomingMatchByUser } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Id } from "../../convex/_generated/dataModel";
import {
  POINT_PER_CATCH,
  POINT_PER_RUN,
  POINT_PER_RUNOUTS,
  POINT_PER_STUMPINGS,
  POINT_PER_WICKET,
} from "./contants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function MatchesgrpByDate(allMatches: UpcomingMatchByUser[]): {
  date: string;
  matches: UpcomingMatchByUser[];
}[] {
  const groupedMatches: Record<string, UpcomingMatchByUser[]> = {};

  allMatches.forEach((match) => {
    // Extract and format the date (YYYY-MM-DD)
    const dateStr = match.datetimeUtc.split("T")[0];
    const formattedDate = new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Ensure the match object includes the formatted time
    const matchDetails = {
      ...match,
      time: new Date(match.datetimeUtc).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };

    // Initialize the date entry if not already present
    if (!groupedMatches[formattedDate]) {
      groupedMatches[formattedDate] = [];
    }

    groupedMatches[formattedDate].push(matchDetails);
  });

  // Convert grouped matches to an array with date-wise grouping
  return Object.keys(groupedMatches).map((date) => ({
    date,
    matches: groupedMatches[date],
  }));
}

export function formatLocalDateTime(utcDateTime: string): string {
  const dateObj = new Date(utcDateTime); // Convert to Date object

  // Format the date in the user's local timezone
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Format the time in the user's local timezone
  const formattedTime = dateObj.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${formattedDate} ${formattedTime}`;
}

export function formatLocalDate(utcDateTime: string): string {
  const dateObj = new Date(utcDateTime); // Convert to Date object

  // Format the date in the user's local timezone
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `${formattedDate} `;
}

export function formatLocalTime(utcDateTime: string): string {
  const dateObj = new Date(utcDateTime); // Convert to Date object

  // Format the time in the user's local timezone
  const formattedTime = dateObj.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${formattedTime}`;
}

export const calculatePlayerPoints = (
  runs: number,
  wickets: number,
  catches: number,
  stumpings: number,
  runouts: number
): number => {
  return (
    runs * POINT_PER_RUN +
    wickets * POINT_PER_WICKET +
    catches * POINT_PER_CATCH +
    stumpings * POINT_PER_STUMPINGS +
    runouts * POINT_PER_RUNOUTS
  );
};

export const calculateTeamPoints = (
  homeTeamId: Id<"teams">,
  awayTeamId: Id<"teams">,
  winnerId: string | null
) => {
  return winnerId
    ? [
        { teamId: homeTeamId, teamPoints: homeTeamId === winnerId ? 10 : 0 },
        { teamId: awayTeamId, teamPoints: awayTeamId === winnerId ? 10 : 0 },
      ]
    : [
        { teamId: homeTeamId, teamPoints: 5 },
        { teamId: awayTeamId, teamPoints: 5 },
      ];
};

export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};
