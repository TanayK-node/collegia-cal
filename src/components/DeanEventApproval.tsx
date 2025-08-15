
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, MapPin, Users, DollarSign, Check, X, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface DeanEventApprovalProps {
  status: 'gs_approved';
}

const DeanEventApproval = ({ status }: DeanEventApprovalProps) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingEvent, setProcessingEvent] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [status]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (eventId: string, approvalStatus: 'approved' | 'rejected') => {
    if (!user) return;

    setProcessingEvent(eventId);
    setError(null);
    setSuccess(null);

    try {
      // Create approval record
      const { error: approvalError } = await supabase
        .from('event_approvals')
        .insert({
          event_id: eventId,
          approver_id: user.id,
          status: approvalStatus,
          approval_type: 'dean_approval',
          comments: comments[eventId] || null
        });

      if (approvalError) throw approvalError;

      // Update event status
      const newStatus = approvalStatus === 'approved' ? 'final_approved' : 'rejected';
      const { error: updateError } = await supabase
        .from('events')
        .update({ status: newStatus })
        .eq('id', eventId);

      if (updateError) throw updateError;

      setSuccess(`Event ${approvalStatus === 'approved' ? 'given final approval' : 'rejected'} successfully!`);
      
      // Remove the event from the list
      setEvents(events.filter(event => event.id !== eventId));
      
      // Clear the comment for this event
      setComments(prev => {
        const newComments = { ...prev };
        delete newComments[eventId];
        return newComments;
      });

    } catch (err: any) {
      setError(err.message || `Failed to ${approvalStatus === 'approved' ? 'approve' : 'reject'} event`);
    } finally {
      setProcessingEvent(null);
    }
  };

  const updateComment = (eventId: string, comment: string) => {
    setComments(prev => ({
      ...prev,
      [eventId]: comment
    }));
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading events...</div>;
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No events pending final approval.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {events.map((event) => (
        <Card key={event.id} className="border-l-4 border-l-primary">
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
                    {format(new Date(event.start_date), 'MMM dd, yyyy')} - {format(new Date(event.end_date), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {event.venue}
                  </div>
                </div>
              </div>
              <Badge className="bg-primary text-primary-foreground">GS Approved</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.description && (
              <p className="text-sm text-muted-foreground">{event.description}</p>
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

            {event.resources_needed && (
              <div>
                <Label className="text-sm font-medium">Resources Needed:</Label>
                <p className="text-sm text-muted-foreground mt-1">{event.resources_needed}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor={`comment-${event.id}`} className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                Dean Comments (Optional)
              </Label>
              <Textarea
                id={`comment-${event.id}`}
                placeholder="Add any final comments or conditions..."
                value={comments[event.id] || ''}
                onChange={(e) => updateComment(event.id, e.target.value)}
                disabled={processingEvent === event.id}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => handleApproval(event.id, 'approved')}
                disabled={processingEvent === event.id}
                className="bg-success hover:bg-success/90 text-success-foreground"
              >
                <Check className="mr-2 h-4 w-4" />
                Final Approval
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleApproval(event.id, 'rejected')}
                disabled={processingEvent === event.id}
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DeanEventApproval;
