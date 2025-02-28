
import { useEffect, useState, useRef } from 'react';
import Button from './Button';
import { ArrowRight, Play, ExternalLink, Sparkles, Star, ChevronDown, ScrollText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();
  const [showMoreCompanies, setShowMoreCompanies] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setIsVisible(true);
    
    // Animate sparkles
    const interval = setInterval(() => {
      const sparkle = document.createElement('div');
      sparkle.classList.add('sparkle');
      sparkle.style.left = `${Math.random() * 100}vw`;
      sparkle.style.animationDuration = `${Math.random() * 2 + 1}s`;
      document.body.appendChild(sparkle);
      
      setTimeout(() => {
        sparkle.remove();
      }, 3000);
    }, 400);
    
    return () => clearInterval(interval);
  }, []);

  const roles = [
    "Engineer", "Designer", "Marketer", "Data Scientist", 
    "Manager", "Developer", "Product Owner", "Entrepreneur",
    "Consultant", "Team Leader"
  ];
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [currentRole, setCurrentRole] = useState(roles[0]);
  const [isChanging, setIsChanging] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showQuickAssessment, setShowQuickAssessment] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsChanging(true);
      setTimeout(() => {
        setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
        setCurrentRole(roles[(currentRoleIndex + 1) % roles.length]);
        setIsChanging(false);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentRoleIndex]);

  const handleWatchDemo = () => {
    setShowVideo(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseVideo = () => {
    setShowVideo(false);
    document.body.style.overflow = '';
  };

  const handleExploreFeatures = () => {
    // Scroll to features section
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    toast({
      title: "Exploring Features",
      description: "Discover how CareerCompass AI can help you navigate your career journey.",
      duration: 3000,
    });
  };
  
  const handleTakeQuickAssessment = () => {
    setShowQuickAssessment(true);
    
    // After 1.5 seconds, redirect to full assessment
    setTimeout(() => {
      toast({
        title: "Quick Assessment Complete",
        description: "We're preparing your personalized career insights...",
        duration: 2000,
      });
      
      setTimeout(() => {
        window.location.href = '/assessment';
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center pt-16 pb-10 px-4 md:px-6 relative bg-gradient-to-b from-background to-background/95">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -left-52 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl opacity-40"></div>
        <div className="absolute bottom-1/4 -right-52 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl opacity-40"></div>
      </div>
    
      <div className="max-w-5xl w-full text-center space-y-6 md:space-y-8 relative z-10">
        <div 
          className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: '100ms' }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm font-medium mb-4 neo-shadow group">
            <Sparkles size={14} className="text-primary animate-pulse" />
            <span>AI-Powered Career Guidance</span>
            <span className="bg-primary/10 px-2 py-0.5 rounded-full text-xs font-semibold text-primary">New</span>
          </div>
        </div>
        
        <h1 
          className={`text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: '300ms' }}
        >
          Your Path to Becoming a <br className="hidden sm:block" />
          <span className="relative inline-block">
            <span 
              className={`transition-all duration-500 absolute ${isChanging ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}
              style={{ color: "hsl(142.1, 76.2%, 36.3%)", textShadow: "0 0 15px rgba(74, 222, 128, 0.2)" }}
            >
              {currentRole}
            </span>
            <span className="invisible">{currentRole}</span>
          </span>
        </h1>
        
        <p 
          className={`text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: '500ms' }}
        >
          Navigate your professional journey with AI-powered insights. Discover careers that match your strengths, 
          bridge skill gaps, and stay ahead of market trends.
        </p>
        
        <div 
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: '700ms' }}
        >
          <Link to="/assessment">
            <Button size="lg" className="w-full sm:w-auto group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
              Start Full Assessment
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
          <Button 
            variant="secondary" 
            size="lg" 
            className="w-full sm:w-auto group" 
            onClick={handleTakeQuickAssessment}
          >
            <Star size={16} className="mr-2 text-primary" />
            Quick Assessment
          </Button>
          <div className="relative group">
            <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={handleExploreFeatures}>
              Explore Features
              <ChevronDown className="ml-2 h-4 w-4 opacity-70" />
            </Button>
            <div className="absolute left-0 right-0 mt-2 p-2 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
              <div className="space-y-1 text-left">
                <button className="w-full px-3 py-2 text-sm text-left rounded-md hover:bg-secondary flex items-center">
                  <ScrollText size={14} className="mr-2 text-primary" />
                  Career Assessments
                </button>
                <button className="w-full px-3 py-2 text-sm text-left rounded-md hover:bg-secondary flex items-center">
                  <Star size={14} className="mr-2 text-primary" />
                  Skill Gap Analysis
                </button>
                <button className="w-full px-3 py-2 text-sm text-left rounded-md hover:bg-secondary flex items-center">
                  <ArrowRight size={14} className="mr-2 text-primary" />
                  View All Features
                </button>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="lg" 
            className="w-full sm:w-auto flex items-center gap-2 hover:bg-primary/5" 
            onClick={handleWatchDemo}
          >
            <div className="relative h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Play size={12} className="text-primary ml-0.5" />
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-75"></div>
            </div>
            Watch Demo
          </Button>
        </div>
        
        {/* Quick assessment popup */}
        {showQuickAssessment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Quick Career Assessment</h3>
              <div className="space-y-4 mb-6">
                <p className="text-muted-foreground">We're analyzing your profile based on your browsing data...</p>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-[quickload_1.5s_ease-in-out]"></div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">This is just a demo. In a real application, we would ask for your permission before analyzing browser data.</p>
            </div>
          </div>
        )}
      </div>
      
      <div 
        className={`mt-16 md:mt-24 w-full max-w-5xl transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{ transitionDelay: '900ms' }}
      >
        <div className="relative h-[350px] md:h-[450px] lg:h-[550px] w-full rounded-xl overflow-hidden neo-shadow transition-transform duration-500 hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 z-10"></div>
          <div className="glass-modern absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 
                        w-[80%] md:w-[70%] p-6 md:p-8 rounded-xl text-left hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-2 mb-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <span>Career Assessment</span>
              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">AI-Powered</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Based on your interests and strengths, these careers may be a great fit:
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-secondary rounded-md flex items-center justify-between hover:bg-secondary/70 transition-colors cursor-pointer">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                    <Star size={14} className="text-primary" />
                  </div>
                  <span className="font-medium">Data Scientist</span>
                </div>
                <span className="text-sm px-2 py-0.5 bg-green-100 text-green-800 rounded">98% Match</span>
              </div>
              <div className="p-3 bg-secondary rounded-md flex items-center justify-between hover:bg-secondary/70 transition-colors cursor-pointer">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                    <Star size={14} className="text-primary" />
                  </div>
                  <span className="font-medium">UX Researcher</span>
                </div>
                <span className="text-sm px-2 py-0.5 bg-green-100 text-green-800 rounded">94% Match</span>
              </div>
              <div className="p-3 bg-secondary rounded-md flex items-center justify-between hover:bg-secondary/70 transition-colors cursor-pointer">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                    <Star size={14} className="text-primary" />
                  </div>
                  <span className="font-medium">Product Manager</span>
                </div>
                <span className="text-sm px-2 py-0.5 bg-green-100 text-green-800 rounded">91% Match</span>
              </div>
            </div>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=2952&ixlib=rb-4.0.3" 
            alt="Person working on a laptop"
            className="object-cover w-full h-full transition-transform duration-700 hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* Client logos section */}
        <div className="mt-12 text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-6">Trusted by leading companies</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png" alt="Google" className="h-6 md:h-8 opacity-75 hover:opacity-100 transition-opacity" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/2560px-Microsoft_logo_%282012%29.svg.png" alt="Microsoft" className="h-6 md:h-8 opacity-75 hover:opacity-100 transition-opacity" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1024px-Amazon_logo.svg.png" alt="Amazon" className="h-6 md:h-8 opacity-75 hover:opacity-100 transition-opacity" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png" alt="Netflix" className="h-5 md:h-7 opacity-75 hover:opacity-100 transition-opacity" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/2560px-IBM_logo.svg.png" alt="IBM" className="h-6 md:h-8 opacity-75 hover:opacity-100 transition-opacity" />
          </div>
          
          {showMoreCompanies && (
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 mt-6 animate-fadeIn">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1667px-Apple_logo_black.svg.png" alt="Apple" className="h-6 md:h-8 opacity-75 hover:opacity-100 transition-opacity" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Facebook_logo_%28square%29.png/800px-Facebook_logo_%28square%29.png" alt="Facebook" className="h-6 md:h-8 opacity-75 hover:opacity-100 transition-opacity" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Linkedin_icon.svg/2048px-Linkedin_icon.svg.png" alt="LinkedIn" className="h-5 md:h-7 opacity-75 hover:opacity-100 transition-opacity" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Twitch_logo_2019.svg/2560px-Twitch_logo_2019.svg.png" alt="Twitch" className="h-5 md:h-7 opacity-75 hover:opacity-100 transition-opacity" />
            </div>
          )}
          
          <button 
            className="mt-4 text-sm text-primary hover:underline focus:outline-none"
            onClick={() => setShowMoreCompanies(!showMoreCompanies)}
          >
            {showMoreCompanies ? 'Show less' : 'Show more'}
          </button>
        </div>
      </div>

      {/* Video modal with ref */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 md:p-8" ref={videoRef}>
          <div className="relative w-full max-w-4xl bg-white rounded-lg overflow-hidden">
            <div className="absolute top-0 right-0 p-4 z-10 flex gap-2">
              <button 
                className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                onClick={handleCloseVideo}
              >
                <ExternalLink size={16} />
              </button>
            </div>
            <div className="aspect-video">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
                title="Product Demo" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hero;
