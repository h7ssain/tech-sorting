import { describe, expect, it } from "vitest";
import { validatePath, isAllowedFileType } from "./fileSearch";

describe("fileSearch security", () => {
  describe("validatePath", () => {
    const allowedPaths = [
      "C:\\Users\\SayedHussainAlhashim\\Downloads",
      "C:\\Users\\SayedHussainAlhashim\\Desktop",
    ];

    it("accepts paths within allowed directories", () => {
      const validPath = "C:\\Users\\SayedHussainAlhashim\\Downloads\\test.txt";
      expect(validatePath(validPath, allowedPaths)).toBe(true);
    });

    it("accepts subdirectories within allowed paths", () => {
      const validPath = "C:\\Users\\SayedHussainAlhashim\\Downloads\\subfolder\\file.json";
      expect(validatePath(validPath, allowedPaths)).toBe(true);
    });

    it("rejects paths outside allowed directories", () => {
      const invalidPath = "C:\\Users\\OtherUser\\Documents\\secret.txt";
      expect(validatePath(invalidPath, allowedPaths)).toBe(false);
    });

    it("prevents path traversal with ..", () => {
      const traversalPath = "C:\\Users\\SayedHussainAlhashim\\Downloads\\..\\..\\secret.txt";
      expect(validatePath(traversalPath, allowedPaths)).toBe(false);
    });

    it("prevents path traversal to parent directory", () => {
      const traversalPath = "C:\\Users\\SayedHussainAlhashim\\Downloads\\..\\Documents\\file.txt";
      expect(validatePath(traversalPath, allowedPaths)).toBe(false);
    });

    it("handles forward slashes in paths", () => {
      const validPath = "C:/Users/SayedHussainAlhashim/Downloads/test.txt";
      expect(validatePath(validPath, allowedPaths)).toBe(true);
    });

    it("rejects completely unrelated paths", () => {
      const invalidPath = "D:\\SomeOtherDrive\\file.txt";
      expect(validatePath(invalidPath, allowedPaths)).toBe(false);
    });

    it("handles empty allowed paths array", () => {
      const path = "C:\\Users\\SayedHussainAlhashim\\Downloads\\test.txt";
      expect(validatePath(path, [])).toBe(false);
    });

    it("rejects paths that are prefixes of allowed paths", () => {
      const invalidPath = "C:\\Users\\SayedHussainAlhashim\\Down";
      expect(validatePath(invalidPath, allowedPaths)).toBe(false);
    });
  });

  describe("isAllowedFileType", () => {
    const allowedTypes = [".txt", ".json"];

    it("accepts .txt files", () => {
      expect(isAllowedFileType("test.txt", allowedTypes)).toBe(true);
    });

    it("accepts .json files", () => {
      expect(isAllowedFileType("data.json", allowedTypes)).toBe(true);
    });

    it("rejects .exe files", () => {
      expect(isAllowedFileType("malware.exe", allowedTypes)).toBe(false);
    });

    it("rejects .bat files", () => {
      expect(isAllowedFileType("script.bat", allowedTypes)).toBe(false);
    });

    it("rejects files without extensions", () => {
      expect(isAllowedFileType("noextension", allowedTypes)).toBe(false);
    });

    it("is case insensitive for extensions", () => {
      expect(isAllowedFileType("TEST.TXT", allowedTypes)).toBe(true);
      expect(isAllowedFileType("DATA.JSON", allowedTypes)).toBe(true);
    });

    it("handles paths with multiple dots", () => {
      expect(isAllowedFileType("file.backup.txt", allowedTypes)).toBe(true);
      expect(isAllowedFileType("config.old.json", allowedTypes)).toBe(true);
    });

    it("rejects other common file types", () => {
      expect(isAllowedFileType("document.pdf", allowedTypes)).toBe(false);
      expect(isAllowedFileType("image.jpg", allowedTypes)).toBe(false);
      expect(isAllowedFileType("script.js", allowedTypes)).toBe(false);
    });
  });
});
