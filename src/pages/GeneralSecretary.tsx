
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import GSEventApproval from '@/components/GSEventApproval';
import GSEventsList from '@/components/GSEventsList';

const GeneralSecretary = () => {
  const { user, profile, signOut, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>;
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  if (profile.role !== 'general_secretary') {
    return <Navigate to="/" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  const handleEventApproved = () => {
    // Force refresh of all event lists
    setRefreshKey(prev => prev + 1);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Refresh data when switching tabs to ensure fresh data
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">General Secretary Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome, {profile.full_name} - Event Approval Management
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Approval
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Approved Events
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              All Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  Events Awaiting Your Approval
                </CardTitle>
                <CardDescription>
                  Review and approve/reject events submitted by committee members.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GSEventApproval 
                  status="submitted" 
                  onEventApproved={handleEventApproved}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Approved Events
                </CardTitle>
                <CardDescription>
                  Events you have approved, now pending Dean's approval.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GSEventsList 
                  status="gs_approved" 
                  refreshKey={refreshKey}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Events Overview</CardTitle>
                <CardDescription>
                  Complete overview of all events in the approval pipeline.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GSEventsList 
                  status="all" 
                  refreshKey={refreshKey}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GeneralSecretary;
