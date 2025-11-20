import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { upsertUser, getDb, getUserByOpenId } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

async function createAuthContext(): Promise<TrpcContext> {
  // Get the actual user from database
  const { getUserByOpenId } = await import("./db");
  const dbUser = await getUserByOpenId("test-user-folders");
  
  if (!dbUser) {
    throw new Error("Test user not found in database");
  }

  const user: AuthenticatedUser = dbUser;

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("folders router", () => {
  const testUserId = 999;
  const testOpenId = "test-user-folders";

  beforeAll(async () => {
    // Create test user
    await upsertUser({
      openId: testOpenId,
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
    });
  });

  afterAll(async () => {
    // Clean up test folders and user
    const db = await getDb();
    if (db) {
      const { searchFolders } = await import("../drizzle/schema");
      const user = await getUserByOpenId(testOpenId);
      if (user) {
        // Delete folders first (foreign key constraint)
        await db.delete(searchFolders).where(eq(searchFolders.addedBy, user.id));
        // Then delete user
        await db.delete(users).where(eq(users.openId, testOpenId));
      }
    }
  });
  it("requires authentication to list folders", async () => {
    const unauthCtx: TrpcContext = {
      user: undefined,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: () => {},
      } as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(unauthCtx);

    await expect(caller.folders.list()).rejects.toThrow();
  });

  it("requires authentication to add folders", async () => {
    const unauthCtx: TrpcContext = {
      user: undefined,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: () => {},
      } as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(unauthCtx);

    await expect(
      caller.folders.add({
        path: "C:\\Users\\Test\\Downloads",
        description: "Test folder",
      })
    ).rejects.toThrow();
  });

  it("requires authentication to delete folders", async () => {
    const unauthCtx: TrpcContext = {
      user: undefined,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: () => {},
      } as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(unauthCtx);

    await expect(caller.folders.delete({ id: 1 })).rejects.toThrow();
  });

  it("allows authenticated users to list folders", async () => {
    const ctx = await createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.folders.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("validates folder path is not empty", async () => {
    const ctx = await createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.folders.add({
        path: "",
        description: "Empty path",
      })
    ).rejects.toThrow();
  });

  it("accepts valid folder paths", async () => {
    const ctx = await createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.folders.add({
      path: "C:\\Users\\Test\\Downloads",
      description: "Test downloads folder",
    });

    expect(result).toEqual({ success: true });
  });

  it("allows adding folders without description", async () => {
    const ctx = await createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.folders.add({
      path: "C:\\Users\\Test\\Desktop",
    });

    expect(result).toEqual({ success: true });
  });
});
