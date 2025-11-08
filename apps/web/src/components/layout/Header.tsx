import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UserButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { User, LogIn } from 'lucide-react';

export function Header() {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-cyan-500/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="font-orbitron text-xl font-black neon-text">
              SCOUT<span className="neon-orange-text">LETE</span>
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/#features" className="font-rajdhani text-muted-foreground hover:text-cyan-400 transition-colors">
              Features
            </Link>
            <Link to="/#story" className="font-rajdhani text-muted-foreground hover:text-cyan-400 transition-colors">
              Stories
            </Link>
            <Link to="/events" className="font-rajdhani text-muted-foreground hover:text-cyan-400 transition-colors">
              Events
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <SignedOut>
              <Link to="/sign-in">
                <Button
                  variant="outline"
                  size="sm"
                  className="cyber-border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 font-rajdhani"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button
                  size="sm"
                  className="cyber-border cyber-glow bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani font-semibold"
                >
                  <User className="w-4 h-4 mr-2" />
                  Join Now
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard">
                <Button
                  size="sm"
                  className="cyber-border cyber-glow bg-orange-500 hover:bg-orange-400 text-black font-rajdhani font-semibold mr-3"
                >
                  Dashboard
                </Button>
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 cyber-border cyber-glow"
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </motion.header>
  );
}