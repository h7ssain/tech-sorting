import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { FolderSearch, Settings, Search } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

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
            <div className="flex justify-center mb-4">
              <FolderSearch className="h-16 w-16 text-slate-700" />
            </div>
            <CardTitle className="text-2xl">{APP_TITLE}</CardTitle>
            <CardDescription>
              Secure file search application for your private network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-6 text-center">
              Search through configured folders for text and JSON files with powerful regex support.
            </p>
            <Button asChild className="w-full" size="lg">
              <a href={getLoginUrl()}>Sign In to Continue</a>
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
              <span className="text-sm text-slate-600">Welcome, {user?.name || user?.email}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              File Search Application
            </h2>
            <p className="text-lg text-slate-600">
              Search through your configured folders with powerful filtering and regex support
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Search className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Search Files</CardTitle>
                </div>
                <CardDescription>
                  Search through text and JSON files with regex pattern matching
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Regex pattern support
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Case-sensitive search option
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Filter by file type
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    View matched lines with context
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/search">Start Searching</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Settings className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>Manage Folders</CardTitle>
                </div>
                <CardDescription>
                  Configure which folders are available for searching
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Add new search folders
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Remove existing folders
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    View all configured paths
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Secure path validation
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/folders">Manage Folders</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8 bg-slate-50 border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Security Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Path Validation</h4>
                  <p className="text-slate-600">
                    All file paths are validated to prevent directory traversal attacks
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">File Type Filtering</h4>
                  <p className="text-slate-600">
                    Only .txt and .json files are accessible through the search interface
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Authentication</h4>
                  <p className="text-slate-600">
                    All features require authentication to access
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
