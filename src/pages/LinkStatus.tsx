import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2, RefreshCw, UsersRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { BrutalButton } from "@/components/ui/brutal-button";
import { api } from "@/lib/api";
import type { LinkedinProfile } from "@/types";

const statusStyles: Record<LinkedinProfile["approval_status"], string> = {
    pending: "bg-secondary text-secondary-foreground",
    approved: "bg-primary text-primary-foreground",
    rejected: "bg-destructive text-destructive-foreground",
};

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

const LinkStatusPage = () => {
    const { t } = useTranslation();
    const [profiles, setProfiles] = useState<LinkedinProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadProfiles = useCallback(async () => {
        try {
            setIsLoading(true);
            setProfiles(await api.getLinkedinProfiles());
        } catch {
            toast.error(t("linkStatus.loadError"));
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        void loadProfiles();
    }, [loadProfiles]);

    return (
        <main className="min-h-screen bg-background px-4 py-8">
            <section className="mx-auto w-full max-w-5xl bg-card border-4 border-foreground p-5 shadow-brutal md:p-6">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <UsersRound className="h-7 w-7 text-primary" aria-hidden="true" />
                        <div>
                            <h1 className="text-3xl font-black uppercase">{t("linkStatus.title")}</h1>
                            <p className="mt-1 text-sm font-bold text-muted-foreground">{t("linkStatus.subtitle")}</p>
                        </div>
                    </div>
                    <BrutalButton
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={loadProfiles}
                        disabled={isLoading}
                        aria-label={t("linkStatus.refresh")}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                            <RefreshCw className="h-4 w-4" aria-hidden="true" />
                        )}
                    </BrutalButton>
                </div>

                {isLoading ? (
                    <div className="flex items-center gap-3 border-4 border-dashed border-foreground/40 p-5 text-sm font-bold">
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                        {t("linkStatus.loading")}
                    </div>
                ) : profiles.length === 0 ? (
                    <div className="border-4 border-dashed border-foreground/40 p-5">
                        <p className="font-black">{t("linkStatus.emptyTitle")}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{t("linkStatus.emptyDesc")}</p>
                    </div>
                ) : (
                    <ul className="grid gap-3">
                        {profiles.map((profile) => (
                            <li key={profile.id} className="border-4 border-foreground bg-background px-4 py-3">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div className="grid min-w-0 flex-1 gap-2 md:grid-cols-[minmax(160px,1fr)_140px_minmax(220px,1.4fr)_130px] md:items-center">
                                        <p className="truncate text-base font-black">
                                            {profile.first_name} {profile.last_name}
                                        </p>
                                        <p className="truncate text-sm font-bold text-muted-foreground">
                                            {maskWhatsappNumber(profile.whatsapp_number)}
                                        </p>
                                        <p className="truncate text-sm font-bold text-primary">
                                            {formatLinkedinProfile(profile.linkedin_url)}
                                        </p>
                                        <p className={`inline-flex w-fit border-2 border-foreground px-2 py-0.5 text-xs font-black uppercase ${statusStyles[profile.approval_status]}`}>
                                            {t(`linkStatus.status.${profile.approval_status}`)}
                                        </p>
                                    </div>
                                    <a
                                        href={profile.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={t("linkStatus.openProfile")}
                                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center border-4 border-foreground bg-primary text-primary-foreground shadow-brutal-sm transition-transform hover:-translate-y-0.5 md:ml-3"
                                    >
                                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                                    </a>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
};

export default LinkStatusPage;
