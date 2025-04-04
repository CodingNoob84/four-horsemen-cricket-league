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

export const formatCreationTime = (timestamp: number) => {
  const date = new Date(timestamp); // Convert timestamp to Date object
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short", // "Jan", "Feb", etc.
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true, // Display time in AM/PM format
  });
};

export const getOrdinal = (num: number) => {
  const suffixes = ["th", "st", "nd", "rd"];
  const remainder = num % 10;
  const suffix =
    remainder === 1 && num !== 11
      ? suffixes[1]
      : remainder === 2 && num !== 12
        ? suffixes[2]
        : remainder === 3 && num !== 13
          ? suffixes[3]
          : suffixes[0];

  return `${num}${suffix}`;
};

const teamColors: Record<string, string> = {
  CSK: "bg-yellow-500",
  RCB: "bg-red-600",
  MI: "bg-blue-600",
  KKR: "bg-purple-600",
  SRH: "bg-orange-500",
  DC: "bg-blue-400",
  RR: "bg-pink-500",
  PBKS: "bg-red-500",
  GT: "bg-teal-500",
  LSG: "bg-cyan-600",
};

export const getTeamColor = (teamName: string): string => {
  // Convert teamName to uppercase and return the corresponding color
  const upperCaseTeamName = teamName.toUpperCase();
  return teamColors[upperCaseTeamName] || "bg-gray-500"; // Default to gray if team not found
};
