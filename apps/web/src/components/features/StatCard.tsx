
import { motion } from 'framer-motion';

interface StatCardProps {
  value: string;
  label: string;
  delay?: number;
}

export function StatCard({ value, label, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      className="cyber-border p-4 cyber-glow bg-card/50"
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay }}
      viewport={{ once: true }}
    >
      <div className="font-orbitron text-2xl lg:text-3xl font-black neon-text mb-1">
        {value}
      </div>
      <div className="font-rajdhani text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </div>
    </motion.div>
  );
}