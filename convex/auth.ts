import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, args) {
      // Skip if this is an existing user update
      if (args.existingUserId) return;

      // For new users, set their default role to READ
      await ctx.db.patch(args.userId, {
        role: "user",
        isAutoSetupDone: false,
      });
    },
  },
});
