import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Building2, DollarSign, Clock } from "lucide-react";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  description?: string;
  venue: string;
  start_date: string;
  end_date: string;
  status: string;
  expected_attendees?: number;
  budget?: number;
  department?: string;
  committee_name?: string;
  created_by: string;
}

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EventDetailsModal = ({ event, isOpen, onClose }: EventDetailsModalProps) => {
  if (!event) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy 'at' h:mm a");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'final_approved': return 'bg-success text-success-foreground';
      case 'gs_approved': return 'bg-primary text-primary-foreground';
      case 'submitted': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">{event.title}</DialogTitle>
            <Badge className={getStatusColor(event.status)}>
              {event.status === 'final_approved' ? 'Approved' : event.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Description */}
          {event.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Start Date</p>
                  <p className="text-sm text-muted-foreground">{formatDate(event.start_date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">End Date</p>
                  <p className="text-sm text-muted-foreground">{formatDate(event.end_date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Venue</p>
                  <p className="text-sm text-muted-foreground">{event.venue}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {event.expected_attendees && (
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Expected Attendees</p>
                    <p className="text-sm text-muted-foreground">{event.expected_attendees}</p>
                  </div>
                </div>
              )}

              {event.department && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Department</p>
                    <p className="text-sm text-muted-foreground">{event.department}</p>
                  </div>
                </div>
              )}

              {event.committee_name && (
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Organized By</p>
                    <p className="text-sm text-muted-foreground">{event.committee_name}</p>
                  </div>
                </div>
              )}

              {event.budget && (
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Budget</p>
                    <p className="text-sm text-muted-foreground">₹{event.budget.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};