import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrutalButton } from "@/components/ui/brutal-button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Rocket, Sparkles, Zap, Mail, Clock, Eye } from "lucide-react";

// Launch date - 30 days from now
const LAUNCH_DATE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Glitch Text Component
const GlitchText = ({ text, className = "" }: { text: string; className?: string }) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -z-10 w-full h-full text-[#00ffff] opacity-70 animate-pulse translate-x-[2px]">
        {text}
      </span>
      <span className="absolute top-0 left-0 -z-10 w-full h-full text-[#ff00ff] opacity-70 animate-pulse -translate-x-[2px]">
        {text}
      </span>
    </div>
  );
};

// Floating Particle
const Particle = ({ delay }: { delay: number }) => {
  const randomX = Math.random() * 100;
  const randomSize = Math.random() * 4 + 2;
  const randomDuration = Math.random() * 10 + 10;
  
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${randomX}%`,
        width: randomSize,
        height: randomSize,
        background: Math.random() > 0.5 
          ? "linear-gradient(135deg, #a3e635, #22d3ee)" 
          : "linear-gradient(135deg, #f472b6, #a855f7)",
        boxShadow: `0 0 ${randomSize * 2}px currentColor`,
      }}
      initial={{ y: "100vh", opacity: 0 }}
      animate={{ 
        y: "-10vh", 
        opacity: [0, 1, 1, 0],
        x: [0, Math.random() * 50 - 25, Math.random() * -50 + 25, 0]
      }}
      transition={{
        duration: randomDuration,
        delay,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );
};

// Animated Grid Background
const GridBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(163, 230, 53, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(163, 230, 53, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(163, 230, 53, 0.08) 0%, transparent 50%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

// Countdown Unit
const CountdownUnit = ({ value, label }: { value: number; label: string }) => (
  <motion.div 
    className="flex flex-col items-center"
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#a3e635] to-[#22d3ee] blur-xl opacity-30 rounded-lg" />
      <div className="relative bg-black/40 backdrop-blur-sm border-2 border-[#a3e635]/30 rounded-lg px-4 py-3 min-w-[70px] sm:min-w-[90px]">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="block text-3xl sm:text-4xl md:text-5xl font-black text-white text-center tabular-nums"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            {value.toString().padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
    <span className="mt-2 text-xs sm:text-sm uppercase tracking-[0.2em] text-gray-400 font-medium">
      {label}
    </span>
  </motion.div>
);

const ComingSoon = () => {
  const [email, setEmail] = useState("");
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for spotlight effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Countdown timer
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = LAUNCH_DATE.getTime() - Date.now();
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("You're on the list! We'll notify you when we launch 🚀");
    setEmail("");
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden relative"
    >
      {/* Spotlight effect following cursor */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(163, 230, 53, 0.06), transparent 40%)`,
        }}
      />

      {/* Grid Background */}
      <GridBackground />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <Particle key={i} delay={i * 0.5} />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        
        {/* Logo / Brand */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[#a3e635] blur-lg opacity-50" />
              <Rocket className="w-10 h-10 text-[#a3e635] relative" />
            </div>
            <span className="text-2xl font-black tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              HYPED
            </span>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#a3e635]" />
            <span className="text-sm uppercase tracking-[0.3em] text-[#a3e635] font-bold">
              Something Big is Coming
            </span>
            <Sparkles className="w-5 h-5 text-[#a3e635]" />
          </div>
          
          <h1 
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            <GlitchText 
              text="COMING" 
              className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-400"
            />
            <GlitchText 
              text="SOON" 
              className="block text-transparent bg-clip-text bg-gradient-to-r from-[#a3e635] via-[#22d3ee] to-[#a3e635]"
            />
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-gray-400 text-center max-w-xl mb-10 text-base sm:text-lg"
        >
          We're building the ultimate platform for creators to showcase their projects, 
          compete for glory, and connect with the community. Get ready to be{' '}
          <span className="text-[#a3e635] font-bold">HYPED</span>.
        </motion.p>

        {/* Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 justify-center mb-4">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Launching In</span>
          </div>
          <div className="flex gap-3 sm:gap-4">
            <CountdownUnit value={timeLeft.days} label="Days" />
            <span className="text-3xl sm:text-4xl font-black text-gray-600 self-start mt-3">:</span>
            <CountdownUnit value={timeLeft.hours} label="Hours" />
            <span className="text-3xl sm:text-4xl font-black text-gray-600 self-start mt-3">:</span>
            <CountdownUnit value={timeLeft.minutes} label="Minutes" />
            <span className="text-3xl sm:text-4xl font-black text-gray-600 self-start mt-3">:</span>
            <CountdownUnit value={timeLeft.seconds} label="Seconds" />
          </div>
        </motion.div>

        {/* Email Subscribe Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          onSubmit={handleSubscribe}
          className="w-full max-w-md mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-14 bg-white/5 border-2 border-white/10 focus:border-[#a3e635] text-white placeholder:text-gray-500 rounded-none"
              />
            </div>
            <BrutalButton 
              type="submit"
              variant="primary" 
              className="h-14 px-8 whitespace-nowrap"
            >
              <Zap className="w-4 h-4 mr-2" />
              Notify Me
            </BrutalButton>
          </div>
          <p className="text-center text-xs text-gray-600 mt-3">
            Be the first to know when we launch. No spam, ever.
          </p>
        </motion.form>

        {/* Feature Preview Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {[
            { icon: "🚀", label: "Project Showcase" },
            { icon: "🏆", label: "Leaderboards" },
            { icon: "💬", label: "Community" },
            { icon: "⭐", label: "Voting" },
          ].map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 + i * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-400"
            >
              <span className="mr-2">{feature.icon}</span>
              {feature.label}
            </motion.div>
          ))}
        </motion.div>

        {/* Social Links / Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-6 mb-4">
            {['Twitter', 'Discord', 'Instagram'].map((social) => (
              <motion.a
                key={social}
                href="#"
                whileHover={{ scale: 1.1, color: '#a3e635' }}
                className="text-sm text-gray-500 hover:text-[#a3e635] transition-colors uppercase tracking-wider"
              >
                {social}
              </motion.a>
            ))}
          </div>
          <p className="text-xs text-gray-600">
            © 2026 HYPED. All rights reserved.
          </p>
        </motion.div>

        {/* Secret Dev Access Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-4 right-4 opacity-0 hover:opacity-30 transition-opacity"
        >
          <a 
            href="/?preview=true" 
            className="text-[10px] text-gray-600 flex items-center gap-1"
          >
            <Eye className="w-3 h-3" />
            Dev Access
          </a>
        </motion.div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[#a3e635]/20" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-[#a3e635]/20" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-[#a3e635]/20" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[#a3e635]/20" />
    </div>
  );
};

export default ComingSoon;
