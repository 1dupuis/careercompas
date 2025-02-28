
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from './Button';
import { Menu, X, ChevronDown, Search, User, Bell, Settings } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { toast } = useToast();
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { 
      name: 'Features', 
      path: '/#features-section',
      children: [
        { name: 'Career Roadmaps', path: '/#features-section' },
        { name: 'Skills Analysis', path: '/#features-section' },
        { name: 'Resume Builder', path: '/#features-section' }
      ] 
    },
    { name: 'Pricing', path: '/#pricing-section' },
    { name: 'Testimonials', path: '/#testimonials-section' },
    { name: 'Assessment', path: '/assessment' }
  ];

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

  useEffect(() => {
    // Close mobile menu when location changes
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    toast({
      title: "Search initiated",
      description: `Searching for "${searchQuery}"`,
      duration: 3000,
    });
    
    setSearchQuery('');
    setShowSearch(false);
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 backdrop-blur-md border-b shadow-sm' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="w-8 h-8 flex items-center justify-center rounded-md bg-primary text-white font-bold">CC</span>
              <span className="text-xl font-bold hidden md:inline-block">CareerCompass</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item, index) => (
              <div key={index} className="relative group">
                <Link
                  to={item.path}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === item.path 
                      ? 'text-primary' 
                      : 'text-foreground/80 hover:text-primary hover:bg-secondary'
                  } ${item.children ? 'inline-flex items-center' : ''}`}
                >
                  {item.name}
                  {item.children && <ChevronDown size={14} className="ml-1" />}
                </Link>
                
                {item.children && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="py-1">
                      {item.children.map((child, childIndex) => (
                        <Link
                          key={childIndex}
                          to={child.path}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-secondary transition-colors"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
          
          <div className="flex items-center space-x-1">
            <button 
              className="p-2 rounded-full text-foreground/80 hover:text-primary hover:bg-secondary transition-colors"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search size={20} />
            </button>
            
            <div className="relative">
              <button 
                className="p-2 rounded-full text-foreground/80 hover:text-primary hover:bg-secondary transition-colors"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                <span className="absolute top-0 right-0 block w-2 h-2 rounded-full bg-red-500"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-2 z-50">
                  <h3 className="text-sm font-medium px-3 py-2 border-b">Notifications</h3>
                  <div className="max-h-56 overflow-y-auto">
                    <div className="px-3 py-2 hover:bg-secondary rounded-md transition-colors">
                      <p className="text-sm font-medium">New feature released</p>
                      <p className="text-xs text-muted-foreground">Our AI Resume Builder is now available</p>
                      <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                    </div>
                    <div className="px-3 py-2 hover:bg-secondary rounded-md transition-colors">
                      <p className="text-sm font-medium">Assessment reminder</p>
                      <p className="text-xs text-muted-foreground">Continue your career assessment</p>
                      <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                    </div>
                  </div>
                  <button className="w-full text-center text-primary text-xs font-medium py-2 mt-1 hover:underline">
                    View all notifications
                  </button>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                className="p-2 rounded-full text-foreground/80 hover:text-primary hover:bg-secondary transition-colors"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <User size={20} />
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-50">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-secondary transition-colors"
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-secondary transition-colors"
                  >
                    Settings
                  </Link>
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-secondary transition-colors"
                    onClick={() => {
                      toast({
                        title: "Logged out",
                        description: "You have been logged out successfully.",
                        duration: 3000,
                      });
                      setShowUserMenu(false);
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
            
            <div className="hidden md:block">
              <Link to="/assessment">
                <Button>Try Assessment</Button>
              </Link>
            </div>
            
            <button
              className="md:hidden p-2 rounded-full text-foreground/80 hover:text-primary hover:bg-secondary transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item, index) => (
              <div key={index}>
                <Link
                  to={item.path}
                  className="block px-3 py-2 text-base font-medium rounded-md hover:bg-secondary transition-colors"
                >
                  {item.name}
                </Link>
                
                {item.children && (
                  <div className="pl-6 space-y-1 mt-1">
                    {item.children.map((child, childIndex) => (
                      <Link
                        key={childIndex}
                        to={child.path}
                        className="block px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-2">
              <Link to="/assessment">
                <Button className="w-full">Try Assessment</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Search overlay */}
      {showSearch && (
        <div className="absolute top-full left-0 w-full bg-white border-b shadow-md p-4 z-50 animate-fade-in">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search for careers, skills, or resources..."
              className="w-full px-4 py-2 rounded-md border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
            >
              <Search size={18} />
            </button>
          </form>
          <div className="mt-2 text-sm text-muted-foreground flex justify-between">
            <span>Try: "data science", "career change", "remote jobs"</span>
            <button 
              className="text-primary hover:underline"
              onClick={() => setShowSearch(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
