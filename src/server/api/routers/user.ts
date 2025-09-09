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

  profile: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      let targetUserId: string;
      let isOwnProfile = false;
      let isAdmin = false;

      if (input.slug === "me") {
        if (!ctx.session?.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        targetUserId = ctx.session.user.id;
        isOwnProfile = true;
      } else {
        const user = await ctx.db.user.findUnique({
          where: { id: input.slug },
        });

        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }

        targetUserId = user.id;
        isOwnProfile = ctx.session?.user?.id === targetUserId;
      }

      if (ctx.session?.user) {
        const currentUser = await ctx.db.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { role: true },
        });
        isAdmin = currentUser?.role === "ADMIN";
      }

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

      const memeStats = await ctx.db.meme.aggregate({
        where: { createdById: targetUserId },
        _count: { id: true },
      });

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
