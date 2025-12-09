import { useState, useEffect } from 'react';
import { Search, Menu, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import ProfileButton from '@/components/ui/ProfileButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Header = ({ onSearch, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const userSession = Cookies.get('userSession');
    if (userSession) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'TV', href: '/tv' },
    { label: 'Movies', href: '/movies' },
    { label: 'My List', href: '/my-list' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <button
              onClick={() => onNavigate?.('/')}
              className="text-2xl font-bold text-white hover:text-glimz-primary transition-colors"
            >
              <span className="bg-gradient-to-r from-glimz-primary to-glimz-secondary bg-clip-text text-transparent">
                glimz
              </span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => onNavigate?.(item.href)}
                  className="btn-glimz-ghost text-sm font-medium"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                <Input
                  type="text"
                  placeholder="Search movies, shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input pl-10 w-64 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>
            </form>

            {/* My List Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate?.('/my-list')}
              className="hidden sm:flex btn-glimz-ghost"
            >
              <Heart className="h-4 w-4" />
            </Button>

            {/* Auth Button */}
            {isLoggedIn ? (
              <ProfileButton />
            ) : (
              <Link to="/signup">
                <Button className="btn-glimz-primary">Sign Up</Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden btn-glimz-ghost"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => {
                    onNavigate?.(item.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left btn-glimz-ghost text-sm font-medium"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                <Input
                  type="text"
                  placeholder="Search movies, shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input pl-10 w-full bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};
