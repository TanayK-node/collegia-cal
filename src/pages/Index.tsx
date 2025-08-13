
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import EventCalendar from "@/components/EventCalendar";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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
