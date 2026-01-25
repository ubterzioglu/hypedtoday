import { motion, type Variants } from "framer-motion";
import { BrutalButton } from "@/components/ui/brutal-button";
import { Rocket, Compass, Vote, Trophy, HelpCircle, Mail } from "lucide-react";
import HeroBackground, { type BackgroundType } from "./HeroBackground";
import heroBg from "@/assets/hero-bg.jpg";
import { Link } from "react-router-dom";

// =====================================================
// ARKA PLAN AYARLARI - Buradan kolayca değiştir!
// =====================================================
const BACKGROUND_CONFIG = {
  // "video" | "image" | "animation" seçeneklerinden birini seç
  type: "image" as BackgroundType,

  // Görsel kullanmak için:
  imageSrc: heroBg,

  // Video kullanmak için (type: "video" yap ve video URL'si ekle):
  // videoSrc: "/videos/hero-video.mp4",

  // Overlay karanlık seviyesi (0-1 arası, 1 = tamamen karanlık)
  overlayOpacity: 0.6,
};
// =====================================================

const HeroSection = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const buttonVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-start justify-center overflow-hidden px-4 pt-12 pb-16">
      {/* Dinamik Arka Plan */}
      <HeroBackground
        type={BACKGROUND_CONFIG.type}
        imageSrc={BACKGROUND_CONFIG.imageSrc}
        videoSrc={undefined}
        overlayOpacity={BACKGROUND_CONFIG.overlayOpacity}
      />

      <motion.div
        className="relative z-10 max-w-5xl mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* Main Heading - Vibecoding Community */}
        <motion.h1
          variants={itemVariants}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight mb-4"
        >
          <span className="text-foreground">Vibecoding Community</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl font-semibold text-muted-foreground tracking-wide mb-12"
        >
          innovate. connect. create. promote.
        </motion.p>

        {/* Buttons Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto"
          variants={containerVariants}
        >
          <motion.div variants={buttonVariants}>
            <Link to="/add-project">
              <BrutalButton
                variant="primary"
                size="lg"
                className="w-full flex-col h-auto py-4 gap-1"
              >
                <Rocket className="w-6 h-6" />
                <span className="text-xs md:text-sm">Add Project</span>
              </BrutalButton>
            </Link>
          </motion.div>

          <motion.div variants={buttonVariants}>
            <Link to="/showroom">
              <BrutalButton
                variant="secondary"
                size="lg"
                className="w-full flex-col h-auto py-4 gap-1"
              >
                <Compass className="w-6 h-6" />
                <span className="text-xs md:text-sm">Explore</span>
              </BrutalButton>
            </Link>
          </motion.div>

          <motion.div variants={buttonVariants}>
            <Link to="/showroom">
              <BrutalButton
                variant="tertiary"
                size="lg"
                className="w-full flex-col h-auto py-4 gap-1"
              >
                <Vote className="w-6 h-6" />
                <span className="text-xs md:text-sm">Vote</span>
              </BrutalButton>
            </Link>
          </motion.div>

          <motion.div variants={buttonVariants}>
            <BrutalButton
              variant="accent"
              size="lg"
              className="w-full flex-col h-auto py-4 gap-1"
            >
              <Trophy className="w-6 h-6" />
              <span className="text-xs md:text-sm">Rankings</span>
            </BrutalButton>
          </motion.div>

          <motion.div variants={buttonVariants} className="col-span-2 md:col-span-1">
            <BrutalButton
              variant="highlight"
              size="lg"
              className="w-full flex-col h-auto py-4 gap-1"
            >
              <HelpCircle className="w-6 h-6" />
              <span className="text-xs md:text-sm">How It Works?</span>
            </BrutalButton>
          </motion.div>

          <motion.div variants={buttonVariants} className="col-span-2 md:col-span-1">
            <Link to="/leaderboard">
              <BrutalButton
                variant="accent"
                size="lg"
                className="w-full flex-col h-auto py-4 gap-1"
              >
                <Trophy className="w-6 h-6" />
                <span className="text-xs md:text-sm">Leaderboard</span>
              </BrutalButton>
            </Link>
          </motion.div>

          <motion.div variants={buttonVariants} className="col-span-2 md:col-span-1">
            <a href="mailto:ubterzioglu@gmail.com">
              <BrutalButton
                variant="secondary"
                size="lg"
                className="w-full flex-col h-auto py-4 gap-1"
              >
                <Mail className="w-6 h-6" />
                <span className="text-xs md:text-sm">Contact</span>
              </BrutalButton>
            </a>
          </motion.div>
        </motion.div>

        {/* Join Us Button */}
        <motion.div
          variants={itemVariants}
          className="mt-8"
        >
          <a
            href="https://www.linkedin.com/groups/16927008/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <BrutalButton
              variant="primary"
              size="lg"
              className="px-12 py-4 text-lg font-bold"
            >
              Join us! 🚀
            </BrutalButton>
          </a>
        </motion.div>




      </motion.div>
    </section>
  );
};

export default HeroSection;
