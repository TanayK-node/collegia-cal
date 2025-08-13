
import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const EventCalendar = () => {
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [user, profile]);

  const fetchEvents = async () => {
    try {
      let query = supabase.from('events').select('*');
      
      // Only show final approved events for students and non-authenticated users
      if (!user || profile?.role === 'student') {
        query = query.eq('status', 'final_approved');
      }
      // Show all relevant events for other roles (handled by RLS policies)
      
      const { data, error } = await query.order('start_date', { ascending: true });
      
      if (error) {
        console.error('Error fetching events:', error);
        return;
      }
      
      setEvents(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventColor = (status: string) => {
    switch (status) {
      case 'final_approved': return 'hsl(var(--success))';
      case 'gs_approved': return 'hsl(var(--primary))';
      case 'submitted': return 'hsl(var(--warning))';
      default: return 'hsl(var(--muted))';
    }
  };

  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start_date,
    end: event.end_date,
    backgroundColor: getEventColor(event.status),
    borderColor: getEventColor(event.status),
    extendedProps: {
      ...event,
      registrations: Math.floor(Math.random() * 200) + 50 // Mock data for registrations
    }
  }));

  const handleEventClick = (eventInfo: any) => {
    console.log('Event clicked:', eventInfo.event);
    // Here you would typically open a modal with event details
  };

  const handleDateSelect = (selectInfo: any) => {
    console.log('Date selected:', selectInfo);
    // Here you would typically open the event creation form
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Event Calendar
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {user ? 
              `View ${profile?.role === 'student' ? 'approved' : 'all relevant'} events and check availability.` :
              'View approved events. Sign in for more features.'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center h-96">
                    <div>Loading events...</div>
                  </div>
                ) : (
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    events={calendarEvents}
                    eventClick={handleEventClick}
                    select={handleDateSelect}
                    selectable={user ? true : false}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={true}
                    height="600px"
                    eventDisplay="block"
                    eventTextColor="white"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {events.slice(0, 3).map((event) => (
                  <div key={event.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <Badge 
                        variant={event.status === 'final_approved' ? 'default' : 'secondary'}
                        className={event.status === 'final_approved' ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}
                      >
                        {event.status === 'final_approved' ? 'approved' : event.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.venue}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {event.expected_attendees || 'TBA'} expected
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Events</span>
                  <span className="font-semibold">{events.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <span className="font-semibold text-primary">
                    {events.filter(e => new Date(e.start_date).getMonth() === new Date().getMonth()).length}
                  </span>
                </div>
                {profile?.role !== 'student' && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Pending Approval</span>
                      <span className="font-semibold text-warning">
                        {events.filter(e => e.status === 'submitted').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Approved</span>
                      <span className="font-semibold text-success">
                        {events.filter(e => e.status === 'final_approved').length}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventCalendar;
