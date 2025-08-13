
import { Calendar, Users, Settings, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  return (
    <nav className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">CampusEvents</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-1">
              <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
                <Calendar className="h-4 w-4 mr-2" />
                Events
              </Button>
              <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
                <Users className="h-4 w-4 mr-2" />
                Committees
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Login
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Sign Up
            </Button>
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
