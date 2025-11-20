import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { APP_TITLE, getLoginUrl } from "@/const";
import { FolderSearch, Trash2, Plus, Home } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function FolderManagement() {
  const { user, loading, isAuthenticated } = useAuth();
  const [newPath, setNewPath] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const utils = trpc.useUtils();
  const { data: folders, isLoading: foldersLoading } = trpc.folders.list.useQuery();
  
  const addFolderMutation = trpc.folders.add.useMutation({
    onSuccess: () => {
      utils.folders.list.invalidate();
      setNewPath("");
      setNewDescription("");
      toast.success("Folder added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add folder: ${error.message}`);
    },
  });

  const deleteFolderMutation = trpc.folders.delete.useMutation({
    onSuccess: () => {
      utils.folders.list.invalidate();
      toast.success("Folder removed successfully");
    },
    onError: (error) => {
      toast.error(`Failed to remove folder: ${error.message}`);
    },
  });

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPath.trim()) {
      toast.error("Please enter a folder path");
      return;
    }
    addFolderMutation.mutate({
      path: newPath,
      description: newDescription || undefined,
    });
  };

  const handleDeleteFolder = (id: number) => {
    if (confirm("Are you sure you want to remove this folder?")) {
      deleteFolderMutation.mutate({ id });
    }
  };

  if (loading || foldersLoading) {
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
            <CardDescription>Please sign in to manage folders</CardDescription>
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
                <Link href="/search">Search</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Manage Search Folders</h2>
            <p className="text-slate-600">
              Configure which folders are available for file searching
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Folder
              </CardTitle>
              <CardDescription>
                Enter the full path to a folder you want to make searchable
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddFolder} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="path">Folder Path *</Label>
                  <Input
                    id="path"
                    type="text"
                    placeholder="C:\Users\YourName\Documents"
                    value={newPath}
                    onChange={(e) => setNewPath(e.target.value)}
                    required
                  />
                  <p className="text-xs text-slate-500">
                    Example: C:\Users\SayedHussainAlhashim\Downloads
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    type="text"
                    placeholder="e.g., Downloads folder"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={addFolderMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {addFolderMutation.isPending ? "Adding..." : "Add Folder"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configured Folders ({folders?.length || 0})</CardTitle>
              <CardDescription>
                These folders are currently available for searching
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!folders || folders.length === 0 ? (
                <div className="text-center py-12">
                  <FolderSearch className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-2">No folders configured yet</p>
                  <p className="text-sm text-slate-400">
                    Add your first folder above to start searching
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      className="flex items-start justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm text-slate-900 break-all">
                          {folder.path}
                        </p>
                        {folder.description && (
                          <p className="text-sm text-slate-600 mt-1">
                            {folder.description}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-2">
                          Added {new Date(folder.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFolder(folder.id)}
                        disabled={deleteFolderMutation.isPending}
                        className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
