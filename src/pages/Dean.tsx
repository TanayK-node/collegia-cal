
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, FileText, Clock, CheckCircle, Award, AlertTriangle } from 'lucide-react';
import DeanEventApproval from '@/components/DeanEventApproval';
import DeanEventsList from '@/components/DeanEventsList';

const Dean = () => {
  const { user, profile, signOut, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>;
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  if (profile.role !== 'dean') {
    return <Navigate to="/" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">Dean Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome, {profile.full_name} - Final Event Authorization
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Final Approval
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Finalized Events
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
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Events Requiring Final Approval
                </CardTitle>
                <CardDescription>
                  Events approved by General Secretary, awaiting your final authorization.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DeanEventApproval status="gs_approved" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-success" />
                  Finalized Events
                </CardTitle>
                <CardDescription>
                  Events you have given final approval - ready for execution.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DeanEventsList status="final_approved" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Complete Events Overview</CardTitle>
                <CardDescription>
                  All events in the system with their current approval status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DeanEventsList status="all" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dean;
