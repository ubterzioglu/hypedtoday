import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BrutalButton } from "@/components/ui/brutal-button";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface ClaimRow {
    id: string;
    post_id: string;
    task_type: string;
    status: string;
    supporter_user_id: string;
    owner_user_id: string;
    started_at: string;
    completed_at: string | null;
    approved_at: string | null;
    rejected_at: string | null;
}

const STATUS_FILTERS = ['all', 'claimed', 'completed', 'pending_review', 'approved', 'rejected'];

const AdminClaims = () => {
    const [claims, setClaims] = useState<ClaimRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => { loadClaims(); }, [statusFilter]);

    const loadClaims = async () => {
        try {
            setLoading(true);
            let query = supabase.from('task_claims').select('*').order('created_at', { ascending: false }).limit(100);
            if (statusFilter !== 'all') query = query.eq('status', statusFilter);
            const { data, error } = await query;
            if (error) throw error;
            setClaims(data ?? []);
        } catch {
            toast.error("Failed to load claims");
        } finally {
            setLoading(false);
        }
    };

    const handleOverride = async (claimId: string, decision: 'approved' | 'rejected') => {
        const note = prompt(`Admin override: ${decision}. Enter note (required):`);
        if (!note) return;
        try {
            await api.adminAction({
                action_type: decision === 'approved' ? 'claim_override_approved' : 'claim_override_rejected',
                target_claim_id: claimId,
                note,
            });
            toast.success(`Claim ${decision}`);
            loadClaims();
        } catch (err: unknown) {
            toast.error((err as { message?: string })?.message ?? "Failed");
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold uppercase">Claims ({claims.length})</h2>
                <div className="flex gap-1">
                    {STATUS_FILTERS.map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-2 py-1 text-xs font-bold border-2 border-foreground ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                        >
                            {s === 'all' ? 'All' : s.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid gap-3">
                {claims.map(c => (
                    <div key={c.id} className="bg-card border-2 border-foreground p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                            <p className="font-bold capitalize">{c.task_type}</p>
                            <p className="text-xs text-muted-foreground">
                                Status: <span className="font-bold">{c.status}</span> &middot; {new Date(c.started_at).toLocaleString()}
                                {c.completed_at && <> &middot; Completed: {new Date(c.completed_at).toLocaleString()}</>}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">{c.id.slice(0, 8)}</p>
                        </div>
                        <div className="flex gap-1">
                            {c.status !== 'approved' && (
                                <BrutalButton variant="primary" size="sm" onClick={() => handleOverride(c.id, 'approved')}>
                                    <CheckCircle className="w-3 h-3 mr-1" /> Approve
                                </BrutalButton>
                            )}
                            {c.status !== 'rejected' && (
                                <BrutalButton variant="secondary" size="sm" className="bg-red-600 text-white" onClick={() => handleOverride(c.id, 'rejected')}>
                                    <XCircle className="w-3 h-3 mr-1" /> Reject
                                </BrutalButton>
                            )}
                        </div>
                    </div>
                ))}
                {claims.length === 0 && <p className="text-center text-muted-foreground py-10">No claims found.</p>}
            </div>
        </div>
    );
};

export default AdminClaims;
