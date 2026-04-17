import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BrutalButton } from "@/components/ui/brutal-button";
import { HelpCircle, Rocket, Search, Vote, Trophy, ArrowRight, Share2, HeartHandshake } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";

const HowItWorks = () => {
    const { t } = useTranslation();

    const STEPS = [
        { icon: Rocket, title: t("howItWorks.step1Title"), description: t("howItWorks.step1Desc"), color: "bg-primary", textColor: "text-primary-foreground" },
        { icon: Search, title: t("howItWorks.step2Title"), description: t("howItWorks.step2Desc"), color: "bg-secondary", textColor: "text-secondary-foreground" },
        { icon: Share2, title: t("howItWorks.step3Title"), description: t("howItWorks.step3Desc"), color: "bg-tertiary", textColor: "text-tertiary-foreground" },
        { icon: Vote, title: t("howItWorks.step4Title"), description: t("howItWorks.step4Desc"), color: "bg-accent", textColor: "text-accent-foreground" },
        { icon: HeartHandshake, title: t("howItWorks.step5Title"), description: t("howItWorks.step5Desc"), color: "bg-muted", textColor: "text-foreground" },
        { icon: Trophy, title: t("howItWorks.step6Title"), description: t("howItWorks.step6Desc"), color: "bg-highlight", textColor: "text-black" },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <div className="bg-gradient-to-r from-highlight/30 via-primary/20 to-secondary/30 border-b-4 border-foreground">
                <div className="container mx-auto px-4 py-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-highlight border-4 border-foreground flex items-center justify-center">
                            <HelpCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black uppercase">
                                {t("howItWorks.title")}
                            </h1>
                            <p className="text-muted-foreground font-medium text-lg">
                                {t("howItWorks.subtitle")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {STEPS.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative p-8 border-4 border-foreground shadow-brutal hover:shadow-brutal-lg transition-all ${step.color} ${step.textColor}`}
                        >
                            <div className="absolute -top-6 -left-6 w-12 h-12 bg-background border-4 border-foreground flex items-center justify-center font-black text-xl text-foreground z-10">
                                {index + 1}
                            </div>
                            <step.icon className="w-12 h-12 mb-4 drop-shadow-md" />
                            <h3 className="text-2xl font-black uppercase mb-2">{step.title}</h3>
                            <p className="font-bold text-lg opacity-90 leading-snug">{step.description}</p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-center"
                >
                    <div className="bg-card border-4 border-foreground p-8 md:p-12 shadow-brutal">
                        <h2 className="text-3xl md:text-5xl font-black uppercase mb-6">
                            {t("howItWorks.readyTitle")}
                        </h2>
                        <Link to="/add-project">
                            <BrutalButton variant="primary" size="lg" className="px-12 py-6 text-xl">
                                {t("howItWorks.startNow")} <ArrowRight className="ml-2 w-6 h-6" />
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
