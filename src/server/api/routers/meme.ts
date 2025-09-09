import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const memeRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(10),
      search: z.string().optional(),
      sortBy: z.enum(["createdAt", "title"]).default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
      userId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { cursor, limit, search, sortBy, sortOrder, userId } = input;

      const whereClause: {
        title?: { contains: string; mode: "insensitive" };
        createdById?: string;
      } = {};

      if (search) {
        whereClause.title = {
          contains: search,
          mode: "insensitive" as const,
        };
      }

      if (userId) {
        whereClause.createdById = userId;
      }

      const orderBy = { [sortBy]: sortOrder };

      const memes = await ctx.db.meme.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: [
          orderBy,
          { id: "asc" },
        ],
        where: whereClause,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              votes: true,
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (memes.length > limit) {
        const nextItem = memes.pop()!;
        nextCursor = nextItem.id;
      }

      const memeIds = memes.map(meme => meme.id);

      const voteCounts = await ctx.db.vote.groupBy({
        by: ['memeId', 'type'],
        where: {
          memeId: { in: memeIds },
        },
        _count: {
          id: true,
        },
      });

      const userVotes = ctx.session?.user ? await ctx.db.vote.findMany({
        where: {
          memeId: { in: memeIds },
          userId: ctx.session.user.id,
        },
        select: {
          memeId: true,
          type: true,
        },
      }) : [];

      const memesWithVoteData = memes.map((meme) => {
        const upVotes = voteCounts.find(vc => vc.memeId === meme.id && vc.type === "UP")?._count.id ?? 0;
        const downVotes = voteCounts.find(vc => vc.memeId === meme.id && vc.type === "DOWN")?._count.id ?? 0;
        const userVote = userVotes.find(uv => uv.memeId === meme.id)?.type ?? null;

        return {
          ...meme,
          _count: {
            votes: upVotes + downVotes,
          },
          voteStats: {
            upVotes,
            downVotes,
            total: upVotes - downVotes,
          },
          userVote: userVote as "UP" | "DOWN" | null,
        };
      });

      return {
        memes: memesWithVoteData,
        nextCursor,
        hasMore: !!nextCursor,
        metadata: {
          requestedLimit: limit,
          returnedCount: memesWithVoteData.length,
          sortBy,
          sortOrder,
        },
      };
    }),

  get: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const meme = await ctx.db.meme.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          title: true,
          imageUrl: true,
          publicId: true,
          createdAt: true,
          updatedAt: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      if (!meme) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meme not found" });
      }

      const voteCounts = await ctx.db.vote.groupBy({
        by: ['type'],
        where: {
          memeId: input.id,
        },
        _count: {
          id: true,
        },
      });

      const userVote = ctx.session?.user ? await ctx.db.vote.findUnique({
        where: {
          userId_memeId: {
            userId: ctx.session.user.id,
            memeId: input.id,
          },
        },
        select: {
          type: true,
        },
      }) : null;

      const upVotes = voteCounts.find(vc => vc.type === "UP")?._count.id ?? 0;
      const downVotes = voteCounts.find(vc => vc.type === "DOWN")?._count.id ?? 0;

      return {
        ...meme,
        _count: {
          votes: upVotes + downVotes,
        },
        voteStats: {
          upVotes,
          downVotes,
          total: upVotes - downVotes,
        },
        userVote: userVote?.type ?? null,
      };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {

      // if admin
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });
      const isAdmin = user?.role === "ADMIN";

      const meme = await ctx.db.meme.findUnique({
        where: { id: input.id },
        select: { createdById: true },
      });

      if (!meme) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meme not found" });
      }

      if (meme.createdById !== ctx.session.user.id && !isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own memes" });
      }

      await ctx.db.meme.delete({
        where: { id: input.id },
      });

      return {
        success: true,
        message: "Meme deleted successfully",
        deletedMemeId: input.id,
      };
    }),

  vote: protectedProcedure
    .input(z.object({
      memeId: z.string().min(1),
      type: z.enum(["UP", "DOWN"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const { memeId, type } = input;
      const userId = ctx.session.user.id;

      const meme = await ctx.db.meme.findUnique({
        where: { id: memeId },
        select: { id: true },
      });

      if (!meme) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meme not found",
        });
      }

      const existingVote = await ctx.db.vote.findUnique({
        where: {
          userId_memeId: {
            userId,
            memeId,
          },
        },
      });

      if (existingVote) {
        if (existingVote.type === type) {
          // remove vote
          await ctx.db.vote.delete({
            where: { id: existingVote.id },
          });

          return {
            success: true,
            action: "removed",
            message: `${type.toLowerCase()} vote removed`,
            voteType: null,
          };
        } else {
          // update vote
          await ctx.db.vote.update({
            where: { id: existingVote.id },
            data: { type },
          });

          return {
            success: true,
            action: "updated",
            message: `Vote changed to ${type.toLowerCase()}`,
            voteType: type,
          };
        }
      } else {
        // create vote
        await ctx.db.vote.create({
          data: {
            type,
            userId,
            memeId,
          },
        });

        return {
          success: true,
          action: "created",
          message: `${type.toLowerCase()} vote added`,
          voteType: type,
        };
      }
    }),

  upload: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(100),
      imageData: z.string().min(1), // base64 encoded image data
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Upload image to Cloudinary
        const uploadResult = await ctx.cloudinary.uploadAsset(
          input.imageData,
          "memes"
        );

        // Create meme record in database
        const meme = await ctx.db.meme.create({
          data: {
            title: input.title,
            imageUrl: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            createdById: ctx.session.user.id,
          },
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        });

        return {
          success: true,
          message: "Meme uploaded successfully!",
          meme,
          uploadResult: {
            publicId: uploadResult.public_id,
            imageUrl: uploadResult.secure_url,
            width: uploadResult.width,
            height: uploadResult.height,
          },
        };
      } catch (error) {
        console.error("Upload error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload meme",
          cause: error,
        });
      }
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      imageUrl: z.string().url(),
      publicId: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const meme = await ctx.db.meme.create({
        data: {
          title: input.title,
          imageUrl: input.imageUrl,
          publicId: input.publicId,
          createdById: ctx.session.user.id,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      return {
        success: true,
        meme,
      };
    }),

  leaderboard: publicProcedure
    .query(async ({ ctx }) => {
      // Get all memes with their vote counts
      const memes = await ctx.db.meme.findMany({
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              votes: true,
            },
          },
        },
      });

      const memeIds = memes.map(meme => meme.id);

      // Get vote counts for all memes
      const voteCounts = await ctx.db.vote.groupBy({
        by: ['memeId', 'type'],
        where: {
          memeId: { in: memeIds },
        },
        _count: {
          id: true,
        },
      });

      // Get user votes if logged in
      const userVotes = ctx.session?.user ? await ctx.db.vote.findMany({
        where: {
          memeId: { in: memeIds },
          userId: ctx.session.user.id,
        },
        select: {
          memeId: true,
          type: true,
        },
      }) : [];

      // Calculate net score (upvotes - downvotes) for each meme
      const memesWithScores = memes.map((meme) => {
        const upVotes = voteCounts.find(vc => vc.memeId === meme.id && vc.type === "UP")?._count.id ?? 0;
        const downVotes = voteCounts.find(vc => vc.memeId === meme.id && vc.type === "DOWN")?._count.id ?? 0;
        const userVote = userVotes.find(uv => uv.memeId === meme.id)?.type ?? null;
        const netScore = upVotes - downVotes;

        return {
          ...meme,
          voteStats: {
            upVotes,
            downVotes,
            total: upVotes + downVotes,
            netScore,
          },
          userVote,
        };
      });

      // Sort by net score (highest first) and take top 5
      const topMemes = memesWithScores
        .sort((a, b) => b.voteStats.netScore - a.voteStats.netScore)
        .slice(0, 5);

      return topMemes;
    }),

});
