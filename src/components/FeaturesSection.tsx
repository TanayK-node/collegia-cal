
import { CheckCircle, Users, Calendar, Settings, Bell, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FeaturesSection = () => {
  const features = [
    {
      icon: Users,
      title: "Committee Panel",
      description: "Easy event proposal with calendar slot booking and real-time status tracking.",
      color: "text-primary"
    },
    {
      icon: CheckCircle,
      title: "Approval Workflow",
      description: "Two-step approval process with GS and Faculty Coordinator validation.",
      color: "text-success"
    },
    {
      icon: Calendar,
      title: "Public Calendar",
      description: "Unified view of all approved events with filtering and registration capabilities.",
      color: "text-warning"
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Automated notifications for approvals, registrations, and event updates.",
      color: "text-primary"
    },
    {
      icon: Settings,
      title: "Admin Dashboard",
      description: "Comprehensive management tools for events, users, and system analytics.",
      color: "text-success"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Detailed insights on event performance, attendance, and engagement metrics.",
      color: "text-warning"
    }
  ];

  return (
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Everything You Need for Event Management
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From event creation to student registration, CampusEvents provides a complete solution 
            for college event coordination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 gradient-card"
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
