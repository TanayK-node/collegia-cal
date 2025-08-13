
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import EventCalendar from "@/components/EventCalendar";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <EventCalendar />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default Index;
