import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BrutalButton } from "@/components/ui/brutal-button";
import { HelpCircle, Rocket, Search, Vote, Trophy, ArrowRight, Share2, HeartHandshake } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const STEPS = [
    {
        icon: Rocket,
        title: "1. Submit Project",
        description: "Have a cool project? Share it with the community! Just add your GitHub repo or project URL.",
        color: "bg-primary",
        textColor: "text-primary-foreground"
    },
    {
        icon: Search,
        title: "2. Verification",
        description: "Our team briefly reviews your submission to ensure it's legit and safe for the community.",
        color: "bg-secondary",
        textColor: "text-secondary-foreground"
    },
    {
        icon: Share2,
        title: "3. Share",
        description: "Spread the word! Share your project link with friends and followers to gather maximum vibes.",
        color: "bg-tertiary",
        textColor: "text-tertiary-foreground"
    },
    {
        icon: Vote,
        title: "4. Get Votes",
        description: "Community members vote on your project based on UI, UX, Innovation, and more.",
        color: "bg-accent",
        textColor: "text-accent-foreground"
    },
    {
        icon: HeartHandshake,
        title: "5. You Vote Too!",
        description: "Don't just watch! Support fellow developers by voting on their projects. Vibe is mutual.",
        color: "bg-muted",
        textColor: "text-foreground"
    },
    {
        icon: Trophy,
        title: "6. Climb Ranks",
        description: "Earn points, rise up the leaderboard, and get recognized as a top vibe creator!",
        color: "bg-highlight",
        textColor: "text-black"
    }
];

const HowItWorks = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            {/* Page Header */}
            <div className="bg-gradient-to-r from-highlight/30 via-primary/20 to-secondary/30 border-b-4 border-foreground">
                <div className="container mx-auto px-4 py-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-highlight border-4 border-foreground flex items-center justify-center">
                            <HelpCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black uppercase">
                                How It Works
                            </h1>
                            <p className="text-muted-foreground font-medium text-lg">
                                From code to fame in 6 simple steps
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {STEPS.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`
                                relative p-8 border-4 border-foreground shadow-brutal hover:shadow-brutal-lg transition-all
                                ${step.color} ${step.textColor}
                            `}
                        >
                            <div className="absolute -top-6 -left-6 w-12 h-12 bg-background border-4 border-foreground flex items-center justify-center font-black text-xl text-foreground z-10">
                                {index + 1}
                            </div>

                            <step.icon className="w-12 h-12 mb-4 drop-shadow-md" />

                            <h3 className="text-2xl font-black uppercase mb-2">{step.title}</h3>
                            <p className="font-bold text-lg opacity-90 leading-snug">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-center"
                >
                    <div className="bg-card border-4 border-foreground p-8 md:p-12 shadow-brutal">
                        <h2 className="text-3xl md:text-5xl font-black uppercase mb-6">
                            Ready to Showcase?
                        </h2>
                        <Link to="/add-project">
                            <BrutalButton variant="primary" size="lg" className="px-12 py-6 text-xl">
                                Start Now <ArrowRight className="ml-2 w-6 h-6" />
                            </BrutalButton>
                        </Link>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
};

export default HowItWorks;
