import { motion } from "framer-motion";

const FloatingShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Lime green circle */}
      <motion.div
        className="absolute w-32 h-32 bg-primary rounded-full opacity-20 blur-xl"
        style={{ top: "10%", left: "5%" }}
        animate={{
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Coral square */}
      <motion.div
        className="absolute w-24 h-24 bg-secondary opacity-30"
        style={{ top: "20%", right: "10%" }}
        animate={{
          rotate: [0, 90, 180, 270, 360],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Cyan triangle */}
      <motion.div
        className="absolute w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[70px] border-b-tertiary opacity-40"
        style={{ bottom: "30%", left: "15%" }}
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Mustard circle */}
      <motion.div
        className="absolute w-20 h-20 bg-accent rounded-full opacity-25 blur-lg"
        style={{ bottom: "20%", right: "20%" }}
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Hot pink ring */}
      <motion.div
        className="absolute w-40 h-40 border-4 border-highlight rounded-full opacity-20"
        style={{ top: "50%", right: "5%" }}
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Gradient blob */}
      <motion.div
        className="absolute w-64 h-64 bg-gradient-hero rounded-full opacity-10 blur-3xl"
        style={{ bottom: "10%", left: "30%" }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default FloatingShapes;
