
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";

const EventCalendar = () => {
  // Sample events data
  const events = [
    {
      id: '1',
      title: 'Tech Symposium 2024',
      start: '2024-08-15T10:00:00',
      end: '2024-08-15T17:00:00',
      backgroundColor: 'hsl(var(--success))',
      borderColor: 'hsl(var(--success))',
      extendedProps: {
        department: 'Computer Science',
        venue: 'Auditorium A',
        status: 'approved',
        registrations: 156
      }
    },
    {
      id: '2',
      title: 'Cultural Night',
      start: '2024-08-18T19:00:00',
      end: '2024-08-18T22:00:00',
      backgroundColor: 'hsl(var(--primary))',
      borderColor: 'hsl(var(--primary))',
      extendedProps: {
        department: 'Cultural Committee',
        venue: 'Main Ground',
        status: 'approved',
        registrations: 230
      }
    },
    {
      id: '3',
      title: 'Robotics Workshop',
      start: '2024-08-20T14:00:00',
      end: '2024-08-20T16:00:00',
      backgroundColor: 'hsl(var(--warning))',
      borderColor: 'hsl(var(--warning))',
      extendedProps: {
        department: 'Electronics',
        venue: 'Lab 201',
        status: 'pending',
        registrations: 45
      }
    },
    {
      id: '4',
      title: 'Startup Pitch Competition',
      start: '2024-08-22T09:00:00',
      end: '2024-08-22T15:00:00',
      backgroundColor: 'hsl(var(--success))',
      borderColor: 'hsl(var(--success))',
      extendedProps: {
        department: 'Entrepreneurship Cell',
        venue: 'Conference Hall',
        status: 'approved',
        registrations: 89
      }
    }
  ];

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
            View all upcoming events, check availability, and manage your college calendar in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                  }}
                  events={events}
                  eventClick={handleEventClick}
                  select={handleDateSelect}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={true}
                  weekends={true}
                  height="600px"
                  eventDisplay="block"
                  eventTextColor="white"
                />
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
                        variant={event.extendedProps.status === 'approved' ? 'default' : 'secondary'}
                        className={event.extendedProps.status === 'approved' ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}
                      >
                        {event.extendedProps.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.extendedProps.venue}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {event.extendedProps.registrations} registered
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
                  <span className="font-semibold">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <span className="font-semibold text-primary">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending Approval</span>
                  <span className="font-semibold text-warning">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Registrations</span>
                  <span className="font-semibold text-success">520</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventCalendar;
