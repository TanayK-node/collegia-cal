import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Calendar, MapPin, Users, DollarSign, Award } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  resources_needed: string | null;
  created_at: string;
}

interface DeanEventApprovalProps {
  status: 'draft' | 'submitted' | 'gs_approved' | 'final_approved' | 'rejected';
}

const DeanEventApproval = ({ status }: DeanEventApprovalProps) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [comments, setComments] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(err.message);
    }
  };

  const handleApproval = async (eventId: string, action: 'approve' | 'reject') => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Create approval record
      const { error: approvalError } = await supabase
        .from('event_approvals')
        .insert({
          event_id: eventId,
          approver_id: user.id,
          approval_type: 'dean_approval',
          status: action === 'approve' ? 'approved' : 'rejected',
          comments: comments || null
        });

      if (approvalError) throw approvalError;

      // Update event status
      const newStatus = action === 'approve' ? 'final_approved' : 'rejected';
      const { error: updateError } = await supabase
        .from('events')
        .update({ status: newStatus })
        .eq('id', eventId);

      if (updateError) throw updateError;

      setComments('');
      setSelectedEvent(null);
      fetchEvents();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No events requiring final approval at the moment.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id} className="border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
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
                <Badge className="bg-primary text-primary-foreground">GS Approved</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.description && (
                <p className="text-sm">{event.description}</p>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {event.department && (
                  <div>
                    <Label className="font-medium">Department</Label>
                    <p className="text-muted-foreground">{event.department}</p>
                  </div>
                )}
                {event.expected_attendees && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{event.expected_attendees} attendees</span>
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
                  <Label className="font-medium">Resources Needed</Label>
                  <p className="text-sm text-muted-foreground">{event.resources_needed}</p>
                </div>
              )}

              <div className="space-y-3 pt-4 border-t">
                <div>
                  <Label htmlFor={`comments-${event.id}`}>Final Comments (Optional)</Label>
                  <Textarea
                    id={`comments-${event.id}`}
                    placeholder="Add any final comments or special instructions..."
                    value={selectedEvent?.id === event.id ? comments : ''}
                    onChange={(e) => {
                      setSelectedEvent(event);
                      setComments(e.target.value);
                    }}
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApproval(event.id, 'approve')}
                    disabled={isLoading}
                    className="bg-success hover:bg-success/90"
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Give Final Approval
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleApproval(event.id, 'reject')}
                    disabled={isLoading}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DeanEventApproval;
