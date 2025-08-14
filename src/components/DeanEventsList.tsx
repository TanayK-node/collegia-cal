
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, DollarSign, Award } from 'lucide-react';
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
  created_at: string;
}

interface DeanEventsListProps {
  status: string;
}

const DeanEventsList = ({ status }: DeanEventsListProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [status]);

  const fetchEvents = async () => {
    try {
      let query = supabase.from('events').select('*');
      
      if (status !== 'all') {
        query = query.eq('status', status);
      } else {
        query = query.in('status', ['gs_approved', 'final_approved', 'rejected']);
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
      case 'gs_approved':
        return <Badge className="bg-primary text-primary-foreground">Pending Final Approval</Badge>;
      case 'final_approved':
        return <Badge className="bg-success text-success-foreground">
          <Award className="mr-1 h-3 w-3" />
          Finalized
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
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
        <Card key={event.id} className={event.status === 'final_approved' ? 'border-l-4 border-l-success' : ''}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {event.status === 'final_approved' && <Award className="h-5 w-5 text-success" />}
                  {event.title}
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

export default DeanEventsList;
