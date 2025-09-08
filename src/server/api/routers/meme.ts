import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const memeRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ cursor: z.string().optional() }))
    .query(({ input }) => {
      // TODO: implment pagination
    }),

  upload: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // TODO: implement upload
    }),
});
