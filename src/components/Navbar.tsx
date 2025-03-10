
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Home, LineChart, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <LineChart className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight">TradeologyExplorer</span>
        </Link>
        
        <div className="flex items-center space-x-1">
          <NavItem to="/" icon={<Home className="h-5 w-5" />} label="Dashboard" />
          <NavItem to="/strategies" icon={<BarChart className="h-5 w-5" />} label="Strategies" />
          <NavItem to="/settings" icon={<Settings className="h-5 w-5" />} label="Settings" />
        </div>
      </div>
    </nav>
  );
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

function NavItem({ to, icon, label }: NavItemProps) {
  return (
    <Link 
      to={to} 
      className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
