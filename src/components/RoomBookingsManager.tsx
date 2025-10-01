import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Calendar, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';

interface RoomBooking {
  id: string;
  room_id: string;
  event_id: string;
  start_time: string;
  end_time: string;
  rooms: {
    room_name: string;
    room_number: string;
    floor_number: number;
  };
  events: {
    title: string;
    created_by: string;
    profiles: {
      full_name: string;
      committee_name: string;
    };
  };
}

const RoomBookingsManager = () => {
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoomBookings();
  }, []);

  const fetchRoomBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('room_bookings')
        .select(`
          *,
          rooms (
            room_name,
            room_number,
            floor_number
          ),
          events!inner (
            title,
            created_by
          )
        `)
        .order('start_time', { ascending: true });

      if (error) throw error;

      // Fetch profile information separately for each event
      if (data) {
        const bookingsWithProfiles = await Promise.all(
          data.map(async (booking: any) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, committee_name')
              .eq('id', booking.events.created_by)
              .single();

            return {
              ...booking,
              events: {
                ...booking.events,
                profiles: profileData || { full_name: 'Unknown', committee_name: null }
              }
            };
          })
        );
        setBookings(bookingsWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching room bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading room bookings...</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No room bookings found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {booking.rooms.room_name} ({booking.rooms.room_number})
                </CardTitle>
                <CardDescription>
                  Floor {booking.rooms.floor_number}
                </CardDescription>
              </div>
              <Badge variant="secondary">Booked</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Event:</span>
                <span>{booking.events.title}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Committee:</span>
                <span>
                  {booking.events.profiles?.committee_name || booking.events.profiles?.full_name || 'Unknown'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Time:</span>
                <span>
                  {format(new Date(booking.start_time), 'PPp')} - {format(new Date(booking.end_time), 'p')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RoomBookingsManager;
