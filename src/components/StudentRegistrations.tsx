import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Ticket } from 'lucide-react';
import { format } from 'date-fns';

interface Registration {
  id: string;
  ticket_number: string;
  registered_at: string;
  status: string;
  event: {
    id: string;
    title: string;
    description: string;
    venue: string;
    start_date: string;
    end_date: string;
    committee_name: string;
  };
}

const StudentRegistrations = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchRegistrations();
    }
  }, [user]);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          id,
          ticket_number,
          registered_at,
          status,
          events!inner(
            id,
            title,
            description,
            venue,
            start_date,
            end_date,
            created_by
          )
        `)
        .eq('student_id', user?.id)
        .order('registered_at', { ascending: false });

      if (error) throw error;

      // Fetch committee names separately
      const eventsWithCommittees = await Promise.all(
        (data || []).map(async (reg) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('committee_name')
            .eq('id', reg.events.created_by)
            .single();

          return {
            ...reg,
            event: {
              ...reg.events,
              committee_name: profileData?.committee_name || 'Unknown Committee'
            }
          };
        })
      );

      setRegistrations(eventsWithCommittees);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading your registrations...</div>;
  }

  if (registrations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Event Registrations</CardTitle>
          <CardDescription>You haven't registered for any events yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Event Registrations</h2>
      <div className="grid gap-4">
        {registrations.map((registration) => (
          <Card key={registration.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{registration.event.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {registration.event.committee_name}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Ticket className="h-3 w-3" />
                    {registration.ticket_number}
                  </Badge>
                  <Badge variant={registration.status === 'registered' ? 'default' : 'secondary'}>
                    {registration.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {registration.event.description && (
                  <p className="text-sm text-muted-foreground">
                    {registration.event.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(registration.event.start_date), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(new Date(registration.event.start_date), 'HH:mm')} - 
                    {format(new Date(registration.event.end_date), 'HH:mm')}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {registration.event.venue}
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Registered on {format(new Date(registration.registered_at), 'MMM dd, yyyy HH:mm')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentRegistrations;