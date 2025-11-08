import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Target, Users, Trophy, Zap } from 'lucide-react';
import { HeroSection } from '@/components/features/HeroSection';
import { FeatureCard } from '@/components/features/FeatureCard';
import { StatCard } from '@/components/features/StatCard';
import { StorySection } from '@/components/features/StorySection';
import { WhyScoutleteSection } from '@/components/features/WhyScoutleteSection';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Link } from 'react-router-dom';

export default function Home() {
  const features = [
    {
      icon: Target,
      title: "AI-Powered Analysis",
      description: "Computer vision technology analyzes technique, speed, and biomechanics in real-time",
      delay: 0.1
    },
    {
      icon: Users,
      title: "Virtual Trials",
      description: "Compete from anywhere with standardized fitness assessments and skill evaluations",
      delay: 0.2
    },
    {
      icon: Trophy,
      title: "Direct SAI Pipeline",
      description: "Direct pathway to Sports Authority of India scouts and national training programs",
      delay: 0.3
    },
    {
      icon: Zap,
      title: "Instant Feedback",
      description: "Get detailed performance analytics and improvement suggestions immediately",
      delay: 0.4
    }
  ];

  const stats = [
    { value: "2,847", label: "Athletes Discovered", delay: 0.1 },
    { value: "156", label: "Now Training", delay: 0.2 },
    { value: "23", label: "National Teams", delay: 0.3 },
    { value: "4", label: "Olympic Prospects", delay: 0.4 }
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      {/* Header */}
      <Header />

      {/* Animated Grid Background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,217,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,217,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px] animate-pulse" />
      </div>

      {/* Hero Section */}
      <div className="pt-16">
        <HeroSection />
      </div>

      {/* Why SCOUTLETE Section */}
      <WhyScoutleteSection />

      {/* Story Section */}
      <StorySection />

      {/* Features Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="font-orbitron text-3xl sm:text-4xl lg:text-5xl font-bold neon-text mb-6">
              POWERED BY CUTTING-EDGE TECHNOLOGY
            </h2>
            <p className="text-xl text-muted-foreground font-rajdhani max-w-3xl mx-auto">
              Advanced AI and computer vision bring professional-grade sports analysis to your smartphone
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-orange-500 mx-auto mt-6 cyber-glow" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-lg text-muted-foreground font-rajdhani mb-8">
              From pose detection to performance prediction, every feature is designed to unlock potential
            </p>
            <Link to="/dashboard">
              <Button
                size="lg"
                className="cyber-border cyber-glow px-8 py-4 text-base font-rajdhani font-semibold bg-cyan-500 hover:bg-cyan-400 text-black group transition-all duration-300"
              >
                <Target className="mr-2 h-4 w-4 group-hover:animate-spin" />
                Explore Technology
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-card/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="font-orbitron text-3xl sm:text-4xl font-bold neon-text mb-4">
              TRANSFORMING LIVES ACROSS INDIA
            </h2>
            <p className="text-lg text-muted-foreground font-rajdhani">
              Real numbers, real impact, real champions being discovered every day
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center mb-12">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="cyber-card p-8 max-w-2xl mx-auto">
              <h3 className="font-orbitron text-2xl font-bold neon-orange-text mb-4">
                BE PART OF THE REVOLUTION
              </h3>
              <p className="text-lg text-muted-foreground font-rajdhani mb-6">
                Every athlete discovered through SCOUTLETE proves that talent exists everywhere.
                Your story could be next.
              </p>
              <Link to="/events">
                <Button
                  size="lg"
                  className="cyber-border cyber-glow px-8 py-4 text-base font-rajdhani font-semibold bg-orange-500 hover:bg-orange-400 text-black transition-all duration-300"
                >
                  Join the Movement
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Data Stream Effect */}
      <div className="fixed bottom-0 left-0 right-0 h-1 data-stream pointer-events-none" />
    </div>
  );
}