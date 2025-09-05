import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, MapPin, Clock, Ticket } from 'lucide-react';
import { format } from 'date-fns';

interface EventWithRegistrations {
  id: string;
  title: string;
  description: string;
  venue: string;
  start_date: string;
  end_date: string;
  registration_enabled: boolean;
  registrations: Registration[];
}

interface Registration {
  id: string;
  ticket_number: string;
  registered_at: string;
  status: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const EventRegistrationTracker = () => {
  const [events, setEvents] = useState<EventWithRegistrations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchEventsWithRegistrations();
    }
  }, [user]);

  const fetchEventsWithRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          venue,
          start_date,
          end_date,
          registration_enabled,
          event_registrations(
            id,
            ticket_number,
            registered_at,
            status,
            profiles!inner(
              full_name,
              email
            )
          )
        `)
        .eq('created_by', user?.id)
        .eq('registration_enabled', true)
        .order('start_date', { ascending: false });

      if (error) throw error;
      
      const formattedEvents = data?.map(event => ({
        ...event,
        registrations: event.event_registrations || []
      })) || [];
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events with registrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading registration data...</div>;
  }

  const eventsWithRegistrations = events.filter(event => event.registrations.length > 0);
  const eventsWithoutRegistrations = events.filter(event => event.registrations.length === 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Event Registration Tracking</h2>
      
      <Tabs defaultValue="with-registrations" className="w-full">
        <TabsList>
          <TabsTrigger value="with-registrations">
            Events with Registrations ({eventsWithRegistrations.length})
          </TabsTrigger>
          <TabsTrigger value="without-registrations">
            No Registrations ({eventsWithoutRegistrations.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="with-registrations" className="space-y-4">
          {eventsWithRegistrations.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Registrations Yet</CardTitle>
                <CardDescription>None of your events have received registrations yet.</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            eventsWithRegistrations.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(event.start_date), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(event.start_date), 'HH:mm')} - 
                          {format(new Date(event.end_date), 'HH:mm')}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.venue}
                        </div>
                      </div>
                    </div>
                    <Badge variant="default" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {event.registrations.length} registered
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium">Registered Students:</h4>
                    <div className="grid gap-2">
                      {event.registrations.map((registration) => (
                        <div key={registration.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <div>
                            <div className="font-medium">{registration.profiles.full_name}</div>
                            <div className="text-sm text-muted-foreground">{registration.profiles.email}</div>
                            <div className="text-xs text-muted-foreground">
                              Registered: {format(new Date(registration.registered_at), 'MMM dd, yyyy HH:mm')}
                            </div>
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
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="without-registrations" className="space-y-4">
          {eventsWithoutRegistrations.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>All Events Have Registrations</CardTitle>
                <CardDescription>Great! All your events with registration enabled have received sign-ups.</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            eventsWithoutRegistrations.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(event.start_date), 'MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {format(new Date(event.start_date), 'HH:mm')} - 
                      {format(new Date(event.end_date), 'HH:mm')}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.venue}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">No registrations yet for this event.</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventRegistrationTracker;