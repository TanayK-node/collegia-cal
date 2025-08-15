
import { Calendar, Users, Settings, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
const Navigation = () => {
  const { user, profile } = useAuth();

  const getDashboardLink = () => {
    if (!user || !profile) return "/auth";
    
    switch (profile.role) {
      case 'committee':
        return '/committee';
      case 'general_secretary':
        return '/general-secretary';
      case 'dean':
        return '/dean';
      default:
        return '/';
    }
  };

  const getDashboardLabel = () => {
    if (!user || !profile) return "Login";
    
    switch (profile.role) {
      case 'committee':
        return 'Committee';
      case 'general_secretary':
        return 'General Secretary';
      case 'dean':
        return 'Dean';
      default:
        return 'Dashboard';
    }
  };

  return (
    <nav className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">CampusEvents</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              <Button asChild variant="ghost" size="sm" className="text-foreground hover:text-primary">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-foreground hover:text-primary">
                <Link to="/">
                  <Calendar className="h-4 w-4 mr-2" />
                  Events
                </Link>
              </Button>
              {user && profile && (
                <Button asChild variant="ghost" size="sm" className="text-foreground hover:text-primary">
                  <Link to={getDashboardLink()}>
                    <Users className="h-4 w-4 mr-2" />
                    {getDashboardLabel()}
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!user ? (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link to="/auth">Login</Link>
                </Button>
                <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                  <Link to="/auth">Sign Up</Link>
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/auth"; // Force redirect to auth page
                }}
              >
                Logout
              </Button>

            )}
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
