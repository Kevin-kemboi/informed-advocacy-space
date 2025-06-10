
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Flag, MoreHorizontal, Clock } from "lucide-react";
import { Post } from "@/lib/supabase";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const { likePost, flagPost } = usePosts();
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
    <Card className="hover:shadow-md transition-shadow duration-200 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {post.profiles?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {post.profiles?.full_name || 'Anonymous'}
                </span>
                <Badge variant="outline" className={`text-xs ${getRoleColor(post.profiles?.role || 'citizen')}`}>
                  {getRoleIcon(post.profiles?.role || 'citizen')} {post.profiles?.role?.replace('_', ' ') || 'citizen'}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
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
                  className="rounded-lg max-h-80 w-full object-cover"
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
              className={`flex items-center gap-2 hover:bg-red-50 ${
                liked ? 'text-red-600' : 'text-gray-600'
              }`}
              disabled={liked}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              {post.likes_count + (liked ? 1 : 0)}
            </Button>
            
            {profile?.role !== 'citizen' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFlag}
                className={`flex items-center gap-2 hover:bg-orange-50 ${
                  flagged ? 'text-orange-600' : 'text-gray-600'
                }`}
                disabled={flagged}
              >
                <Flag className="h-4 w-4" />
                {flagged ? 'Flagged' : 'Flag'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
