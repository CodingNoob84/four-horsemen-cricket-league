import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const sendAdminRequest = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User is not authenticated");
    }

    // Check if a request already exists
    const existingRequest = await ctx.db
      .query("adminRequests")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existingRequest) {
      return {
        success: false,
        msg: "You have already submitted an admin access request.",
      };
    }

    // Create new admin request
    await ctx.db.insert("adminRequests", {
      userId,
      status: "pending",
      requestedAt: Date.now(),
    });

    return {
      success: true,
      msg: "Admin access request submitted successfully.",
    };
  },
});

export const fetchUserAdminRequestStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User is not authenticated.");
    }

    const request = await ctx.db
      .query("adminRequests")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return request || null;
  },
});

export const fetchAdminRequests = query({
  args: { status: v.optional(v.string()) }, // Filter by status if needed
  handler: async (ctx, { status }) => {
    const adminUserId = await getAuthUserId(ctx);
    if (!adminUserId) {
      throw new Error("Admin authentication required.");
    }

    // Fetch user details to verify admin role
    const adminUser = await ctx.db.get(adminUserId);
    if (!adminUser || adminUser.role !== "admin") {
      throw new Error("You do not have permission to view this data.");
    }

    let requestQuery;

    if (status) {
      requestQuery = ctx.db
        .query("adminRequests")
        .withIndex("by_status", (q) =>
          q.eq("status", status as "pending" | "approved" | "rejected")
        )
        .collect();
    } else {
      requestQuery = ctx.db.query("adminRequests").collect();
    }

    const requests = await requestQuery;

    return requests;
  },
});

export const processAdminRequest = mutation({
  args: {
    requestId: v.id("adminRequests"),
    action: v.union(v.literal("approve"), v.literal("reject")),
  },
  handler: async (ctx, { requestId, action }) => {
    const adminUserId = await getAuthUserId(ctx);
    if (!adminUserId) {
      return { success: false, message: `Admin authentication required.` };
      // throw new Error("Admin authentication required.");
    }

    // Fetch user details to verify admin role
    const adminUser = await ctx.db.get(adminUserId);
    if (!adminUser || adminUser.role !== "admin") {
      return { success: false, message: `Admin authentication required.` };
      //throw new Error("You do not have permission to process requests.");
    }

    // Fetch the request
    const request = await ctx.db.get(requestId);
    if (!request) {
      return { success: false, message: `Admin request not found.` };
      throw new Error("Admin request not found.");
    }

    if (request.status !== "pending") {
      return {
        success: false,
        message: `This request has already been processed.`,
      };
      throw new Error("This request has already been processed.");
    }

    // Update the request status
    await ctx.db.patch(requestId, {
      status: action === "approve" ? "approved" : "rejected",
      processedAt: Date.now(),
      processedBy: adminUserId,
    });

    // If approved, update user role
    if (action === "approve") {
      await ctx.db.patch(request.userId, { role: "admin" });
    }

    return { success: true, message: `Request ${action}d successfully.` };
  },
});
