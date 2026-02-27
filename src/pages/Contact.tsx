import { useState } from "react";
import { BrutalButton } from "@/components/ui/brutal-button";
import { submitFeedback } from "@/data/mockData";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, MessageCircle, Twitter, Send, ArrowLeft } from "lucide-react";

import HeroBackground from "@/components/HeroBackground";
import { Link } from "react-router-dom";

const SOCIAL_LINKS = [
    { icon: Twitter, href: "https://twitter.com/supporttopromote", color: "bg-sky-500", label: "X / Twitter" },
    { icon: MessageCircle, href: "https://reddit.com/r/supporttopromote", color: "bg-orange-600", label: "Reddit" },
    { icon: Facebook, href: "https://facebook.com/supporttopromote", color: "bg-blue-600", label: "Facebook" },
    { icon: Phone, href: "https://wa.me/905551234567", color: "bg-green-500", label: "WhatsApp" },
    { icon: Linkedin, href: "https://linkedin.com/company/supporttopromote", color: "bg-blue-700", label: "LinkedIn" },
    { icon: Instagram, href: "https://instagram.com/supporttopromote", color: "bg-pink-600", label: "Instagram" },
    { icon: MapPin, href: "https://maps.google.com/?q=Istanbul", color: "bg-red-500", label: "Location" },
    { icon: Phone, href: "tel:+905551234567", color: "bg-yellow-500", label: "Call Us" },
    { icon: Mail, href: "mailto:contact@supporttopromote.online", color: "bg-purple-600", label: "Email" },
];

import heroBg from "@/assets/hero-bg.jpg";

const Contact = () => {
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            toast.error("Please enter a message!");
            return;
        }

        try {
            setIsSubmitting(true);
            await submitFeedback(message);
            toast.success("Feedback sent! Thank you.");
            setMessage("");
        } catch (error) {
            toast.error("Error sending feedback.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-black">
            <HeroBackground type="image" imageSrc={heroBg} overlayOpacity={0.9} />

            <div className="relative z-10 container mx-auto px-4 py-16 max-w-4xl">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 relative">
                    <Link to="/" className="absolute left-0 top-0 md:static">
                        <BrutalButton variant="secondary" size="default">
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Home
                        </BrutalButton>
                    </Link>
                    <h1 className="text-5xl md:text-7xl font-display font-black uppercase text-primary drop-shadow-lg text-center flex-1">
                        Contact Us
                    </h1>
                </div>

                {/* Social Grid - Resized */}
                <div className="grid grid-cols-3 md:grid-cols-9 gap-2 md:gap-4 mb-8 justify-center max-w-4xl mx-auto">
                    {SOCIAL_LINKS.map((link, i) => (
                        <a
                            key={i}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`
                                aspect-square w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full border-2 border-foreground 
                                hover:scale-105 transition-transform shadow-brutal hover:shadow-brutal-sm mx-auto
                                ${link.color} text-white
                            `}
                            title={link.label}
                        >
                            <link.icon className="w-5 h-5 md:w-6 md:h-6" />
                        </a>
                    ))}
                </div>

                {/* Feedback Form */}
                <div className="bg-card border-4 border-foreground p-8 relative">
                    <div className="absolute -top-4 -left-4 bg-secondary text-secondary-foreground px-4 py-2 border-2 border-foreground font-bold uppercase transform -rotate-2">
                        Send Feedback
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={6}
                            placeholder="Tell us what you think..."
                            className="w-full p-4 bg-background border-4 border-foreground focus:outline-none focus:border-primary resize-none font-bold text-lg"
                        />

                        <BrutalButton
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full py-4 text-xl"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Sending..." : "Submit Feedback"} <Send className="ml-2 w-5 h-5" />
                        </BrutalButton>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
