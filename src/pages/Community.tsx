import { Users, ArrowLeft, MessageCircle, FileText, Phone, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const resources = [
  {
    icon: FileText,
    title: "Government Schemes",
    description: "Access PM-KISAN, crop insurance, and other welfare programs",
    link: "#",
  },
  {
    icon: BookOpen,
    title: "Farming Guides",
    description: "Learn best practices for various crops and seasons",
    link: "#",
  },
  {
    icon: Phone,
    title: "Expert Helpline",
    description: "Connect with agricultural experts for personalized advice",
    link: "#",
  },
  {
    icon: MessageCircle,
    title: "Community Forum",
    description: "Discuss with fellow farmers and share experiences",
    link: "#",
  },
];

const updates = [
  {
    title: "PM-KISAN 16th Installment Released",
    date: "Jan 28, 2025",
    description: "₹2,000 credited to eligible farmers. Check your status.",
  },
  {
    title: "Weather Advisory: Frost Alert",
    date: "Jan 27, 2025",
    description: "Cover sensitive crops in North India this week.",
  },
  {
    title: "New Crop Insurance Deadline",
    date: "Jan 25, 2025",
    description: "Last date to enroll for Rabi 2025 is Feb 15.",
  },
];

const Community = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground font-display">Farmer Community</h1>
                <p className="text-muted-foreground">Connect with experts and access government schemes</p>
              </div>
            </div>

            {/* Resources Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {resources.map((resource) => (
                <Link
                  key={resource.title}
                  to={resource.link}
                  className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <resource.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                </Link>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Latest Updates */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Latest Updates</h2>
                <div className="space-y-4">
                  {updates.map((update, index) => (
                    <div key={index} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-foreground">{update.title}</h3>
                        <span className="text-xs text-muted-foreground">{update.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{update.description}</p>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Updates
                </Button>
              </div>

              {/* Quick Contact */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
                <div className="space-y-4">
                  <div className="bg-primary/5 rounded-xl p-4">
                    <h3 className="font-semibold text-foreground mb-1">Kisan Call Center</h3>
                    <p className="text-2xl font-bold text-primary mb-1">1800-180-1551</p>
                    <p className="text-sm text-muted-foreground">Free toll-free number, available 24/7</p>
                  </div>
                  
                  <div className="bg-accent/50 rounded-xl p-4">
                    <h3 className="font-semibold text-foreground mb-1">WhatsApp Support</h3>
                    <p className="text-lg font-bold text-primary mb-1">+91 9999-999-999</p>
                    <p className="text-sm text-muted-foreground">Send queries via WhatsApp</p>
                  </div>

                  <div className="bg-secondary/30 rounded-xl p-4">
                    <h3 className="font-semibold text-foreground mb-2">Join Our Community</h3>
                    <p className="text-sm text-muted-foreground mb-3">Connect with 50,000+ farmers across India</p>
                    <Button className="w-full">Join WhatsApp Group</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <p className="text-3xl font-bold text-primary">50K+</p>
                <p className="text-sm text-muted-foreground">Active Farmers</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <p className="text-3xl font-bold text-primary">100+</p>
                <p className="text-sm text-muted-foreground">Expert Advisors</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <p className="text-3xl font-bold text-primary">15K+</p>
                <p className="text-sm text-muted-foreground">Queries Solved</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <p className="text-3xl font-bold text-primary">6</p>
                <p className="text-sm text-muted-foreground">Languages</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Community;
