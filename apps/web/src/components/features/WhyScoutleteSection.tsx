
import { motion } from 'framer-motion';
import { CheckCircle, X, MapPin, Clock, DollarSign, Users } from 'lucide-react';

export function WhyScoutleteSection() {
  const comparisons = [
    {
      traditional: "Travel 500km to nearest trial center",
      scoutlete: "Record from your village",
      icon: MapPin,
      color: "text-cyan-400"
    },
    {
      traditional: "Spend ₹15,000+ on travel & accommodation",
      scoutlete: "Free platform, unlimited attempts",
      icon: DollarSign,
      color: "text-green-400"
    },
    {
      traditional: "Wait months for trial announcements",
      scoutlete: "24/7 availability, instant analysis",
      icon: Clock,
      color: "text-orange-400"
    },
    {
      traditional: "Need connections and recommendations",
      scoutlete: "Pure talent-based selection",
      icon: Users,
      color: "text-purple-400"
    }
  ];

  const painPoints = [
    {
      title: "Geographic Barriers",
      problem: "97% of India's talent lives in villages, but 90% of trials happen in cities",
      solution: "SCOUTLETE brings trials to every smartphone",
      stat: "28 States Connected"
    },
    {
      title: "Economic Barriers",
      problem: "Average family spends 3 months' income for one trial opportunity",
      solution: "Free platform removes financial obstacles",
      stat: "₹0 Cost"
    },
    {
      title: "Information Barriers",
      problem: "Most athletes never know when trials are happening",
      solution: "AI-powered matching connects athletes to opportunities",
      stat: "Real-time Alerts"
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="font-orbitron text-3xl sm:text-4xl lg:text-5xl font-bold neon-text mb-6">
            WHY SCOUTLETE?
          </h2>
          <p className="text-xl text-muted-foreground font-rajdhani max-w-3xl mx-auto">
            The current system is broken. We're building the bridge between hidden talent and national glory.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-orange-500 mx-auto mt-6 cyber-glow" />
        </motion.div>

        {/* Pain Points */}
        <div className="mb-20">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="font-orbitron text-2xl sm:text-3xl font-bold neon-orange-text mb-4">
              THE BROKEN SYSTEM
            </h3>
            <p className="text-lg text-muted-foreground font-rajdhani">
              Three critical barriers are keeping India's champions in the shadows
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {painPoints.map((point, index) => (
              <motion.div
                key={index}
                className="cyber-card p-6 border-red-500/30 bg-red-500/5"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-center space-y-4">
                  <h4 className="font-orbitron text-xl font-bold text-red-400">
                    {point.title}
                  </h4>
                  <p className="text-muted-foreground font-rajdhani text-sm leading-relaxed">
                    {point.problem}
                  </p>
                  <div className="border-t border-cyan-400/30 pt-4">
                    <p className="text-cyan-400 font-rajdhani font-semibold text-sm">
                      {point.solution}
                    </p>
                    <div className="font-orbitron text-lg font-bold neon-text mt-2">
                      {point.stat}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Traditional vs SCOUTLETE */}
        <motion.div
          className="bg-card/20 rounded-2xl p-8 lg:p-12"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h3 className="font-orbitron text-2xl sm:text-3xl font-bold neon-text mb-4">
              TRADITIONAL TRIALS VS SCOUTLETE
            </h3>
            <p className="text-lg text-muted-foreground font-rajdhani">
              See how we're revolutionizing sports talent discovery
            </p>
          </div>

          <div className="space-y-8">
            {comparisons.map((item, index) => (
              <motion.div
                key={index}
                className="grid lg:grid-cols-2 gap-8 items-center"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Traditional Way */}
                <div className="cyber-card p-6 border-red-500/30 bg-red-500/5">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <X className="h-4 w-4 text-red-400" />
                    </div>
                    <div>
                      <h4 className="font-rajdhani font-semibold text-red-400 mb-2">
                        Traditional System
                      </h4>
                      <p className="text-muted-foreground font-rajdhani">
                        {item.traditional}
                      </p>
                    </div>
                  </div>
                </div>

                {/* SCOUTLETE Way */}
                <div className="cyber-card p-6 border-cyan-500/30 bg-cyan-500/5">
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 bg-cyan-400/20 border border-cyan-400/30 rounded-full flex items-center justify-center flex-shrink-0`}>
                      <CheckCircle className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="font-rajdhani font-semibold text-cyan-400 mb-2">
                        SCOUTLETE Solution
                      </h4>
                      <p className="text-muted-foreground font-rajdhani">
                        {item.scoutlete}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            className="text-center mt-12 pt-8 border-t border-border"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h4 className="font-orbitron text-xl font-bold neon-text mb-4">
              READY TO BREAK THE BARRIERS?
            </h4>
            <p className="text-lg text-cyan-400 font-rajdhani font-semibold">
              Your talent deserves to be discovered. The future of Indian sports starts with your first recording.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}