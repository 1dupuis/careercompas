
import { useEffect, useState } from 'react';
import Button from './Button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const roles = ["Engineer", "Designer", "Marketer", "Data Scientist", "Manager", "Developer"];
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [currentRole, setCurrentRole] = useState(roles[0]);
  const [isChanging, setIsChanging] = useState(false);

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

  return (
    <div className="min-h-screen flex flex-col justify-center items-center pt-16 pb-10 px-4 md:px-6">
      <div className="max-w-5xl w-full text-center space-y-6 md:space-y-8">
        <div 
          className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: '100ms' }}
        >
          <div className="inline-block rounded-full bg-secondary px-3 py-1 text-sm font-medium mb-4 neo-shadow">
            AI-Powered Career Guidance
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
              style={{ color: "hsl(142.1, 76.2%, 36.3%)" }}
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
            <Button size="lg" className="w-full sm:w-auto">
              Start Your Assessment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            Explore Features
          </Button>
        </div>
      </div>
      
      <div 
        className={`mt-16 md:mt-24 w-full max-w-5xl transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{ transitionDelay: '900ms' }}
      >
        <div className="relative h-[350px] md:h-[450px] lg:h-[550px] w-full rounded-lg overflow-hidden neo-shadow">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 z-10"></div>
          <div className="glass-card absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 
                         w-[80%] md:w-[70%] p-6 md:p-8 rounded-xl text-left">
            <div className="flex items-center space-x-2 mb-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <h3 className="text-lg font-medium mb-2">Career Assessment</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Based on your interests and strengths, these careers may be a great fit:
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-secondary rounded-md flex items-center justify-between">
                <span className="font-medium">Data Scientist</span>
                <span className="text-sm px-2 py-0.5 bg-green-100 text-green-800 rounded">98% Match</span>
              </div>
              <div className="p-3 bg-secondary rounded-md flex items-center justify-between">
                <span className="font-medium">UX Researcher</span>
                <span className="text-sm px-2 py-0.5 bg-green-100 text-green-800 rounded">94% Match</span>
              </div>
              <div className="p-3 bg-secondary rounded-md flex items-center justify-between">
                <span className="font-medium">Product Manager</span>
                <span className="text-sm px-2 py-0.5 bg-green-100 text-green-800 rounded">91% Match</span>
              </div>
            </div>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=2952&ixlib=rb-4.0.3" 
            alt="Person working on a laptop"
            className="object-cover w-full h-full"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
