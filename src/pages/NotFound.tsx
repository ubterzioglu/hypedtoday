import { Link } from "react-router-dom";
import { BrutalButton } from "@/components/ui/brutal-button";
import { ArrowLeft, Ghost } from "lucide-react";
import HeroBackground from "@/components/HeroBackground";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground relative overflow-hidden font-sans">
      {/* Background with glitch/noise effect */}
      <HeroBackground type="image" imageSrc="/assets/hero-bg.jpg" overlayOpacity={0.9} />

      <div className="relative z-10 text-center p-8 max-w-2xl mx-auto">
        {/* Giant 404 */}
        <div className="relative inline-block mb-8">
          <h1 className="text-[10rem] md:text-[15rem] font-black font-display leading-none tracking-tighter text-primary drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] select-none animate-pulse">
            404
          </h1>
          <Ghost className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 text-foreground opacity-20 pointer-events-none" />
        </div>

        {/* Message */}
        <h2 className="text-4xl md:text-6xl font-black uppercase mb-6 bg-card border-4 border-foreground p-4 inline-block transform -rotate-2">
          Lost the Vibe?
        </h2>

        <p className="text-xl md:text-2xl font-bold bg-black text-white p-4 mb-8 border-4 border-white inline-block">
          The page you're looking for has vanished into the void.
        </p>

        {/* Action */}
        <div>
          <Link to="/">
            <BrutalButton variant="secondary" size="xl" className="text-xl py-6 px-12 uppercase tracking-wide">
              <ArrowLeft className="w-8 h-8 mr-4" />
              Back to Safety
            </BrutalButton>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
