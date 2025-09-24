import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, Loader2, Save, Send, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  start_date: z.date().refine((date) => date !== undefined, {
    message: 'Start date is required'
  }),
  start_time: z.string().min(1, 'Start time is required'),
  end_date: z.date().refine((date) => date !== undefined, {
    message: 'End date is required'
  }),
  end_time: z.string().min(1, 'End time is required'),
  venue: z.string().min(1, 'Venue is required'),
  department: z.string().optional(),
  expected_attendees: z.number().optional(),
  budget: z.number().optional(),
  resources_needed: z.string().optional(),
  google_form_url: z.string().url().optional().or(z.literal("")),
  is_private: z.boolean().optional(),
  registration_enabled: z.boolean().optional(),
}).refine((data) => {
  // Combine date and time for comparison
  const startDateTime = new Date(`${data.start_date.toISOString().split('T')[0]}T${data.start_time}`);
  const endDateTime = new Date(`${data.end_date.toISOString().split('T')[0]}T${data.end_time}`);
  return endDateTime > startDateTime;
}, {
  message: "End date and time must be after start date and time",
  path: ["end_time"],
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  onSuccess: () => void;
}

const EventForm = ({ onSuccess }: EventFormProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      is_private: false,
      registration_enabled: false
    }
  });

  const startDate = watch('start_date');
  const endDate = watch('end_date');
  const startTime = watch('start_time');
  const endTime = watch('end_time');
  const isPrivate = watch('is_private');
  const registrationEnabled = watch('registration_enabled');

  const submitEvent = async (data: EventFormData, isDraft: boolean = false) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Combine date and time for proper ISO string
      const startDateTime = new Date(`${data.start_date.toISOString().split('T')[0]}T${data.start_time}`);
      const endDateTime = new Date(`${data.end_date.toISOString().split('T')[0]}T${data.end_time}`);
      
      const eventData = {
        title: data.title,
        description: data.description,
        venue: data.venue,
        department: data.department,
        expected_attendees: data.expected_attendees,
        budget: data.budget,
        resources_needed: data.resources_needed,
        google_form_url: data.google_form_url || null,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        created_by: user.id,
        status: (isDraft ? 'draft' : 'submitted') as 'draft' | 'submitted',
        is_private: data.is_private || false,
        registration_enabled: data.registration_enabled || false
      };

      const { error: insertError } = await supabase
        .from('events')
        .insert(eventData);

      if (insertError) throw insertError;

      const message = isDraft ? 'Event saved as draft!' : 'Event submitted for approval!';
      setSuccess(message);
      reset();
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Failed to save event');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data: EventFormData) => {
    submitEvent(data, false);
  };

  const saveDraft = (data: EventFormData) => {
    submitEvent(data, true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Event Title *</Label>
          <Input
            id="title"
            {...register('title')}
            disabled={isLoading}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="venue">Venue *</Label>
          <Input
            id="venue"
            {...register('venue')}
            disabled={isLoading}
          />
          {errors.venue && (
            <p className="text-sm text-destructive">{errors.venue.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Start Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                disabled={isLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && setValue('start_date', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.start_date && (
            <p className="text-sm text-destructive">{errors.start_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_time">Start Time *</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="start_time"
              type="time"
              className="pl-10"
              {...register('start_time')}
              disabled={isLoading}
            />
          </div>
          {errors.start_time && (
            <p className="text-sm text-destructive">{errors.start_time.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>End Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                disabled={isLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => date && setValue('end_date', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.end_date && (
            <p className="text-sm text-destructive">{errors.end_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_time">End Time *</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="end_time"
              type="time"
              className="pl-10"
              {...register('end_time')}
              disabled={isLoading}
            />
          </div>
          {errors.end_time && (
            <p className="text-sm text-destructive">{errors.end_time.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            {...register('department')}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expected_attendees">Expected Attendees</Label>
          <Input
            id="expected_attendees"
            type="number"
            {...register('expected_attendees', { valueAsNumber: true })}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget">Budget</Label>
          <Input
            id="budget"
            type="number"
            step="0.01"
            {...register('budget', { valueAsNumber: true })}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="registration_enabled"
              checked={registrationEnabled}
              onCheckedChange={(checked) => setValue('registration_enabled', checked as boolean)}
              disabled={isLoading}
            />
            <Label htmlFor="registration_enabled" className="text-sm font-medium">
              Enable Student Registration
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_private"
              checked={isPrivate}
              onCheckedChange={(checked) => setValue('is_private', checked as boolean)}
              disabled={isLoading}
            />
            <Label htmlFor="is_private" className="text-sm font-medium">
              Private Event (Only visible to your committee)
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          rows={4}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="resources_needed">Resources Needed</Label>
        <Textarea
          id="resources_needed"
          {...register('resources_needed')}
          rows={3}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="google_form_url">Google Form URL (Optional)</Label>
        <Input
          id="google_form_url"
          type="url"
          placeholder="https://forms.gle/..."
          {...register('google_form_url')}
          disabled={isLoading}
        />
        {errors.google_form_url && (
          <p className="text-sm text-destructive">{errors.google_form_url.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Add a Google Form link for additional event information or registration
        </p>
      </div>

      {error && (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleSubmit(saveDraft)}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Draft
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Submit for Approval
        </Button>
      </div>
    </form>
  );
};

export default EventForm;