
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import EventForm from '@/components/EventForm';
import CommitteeCalendar from '@/components/CommitteeCalendar';
import { Button } from '@/components/ui/button';
import { LogOut, Plus } from 'lucide-react';

const Committee = () => {
  const { user, profile, signOut, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('calendar');

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  if (profile.role !== 'committee') {
    return <Navigate to="/" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Committee Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome, {profile.full_name} - {profile.committee_name || 'Committee Member'}
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="calendar">My Events</TabsTrigger>
              <TabsTrigger value="create">Create Event</TabsTrigger>
            </TabsList>
            <Button onClick={() => setActiveTab('create')}>
              <Plus className="mr-2 h-4 w-4" />
              New Event
            </Button>
          </div>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Events Calendar</CardTitle>
                <CardDescription>
                  View and manage your events. Draft events appear as pending until submitted.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CommitteeCalendar />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create New Event</CardTitle>
                <CardDescription>
                  Fill out the form below to create a new event. Save as draft or submit for approval.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EventForm onSuccess={() => setActiveTab('calendar')} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Committee;
