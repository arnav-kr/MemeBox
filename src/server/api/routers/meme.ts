import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const memeRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ cursor: z.string().optional() }))
    .query(({ input }) => {
      // TODO: implment pagination
    }),
  get: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const meme = await ctx.db.meme.findUnique({
        where: { id: input.id },
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

      if (!meme) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Meme not found" });
      }

      return meme;
    }),

  vote: protectedProcedure
    .input(z.object({
      id: z.string().min(1),
      type: z.enum(["up", "down"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement voting logic
      return {
        success: true,
        message: `${input.type} vote recorded for meme ${input.id}`,
        voteType: input.type,
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

  upload: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement upload
    }),

});
