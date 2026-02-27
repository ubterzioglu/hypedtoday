import { motion } from "framer-motion";
import FloatingShapes from "./FloatingShapes";

// Arka plan türlerini buradan değiştir
// "video" | "image" | "animation"
export type BackgroundType = "video" | "image" | "animation";

interface HeroBackgroundProps {
  type?: BackgroundType;
  imageSrc?: string;
  videoSrc?: string;
  overlayOpacity?: number;
}

const HeroBackground = ({
  type = "image",
  imageSrc,
  videoSrc,
  overlayOpacity = 0.7,
}: HeroBackgroundProps) => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Video Background */}
      {type === "video" && videoSrc && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Image Background */}
      {type === "image" && imageSrc && (
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          <img
            src={imageSrc}
            alt="Hero background"
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}

      {/* Animated Shapes Background */}
      {type === "animation" && <FloatingShapes />}

      {/* Dark overlay for readability */}
      <div
        className="absolute inset-0 bg-background"
        style={{ opacity: overlayOpacity }}
      />

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      {/* Subtle noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default HeroBackground;
