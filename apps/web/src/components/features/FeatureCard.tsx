
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export function FeatureCard({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      className="cyber-card p-6 text-center group hover:cyber-glow transition-all duration-300"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="w-12 h-12 mx-auto mb-4 cyber-border cyber-glow flex items-center justify-center hex-clip bg-cyan-400/20 group-hover:pulse-cyan">
        <Icon className="h-6 w-6 text-cyan-400" />
      </div>
      <h3 className="font-orbitron text-lg font-bold neon-text mb-2">{title}</h3>
      <p className="text-muted-foreground font-rajdhani text-sm">{description}</p>
    </motion.div>
  );
}