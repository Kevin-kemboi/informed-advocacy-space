
import { supabase } from '@/lib/supabase'

export const uploadFile = async (file: File, userId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `posts/${fileName}`

    console.log('Uploading file:', fileName)
    
    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(filePath, file)

    if (error) {
      console.error('Error uploading file:', error)
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath)

    console.log('File uploaded successfully:', publicUrl)
    return publicUrl
  } catch (error) {
    console.error('Error in uploadFile:', error)
    return null
  }
}

export const validateFileType = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  return allowedTypes.includes(file.type)
}

export const validateFileSize = (file: File): boolean => {
  // 5MB limit
  const maxSize = 5 * 1024 * 1024
  return file.size <= maxSize
}
