import { Link } from "react-router-dom";
import { BrutalButton } from "@/components/ui/brutal-button";
import { ArrowLeft, Ghost } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center relative overflow-hidden">
        <div className="relative z-10 text-center p-8 max-w-2xl mx-auto">
          {/* Giant 404 */}
          <div className="relative inline-block mb-8">
            <h1 className="text-[10rem] md:text-[15rem] font-black font-display leading-none tracking-tighter text-primary drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] select-none animate-pulse">
              404
            </h1>
            <Ghost className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 text-foreground opacity-20 pointer-events-none" />
          </div>

          {/* Message */}
          <h2 className="text-4xl md:text-5xl font-black uppercase mb-6 bg-card border-4 border-foreground p-4 inline-block transform -rotate-2">
            Page Not Found
          </h2>

          <p className="text-xl font-bold text-muted-foreground mb-8">
            The page you're looking for doesn't exist.
          </p>

          {/* Action */}
          <Link to="/">
            <BrutalButton variant="primary" size="lg" className="text-xl py-4 px-8">
              <ArrowLeft className="w-6 h-6 mr-2" />
              Back to Home
            </BrutalButton>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
