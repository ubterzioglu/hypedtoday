import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Loader2, Zap, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RequestLimits {
    allowed: boolean;
    remaining?: {
        daily: number;
        weekly: number;
        active_posts: number;
        pending_reviews: number;
    };
    reason?: string;
    message?: string;
}

const RequestCapacityWidget = () => {
    const { user, session, loading: authLoading } = useAuth();
    const { t } = useTranslation();
    const [limits, setLimits] = useState<RequestLimits | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user || !session?.access_token) {
            setLoading(false);
            return;
        }

        const load = async () => {
            try {
                const data = await api.getRequestLimits() as RequestLimits;
                setLimits(data);
            } catch {
                // silently fail — widget is informational
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [authLoading, session?.access_token, user]);

    if (!user || loading) {
        return loading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold">
                <Loader2 className="w-3 h-3 animate-spin" /> {t("capacity.loading")}
            </div>
        ) : null;
    }

    if (!limits) return null;

    const r = limits.remaining;

    return (
        <div className={`border-2 border-foreground p-3 text-sm ${limits.allowed ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center gap-2 mb-2 font-bold">
                {limits.allowed
                    ? <Zap className="w-4 h-4 text-green-600" />
                    : <AlertCircle className="w-4 h-4 text-destructive" />}
                <span className={limits.allowed ? 'text-green-700' : 'text-destructive'}>
                    {limits.allowed ? t("capacity.canSubmit") : t("capacity.limitReached")}
                </span>
            </div>

            {!limits.allowed && limits.message && (
                <p className="text-xs text-destructive mb-2">{limits.message}</p>
            )}

            {r && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground font-medium">
                    <span>{t("capacity.dailyRemaining")}: <strong className="text-foreground">{r.daily}</strong></span>
                    <span>{t("capacity.weeklyRemaining")}: <strong className="text-foreground">{r.weekly}</strong></span>
                    <span>{t("capacity.activePosts")}: <strong className="text-foreground">{r.active_posts}</strong></span>
                    <span>{t("capacity.pendingReviews")}: <strong className="text-foreground">{r.pending_reviews}</strong></span>
                </div>
            )}
        </div>
    );
};

export default RequestCapacityWidget;
