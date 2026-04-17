import { useState } from "react";
import { BrutalButton } from "@/components/ui/brutal-button";
import { api } from "@/lib/api";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, MessageCircle, Twitter, Send, MailIcon } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";

const SOCIAL_LINKS = [
    { icon: Twitter, href: "https://twitter.com/hypedtoday", color: "bg-sky-500", label: "X / Twitter" },
    { icon: MessageCircle, href: "https://www.reddit.com/r/hypedtoday/", color: "bg-orange-600", label: "Reddit" },
    { icon: Facebook, href: "https://www.facebook.com/supporttopromote", color: "bg-blue-600", label: "Facebook" },
    { icon: Phone, href: "https://wa.me/905302404995", color: "bg-green-500", label: "WhatsApp" },
    { icon: Linkedin, href: "http://linkedin.com/company/hyped-today", color: "bg-blue-700", label: "LinkedIn" },
    { icon: Instagram, href: "https://instagram.com/hypedtoday", color: "bg-pink-600", label: "Instagram" },
    { icon: MapPin, href: "https://maps.google.com/?q=Istanbul", color: "bg-red-500", label: "Location" },
    { icon: Phone, href: "tel:+905302404995", color: "bg-yellow-500", label: "Call Us" },
    { icon: Mail, href: "mailto:contact@hyped.today", color: "bg-purple-600", label: "Email" },
];

const Contact = () => {
    const { t } = useTranslation();
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            toast.error(t("contact.errorEmpty"));
            return;
        }

        try {
            setIsSubmitting(true);
            await api.submitFeedback({ message });
            toast.success(t("contact.successMsg"));
            setMessage("");
        } catch {
            toast.error(t("contact.errorMsg"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <div className="bg-gradient-to-r from-secondary/20 via-primary/20 to-tertiary/20 border-b-4 border-foreground">
                <div className="container mx-auto px-4 py-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-secondary border-4 border-foreground flex items-center justify-center">
                            <MailIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black uppercase">
                                {t("contact.title")}
                            </h1>
                            <p className="text-muted-foreground font-medium text-lg">
                                {t("contact.subtitle")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
                <div className="grid grid-cols-3 md:grid-cols-9 gap-3 mb-10">
                    {SOCIAL_LINKS.map((link, i) => (
                        <a
                            key={i}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`aspect-square flex items-center justify-center rounded-full border-2 border-foreground hover:scale-105 transition-transform shadow-brutal hover:shadow-brutal-sm ${link.color} text-white`}
                            title={link.label}
                        >
                            <link.icon className="w-5 h-5" />
                        </a>
                    ))}
                </div>

                <div className="bg-card border-4 border-foreground p-8 relative">
                    <div className="absolute -top-4 -left-4 bg-secondary text-secondary-foreground px-4 py-2 border-2 border-foreground font-bold uppercase transform -rotate-2">
                        {t("contact.sendFeedback")}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={6}
                            placeholder={t("contact.placeholder")}
                            className="w-full p-4 bg-background border-4 border-foreground focus:outline-none focus:border-primary resize-none font-bold text-lg"
                        />

                        <BrutalButton
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full py-4 text-xl"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? t("contact.submitting") : t("contact.submit")} <Send className="ml-2 w-5 h-5" />
                        </BrutalButton>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Contact;
