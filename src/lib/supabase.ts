
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  full_name: string
  role: 'citizen' | 'government_official' | 'admin'
  created_at: string
}

export interface Incident {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  location: {
    lat: number
    lng: number
    address: string
  }
  media_urls: string[]
  created_at: string
  updated_at: string
  assigned_to?: string
}

export interface Poll {
  id: string
  title: string
  description: string
  options: { id: string; text: string; votes: number }[]
  status: 'active' | 'closed'
  created_by: string
  created_at: string
  ends_at: string
}

export interface Opinion {
  id: string
  user_id: string
  title: string
  content: string
  category: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface PollVote {
  id: string
  poll_id: string
  user_id: string
  option_id: string
  created_at: string
}
