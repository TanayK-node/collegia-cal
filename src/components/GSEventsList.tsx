
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  venue: string;
  status: string;
  department: string | null;
  expected_attendees: number | null;
  budget: number | null;
  is_private: boolean | null;
  created_at: string;
  resources_needed?: string | null;
}

interface GSEventsListProps {
  status: 'draft' | 'submitted' | 'gs_approved' | 'final_approved' | 'rejected' | 'cancelled' | 'all';
  refreshKey?: number;
}

const GSEventsList = ({ status, refreshKey }: GSEventsListProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [status, refreshKey]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      let query = supabase.from('events').select('*');
      
      if (status !== 'all') {
        query = query.eq('status', status);
      } else {
        query = query.in('status', ['submitted', 'gs_approved', 'final_approved', 'rejected', 'cancelled']);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (err: any) {
      console.error('Error fetching events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge className="bg-warning text-warning-foreground">Pending GS</Badge>;
      case 'gs_approved':
        return <Badge className="bg-primary text-primary-foreground">Pending Dean</Badge>;
      case 'final_approved':
        return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading events...</div>;
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No events found for this category.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {events.map((event) => (
        <Card key={event.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {event.title}
                  {event.is_private && (
                    <Badge variant="secondary" className="text-xs">
                      Private
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(event.start_date), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {event.venue}
                  </div>
                </div>
              </div>
              {getStatusBadge(event.status)}
            </div>
          </CardHeader>
          <CardContent>
            {event.description && (
              <p className="text-sm mb-3 text-muted-foreground">{event.description}</p>
            )}
            
            <div className="flex gap-4 text-sm">
              {event.department && (
                <span className="text-muted-foreground">Dept: {event.department}</span>
              )}
              {event.expected_attendees && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{event.expected_attendees}</span>
                </div>
              )}
              {event.budget && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>${event.budget}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default GSEventsList;
