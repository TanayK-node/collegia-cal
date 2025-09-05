
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import EventCalendar from "@/components/EventCalendar";
import StudentRegistrations from "@/components/StudentRegistrations";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Index = () => {
  const { user, profile, loading } = useAuth();
  const [forceLoaded, setForceLoaded] = useState(false);

  // Fallback to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      setForceLoaded(true);
    }, 3000); // Force load after 3 seconds

    return () => clearTimeout(timeout);
  }, []);

  if (loading && !forceLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect committee users to their dashboard
  if (user && profile?.role === 'committee') {
    return <Navigate to="/committee" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Show login prompt if not authenticated */}
      {!user && (
        <div className="bg-primary text-primary-foreground py-4">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <p>Sign in to access event management features</p>
            <Button asChild variant="secondary">
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      )}
      
      {user && profile?.role === 'student' ? (
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="calendar" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="calendar">Event Calendar</TabsTrigger>
              <TabsTrigger value="registrations">My Registrations</TabsTrigger>
            </TabsList>
            <TabsContent value="calendar" className="space-y-4">
              <EventCalendar />
            </TabsContent>
            <TabsContent value="registrations" className="space-y-4">
              <StudentRegistrations />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <EventCalendar />
      )}
    
      <Footer />
    </div>
  );
};

export default Index;
