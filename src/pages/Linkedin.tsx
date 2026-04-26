import { useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { KeyRound, Linkedin, Loader2, MessageCircle, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BrutalButton } from "@/components/ui/brutal-button";
import { api } from "@/lib/api";
import type { LinkedinProfileFormData } from "@/types";

const LINKEDIN_ACCESS_STORAGE_KEY = "linkedin-page-access-granted";
const WHATSAPP_NUMBER_PATTERN = /^\+[1-9]\d{7,14}$/;

const linkedinProfileSchema = z.object({
    first_name: z.string().trim().min(1, "linkedin.form.firstNameRequired").max(80, "linkedin.form.maxLength"),
    last_name: z.string().trim().min(1, "linkedin.form.lastNameRequired").max(80, "linkedin.form.maxLength"),
    whatsapp_number: z
        .string()
        .trim()
        .min(1, "linkedin.form.whatsappRequired")
        .regex(WHATSAPP_NUMBER_PATTERN, "linkedin.form.whatsappFormat"),
    linkedin_url: z
        .string()
        .trim()
        .url("linkedin.form.validUrl")
        .max(300, "linkedin.form.maxLength")
        .regex(/^https?:\/\/([a-z]{2,3}\.)?(www\.)?linkedin\.com\/in\/[^/?#]+\/?/i, "linkedin.form.linkedinProfileUrl"),
});

function getLinkedinPagePassword(): string {
    return import.meta.env.VITE_LINKEDIN_PAGE_PASSWORD ?? "";
}

const LinkedinPage = () => {
    const { t } = useTranslation();
    const [passwordInput, setPasswordInput] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [hasAccess, setHasAccess] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.localStorage.getItem(LINKEDIN_ACCESS_STORAGE_KEY) === "true";
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<LinkedinProfileFormData>({
        resolver: zodResolver(linkedinProfileSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            whatsapp_number: "",
            linkedin_url: "",
        },
    });

    const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (passwordInput === getLinkedinPagePassword()) {
            window.localStorage.setItem(LINKEDIN_ACCESS_STORAGE_KEY, "true");
            setHasAccess(true);
            setPasswordError("");
            return;
        }

        setPasswordError(t("linkedin.passwordError"));
    };

    const onSubmit = async (data: LinkedinProfileFormData) => {
        try {
            setIsSubmitting(true);
            await api.submitLinkedinProfile({
                first_name: data.first_name.trim(),
                last_name: data.last_name.trim(),
                whatsapp_number: data.whatsapp_number.trim(),
                linkedin_url: data.linkedin_url.trim(),
            });
            reset();
            toast.success(t("linkedin.successTitle"), { description: t("linkedin.successDesc") });
        } catch (error: unknown) {
            const message = error && typeof error === "object" && "message" in error
                ? String((error as { message: unknown }).message)
                : t("linkedin.submitErrorDesc");
            toast.error(t("linkedin.submitError"), { description: message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 border-b-4 border-foreground">
                <div className="container mx-auto px-4 py-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-tertiary border-4 border-foreground flex items-center justify-center text-tertiary-foreground">
                            <Linkedin className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black">
                                Gerçek Linkedin Etkileşim Desteği
                            </h1>
                            <p className="text-muted-foreground font-medium text-lg">
                                {t("linkedin.subtitle")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-12">
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border-4 border-foreground p-6 md:p-8 shadow-brutal w-full max-w-2xl mx-auto"
                >
                    {!hasAccess ? (
                        <div key="password-gate">
                            <div className="flex items-center gap-3 mb-6">
                                <KeyRound className="w-6 h-6 text-primary" />
                                <h2 className="text-2xl font-black">{t("linkedin.passwordTitle")}</h2>
                            </div>

                            <form onSubmit={handlePasswordSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="linkedin_password" className="block text-sm font-bold mb-2 uppercase">
                                        {t("linkedin.passwordLabel")}
                                    </label>
                                    <input
                                        id="linkedin_password"
                                        type="password"
                                        value={passwordInput}
                                        onChange={(event) => setPasswordInput(event.target.value)}
                                        className="w-full px-4 py-3 bg-background border-4 border-foreground focus:outline-none focus:border-primary transition-colors"
                                        placeholder={t("linkedin.passwordPlaceholder")}
                                    />
                                    {passwordError && (
                                        <p className="mt-1 text-sm text-destructive font-bold">{passwordError}</p>
                                    )}
                                </div>

                                <BrutalButton type="submit" variant="primary" size="lg" className="w-full">
                                    {t("linkedin.passwordSubmit")}
                                </BrutalButton>
                            </form>
                        </div>
                    ) : (
                        <div key="linkedin-form">
                            <div className="flex items-center gap-3 mb-6">
                                <UserPlus className="w-6 h-6 text-primary" />
                                <h2 className="text-2xl font-black">{t("linkedin.formTitle")}</h2>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div>
                                    <label htmlFor="first_name" className="block text-sm font-bold mb-2 uppercase">
                                        {t("linkedin.firstName")}
                                    </label>
                                    <input
                                        id="first_name"
                                        {...register("first_name")}
                                        className="w-full px-4 py-3 bg-background border-4 border-foreground focus:outline-none focus:border-primary transition-colors"
                                        placeholder={t("linkedin.firstNamePlaceholder")}
                                    />
                                    {errors.first_name && (
                                        <p className="mt-1 text-sm text-destructive font-bold">{t(errors.first_name.message ?? "")}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="last_name" className="block text-sm font-bold mb-2 uppercase">
                                        {t("linkedin.lastName")}
                                    </label>
                                    <input
                                        id="last_name"
                                        {...register("last_name")}
                                        className="w-full px-4 py-3 bg-background border-4 border-foreground focus:outline-none focus:border-primary transition-colors"
                                        placeholder={t("linkedin.lastNamePlaceholder")}
                                    />
                                    {errors.last_name && (
                                        <p className="mt-1 text-sm text-destructive font-bold">{t(errors.last_name.message ?? "")}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="whatsapp_number" className="block text-sm font-bold mb-2 uppercase flex items-center gap-2">
                                        <MessageCircle className="w-4 h-4" /> {t("linkedin.whatsappNumber")}
                                    </label>
                                    <input
                                        id="whatsapp_number"
                                        type="tel"
                                        {...register("whatsapp_number")}
                                        className="w-full px-4 py-3 bg-background border-4 border-foreground focus:outline-none focus:border-primary transition-colors"
                                        placeholder="+905551112233"
                                    />
                                    {errors.whatsapp_number && (
                                        <p className="mt-1 text-sm text-destructive font-bold">{t(errors.whatsapp_number.message ?? "")}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="linkedin_url" className="block text-sm font-bold mb-2 uppercase flex items-center gap-2">
                                        <Linkedin className="w-4 h-4" /> {t("linkedin.profileUrl")}
                                    </label>
                                    <input
                                        id="linkedin_url"
                                        type="url"
                                        {...register("linkedin_url")}
                                        className="w-full px-4 py-3 bg-background border-4 border-foreground focus:outline-none focus:border-primary transition-colors"
                                        placeholder="https://www.linkedin.com/in/..."
                                    />
                                    {errors.linkedin_url && (
                                        <p className="mt-1 text-sm text-destructive font-bold">{t(errors.linkedin_url.message ?? "")}</p>
                                    )}
                                </div>

                                <BrutalButton
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    className="w-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> {t("linkedin.submitting")}</>
                                    ) : (
                                        t("linkedin.submit")
                                    )}
                                </BrutalButton>
                            </form>
                        </div>
                    )}
                </motion.section>
            </main>

            <Footer />
        </div>
    );
};

export default LinkedinPage;
