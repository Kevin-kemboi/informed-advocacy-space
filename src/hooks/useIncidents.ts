
import { useState, useEffect } from 'react'
import { supabase, Incident } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase not available for incidents')
      setLoading(false)
      return
    }

    fetchIncidents()
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('incidents')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'incidents'
      }, () => {
        fetchIncidents()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchIncidents = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('incidents')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setIncidents(data || [])
    } catch (error) {
      console.error('Error fetching incidents:', error)
    } finally {
      setLoading(false)
    }
  }

  const createIncident = async (incidentData: Omit<Incident, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!supabase) {
      toast({
        title: "Error",
        description: "Database not available. Please check Supabase configuration.",
        variant: "destructive"
      })
      throw new Error('Supabase not available')
    }

    try {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('incidents')
        .insert({
          ...incidentData,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Incident Reported",
        description: "Your incident has been successfully reported."
      })

      return data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
      throw error
    }
  }

  const updateIncident = async (id: string, updates: Partial<Incident>) => {
    if (!supabase) {
      toast({
        title: "Error",
        description: "Database not available. Please check Supabase configuration.",
        variant: "destructive"
      })
      throw new Error('Supabase not available')
    }

    try {
      const { data, error } = await supabase
        .from('incidents')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Incident Updated",
        description: "The incident has been updated successfully."
      })

      return data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
      throw error
    }
  }

  return {
    incidents,
    loading,
    createIncident,
    updateIncident,
    refetch: fetchIncidents
  }
}
