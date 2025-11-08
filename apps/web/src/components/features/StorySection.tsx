
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ArrowRight, MapPin, Phone, Eye, Trophy } from 'lucide-react';

export function StorySection() {
  const journeySteps = [
    {
      icon: Phone,
      title: "Record at Home",
      description: "A young athlete in any village records their performance using just a smartphone",
      color: "text-cyan-400",
      bgColor: "bg-cyan-400/10",
      borderColor: "border-cyan-400/30"
    },
    {
      icon: Eye,
      title: "AI Analyzes",
      description: "Our advanced AI evaluates technique, speed, and potential in real-time",
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      borderColor: "border-purple-400/30"
    },
    {
      icon: Trophy,
      title: "Talent Discovered",
      description: "Sports Authority of India scouts identify and contact promising athletes",
      color: "text-orange-400",
      bgColor: "bg-orange-400/10",
      borderColor: "border-orange-400/30"
    }
  ];

  return (
    <section id="story" className="py-24 px-4 sm:px-6 lg:px-8 bg-card/10">
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
            FROM VILLAGES TO VICTORY
          </h2>
          <p className="text-xl text-muted-foreground font-rajdhani max-w-3xl mx-auto">
            Every champion started as an unknown dreamer. SCOUTLETE ensures no talent is left behind.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-orange-500 mx-auto mt-6 cyber-glow" />
        </motion.div>

        {/* Journey Visualization */}
        <div className="mb-20">
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400/30 via-purple-400/30 to-orange-400/30 transform -translate-y-1/2 z-0" />

            {journeySteps.map((step, index) => (
              <motion.div
                key={index}
                className="relative z-10"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className={`cyber-card p-8 text-center ${step.borderColor} hover:${step.bgColor} transition-all duration-300 group`}>
                  <div className={`w-16 h-16 mx-auto mb-6 ${step.bgColor} ${step.borderColor} border-2 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className={`h-8 w-8 ${step.color}`} />
                  </div>
                  <h3 className={`font-orbitron text-xl font-bold mb-4 ${step.color}`}>
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground font-rajdhani leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Success Stories */}
        <motion.div
          className="grid lg:grid-cols-2 gap-12 items-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Story Content */}
          <div className="space-y-8">
            <div>
              <h3 className="font-orbitron text-2xl sm:text-3xl font-bold neon-text mb-4">
                REAL STORIES, REAL DREAMS
              </h3>
              <p className="text-lg text-muted-foreground font-rajdhani leading-relaxed">
                Meet the athletes who transformed their lives through SCOUTLETE. From remote villages to national teams,
                their journey proves that talent knows no boundaries.
              </p>
            </div>

            {/* Testimonial Cards */}
            <div className="space-y-6">
              <motion.div
                className="cyber-card p-6 border-cyan-400/30"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start gap-4">
                  <MapPin className="h-5 w-5 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-foreground font-rajdhani font-medium mb-2">
                      "I never thought anyone would see my talent in our small village. SCOUTLETE changed my life in 24 hours."
                    </p>
                    <div className="text-sm text-cyan-400 font-semibold">
                      Priya M., Sprinter • Jharkhand → National Team
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="cyber-card p-6 border-orange-400/30"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start gap-4">
                  <Trophy className="h-5 w-5 text-orange-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-foreground font-rajdhani font-medium mb-2">
                      "The AI saw potential in me that even I didn't know existed. Now I'm training for the Olympics."
                    </p>
                    <div className="text-sm text-orange-400 font-semibold">
                      Arjun S., Javelin Thrower • Odisha → Olympic Training Camp
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Impact Statistics */}
          <div className="space-y-6">
            <div className="cyber-card p-8 text-center">
              <h4 className="font-orbitron text-2xl font-bold neon-orange-text mb-8">
                CHANGING LIVES DAILY
              </h4>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="font-orbitron text-4xl font-black neon-text mb-2">2,847</div>
                  <div className="text-sm text-muted-foreground font-rajdhani uppercase">Athletes Discovered</div>
                </div>
                <div className="text-center">
                  <div className="font-orbitron text-4xl font-black neon-text mb-2">156</div>
                  <div className="text-sm text-muted-foreground font-rajdhani uppercase">Now in Training</div>
                </div>
                <div className="text-center">
                  <div className="font-orbitron text-4xl font-black neon-text mb-2">23</div>
                  <div className="text-sm text-muted-foreground font-rajdhani uppercase">National Teams</div>
                </div>
                <div className="text-center">
                  <div className="font-orbitron text-4xl font-black neon-text mb-2">4</div>
                  <div className="text-sm text-muted-foreground font-rajdhani uppercase">Olympic Prospects</div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-cyan-400 font-rajdhani font-semibold text-lg">
                  The next champion could be recording right now.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}