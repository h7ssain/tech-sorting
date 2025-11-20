import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { APP_TITLE, getLoginUrl } from "@/const";
import { FolderSearch, Search, Home, FileText, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

interface SearchResult {
  filePath: string;
  fileName: string;
  matches: Array<{
    line: number;
    content: string;
  }>;
}

export default function FileSearch() {
  const { user, loading, isAuthenticated } = useAuth();
  const [query, setQuery] = useState("");
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [searchTxt, setSearchTxt] = useState(true);
  const [searchJson, setSearchJson] = useState(true);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchMessage, setSearchMessage] = useState("");

  const searchMutation = trpc.search.execute.useMutation({
    onSuccess: (data) => {
      setResults(data.results);
      setSearchMessage(data.message);
      if (data.results.length === 0) {
        toast.info("No matches found");
      } else {
        toast.success(data.message);
      }
    },
    onError: (error) => {
      toast.error(`Search failed: ${error.message}`);
      setResults([]);
      setSearchMessage("");
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    if (!searchTxt && !searchJson) {
      toast.error("Please select at least one file type");
      return;
    }

    const fileTypes: string[] = [];
    if (searchTxt) fileTypes.push(".txt");
    if (searchJson) fileTypes.push(".json");

    searchMutation.mutate({
      query,
      useRegex,
      caseSensitive,
      fileTypes,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to search files</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FolderSearch className="h-8 w-8 text-slate-700" />
              <h1 className="text-xl font-semibold text-slate-900">{APP_TITLE}</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/folders">Manage Folders</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">File Search</h2>
            <p className="text-slate-600">
              Search through configured folders with regex support
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="query">Search Query *</Label>
                  <Input
                    id="query"
                    type="text"
                    placeholder="Enter text or regex pattern..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    required
                    className="font-mono"
                  />
                  {useRegex && (
                    <p className="text-xs text-slate-500">
                      Regex example: <code className="bg-slate-100 px-1 py-0.5 rounded">\d{3}-\d{4}</code> to find phone numbers
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <Label>Search Options</Label>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="useRegex"
                        checked={useRegex}
                        onCheckedChange={(checked) => setUseRegex(checked as boolean)}
                      />
                      <Label htmlFor="useRegex" className="font-normal cursor-pointer">
                        Use Regular Expression
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="caseSensitive"
                        checked={caseSensitive}
                        onCheckedChange={(checked) => setCaseSensitive(checked as boolean)}
                      />
                      <Label htmlFor="caseSensitive" className="font-normal cursor-pointer">
                        Case Sensitive
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>File Types</Label>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="searchTxt"
                        checked={searchTxt}
                        onCheckedChange={(checked) => setSearchTxt(checked as boolean)}
                      />
                      <Label htmlFor="searchTxt" className="font-normal cursor-pointer">
                        Text Files (.txt)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="searchJson"
                        checked={searchJson}
                        onCheckedChange={(checked) => setSearchJson(checked as boolean)}
                      />
                      <Label htmlFor="searchJson" className="font-normal cursor-pointer">
                        JSON Files (.json)
                      </Label>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={searchMutation.isPending}
                  className="w-full sm:w-auto"
                  size="lg"
                >
                  {searchMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search Files
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {searchMessage && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">{searchMessage}</p>
            </div>
          )}

          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Search Results ({results.length} files)</CardTitle>
                <CardDescription>
                  Files containing matches for your search query
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.map((result, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-lg overflow-hidden"
                    >
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 mb-1">
                              {result.fileName}
                            </p>
                            <p className="font-mono text-xs text-slate-600 break-all">
                              {result.filePath}
                            </p>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex-shrink-0">
                            {result.matches.length} {result.matches.length === 1 ? 'match' : 'matches'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        {result.matches.slice(0, 5).map((match, matchIdx) => (
                          <div
                            key={matchIdx}
                            className="bg-white border border-slate-200 rounded p-3"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-xs font-mono text-slate-500 flex-shrink-0">
                                Line {match.line}
                              </span>
                              <code className="text-sm text-slate-900 break-all flex-1">
                                {match.content}
                              </code>
                            </div>
                          </div>
                        ))}
                        {result.matches.length > 5 && (
                          <p className="text-xs text-slate-500 text-center pt-2">
                            ... and {result.matches.length - 5} more matches
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!searchMutation.isPending && results.length === 0 && searchMessage === "" && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-2">No search performed yet</p>
                  <p className="text-sm text-slate-400">
                    Enter a search query above and click "Search Files" to begin
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
