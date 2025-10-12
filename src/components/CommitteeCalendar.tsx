
import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Send, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Event {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  venue: string;
  status: 'draft' | 'submitted' | 'gs_approved' | 'final_approved' | 'rejected' | 'cancelled';
  department: string | null;
  expected_attendees: number | null;
  budget: number | null;
}

const CommitteeCalendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [eventToCancel, setEventToCancel] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', user.id)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventColor = (status: string) => {
    switch (status) {
      case 'draft': return '#94a3b8'; // gray
      case 'submitted': return '#f59e0b'; // yellow
      case 'gs_approved': return '#3b82f6'; // blue
      case 'final_approved': return '#10b981'; // green
      case 'rejected': return '#ef4444'; // red
      case 'cancelled': return '#64748b'; // slate
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'submitted': return 'Pending GS Approval';
      case 'gs_approved': return 'Pending Dean Approval';
      case 'final_approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start_date,
    end: event.end_date,
    backgroundColor: getEventColor(event.status),
    borderColor: getEventColor(event.status),
    extendedProps: event
  }));

  const handleEventClick = (eventInfo: any) => {
    setSelectedEvent(eventInfo.event.extendedProps);
  };

  const submitForApproval = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'submitted' })
        .eq('id', eventId);

      if (error) throw error;
      fetchEvents();
      setSelectedEvent(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      fetchEvents();
      setSelectedEvent(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCancelClick = (eventId: string) => {
    setEventToCancel(eventId);
    setShowCancelDialog(true);
  };

  const confirmCancelEvent = async () => {
    if (!eventToCancel) return;

    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'cancelled' })
        .eq('id', eventToCancel);

      if (error) throw error;
      fetchEvents();
      setSelectedEvent(null);
      setShowCancelDialog(false);
      setEventToCancel(null);
    } catch (err: any) {
      setError(err.message);
      setShowCancelDialog(false);
    }
  };

  if (isLoading) return <div>Loading events...</div>;

  return (
    <div className="space-y-6">
      {error && (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek'
            }}
            events={calendarEvents}
            eventClick={handleEventClick}
            height="600px"
            eventDisplay="block"
            eventTextColor="white"
          />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Status Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#94a3b8' }}></div>
                <span className="text-sm">Draft</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                <span className="text-sm">Pending GS Approval</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                <span className="text-sm">Pending Dean Approval</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
                <span className="text-sm">Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                <span className="text-sm">Rejected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#64748b' }}></div>
                <span className="text-sm">Cancelled</span>
              </div>
            </CardContent>
          </Card>

          {selectedEvent && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{selectedEvent.title}</CardTitle>
                  <Badge variant="secondary">
                    {getStatusLabel(selectedEvent.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Venue</p>
                  <p className="text-sm text-muted-foreground">{selectedEvent.venue}</p>
                </div>
                
                {selectedEvent.description && (
                  <div>
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {selectedEvent.status === 'draft' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => submitForApproval(selectedEvent.id)}
                      >
                        <Send className="mr-1 h-3 w-3" />
                        Submit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteEvent(selectedEvent.id)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    </>
                  )}
                  {(selectedEvent.status === 'submitted' || 
                    selectedEvent.status === 'gs_approved' || 
                    selectedEvent.status === 'final_approved') && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleCancelClick(selectedEvent.id)}
                    >
                      <XCircle className="mr-1 h-3 w-3" />
                      Cancel Event
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the event and remove it from the public calendar. 
              The event will still be visible to the General Secretary and Dean with a "Cancelled" status.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEventToCancel(null)}>
              No, keep event
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelEvent}>
              Yes, cancel event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CommitteeCalendar;
