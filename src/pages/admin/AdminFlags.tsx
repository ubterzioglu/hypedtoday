import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { BrutalButton } from "@/components/ui/brutal-button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Flag {
    id: string;
    flag_type: string;
    user_id: string | null;
    post_id: string | null;
    task_claim_id: string | null;
    reason: string;
    status: string;
    created_at: string;
}

const FLAG_COLORS: Record<string, string> = {
    fast_complete: 'text-orange-600 bg-orange-50',
    high_rejection: 'text-red-600 bg-red-50',
    mutual_support: 'text-yellow-600 bg-yellow-50',
    owner_mass_approval: 'text-purple-600 bg-purple-50',
    request_limit_abuse: 'text-pink-600 bg-pink-50',
    suspicious_pattern: 'text-red-700 bg-red-100',
};

const AdminFlags = () => {
    const [flags, setFlags] = useState<Flag[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionPending, setActionPending] = useState<string | null>(null);

    useEffect(() => {
        loadFlags();
    }, []);

    const loadFlags = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminDashboard() as { flags?: Flag[] };
            setFlags(data?.flags ?? []);
        } catch {
            toast.error("Failed to load flags");
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (flagId: string, status: 'reviewed' | 'ignored') => {
        try {
            setActionPending(flagId);
            await api.adminAction({
                action_type: 'flag_reviewed',
                payload: { flag_id: flagId, new_status: status },
                note: `Flag marked as ${status}`,
            });
            toast.success(`Flag marked as ${status}`);
            setFlags(prev => prev.map(f => f.id === flagId ? { ...f, status } : f));
        } catch {
            toast.error("Failed to update flag");
        } finally {
            setActionPending(null);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    const openFlags = flags.filter(f => f.status === 'open');
    const resolvedFlags = flags.filter(f => f.status !== 'open');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black uppercase">Admin Flags</h2>
                <span className={`px-3 py-1 font-bold border-2 border-foreground text-sm ${openFlags.length > 0 ? 'bg-destructive text-destructive-foreground' : 'bg-muted'}`}>
                    {openFlags.length} Open
                </span>
            </div>

            {flags.length === 0 ? (
                <div className="p-10 text-center bg-card border-4 border-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <p className="font-bold text-muted-foreground">No flags detected.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {[...openFlags, ...resolvedFlags].map(flag => (
                        <div key={flag.id} className={`bg-card border-4 border-foreground p-4 ${flag.status !== 'open' ? 'opacity-60' : ''}`}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${FLAG_COLORS[flag.flag_type] ?? 'text-foreground bg-muted'}`}>
                                            {flag.flag_type.replace(/_/g, ' ')}
                                        </span>
                                        <span className={`text-xs font-bold uppercase px-2 py-0.5 border border-foreground ${flag.status === 'open' ? 'bg-destructive/20' : 'bg-muted'}`}>
                                            {flag.status}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium mb-1">{flag.reason}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(flag.created_at), { addSuffix: true })}
                                        {flag.user_id && ` · User: ${flag.user_id.slice(0, 8)}...`}
                                    </p>
                                </div>
                                {flag.status === 'open' && (
                                    <div className="flex gap-2 flex-shrink-0">
                                        <BrutalButton
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleReview(flag.id, 'reviewed')}
                                            disabled={actionPending === flag.id}
                                        >
                                            Review
                                        </BrutalButton>
                                        <BrutalButton
                                            size="sm"
                                            onClick={() => handleReview(flag.id, 'ignored')}
                                            disabled={actionPending === flag.id}
                                        >
                                            Ignore
                                        </BrutalButton>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminFlags;
