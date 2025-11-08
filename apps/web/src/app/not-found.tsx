
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft, Zap } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,217,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,217,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px] animate-pulse" />
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="font-orbitron text-3xl font-black neon-text mb-2">
            SCOUT<span className="neon-orange-text">LETE</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-orange-500 mx-auto cyber-glow" />
        </motion.div>

        {/* 404 Animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative">
            <h2 className="font-orbitron text-8xl lg:text-9xl font-black neon-text opacity-20 select-none">
              404
            </h2>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <div className="w-32 h-32 hex-clip bg-gradient-to-br from-cyan-400/20 to-orange-500/20 cyber-glow" />
            </motion.div>
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="cyber-card p-8 mb-8"
        >
          <h3 className="font-orbitron text-2xl lg:text-3xl font-bold neon-orange-text mb-4">
            PAGE NOT FOUND
          </h3>
          <p className="text-muted-foreground font-rajdhani text-lg">
            The page you're looking for doesn't exist.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/">
            <Button
              size="lg"
              className="cyber-border cyber-glow bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani font-semibold transition-all duration-300 group"
            >
              <Home className="mr-2 h-4 w-4 group-hover:animate-pulse" />
              Return to Home Base
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button
              variant="outline"
              size="lg"
              className="cyber-border border-orange-500 text-orange-400 hover:bg-orange-500/10 font-rajdhani font-semibold transition-all duration-300 group"
            >
              <Search className="mr-2 h-4 w-4 group-hover:animate-spin" />
              Go to Dashboard
            </Button>
          </Link>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8"
        >
          <div>
            <button
              onClick={() => window.history.back()}
              className="text-sm font-rajdhani text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go back
            </button>
          </div>
        </motion.div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-1/4 left-4 w-12 h-12 hex-clip bg-cyan-400/10 cyber-glow hidden lg:block"
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
          className="absolute bottom-1/4 right-4 w-8 h-8 hex-clip bg-orange-500/10 cyber-glow hidden lg:block"
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
      </div>
    </div>
  );
}