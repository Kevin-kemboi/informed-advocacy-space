
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProfileCard } from '@/components/ui/profile-card'
import { 
  ImageIcon, 
  MapPin, 
  Hash, 
  AlertTriangle,
  Send,
  X
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { uploadFile, validateFileType, validateFileSize } from '@/utils/fileUpload'

interface TwitterPostComposerProps {
  onSubmit: (postData: {
    content: string
    category: string
    post_type: string
    media_urls: string[]
    location?: string
    hashtags?: string[]
  }) => void
  parentId?: string
  placeholder?: string
}

export function TwitterPostComposer({ 
  onSubmit, 
  parentId, 
  placeholder = "What's happening in your community?" 
}: TwitterPostComposerProps) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')
  const [postType, setPostType] = useState('opinion')
  const [location, setLocation] = useState('')
  const [uploading, setUploading] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [mediaUrls, setMediaUrls] = useState<string[]>([])

  const maxChars = 280
  const remainingChars = maxChars - content.length

  const handleFileUpload = async (files: File[]) => {
    setUploading(true)
    const newUrls: string[] = []
    
    for (const file of files) {
      if (!validateFileType(file)) {
        alert('Please upload only image files (JPEG, PNG, GIF, WebP)')
        continue
      }
      
      if (!validateFileSize(file)) {
        alert('File size must be less than 5MB')
        continue
      }
      
      if (user) {
        const url = await uploadFile(file, user.id)
        if (url) newUrls.push(url)
      }
    }
    
    setMediaUrls(prev => [...prev, ...newUrls])
    setUploading(false)
  }

  const extractHashtags = (text: string): string[] => {
    const hashtags = text.match(/#[\w]+/g)
    return hashtags ? hashtags.map(tag => tag.slice(1)) : []
  }

  const handleSubmit = async () => {
    if (!content.trim()) return
    
    const hashtags = extractHashtags(content)
    
    await onSubmit({
      content: content.trim(),
      category,
      post_type: postType,
      media_urls: mediaUrls,
      location: location || undefined,
      hashtags: hashtags.length > 0 ? hashtags : undefined
    })
    
    // Reset form
    setContent('')
    setLocation('')
    setMediaUrls([])
    setMediaFiles([])
    setCategory('general')
    setPostType('opinion')
  }

  if (!user) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="border-gray-200 bg-white/90 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <ProfileCard 
              user={{
                full_name: user.full_name,
                role: user.role,
                profile_pic_url: user.profile_pic_url,
                verified: user.verified
              }}
              size="md"
            />
            
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder={placeholder}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="border-none resize-none text-lg placeholder:text-gray-500 focus:ring-0"
                rows={3}
                maxLength={maxChars}
              />
              
              {/* Media Preview */}
              {mediaUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {mediaUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => setMediaUrls(prev => prev.filter((_, i) => i !== index))}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Controls */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="crime">Crime</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="corruption">Corruption</SelectItem>
                      <SelectItem value="environment">Environment</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={postType} onValueChange={setPostType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="opinion">Opinion</SelectItem>
                      <SelectItem value="incident">Incident</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleFileUpload(Array.from(e.target.files))}
                      className="hidden"
                      id="media-upload"
                    />
                    <label htmlFor="media-upload">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={uploading}
                        asChild
                      >
                        <span className="cursor-pointer">
                          <ImageIcon className="w-5 h-5 text-blue-500" />
                        </span>
                      </Button>
                    </label>
                    
                    <Button variant="ghost" size="sm">
                      <MapPin className="w-5 h-5 text-blue-500" />
                    </Button>
                    
                    <Button variant="ghost" size="sm">
                      <Hash className="w-5 h-5 text-blue-500" />
                    </Button>
                    
                    {postType === 'emergency' && (
                      <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${remainingChars < 20 ? 'text-red-500' : 'text-gray-500'}`}>
                    {remainingChars}
                  </span>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleSubmit}
                      disabled={!content.trim() || remainingChars < 0 || uploading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Post
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
