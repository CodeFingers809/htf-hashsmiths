
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, Play, MapPin, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Story Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="space-y-8"
          >
            {/* The Problem */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="space-y-4"
            >
              <div className="cyber-card p-6 border-orange-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  <span className="text-orange-400 font-rajdhani font-semibold text-sm uppercase tracking-wide">The Reality</span>
                </div>
                <p className="text-muted-foreground font-rajdhani text-base leading-relaxed">
                  <span className="text-orange-400 font-bold">A 16-year-old sprinter in rural Odisha</span> runs faster than most national champions.
                  But she'll never make it to trials. No coach, no connections, no money for travel to the city.
                  <span className="text-foreground font-semibold"> Her dreams die in silence.</span>
                </p>
              </div>
            </motion.div>

            {/* The Vision */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="space-y-4"
            >
              <div className="cyber-card p-6 border-cyan-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-5 w-5 text-cyan-400" />
                  <span className="text-cyan-400 font-rajdhani font-semibold text-sm uppercase tracking-wide">The Solution</span>
                </div>
                <p className="text-muted-foreground font-rajdhani text-base leading-relaxed">
                  <span className="text-cyan-400 font-bold">SCOUTLETE changes everything.</span>
                  That same athlete records her sprint on her phone. Our AI analyzes every stride, every movement.
                  Within minutes, <span className="text-foreground font-semibold">talent scouts from Sports Authority of India are watching her performance.</span>
                  Distance becomes irrelevant. Dreams become reality.
                </p>
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/events">
                <Button
                  size="lg"
                  className="cyber-border cyber-glow px-8 py-4 text-base font-rajdhani font-semibold bg-cyan-500 hover:bg-cyan-400 text-black group transition-all duration-300"
                >
                  <Play className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                  Start Your Journey
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="#story">
                <Button
                  variant="outline"
                  size="lg"
                  className="cyber-border px-8 py-4 text-base font-rajdhani font-semibold border-orange-500 text-orange-400 hover:bg-orange-500/10 transition-all duration-300"
                >
                  Watch Stories
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Branding */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-center lg:text-right space-y-8"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="space-y-4"
            >
              <h1 className="font-orbitron text-5xl sm:text-6xl lg:text-7xl font-black neon-text">
                SCOUT<span className="neon-orange-text">LETE</span>
              </h1>
              <div className="w-48 h-1 bg-gradient-to-r from-cyan-400 to-orange-500 mx-auto lg:ml-auto cyber-glow" />
            </motion.div>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="space-y-4"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-rajdhani font-bold text-cyan-300">
                Every Village. Every Talent.
                <br />
                <span className="neon-orange-text">Every Dream Discovered.</span>
              </h2>
              <p className="text-lg text-muted-foreground font-rajdhani max-w-lg mx-auto lg:ml-auto">
                India's first AI-powered virtual sports trials platform.
                Breaking barriers. Building champions. Creating history.
              </p>
            </motion.div>

            {/* Impact Numbers */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="grid grid-cols-3 gap-4 max-w-md mx-auto lg:ml-auto"
            >
              <div className="cyber-border p-3 cyber-glow bg-card/30 text-center">
                <div className="font-orbitron text-xl lg:text-2xl font-black neon-text">28</div>
                <div className="text-xs text-muted-foreground font-rajdhani uppercase">States</div>
              </div>
              <div className="cyber-border p-3 cyber-glow bg-card/30 text-center">
                <div className="font-orbitron text-xl lg:text-2xl font-black neon-text">1M+</div>
                <div className="text-xs text-muted-foreground font-rajdhani uppercase">Athletes</div>
              </div>
              <div className="cyber-border p-3 cyber-glow bg-card/30 text-center">
                <div className="font-orbitron text-xl lg:text-2xl font-black neon-text">24/7</div>
                <div className="text-xs text-muted-foreground font-rajdhani uppercase">Access</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-1/4 left-4 w-16 h-16 hex-clip bg-cyan-400/20 cyber-glow hidden xl:block"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-4 w-12 h-12 hex-clip bg-orange-500/20 cyber-glow hidden xl:block"
        animate={{
          y: [0, 20, 0],
          rotate: [360, 180, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-transparent cyber-glow" />
      </motion.div>
    </section>
  );
}