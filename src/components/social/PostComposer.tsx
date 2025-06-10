
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Image, X } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";

interface PostComposerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PostComposer({ isOpen, onClose }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createPost } = usePosts();
  const { profile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await createPost(content, mediaUrls);
      setContent("");
      setMediaUrls([]);
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addImageUrl = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      setMediaUrls([...mediaUrls, url]);
    }
  };

  const removeImage = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {profile?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            Share Your Voice
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="What's happening in your community? Share your thoughts, concerns, or ideas..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] border-gray-200 focus:border-blue-400 resize-none"
            maxLength={280}
          />
          
          <div className="text-right text-sm text-gray-500">
            {content.length}/280
          </div>

          {/* Media Preview */}
          {mediaUrls.length > 0 && (
            <div className="space-y-2">
              {mediaUrls.map((url, index) => (
                <Card key={index} className="relative">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <img 
                        src={url} 
                        alt="Preview" 
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImage(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addImageUrl}
              className="text-blue-600 hover:text-blue-700"
            >
              <Image className="h-4 w-4 mr-2" />
              Add Image
            </Button>
            
            <Button 
              type="submit" 
              disabled={!content.trim() || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
