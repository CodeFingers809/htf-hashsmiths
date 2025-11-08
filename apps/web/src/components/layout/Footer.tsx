
import { motion } from 'framer-motion';
import { Heart, Github, Linkedin, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative py-16 px-4 sm:px-6 lg:px-8 bg-card/20 border-t border-border">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <div>
              <h3 className="font-orbitron text-2xl font-bold neon-text mb-4">
                SCOUT<span className="neon-orange-text">LETE</span>
              </h3>
              <p className="text-muted-foreground font-rajdhani leading-relaxed">
                Democratizing sports talent discovery across India through AI-powered virtual trials.
              </p>
            </div>
            <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-orange-500 cyber-glow" />
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-rajdhani font-semibold text-foreground mb-6 uppercase tracking-wide">
              Platform
            </h4>
            <div className="space-y-3">
              {['Virtual Trials', 'AI Analysis', 'Talent Discovery', 'Success Stories'].map((item) => (
                <div key={item}>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-cyan-400 transition-colors duration-300 font-rajdhani"
                  >
                    {item}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* For Athletes */}
          <div>
            <h4 className="font-rajdhani font-semibold text-foreground mb-6 uppercase tracking-wide">
              For Athletes
            </h4>
            <div className="space-y-3">
              {['Getting Started', 'How It Works', 'Training Tips', 'Support'].map((item) => (
                <div key={item}>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-cyan-400 transition-colors duration-300 font-rajdhani"
                  >
                    {item}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-rajdhani font-semibold text-foreground mb-6 uppercase tracking-wide">
              Connect
            </h4>
            <div className="space-y-4">
              <p className="text-muted-foreground font-rajdhani">
                Join the revolution in sports talent discovery
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: Github, href: '#', label: 'GitHub' },
                  { icon: Linkedin, href: '#', label: 'LinkedIn' },
                  { icon: Twitter, href: '#', label: 'Twitter' }
                ].map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 cyber-border cyber-glow bg-card/50 flex items-center justify-center hover:bg-cyan-400/20 transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                  >
                    <social.icon className="h-4 w-4 text-cyan-400" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Team Attribution */}
        <motion.div
          className="border-t border-border pt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
              <p className="text-muted-foreground font-rajdhani">
                © 2024 SCOUTLETE. Building the future of sports in India.
              </p>
            </div>

            {/* Team Atlas Attribution */}
            <motion.div
              className="flex items-center gap-2 px-6 py-3 cyber-card border-pink-500/30 bg-pink-500/5"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-muted-foreground font-rajdhani">Made with</span>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Heart className="h-4 w-4 text-pink-500 fill-current" />
              </motion.div>
              <span className="text-muted-foreground font-rajdhani">by</span>
              <span className="font-orbitron font-bold text-cyan-400">
                Team Atlas
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Data Stream */}
        <div className="absolute bottom-0 left-0 right-0 h-1 data-stream opacity-50" />
      </div>
    </footer>
  );
}