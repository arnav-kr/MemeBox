import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  keyword: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      const userName = ctx.session.user.name ?? "User";

      const lastUpvotedMemes = await ctx.db.vote.findMany({
        where: {
          userId,
          type: "UP",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        include: {
          meme: {
            select: {
              title: true,
            },
          },
        },
      });

      const titles = lastUpvotedMemes.map(vote => vote.meme.title);

      const personalizedKeyword = await ctx.gemini.generateUserKeyword(titles);

      return {
        userName,
        keyword: personalizedKeyword,
        greeting: `Welcome ${userName}, ${personalizedKeyword}`,
        basedOnMemes: titles.length,
        willUpdate: titles.length > 0,
      };
    }),

  // Get user profile by slug (supports "me" for current user)
  profile: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      let targetUserId: string;
      let isOwnProfile = false;
      let isAdmin = false;

      // Handle "me" special case
      if (input.slug === "me") {
        if (!ctx.session?.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        targetUserId = ctx.session.user.id;
        isOwnProfile = true;
      } else {
        // Find user by slug (assuming slug is user ID for now, can be username later)
        const user = await ctx.db.user.findUnique({
          where: { id: input.slug },
        });

        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }

        targetUserId = user.id;
        isOwnProfile = ctx.session?.user?.id === targetUserId;
      }

      // Check if current user is admin
      if (ctx.session?.user) {
        const currentUser = await ctx.db.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { role: true },
        });
        isAdmin = currentUser?.role === "ADMIN";
      }

      // Get target user info
      const targetUser = await ctx.db.user.findUnique({
        where: { id: targetUserId },
        select: {
          id: true,
          name: true,
          image: true,
          email: isOwnProfile || isAdmin ? true : false,
          createdAt: true,
        },
      });

      if (!targetUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Get meme stats (we'll fetch actual memes on the frontend using meme.list)
      const memeStats = await ctx.db.meme.aggregate({
        where: { createdById: targetUserId },
        _count: { id: true },
      });

      // Get vote stats for this user
      const voteStats = await ctx.db.vote.aggregate({
        where: { userId: targetUserId },
        _count: { id: true },
      });

      return {
        user: targetUser,
        isOwnProfile,
        isAdmin,
        canEdit: isOwnProfile || isAdmin,
        stats: {
          totalMemes: memeStats._count.id,
          totalVotes: voteStats._count.id,
        },
      };
    }),
});
