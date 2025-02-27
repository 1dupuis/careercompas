
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { Check, Users, BarChart, Compass, FileEdit, ArrowRight } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState({
    stats: false,
    testimonials: false,
    pricing: false,
    cta: false,
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      
      // Check each section visibility
      const statsElement = document.getElementById('stats-section');
      if (statsElement && scrollPosition > statsElement.offsetTop + 100) {
        setIsVisible(prev => ({ ...prev, stats: true }));
      }
      
      const testimonialsElement = document.getElementById('testimonials-section');
      if (testimonialsElement && scrollPosition > testimonialsElement.offsetTop + 100) {
        setIsVisible(prev => ({ ...prev, testimonials: true }));
      }
      
      const pricingElement = document.getElementById('pricing-section');
      if (pricingElement && scrollPosition > pricingElement.offsetTop + 100) {
        setIsVisible(prev => ({ ...prev, pricing: true }));
      }
      
      const ctaElement = document.getElementById('cta-section');
      if (ctaElement && scrollPosition > ctaElement.offsetTop + 100) {
        setIsVisible(prev => ({ ...prev, cta: true }));
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger once on mount to check initial visibility
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartFreeTrial = () => {
    toast({
      title: "Free Trial Started",
      description: "Welcome to CareerCompass AI! Your 14-day trial has begun.",
      duration: 3000,
    });
    
    setTimeout(() => {
      navigate("/assessment");
    }, 1000);
  };

  const handleGetStarted = () => {
    navigate("/assessment");
  };

  const handleContactSales = () => {
    toast({
      title: "Contact Request Sent",
      description: "Our sales team will contact you shortly. Thank you for your interest!",
      duration: 3000,
    });
  };

  const handleScheduleDemo = () => {
    toast({
      title: "Demo Scheduled",
      description: "A confirmation email has been sent with your demo details.",
      duration: 3000,
    });
  };

  const testimonials = [
    {
      quote: "CareerCompass AI helped me transition from marketing to UX research by identifying transferrable skills and guiding me through upskilling.",
      author: "Sarah Johnson",
      title: "UX Researcher"
    },
    {
      quote: "The skills gap analysis was eye-opening. I focused on the right certifications and landed a data science role within 6 months.",
      author: "Michael Chen",
      title: "Data Scientist"
    },
    {
      quote: "As someone considering a career change after 10 years, the personalized roadmap made the transition feel achievable and less overwhelming.",
      author: "Alex Rodriguez",
      title: "Product Manager"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main>
        <Hero />
        
        {/* Stats Section */}
        <section id="stats-section" className="py-16 px-4 bg-background">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: "Career paths mapped", value: "200+", icon: Compass },
                { label: "Skills analyzed", value: "1,500+", icon: BarChart },
                { label: "Resumes optimized", value: "50,000+", icon: FileEdit },
                { label: "Success stories", value: "10,000+", icon: Users }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className={`glass-card p-6 rounded-xl text-center transition-all duration-700 ${
                    isVisible.stats 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-10'
                  } hover:shadow-md hover:-translate-y-1`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <Features />
        
        {/* Testimonials Section */}
        <section id="testimonials-section" className="py-20 px-4 bg-background">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium mb-4">
                Success Stories
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Transform your career journey</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                See how CareerCompass AI has helped professionals navigate career transitions and achieve their goals.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className={`glass-card p-6 rounded-xl transition-all duration-700 ${
                    isVisible.testimonials 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-10'
                  } hover:shadow-lg hover:-translate-y-1`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className="mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-medium">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Pricing Section */}
        <section id="pricing-section" className="py-20 px-4 bg-secondary">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium mb-4">
                Pricing Plans
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Choose your career journey</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Select the plan that best fits your career development needs.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  name: "Starter",
                  description: "For individuals exploring career options",
                  price: "$0",
                  period: "Free forever",
                  features: [
                    "Basic career assessment",
                    "Career path suggestions",
                    "Limited skills analysis",
                    "Community access"
                  ],
                  cta: "Get Started",
                  action: handleGetStarted,
                  variant: "outline"
                },
                {
                  name: "Professional",
                  description: "For serious career development",
                  price: "$12",
                  period: "per month",
                  features: [
                    "Advanced career assessment",
                    "Detailed skills gap analysis",
                    "Resume optimization",
                    "AI interview practice",
                    "Job market trends"
                  ],
                  cta: "Start Free Trial",
                  action: handleStartFreeTrial,
                  variant: "default",
                  highlighted: true
                },
                {
                  name: "Enterprise",
                  description: "For teams and organizations",
                  price: "Custom",
                  period: "Contact for pricing",
                  features: [
                    "Everything in Professional",
                    "Team onboarding",
                    "Customized skills mappings",
                    "Industry-specific insights",
                    "API access",
                    "Dedicated support"
                  ],
                  cta: "Contact Sales",
                  action: handleContactSales,
                  variant: "outline"
                }
              ].map((plan, index) => (
                <div 
                  key={index}
                  className={`relative glass-card p-8 rounded-xl transition-all duration-700 ${
                    plan.highlighted ? 'ring-2 ring-ring' : ''
                  } ${
                    isVisible.pricing 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-10'
                  } hover:shadow-lg`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant={plan.variant as any} 
                    className="w-full group"
                    onClick={plan.action}
                  >
                    {plan.cta}
                    {plan.highlighted && (
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section id="cta-section" className="py-20 px-4 bg-background">
          <div 
            className={`container mx-auto max-w-5xl glass-card p-10 md:p-16 rounded-2xl text-center transition-all duration-700 ${
              isVisible.cta ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            } hover:shadow-xl`}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to future-proof your career?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who are navigating their career journeys with confidence using CareerCompass AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="group" onClick={handleGetStarted}>
                Start Free Assessment
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg" onClick={handleScheduleDemo}>
                Schedule a Demo
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
