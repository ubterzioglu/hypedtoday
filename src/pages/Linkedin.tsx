import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronDown, ExternalLink, Info, Linkedin, ListChecks, Loader2, MessageCircle, RefreshCw, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { BrutalButton } from "@/components/ui/brutal-button";
import { api } from "@/lib/api";
import type { LinkedinProfile, LinkedinProfileFormData } from "@/types";

const WHATSAPP_NUMBER_PATTERN = /^\+[1-9]\d{7,14}$/;
const LINKEDIN_WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/LkUAfhwhQJd0cxOOLGX2Az";

const infoSections = [
    {
        title: "Yeni kanalımızı devreye aldık.",
        items: [
            "🚫 Diğer gruplarda bu sistem yok",
            "⚠️ Genelde düzensiz ilerlenir",
            "❌ Gerçek destek sağlanmaz",
            "🚀 Burada fark yaratıyoruz",
            "📊 Daha disiplinli ilerliyoruz",
            "🎯 Bu kanal görünürlük için kuruldu",
            "🤝 Amaç karşılıklı destek sağlamak",
            "👥 Herkes katkı verir",
            "📈 Herkes fayda görür",
            "⚙️ Düzenli ve disiplinli ilerleriz",
            "🔥 İleride detaylar paylaşılacak",
            "⏱️ Zaman limitleri açıklanacak",
            "⚙️ Sistem netleşecek",
            "🧠 Gerçek işleyiş anlatılacak",
            "🙏 Desteğiniz için teşekkürler",
        ],
    },
    {
        title: "hyped.today ile gelişecek sistem",
        items: [
            "🤖 İleride hyped.today ile sistem gelişecek",
            "⚙️ Daha akıllı yapı kurulacak",
            "🚀 Otomasyon devreye alınacak",
        ],
    },
    {
        title: "Gerçek LinkedIn Etkileşim Kuralları",
        items: [
            "🚀 Gerçek LinkedIn Etkileşim Kuralları",
            "🔗 Herkes link paylaşır",
            "📅 Paylaşımlar düzenli yapılır",
            "❤️ Her posta destek verilir",
            "👍 Beğeni zorunlu",
            "💬 Yorum teşvik edilir",
            "⏳ Belirli sürede etkileşim",
            "🚫 Gecikme kabul edilmez",
            "⚠️ Pasif kalan uyarılır",
            "❌ Tekrarında uzaklaştırılır",
            "👤 Takip post sahibinde",
            "🤖 Sistem sonra otomatik",
            "💯 Gerçek destek esastır",
            "🔄 Give to get kuralı",
            "⭐ Kaliteli içerik öncelik",
            "🚫 Spam paylaşım yasak",
            "🧑‍🤝‍🧑 Saygılı iletişim şart",
            "🛡️ Grup disiplini korunur",
            "⚖️ Herkes eşit katkı sağlar",
        ],
    },
];

const ruleItems = [
    "🔹 Herkes LinkedIn profil linkini paylaşır",
    "🔹 Grup üyeleri birbirini ekler",
    "🔹 24 saatte sadece 1 link paylaşılır",
    "🔹 Paylaşım süreci planlı ilerler",
    "🔹 24 saat içinde tam destek hedefi",
    "🔹 Her post herkes tarafından etkileşim alır",
    "🔹 Beğeni kontrolü post sahibinde",
    "🔹 24 saat sonra eksikler taglenir",
    "🔹 Destek vermeyenler açık belirtilir",
    "🔹 3 ihlal → 1 hafta uzaklaştırma",
    "🔹 Kurallar herkes için geçerlidir",
    "🔹 Aktif destek verenler ödüllendirilir",
    "🔹 WhatsApp export verileri baz alınır",
    "🔹 Sistem başlangıç aşamasındadır",
    "🔹 1 ay pilot süreç uygulanır",
    "🔹 Sonrasında hyped.today entegrasyonu",
    "🔹 Ek öneriler yarın 18:00’e kadar",
    "🔹 Sonrasında kurallar finalize edilir",
    "🔹 Süreç resmi olarak başlatılır",
];

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

function maskWhatsappNumber(value: string | null): string {
    if (!value) return "";
    const trimmed = value.trim();
    if (trimmed.length <= 8) return trimmed;
    return `${trimmed.slice(0, 4)}****${trimmed.slice(-4)}`;
}

function formatLinkedinProfile(value: string): string {
    try {
        const url = new URL(value);
        return `${url.hostname.replace(/^www\./, "")}${url.pathname.replace(/\/$/, "")}`;
    } catch {
        return value;
    }
}

function getApprovalLabel(status: LinkedinProfile["approval_status"]): string {
    if (status === "approved") return "Onaylı kullanıcı";
    if (status === "rejected") return "Reddedildi";
    return "Onay bekleniyor";
}

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
        <main className="min-h-screen bg-background px-4 py-8">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border-4 border-foreground p-5 md:p-6 shadow-brutal w-full"
            >
                <div className="flex items-center gap-3 mb-5">
                    <UserPlus className="w-6 h-6 text-primary" />
                    <h1 className="text-2xl font-black">{t("linkedin.formTitle")}</h1>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
                    <div className="min-w-0">
                        <label htmlFor="first_name" className="block text-sm font-bold mb-2 uppercase">
                            {t("linkedin.firstName")}
                        </label>
                        <input
                            id="first_name"
                            {...register("first_name")}
                            className="w-full px-4 py-2.5 bg-background border-4 border-foreground focus:outline-none focus:border-primary transition-colors"
                            placeholder={t("linkedin.firstNamePlaceholder")}
                        />
                        {errors.first_name && (
                            <p className="mt-1 text-sm text-destructive font-bold">{t(errors.first_name.message ?? "")}</p>
                        )}
                    </div>

                    <div className="min-w-0">
                        <label htmlFor="last_name" className="block text-sm font-bold mb-2 uppercase">
                            {t("linkedin.lastName")}
                        </label>
                        <input
                            id="last_name"
                            {...register("last_name")}
                            className="w-full px-4 py-2.5 bg-background border-4 border-foreground focus:outline-none focus:border-primary transition-colors"
                            placeholder={t("linkedin.lastNamePlaceholder")}
                        />
                        {errors.last_name && (
                            <p className="mt-1 text-sm text-destructive font-bold">{t(errors.last_name.message ?? "")}</p>
                        )}
                    </div>

                    <div className="min-w-0">
                        <label htmlFor="whatsapp_number" className="block text-sm font-bold mb-2 uppercase flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" /> {t("linkedin.whatsappNumber")}
                        </label>
                        <input
                            id="whatsapp_number"
                            type="tel"
                            {...register("whatsapp_number")}
                            className="w-full px-4 py-2.5 bg-background border-4 border-foreground focus:outline-none focus:border-primary transition-colors"
                            placeholder="+905551112233"
                        />
                        {errors.whatsapp_number && (
                            <p className="mt-1 text-sm text-destructive font-bold">{t(errors.whatsapp_number.message ?? "")}</p>
                        )}
                    </div>

                    <div className="min-w-0">
                        <label htmlFor="linkedin_url" className="block text-sm font-bold mb-2 uppercase flex items-center gap-2">
                            <Linkedin className="w-4 h-4" /> {t("linkedin.profileUrl")}
                        </label>
                        <input
                            id="linkedin_url"
                            type="url"
                            {...register("linkedin_url")}
                            className="w-full px-4 py-2.5 bg-background border-4 border-foreground focus:outline-none focus:border-primary transition-colors"
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
                        className="w-full md:col-span-2"
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
            <details className="group bg-card border-4 border-foreground shadow-brutal w-full">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 md:p-6">
                    <span className="flex items-center gap-3 text-2xl font-black">
                        <Info className="h-6 w-6 text-primary" />
                        Bilgi
                    </span>
                    <ChevronDown className="h-6 w-6 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t-4 border-foreground p-5 md:p-6">
                    <a
                        href={LINKEDIN_WHATSAPP_GROUP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mb-5 inline-flex max-w-full items-center gap-2 border-4 border-foreground bg-primary px-4 py-3 font-black text-primary-foreground shadow-brutal-sm transition-transform hover:-translate-y-0.5"
                    >
                        <span className="truncate">{LINKEDIN_WHATSAPP_GROUP_URL}</span>
                        <ExternalLink className="h-4 w-4 shrink-0" />
                    </a>
                    <div className="grid gap-5 lg:grid-cols-3">
                        {infoSections.map((section) => (
                            <section key={section.title} className="border-4 border-foreground bg-background p-4">
                                <h3 className="mb-3 text-lg font-black">{section.title}</h3>
                                <ul className="space-y-2">
                                    {section.items.map((item) => (
                                        <li key={item} className="text-sm font-bold leading-snug text-muted-foreground">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ))}
                    </div>
                </div>
            </details>
            <details className="group bg-card border-4 border-foreground shadow-brutal w-full">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 md:p-6">
                    <span className="flex items-center gap-3 text-2xl font-black">
                        <ListChecks className="h-6 w-6 text-primary" />
                        Kurallar
                    </span>
                    <ChevronDown className="h-6 w-6 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t-4 border-foreground p-5 md:p-6">
                    <div className="grid gap-2 md:grid-cols-2">
                        {ruleItems.map((item) => (
                            <p key={item} className="border-2 border-foreground bg-background px-3 py-2 text-sm font-bold leading-snug text-muted-foreground">
                                {item}
                            </p>
                        ))}
                    </div>
                </div>
            </details>
            <section className="bg-card border-4 border-foreground p-5 md:p-6 shadow-brutal w-full">
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
                    <ul className="grid gap-3">
                        {profiles.map((profile) => (
                            <li key={profile.id} className="border-4 border-foreground bg-background px-4 py-3">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div className="grid min-w-0 flex-1 gap-2 md:grid-cols-[minmax(160px,1fr)_140px_minmax(220px,1.4fr)_150px] md:items-center">
                                        <p className="truncate text-base font-black">
                                            {profile.first_name} {profile.last_name}
                                        </p>
                                        <p className="truncate text-sm font-bold text-muted-foreground">
                                            {maskWhatsappNumber(profile.whatsapp_number)}
                                        </p>
                                        <p className="truncate text-sm font-bold text-primary">
                                            {formatLinkedinProfile(profile.linkedin_url)}
                                        </p>
                                        <p className={`inline-flex w-fit border-2 border-foreground px-2 py-0.5 text-xs font-black uppercase ${
                                            profile.approval_status === "approved"
                                                ? "bg-primary text-primary-foreground"
                                                : profile.approval_status === "rejected"
                                                    ? "bg-destructive text-destructive-foreground"
                                                    : "bg-secondary text-secondary-foreground"
                                        }`}>
                                            {getApprovalLabel(profile.approval_status)}
                                        </p>
                                    </div>
                                    <a
                                        href={profile.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={t("linkedin.openProfile")}
                                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center border-4 border-foreground bg-primary text-primary-foreground shadow-brutal-sm transition-transform hover:-translate-y-0.5 md:ml-3"
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
