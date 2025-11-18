import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Zap, MessageCircle, Calendar, Trophy } from "lucide-react";
import heroImage from "@/assets/hero-banner.jpg";

export function LandingPage() {
  const features = [
    {
      icon: Users,
      title: "Find Teammates",
      description: "Connect with students who complement your skills and share your passion for learning."
    },
    {
      icon: Target,
      title: "Skill Matching",
      description: "Our smart algorithm matches you with peers based on skills you have and want to learn."
    },
    {
      icon: Calendar,
      title: "Join Hackathons",
      description: "Participate in exciting hackathons and coding challenges with your dream team."
    },
    {
      icon: MessageCircle,
      title: "Collaborate Seamlessly",
      description: "Built-in chat and project management tools to keep your team synchronized."
    },
    {
      icon: Trophy,
      title: "Build Projects",
      description: "Work on real projects that showcase your skills and build your portfolio."
    },
    {
      icon: Zap,
      title: "Learn Together",
      description: "Accelerate your learning through peer collaboration and knowledge sharing."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            SkillSwap
          </h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button variant="hero" size="lg" asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Team up, learn skills, and{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  build projects
                </span>{" "}
                together.
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Connect with like-minded students, form powerful teams, and accelerate your learning through collaborative projects and hackathons.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" className="text-lg" asChild>
                <Link to="/signup">Get Started Free</Link>
              </Button>
              <Button variant="outline" size="xl" className="text-lg">
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Universities</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <img 
              src={heroImage} 
              alt="Students collaborating on projects" 
              className="rounded-2xl shadow-2xl w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-primary opacity-10 rounded-2xl" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Everything you need to{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              collaborate
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From finding the perfect teammates to managing projects, we've got you covered.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group"
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <Card className="bg-gradient-primary border-0 text-center">
          <CardContent className="p-12">
            <h2 className="text-4xl font-bold text-primary-foreground mb-4">
              Ready to start building?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already collaborating, learning, and building amazing projects together.
            </p>
            <Button variant="outline" size="xl" className="bg-primary-foreground text-primary border-0 hover:bg-primary-foreground/90" asChild>
              <Link to="/signup">Sign Up Now - It's Free</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <h3 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              SkillSwap
            </h3>
            <p className="text-muted-foreground mb-6">
              Empowering student collaboration worldwide.
            </p>
            <div className="text-sm text-muted-foreground">
              © 2024 SkillSwap. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}