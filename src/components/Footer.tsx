
import { Calendar, Github, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">CampusEvents</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Smart calendar-based event management system for colleges. 
              Streamline planning, approvals, and discovery.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Event Scheduling</li>
              <li>Approval Workflow</li>
              <li>Student Registration</li>
              <li>Admin Dashboard</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Documentation</li>
              <li>Help Center</li>
              <li>Contact Support</li>
              <li>System Status</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Connect</h3>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer">
                <Github className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </div>
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer">
                <Mail className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </div>
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer">
                <MapPin className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 CampusEvents. Built for better college event management.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
