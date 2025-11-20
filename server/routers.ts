import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { performSearch } from "./fileSearch";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  folders: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllSearchFolders();
    }),
    add: protectedProcedure
      .input(z.object({
        path: z.string().min(1),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.addSearchFolder({
          path: input.path,
          description: input.description || null,
          addedBy: ctx.user.id,
        });
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSearchFolder(input.id);
        return { success: true };
      }),
  }),

  search: router({
    execute: protectedProcedure
      .input(z.object({
        query: z.string().min(1),
        useRegex: z.boolean().default(false),
        caseSensitive: z.boolean().default(false),
        fileTypes: z.array(z.string()).default(['.txt', '.json']),
      }))
      .mutation(async ({ input }) => {
        // Get all allowed folders from database
        const folders = await db.getAllSearchFolders();
        const allowedPaths = folders.map(f => f.path);

        if (allowedPaths.length === 0) {
          return { results: [], message: 'No search folders configured' };
        }

        // Perform search
        const results = await performSearch(allowedPaths, {
          query: input.query,
          useRegex: input.useRegex,
          caseSensitive: input.caseSensitive,
          fileTypes: input.fileTypes,
        });

        return { results, message: `Found ${results.length} files with matches` };
      }),
  }),
});

export type AppRouter = typeof appRouter;
