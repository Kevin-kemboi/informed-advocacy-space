
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://mgjvxhvlvscckzeucwcn.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nanZ4aHZsdnNjY2t6ZXVjd2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MDA0NDgsImV4cCI6MjA2NTA3NjQ0OH0.b3hmwUJTRT48JIo5Pg2hRgvR9V4jOTKto3iiYrfdoUg"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  full_name: string
  role: 'citizen' | 'government_official' | 'admin'
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  content: string
  media_urls: string[]
  status: 'active' | 'flagged' | 'resolved' | 'archived'
  likes_count: number
  flags_count: number
  created_at: string
  updated_at: string
  profiles?: {
    full_name: string
    email: string
    role: string
  }
}

export interface Poll {
  id: string
  user_id: string
  question: string
  options: { id: string; text: string; votes: number }[]
  total_votes: number
  status: 'active' | 'closed' | 'archived'
  expires_at: string | null
  created_at: string
  updated_at: string
  profiles?: {
    full_name: string
    email: string
    role: string
  }
}

export interface Vote {
  id: string
  poll_id: string
  user_id: string
  option_id: string
  created_at: string
}

export interface Like {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface Flag {
  id: string
  post_id?: string
  poll_id?: string
  user_id: string
  reason?: string
  created_at: string
}

// Utility functions
export const getRoleFromEmail = (email: string): 'citizen' | 'government_official' | 'admin' => {
  if (email.endsWith('@admin.gmail.com')) return 'admin'
  if (email.endsWith('@govt.gmail.com')) return 'government_official'
  return 'citizen'
}

export const validateEmailDomain = (email: string, role: string): boolean => {
  const detectedRole = getRoleFromEmail(email)
  return detectedRole === role
}
