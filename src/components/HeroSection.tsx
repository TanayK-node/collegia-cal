
import { Calendar, Clock, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 gradient-hero opacity-5"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-8 animate-fade-in-up">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              Smart Campus
              <span className="text-primary block">Event Management</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Streamline event planning, approvals, and discovery. One platform for all your college events.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Calendar className="h-5 w-5 mr-2" />
              View Events
            </Button>
            <Button size="lg" variant="outline">
              <Users className="h-5 w-5 mr-2" />
              For Committees
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            <Card className="p-6 gradient-card border-0 shadow-lg animate-float" style={{ animationDelay: '0s' }}>
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Easy Scheduling</h3>
                <p className="text-muted-foreground text-sm">
                  Book calendar slots and avoid conflicts automatically
                </p>
              </div>
            </Card>

            <Card className="p-6 gradient-card border-0 shadow-lg animate-float" style={{ animationDelay: '0.2s' }}>
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <h3 className="text-lg font-semibold">Quick Approvals</h3>
                <p className="text-muted-foreground text-sm">
                  Two-step approval process with real-time notifications
                </p>
              </div>
            </Card>

            <Card className="p-6 gradient-card border-0 shadow-lg animate-float" style={{ animationDelay: '0.4s' }}>
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <h3 className="text-lg font-semibold">Instant Publishing</h3>
                <p className="text-muted-foreground text-sm">
                  Approved events appear immediately for student registration
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
