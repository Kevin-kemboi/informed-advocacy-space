
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Flag, MoreHorizontal, Clock, Trash2 } from "lucide-react";
import { Post } from "@/lib/supabase";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { likePost, flagPost, deletePost } = usePosts();
  const { profile } = useAuth();

  const handleLike = async () => {
    if (!liked) {
      await likePost(post.id);
      setLiked(true);
    }
  };

  const handleFlag = async () => {
    if (!flagged) {
      await flagPost(post.id, "Inappropriate content");
      setFlagged(true);
    }
  };

  const handleDelete = async () => {
    await deletePost(post.id);
    setShowDeleteDialog(false);
  };

  const canDelete = profile && (profile.id === post.user_id || profile.role === 'admin');

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'government_official': return 'bg-blue-100 text-blue-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return '👑';
      case 'government_official': return '🏛️';
      default: return '👤';
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-all duration-300 animate-fade-in hover:scale-[1.02]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">
                  {post.profiles?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {post.profiles?.full_name || 'Anonymous'}
                  </span>
                  <Badge variant="outline" className={`text-xs transition-colors hover:scale-105 ${getRoleColor(post.profiles?.role || 'citizen')}`}>
                    {getRoleIcon(post.profiles?.role || 'citizen')} {post.profiles?.role?.replace('_', ' ') || 'citizen'}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {canDelete && (
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                )}
                {profile?.role !== 'citizen' && (
                  <DropdownMenuItem onClick={handleFlag} disabled={flagged}>
                    <Flag className="h-4 w-4 mr-2" />
                    {flagged ? 'Flagged' : 'Flag Post'}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4">
            <p className="text-gray-900 leading-relaxed">{post.content}</p>
            
            {/* Media */}
            {post.media_urls && post.media_urls.length > 0 && (
              <div className="grid grid-cols-1 gap-3">
                {post.media_urls.map((url, index) => (
                  <img 
                    key={index}
                    src={url} 
                    alt="Post media" 
                    className="rounded-lg max-h-80 w-full object-cover shadow-md hover:shadow-lg transition-shadow duration-300"
                  />
                ))}
              </div>
            )}
            
            {/* Actions */}
            <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center gap-2 hover:bg-red-50 transition-all duration-200 hover:scale-105 ${
                  liked ? 'text-red-600' : 'text-gray-600'
                }`}
                disabled={liked}
              >
                <Heart className={`h-4 w-4 transition-all duration-200 ${liked ? 'fill-current scale-110' : ''}`} />
                {post.likes_count + (liked ? 1 : 0)}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
