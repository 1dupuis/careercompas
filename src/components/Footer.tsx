
import { Link } from 'react-router-dom';
import { ChevronRight, Mail, MapPin, Phone, Clock, Twitter, Linkedin, Github, Instagram } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react';

const Footer = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    toast({
      title: "Newsletter subscription successful",
      description: "Thank you for subscribing to our newsletter!",
      duration: 3000,
    });
    
    setEmail('');
  };

  return (
    <footer className="bg-secondary pt-16 pb-8 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="text-xl font-bold mb-4">CareerCompass AI</h3>
            <p className="text-muted-foreground mb-6">
              Navigate your career journey with confidence using AI-powered insights and personalized guidance.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                <Twitter size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                <Linkedin size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                <Github size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                <Instagram size={16} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: 'Home', link: '/' },
                { label: 'Assessment', link: '/assessment' },
                { label: 'Pricing', link: '/#pricing-section' },
                { label: 'About Us', link: '#' },
                { label: 'Contact', link: '#' },
              ].map((item, index) => (
                <li key={index}>
                  <Link 
                    to={item.link} 
                    className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ChevronRight size={14} className="mr-1" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  123 Innovation Drive, Tech District, CA 94103, USA
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">support@careercompass.ai</span>
              </li>
              <li className="flex items-center">
                <Clock size={18} className="mr-2 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Mon-Fri: 9AM - 5PM EST</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-muted-foreground mb-4">
              Subscribe to our newsletter for the latest career insights and tips.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email address"
                  className="flex h-10 w-full rounded-l-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button 
                  type="submit"
                  className="bg-primary text-white px-4 rounded-r-md hover:bg-primary/90 transition-colors"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-muted">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CareerCompass AI. All rights reserved.
            </p>
            <div className="flex mt-4 md:mt-0 space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
