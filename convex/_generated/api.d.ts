/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as adminreq from "../adminreq.js";
import type * as auth from "../auth.js";
import type * as betting from "../betting.js";
import type * as common from "../common.js";
import type * as crons from "../crons.js";
import type * as groups from "../groups.js";
import type * as http from "../http.js";
import type * as matches from "../matches.js";
import type * as players from "../players.js";
import type * as teams from "../teams.js";
import type * as users from "../users.js";
import type * as userspoints from "../userspoints.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminreq: typeof adminreq;
  auth: typeof auth;
  betting: typeof betting;
  common: typeof common;
  crons: typeof crons;
  groups: typeof groups;
  http: typeof http;
  matches: typeof matches;
  players: typeof players;
  teams: typeof teams;
  users: typeof users;
  userspoints: typeof userspoints;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
