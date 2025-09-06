import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Users, Calendar, MapPin, Clock, Ticket, ChevronDown, ChevronRight, Download } from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

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
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
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
            student_id
          )
        `)
        .eq('created_by', user?.id)
        .eq('registration_enabled', true)
        .order('start_date', { ascending: false });

      if (error) throw error;
      
      // Get profile data for students who registered
      const allRegistrations = data?.flatMap(event => event.event_registrations || []) || [];
      const studentIds = [...new Set(allRegistrations.map(reg => reg.student_id))];
      
      let profilesData: any[] = [];
      if (studentIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', studentIds);
        
        if (!profilesError) {
          profilesData = profiles || [];
        }
      }

      
      const formattedEvents = data?.map(event => ({
        ...event,
        registrations: (event.event_registrations || []).map(reg => ({
          ...reg,
          profiles: profilesData.find(p => p.id === reg.student_id) || { full_name: 'Unknown', email: 'Unknown' }
        }))
      })) || [];
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events with registrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEventExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const exportRegistrations = (event: EventWithRegistrations) => {
    const data = event.registrations.map(registration => ({
      'Full Name': registration.profiles.full_name,
      'Email': registration.profiles.email,
      'Ticket Number': registration.ticket_number,
      'Registration Date': format(new Date(registration.registered_at), 'MMM dd, yyyy HH:mm'),
      'Status': registration.status
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
    
    const fileName = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_registrations.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading registration data...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Event Registration Tracking</h2>
      
      <div className="space-y-4">
        {events.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Events with Registration</CardTitle>
              <CardDescription>You haven't created any events with registration enabled yet.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id}>
              <Collapsible 
                open={expandedEvents.has(event.id)}
                onOpenChange={() => toggleEventExpansion(event.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {expandedEvents.has(event.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
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
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={event.registrations.length > 0 ? "default" : "secondary"} className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.registrations.length} registered
                        </Badge>
                        {event.registrations.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              exportRegistrations(event);
                            }}
                            className="flex items-center gap-1"
                          >
                            <Download className="h-3 w-3" />
                            Export
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent>
                    {event.registrations.length === 0 ? (
                      <p className="text-muted-foreground">No registrations yet for this event.</p>
                    ) : (
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
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default EventRegistrationTracker;