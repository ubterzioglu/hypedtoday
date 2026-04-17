import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Loader2, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AuditEntry {
    id: string;
    admin_user_id: string;
    action_type: string;
    target_user_id: string | null;
    target_post_id: string | null;
    target_claim_id: string | null;
    note: string | null;
    created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
    user_suspended: 'bg-red-100 text-red-700',
    user_unsuspended: 'bg-green-100 text-green-700',
    post_hidden: 'bg-orange-100 text-orange-700',
    post_archived: 'bg-orange-100 text-orange-700',
    post_deleted: 'bg-red-100 text-red-700',
    claim_override_approved: 'bg-blue-100 text-blue-700',
    claim_override_rejected: 'bg-purple-100 text-purple-700',
    score_adjusted_plus: 'bg-green-100 text-green-700',
    score_adjusted_minus: 'bg-red-100 text-red-700',
    global_setting_changed: 'bg-yellow-100 text-yellow-700',
};

const AdminAudit = () => {
    const [entries, setEntries] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 20;

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await api.getAdminDashboard() as { audit_log?: AuditEntry[] };
                setEntries(data?.audit_log ?? []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    const paged = entries.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    const totalPages = Math.ceil(entries.length / PAGE_SIZE);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black uppercase">Audit Log</h2>
                <span className="text-sm text-muted-foreground font-bold">{entries.length} actions</span>
            </div>

            {entries.length === 0 ? (
                <div className="p-10 text-center bg-card border-4 border-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
                    <p className="font-bold text-muted-foreground">No admin actions recorded yet.</p>
                </div>
            ) : (
                <>
                    <div className="bg-card border-4 border-foreground overflow-hidden">
                        {paged.map((entry, i) => (
                            <div key={entry.id} className={`px-4 py-3 flex items-start gap-3 ${i > 0 ? 'border-t-2 border-foreground/20' : ''} hover:bg-muted/30`}>
                                <Shield className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${ACTION_COLORS[entry.action_type] ?? 'bg-muted text-foreground'}`}>
                                            {entry.action_type.replace(/_/g, ' ')}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            by {entry.admin_user_id.slice(0, 8)}...
                                        </span>
                                    </div>
                                    {entry.note && <p className="text-sm text-muted-foreground italic">&ldquo;{entry.note}&rdquo;</p>}
                                    <div className="flex gap-3 text-[10px] text-muted-foreground mt-1 font-medium">
                                        {entry.target_user_id && <span>User: {entry.target_user_id.slice(0, 8)}…</span>}
                                        {entry.target_post_id && <span>Post: {entry.target_post_id.slice(0, 8)}…</span>}
                                        {entry.target_claim_id && <span>Claim: {entry.target_claim_id.slice(0, 8)}…</span>}
                                        <span>{formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="px-4 py-2 border-2 border-foreground font-bold text-sm disabled:opacity-40 hover:bg-muted"
                            >
                                ← Prev
                            </button>
                            <span className="text-sm font-bold">Page {page + 1} / {totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page === totalPages - 1}
                                className="px-4 py-2 border-2 border-foreground font-bold text-sm disabled:opacity-40 hover:bg-muted"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminAudit;
