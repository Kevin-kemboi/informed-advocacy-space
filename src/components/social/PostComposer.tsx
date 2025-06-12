
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Image, X, Upload, Loader2 } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { uploadFile, validateFileType, validateFileSize } from "@/utils/fileUpload";

interface PostComposerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PostComposer({ isOpen, onClose }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { createPost } = usePosts();
  const { profile, user } = useAuth();
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate files
    const validFiles = files.filter(file => {
      if (!validateFileType(file)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported image format.`,
          variant: "destructive"
        });
        return false;
      }
      
      if (!validateFileSize(file)) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB.`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 4)); // Max 4 images
    }
  };

  const uploadSelectedFiles = async () => {
    if (!user || selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = selectedFiles.map(file => uploadFile(file, user.id));
      const results = await Promise.all(uploadPromises);
      
      const successfulUrls = results.filter(url => url !== null) as string[];
      
      if (successfulUrls.length > 0) {
        setUploadedUrls(prev => [...prev, ...successfulUrls]);
        setSelectedFiles([]);
        toast({
          title: "Images uploaded",
          description: `${successfulUrls.length} image(s) uploaded successfully.`
        });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number, isUploaded: boolean = false) => {
    if (isUploaded) {
      setUploadedUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && uploadedUrls.length === 0) return;

    setIsSubmitting(true);
    try {
      await createPost(content, uploadedUrls);
      setContent("");
      setSelectedFiles([]);
      setUploadedUrls([]);
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setContent("");
    setSelectedFiles([]);
    setUploadedUrls([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
          <DialogDescription>
            Share your thoughts, concerns, or ideas with your community.
          </DialogDescription>
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

          {/* File Upload Section */}
          <div className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept="image/*"
              className="hidden"
            />
            
            {/* Selected Files (not uploaded yet) */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Selected Images</span>
                  <Button
                    type="button"
                    onClick={uploadSelectedFiles}
                    disabled={isUploading}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload ({selectedFiles.length})
                      </>
                    )}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {selectedFiles.map((file, index) => (
                    <Card key={index} className="relative bg-gray-50">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Image className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700 truncate">
                              {file.name}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index, false)}
                            className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Uploaded Images Preview */}
            {uploadedUrls.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700">Uploaded Images</span>
                <div className="grid grid-cols-1 gap-3">
                  {uploadedUrls.map((url, index) => (
                    <Card key={index} className="relative">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <img 
                            src={url} 
                            alt="Upload preview" 
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index, true)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-700"
              disabled={selectedFiles.length + uploadedUrls.length >= 4}
            >
              <Image className="h-4 w-4 mr-2" />
              Add Images ({selectedFiles.length + uploadedUrls.length}/4)
            </Button>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={(!content.trim() && uploadedUrls.length === 0) || isSubmitting || isUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
