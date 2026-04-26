import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ExternalLink, Linkedin, Loader2, MessageCircle, RefreshCw, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { BrutalButton } from "@/components/ui/brutal-button";
import { api } from "@/lib/api";
import type { LinkedinProfile, LinkedinProfileFormData } from "@/types";

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

const LinkedinPage = () => {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
    const [profiles, setProfiles] = useState<LinkedinProfile[]>([]);

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

    const loadProfiles = useCallback(async () => {
        try {
            setIsLoadingProfiles(true);
            setProfiles(await api.getLinkedinProfiles());
        } catch {
            toast.error(t("linkedin.loadError"));
        } finally {
            setIsLoadingProfiles(false);
        }
    }, [t]);

    useEffect(() => {
        void loadProfiles();
    }, [loadProfiles]);

    const onSubmit = async (data: LinkedinProfileFormData) => {
        try {
            setIsSubmitting(true);
            const result = await api.submitLinkedinProfile({
                first_name: data.first_name.trim(),
                last_name: data.last_name.trim(),
                whatsapp_number: data.whatsapp_number.trim(),
                linkedin_url: data.linkedin_url.trim(),
            });
            setProfiles((current) => [result.profile, ...current]);
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
        <main className="min-h-screen bg-background px-4 py-10">
            <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border-4 border-foreground p-6 md:p-8 shadow-brutal w-full"
            >
                <div className="flex items-center gap-3 mb-6">
                    <UserPlus className="w-6 h-6 text-primary" />
                    <h1 className="text-2xl font-black">{t("linkedin.formTitle")}</h1>
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
            </motion.section>
            <section className="bg-card border-4 border-foreground p-6 md:p-8 shadow-brutal w-full">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-black">{t("linkedin.listTitle")}</h2>
                    <BrutalButton
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={loadProfiles}
                        disabled={isLoadingProfiles}
                        aria-label={t("linkedin.refresh")}
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoadingProfiles ? "animate-spin" : ""}`} />
                    </BrutalButton>
                </div>

                {isLoadingProfiles ? (
                    <div className="border-4 border-dashed border-foreground/40 p-5 text-sm font-bold">
                        {t("linkedin.loading")}
                    </div>
                ) : profiles.length === 0 ? (
                    <div className="border-4 border-dashed border-foreground/40 p-5">
                        <p className="font-black">{t("linkedin.emptyTitle")}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{t("linkedin.emptyDesc")}</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {profiles.map((profile) => (
                            <li key={profile.id} className="border-4 border-foreground bg-background p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-lg font-black">
                                            {profile.first_name} {profile.last_name}
                                        </p>
                                        <p className="truncate text-sm font-bold text-muted-foreground">
                                            {profile.whatsapp_number}
                                        </p>
                                    </div>
                                    <a
                                        href={profile.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={t("linkedin.openProfile")}
                                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center border-4 border-foreground bg-primary text-primary-foreground shadow-brutal-sm transition-transform hover:-translate-y-0.5"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
            </div>
        </main>
    );
};

export default LinkedinPage;
