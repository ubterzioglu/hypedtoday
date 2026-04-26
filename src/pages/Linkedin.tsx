import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ExternalLink, Linkedin, Loader2, RefreshCw, UserPlus, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BrutalButton } from "@/components/ui/brutal-button";
import { api } from "@/lib/api";
import type { LinkedinProfile, LinkedinProfileFormData } from "@/types";

const linkedinProfileSchema = z.object({
    first_name: z.string().trim().min(1, "linkedin.form.firstNameRequired").max(80, "linkedin.form.maxLength"),
    last_name: z.string().trim().min(1, "linkedin.form.lastNameRequired").max(80, "linkedin.form.maxLength"),
    linkedin_url: z
        .string()
        .trim()
        .url("linkedin.form.validUrl")
        .max(300, "linkedin.form.maxLength")
        .regex(/^https?:\/\/([a-z]{2,3}\.)?(www\.)?linkedin\.com\/in\/[^/?#]+\/?/i, "linkedin.form.linkedinProfileUrl"),
});

const LinkedinPage = () => {
    const { t } = useTranslation();
    const [profiles, setProfiles] = useState<LinkedinProfile[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const loadRequestId = useRef(0);
    const tRef = useRef(t);

    useEffect(() => {
        tRef.current = t;
    }, [t]);

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
            linkedin_url: "",
        },
    });

    const loadProfiles = useCallback(async (ensureProfile?: LinkedinProfile) => {
        const requestId = loadRequestId.current + 1;
        loadRequestId.current = requestId;
        try {
            setIsLoading(true);
            const nextProfiles = await api.getLinkedinProfiles();
            if (loadRequestId.current !== requestId) {
                return;
            }
            setProfiles(
                ensureProfile && !nextProfiles.some((profile) => profile.id === ensureProfile.id)
                    ? [ensureProfile, ...nextProfiles]
                    : nextProfiles,
            );
        } catch {
            toast.error(tRef.current("linkedin.loadError"));
        } finally {
            if (loadRequestId.current === requestId) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        void loadProfiles();
    }, [loadProfiles]);

    const onSubmit = async (data: LinkedinProfileFormData) => {
        try {
            setIsSubmitting(true);
            const result = await api.submitLinkedinProfile({
                first_name: data.first_name.trim(),
                last_name: data.last_name.trim(),
                linkedin_url: data.linkedin_url.trim(),
            });
            reset();
            toast.success(t("linkedin.successTitle"), { description: t("linkedin.successDesc") });
            await loadProfiles(result.profile);
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
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,420px)_1fr] gap-8 items-start">
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border-4 border-foreground p-6 md:p-8 shadow-brutal"
                    >
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
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <h2 className="text-lg font-bold uppercase flex items-center gap-2">
                                <span className="w-2 h-2 bg-tertiary" />
                                {t("linkedin.listTitle")}
                            </h2>
                            <button
                                type="button"
                                onClick={() => void loadProfiles()}
                                className="p-2 border-2 border-foreground hover:bg-muted transition-colors"
                                title={t("linkedin.refresh")}
                                aria-label={t("linkedin.refresh")}
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                            </button>
                        </div>

                        <div className="bg-card border-4 border-foreground">
                            {isLoading ? (
                                <div className="p-8 flex items-center justify-center gap-3 text-muted-foreground font-bold">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {t("linkedin.loading")}
                                </div>
                            ) : profiles.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                                    <p className="font-bold">{t("linkedin.emptyTitle")}</p>
                                    <p className="text-sm text-muted-foreground">{t("linkedin.emptyDesc")}</p>
                                </div>
                            ) : (
                                <div className="divide-y-2 divide-foreground">
                                    {profiles.map((profile) => (
                                        <article key={profile.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/40 transition-colors">
                                            <div>
                                                <h3 className="text-xl font-black">
                                                    {profile.first_name} {profile.last_name}
                                                </h3>
                                                <p className="text-xs uppercase font-bold text-muted-foreground">
                                                    {new Date(profile.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <a
                                                href={profile.linkedin_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center gap-2 px-4 py-2 border-3 border-foreground bg-tertiary text-tertiary-foreground font-bold uppercase text-sm hover:bg-tertiary/80 transition-colors"
                                            >
                                                {t("linkedin.openProfile")}
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default LinkedinPage;
