import * as fs from 'fs';
import * as path from 'path';

export interface SearchOptions {
  query: string;
  useRegex: boolean;
  caseSensitive: boolean;
  fileTypes: string[];
}

export interface SearchResult {
  filePath: string;
  fileName: string;
  matches: Array<{
    line: number;
    content: string;
  }>;
}

/**
 * Validates that a file path is within allowed directories
 * Prevents path traversal attacks
 */
export function validatePath(filePath: string, allowedPaths: string[]): boolean {
  try {
    // Normalize paths to handle .. and . properly
    const normalizedPath = path.normalize(filePath).replace(/\\/g, '/').toLowerCase();
    
    return allowedPaths.some(allowedPath => {
      const normalizedAllowed = path.normalize(allowedPath).replace(/\\/g, '/').toLowerCase();
      
      // Ensure the normalized path starts with the allowed path
      // and doesn't escape it via .. traversal
      if (!normalizedPath.startsWith(normalizedAllowed)) {
        return false;
      }
      
      // Additional check: ensure no .. remains after normalization
      // that could escape the allowed directory
      const relativePath = normalizedPath.substring(normalizedAllowed.length);
      if (relativePath.includes('..')) {
        return false;
      }
      
      return true;
    });
  } catch (error) {
    console.error('[FileSearch] Path validation error:', error);
    return false;
  }
}

/**
 * Checks if file extension is allowed
 */
export function isAllowedFileType(filePath: string, allowedTypes: string[]): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return allowedTypes.includes(ext);
}

/**
 * Recursively searches for files in a directory
 */
export async function searchInDirectory(
  dirPath: string,
  options: SearchOptions,
  allowedPaths: string[]
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  
  // Validate directory path
  if (!validatePath(dirPath, allowedPaths)) {
    console.warn('[FileSearch] Directory not in allowed paths:', dirPath);
    return results;
  }

  try {
    // Check if directory exists
    if (!fs.existsSync(dirPath)) {
      console.warn('[FileSearch] Directory does not exist:', dirPath);
      return results;
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      // Skip if path is not in allowed paths
      if (!validatePath(fullPath, allowedPaths)) {
        continue;
      }

      if (entry.isDirectory()) {
        // Recursively search subdirectories
        const subResults = await searchInDirectory(fullPath, options, allowedPaths);
        results.push(...subResults);
      } else if (entry.isFile()) {
        // Check file type
        if (!isAllowedFileType(fullPath, options.fileTypes)) {
          continue;
        }

        // Search in file
        const fileResults = await searchInFile(fullPath, options);
        if (fileResults.matches.length > 0) {
          results.push(fileResults);
        }
      }
    }
  } catch (error) {
    console.error('[FileSearch] Error searching directory:', dirPath, error);
  }

  return results;
}

/**
 * Searches for matches within a single file
 */
export async function searchInFile(
  filePath: string,
  options: SearchOptions
): Promise<SearchResult> {
  const result: SearchResult = {
    filePath,
    fileName: path.basename(filePath),
    matches: [],
  };

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    let searchPattern: RegExp;
    
    if (options.useRegex) {
      try {
        const flags = options.caseSensitive ? 'g' : 'gi';
        searchPattern = new RegExp(options.query, flags);
      } catch (error) {
        console.error('[FileSearch] Invalid regex pattern:', options.query);
        return result;
      }
    } else {
      // Escape special regex characters for literal search
      const escapedQuery = options.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const flags = options.caseSensitive ? 'g' : 'gi';
      searchPattern = new RegExp(escapedQuery, flags);
    }

    lines.forEach((line, index) => {
      if (searchPattern.test(line)) {
        result.matches.push({
          line: index + 1,
          content: line.trim(),
        });
      }
    });
  } catch (error) {
    console.error('[FileSearch] Error reading file:', filePath, error);
  }

  return result;
}

/**
 * Main search function that searches across all allowed directories
 */
export async function performSearch(
  allowedPaths: string[],
  options: SearchOptions
): Promise<SearchResult[]> {
  const allResults: SearchResult[] = [];

  for (const dirPath of allowedPaths) {
    const results = await searchInDirectory(dirPath, options, allowedPaths);
    allResults.push(...results);
  }

  return allResults;
}
