import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Users, Projector, Monitor } from 'lucide-react';

interface Room {
  id: string;
  floor_number: number;
  room_number: string;
  room_name: string;
  capacity: number;
  has_projector: boolean;
  has_whiteboard: boolean;
}

interface RoomBookingSelectorProps {
  selectedRoomId?: string;
  onRoomSelect: (roomId: string | null, roomDetails: string) => void;
  startDateTime?: Date;
  endDateTime?: Date;
  disabled?: boolean;
}

const RoomBookingSelector = ({ 
  selectedRoomId, 
  onRoomSelect, 
  startDateTime, 
  endDateTime,
  disabled = false 
}: RoomBookingSelectorProps) => {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [availableRooms, setAvailableRooms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all rooms for the selected floor
  useEffect(() => {
    if (selectedFloor) {
      fetchRoomsForFloor(selectedFloor);
    } else {
      setRooms([]);
    }
  }, [selectedFloor]);

  // Check room availability when datetime changes
  useEffect(() => {
    if (startDateTime && endDateTime && rooms.length > 0) {
      checkRoomAvailability();
    }
  }, [startDateTime, endDateTime, rooms]);

  const fetchRoomsForFloor = async (floor: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('floor_number', floor)
        .order('room_number');

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkRoomAvailability = async () => {
    if (!startDateTime || !endDateTime) return;

    try {
      // Check for overlapping bookings using proper time range overlap
      const { data, error } = await supabase
        .from('room_bookings')
        .select('room_id')
        .or(`and(start_time.lt.${endDateTime.toISOString()},end_time.gt.${startDateTime.toISOString()})`);

      if (error) throw error;

      const bookedRoomIds = data?.map(booking => booking.room_id) || [];
      const available = rooms
        .filter(room => !bookedRoomIds.includes(room.id))
        .map(room => room.id);
      
      setAvailableRooms(available);
    } catch (error) {
      console.error('Error checking availability:', error);
      // If error checking availability, assume all rooms are available
      setAvailableRooms(rooms.map(room => room.id));
    }
  };

  const handleFloorSelect = (floorNumber: string) => {
    const floor = parseInt(floorNumber);
    setSelectedFloor(floor);
    onRoomSelect(null, ''); // Clear room selection when floor changes
  };

  const handleRoomSelect = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      const roomDetails = `Floor ${room.floor_number} - ${room.room_name} (${room.room_number})`;
      onRoomSelect(roomId, roomDetails);
    }
  };

  const isRoomAvailable = (roomId: string) => {
    return !startDateTime || !endDateTime || availableRooms.includes(roomId);
  };

  return (
    <div className="space-y-4">
      {/* Floor Selection */}
      <div className="space-y-2">
        <Label>Select Floor *</Label>
        <Select 
          value={selectedFloor?.toString() || ''} 
          onValueChange={handleFloorSelect}
          disabled={disabled}
        >
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <SelectValue placeholder="Choose a floor" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 8 }, (_, i) => i + 1).map((floor) => (
              <SelectItem key={floor} value={floor.toString()}>
                Floor {floor}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Room Selection */}
      {selectedFloor && (
        <div className="space-y-2">
          <Label>Select Room *</Label>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading rooms...</div>
          ) : rooms.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {rooms.map((room) => {
                const available = isRoomAvailable(room.id);
                const isSelected = selectedRoomId === room.id;
                
                return (
                  <Card 
                    key={room.id}
                    className={`cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : available 
                          ? 'hover:border-primary/50' 
                          : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => available && !disabled && handleRoomSelect(room.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{room.room_name}</h4>
                          <p className="text-sm text-muted-foreground">Room {room.room_number}</p>
                        </div>
                        <Badge 
                          variant={available ? "secondary" : "destructive"}
                          className="text-xs"
                        >
                          {available ? "Available" : "Booked"}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {room.capacity}
                        </div>
                        {room.has_projector && (
                          <div className="flex items-center gap-1">
                            <Projector className="h-3 w-3" />
                            Projector
                          </div>
                        )}
                        {room.has_whiteboard && (
                          <div className="flex items-center gap-1">
                            <Monitor className="h-3 w-3" />
                            Whiteboard
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No rooms found for this floor.</div>
          )}
        </div>
      )}

      {startDateTime && endDateTime && rooms.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Availability checked for {startDateTime.toLocaleString()} - {endDateTime.toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default RoomBookingSelector;