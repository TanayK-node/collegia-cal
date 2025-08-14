
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import EventCalendar from "@/components/EventCalendar";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
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
      
      <HeroSection />
      <EventCalendar />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default Index;
