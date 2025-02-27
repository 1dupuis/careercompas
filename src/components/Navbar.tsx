
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-semibold">CareerCompass</span>
            <span className="text-xs bg-black text-white px-2 py-0.5 rounded-md">AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium hover:opacity-80 transition-opacity">
              Home
            </Link>
            <Link to="/assessment" className="text-sm font-medium hover:opacity-80 transition-opacity">
              Assessment
            </Link>
            <Link to="/skills" className="text-sm font-medium hover:opacity-80 transition-opacity">
              Skills
            </Link>
            <Link to="/resume" className="text-sm font-medium hover:opacity-80 transition-opacity">
              Resume
            </Link>
            <Link to="/market" className="text-sm font-medium hover:opacity-80 transition-opacity">
              Market Insights
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              Log In
            </Button>
            <Button size="sm">Get Started</Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass animate-fade-in">
          <div className="py-4 px-4 space-y-4">
            <Link 
              to="/" 
              className="block text-sm font-medium py-2 hover:opacity-80 transition-opacity"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/assessment" 
              className="block text-sm font-medium py-2 hover:opacity-80 transition-opacity"
              onClick={() => setIsMenuOpen(false)}
            >
              Assessment
            </Link>
            <Link 
              to="/skills" 
              className="block text-sm font-medium py-2 hover:opacity-80 transition-opacity"
              onClick={() => setIsMenuOpen(false)}
            >
              Skills
            </Link>
            <Link 
              to="/resume" 
              className="block text-sm font-medium py-2 hover:opacity-80 transition-opacity"
              onClick={() => setIsMenuOpen(false)}
            >
              Resume
            </Link>
            <Link 
              to="/market" 
              className="block text-sm font-medium py-2 hover:opacity-80 transition-opacity"
              onClick={() => setIsMenuOpen(false)}
            >
              Market Insights
            </Link>
            <div className="pt-2 flex flex-col space-y-3">
              <Button variant="ghost" size="sm" className="justify-start">
                Log In
              </Button>
              <Button size="sm">Get Started</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
