-- Create rooms table with floors and room numbers
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  floor_number INTEGER NOT NULL CHECK (floor_number >= 1 AND floor_number <= 8),
  room_number TEXT NOT NULL,
  room_name TEXT NOT NULL,
  capacity INTEGER DEFAULT 50,
  has_projector BOOLEAN DEFAULT FALSE,
  has_whiteboard BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(floor_number, room_number)
);

-- Create room bookings table to track availability
CREATE TABLE public.room_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id) -- One booking per event
);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms (readable by all authenticated users)
CREATE POLICY "Authenticated users can view rooms" 
ON public.rooms 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- RLS Policies for room bookings
CREATE POLICY "Users can view room bookings" 
ON public.room_bookings 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Committee can create room bookings for their events" 
ON public.room_bookings 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = room_bookings.event_id 
    AND events.created_by = auth.uid()
  )
);

CREATE POLICY "Committee can update room bookings for their events" 
ON public.room_bookings 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = room_bookings.event_id 
    AND events.created_by = auth.uid()
  )
);

CREATE POLICY "Committee can delete room bookings for their events" 
ON public.room_bookings 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = room_bookings.event_id 
    AND events.created_by = auth.uid()
  )
);

-- Insert sample rooms for all 8 floors
INSERT INTO public.rooms (floor_number, room_number, room_name, capacity, has_projector, has_whiteboard) VALUES
-- Floor 1
(1, '101', 'Conference Room A', 30, true, true),
(1, '102', 'Meeting Room B', 15, false, true),
(1, '103', 'Lecture Hall 1', 100, true, true),
(1, '104', 'Seminar Room', 25, true, true),
(1, '105', 'Workshop Room', 40, false, true),

-- Floor 2
(2, '201', 'Conference Room C', 35, true, true),
(2, '202', 'Meeting Room D', 20, true, true),
(2, '203', 'Lecture Hall 2', 120, true, true),
(2, '204', 'Discussion Room', 18, false, true),
(2, '205', 'Lab Room A', 30, true, false),

-- Floor 3
(3, '301', 'Conference Room E', 40, true, true),
(3, '302', 'Meeting Room F', 12, false, true),
(3, '303', 'Lecture Hall 3', 80, true, true),
(3, '304', 'Study Room', 10, false, true),
(3, '305', 'Lab Room B', 25, true, false),

-- Floor 4
(4, '401', 'Conference Room G', 45, true, true),
(4, '402', 'Meeting Room H', 16, true, true),
(4, '403', 'Auditorium', 200, true, true),
(4, '404', 'Training Room', 35, true, true),
(4, '405', 'Computer Lab', 40, true, false),

-- Floor 5
(5, '501', 'Conference Room I', 50, true, true),
(5, '502', 'Meeting Room J', 22, false, true),
(5, '503', 'Lecture Hall 4', 90, true, true),
(5, '504', 'Presentation Room', 28, true, true),
(5, '505', 'Research Lab', 20, true, false),

-- Floor 6
(6, '601', 'Conference Room K', 30, true, true),
(6, '602', 'Meeting Room L', 14, true, true),
(6, '603', 'Lecture Hall 5', 110, true, true),
(6, '604', 'Group Study Room', 12, false, true),
(6, '605', 'Innovation Lab', 35, true, true),

-- Floor 7
(7, '701', 'Conference Room M', 38, true, true),
(7, '702', 'Meeting Room N', 18, false, true),
(7, '703', 'Lecture Hall 6', 95, true, true),
(7, '704', 'Collaboration Room', 24, true, true),
(7, '705', 'Project Room', 30, false, true),

-- Floor 8
(8, '801', 'Conference Room O', 42, true, true),
(8, '802', 'Meeting Room P', 20, true, true),
(8, '803', 'Executive Hall', 150, true, true),
(8, '804', 'Board Room', 16, true, true),
(8, '805', 'Multi-purpose Room', 60, true, true);

-- Add updated_at trigger for rooms
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_rooms_updated_at
BEFORE UPDATE ON public.rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();