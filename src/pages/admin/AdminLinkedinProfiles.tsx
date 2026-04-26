import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, MessageCircle, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { BrutalButton } from "@/components/ui/brutal-button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { LinkedinProfile } from "@/types";

type ApprovalStatus = LinkedinProfile["approval_status"];

const statusStyles: Record<ApprovalStatus, string> = {
    pending: "bg-secondary text-secondary-foreground",
    approved: "bg-primary text-primary-foreground",
    rejected: "bg-destructive text-destructive-foreground",
};

const statusLabels: Record<ApprovalStatus, string> = {
    pending: "Onay bekliyor",
    approved: "Onaylı",
    rejected: "Reddedildi",
};

function normalizeWhatsappHref(value: string | null): string | null {
    if (!value) return null;
    const trimmed = value.trim();

    if (/^05\d{9}$/.test(trimmed)) {
        return `https://wa.me/9${trimmed}`;
    }

    if (/^\+[1-9]\d{7,14}$/.test(trimmed)) {
        return `https://wa.me/${trimmed.slice(1)}`;
    }

    return null;
}

const AdminLinkedinProfiles = () => {
    const { user } = useAuth();
    const [profiles, setProfiles] = useState<LinkedinProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const loadProfiles = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("linkedin_profiles")
                .select("id, first_name, last_name, whatsapp_number, linkedin_url, approval_status, created_at, reviewed_at")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setProfiles((data ?? []) as LinkedinProfile[]);
        } catch {
            toast.error("LinkedIn kayıtları yüklenemedi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadProfiles();
    }, []);

    const setApprovalStatus = async (profileId: string, approvalStatus: ApprovalStatus) => {
        try {
            setUpdatingId(profileId);
            const { error } = await supabase
                .from("linkedin_profiles")
                .update({
                    approval_status: approvalStatus,
                    reviewed_by: user?.id ?? null,
                    reviewed_at: new Date().toISOString(),
                })
                .eq("id", profileId);

            if (error) throw error;
            toast.success(`Kayıt ${statusLabels[approvalStatus].toLowerCase()}`);
            await loadProfiles();
        } catch (err: unknown) {
            toast.error((err as { message?: string })?.message ?? "Kayıt güncellenemedi");
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-xl font-bold uppercase">LinkedIn Kayıt Onayı ({profiles.length})</h2>
                    <p className="text-sm font-bold text-muted-foreground">Yeni kayıtları onayla veya reddet.</p>
                </div>
                <BrutalButton variant="secondary" size="sm" onClick={loadProfiles}>
                    <RefreshCw className="w-4 h-4 mr-1" /> Yenile
                </BrutalButton>
            </div>

            <div className="grid gap-3">
                {profiles.map((profile) => (
                    <div key={profile.id} className="bg-card border-2 border-foreground p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="font-black">{profile.first_name} {profile.last_name}</p>
                                <span className={`border-2 border-foreground px-2 py-0.5 text-xs font-black uppercase ${statusStyles[profile.approval_status]}`}>
                                    {statusLabels[profile.approval_status]}
                                </span>
                            </div>
                            {normalizeWhatsappHref(profile.whatsapp_number) ? (
                                <a
                                    href={`${normalizeWhatsappHref(profile.whatsapp_number)}?text=${encodeURIComponent(`Merhaba ${profile.first_name}, hyped.today LinkedIn kaydiniz icin size ulasiyorum.`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-green-700 underline"
                                >
                                    <MessageCircle className="h-3 w-3 shrink-0" />
                                    <span>{profile.whatsapp_number}</span>
                                </a>
                            ) : (
                                <p className="mt-1 text-xs font-bold text-muted-foreground">{profile.whatsapp_number ?? "-"}</p>
                            )}
                            <a
                                href={profile.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 inline-flex max-w-full items-center gap-1 text-xs font-bold text-primary underline"
                            >
                                <span className="truncate">{profile.linkedin_url}</span>
                                <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Kayıt: {new Date(profile.created_at).toLocaleString("tr-TR")}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <BrutalButton
                                variant="primary"
                                size="sm"
                                disabled={updatingId === profile.id || profile.approval_status === "approved"}
                                onClick={() => setApprovalStatus(profile.id, "approved")}
                            >
                                <CheckCircle2 className="w-4 h-4 mr-1" /> Onayla
                            </BrutalButton>
                            <BrutalButton
                                variant="secondary"
                                size="sm"
                                className="bg-red-600 text-white"
                                disabled={updatingId === profile.id || profile.approval_status === "rejected"}
                                onClick={() => setApprovalStatus(profile.id, "rejected")}
                            >
                                <XCircle className="w-4 h-4 mr-1" /> Reddet
                            </BrutalButton>
                        </div>
                    </div>
                ))}
                {profiles.length === 0 && (
                    <div className="border-4 border-dashed border-foreground/40 p-6">
                        <p className="font-black">Henüz LinkedIn kaydı yok.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminLinkedinProfiles;
