import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BrutalButton } from "@/components/ui/brutal-button";
import { Loader2, ThumbsUp, MessageSquare, Repeat2, Clock, CheckCircle, XCircle, ExternalLink, Send } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface MyClaim {
    id: string;
    post_id: string;
    task_type: string;
    status: string;
    started_at: string;
    completed_at: string | null;
    approved_at: string | null;
    rejected_at: string | null;
    linkedin_url: string;
    post_title: string | null;
    supporter_note: string | null;
    comment_text: string | null;
    repost_text: string | null;
}

const TASK_ICONS: Record<string, React.ElementType> = {
    like: ThumbsUp,
    comment: MessageSquare,
    repost: Repeat2,
};

const STATUS_STYLES: Record<string, string> = {
    claimed: 'bg-yellow-100 text-yellow-800 border-yellow-400',
    completed: 'bg-blue-100 text-blue-800 border-blue-400',
    pending_review: 'bg-orange-100 text-orange-800 border-orange-400',
    approved: 'bg-green-100 text-green-800 border-green-400',
    rejected: 'bg-red-100 text-red-800 border-red-400',
    cancelled: 'bg-gray-100 text-gray-600 border-gray-400',
    expired: 'bg-gray-100 text-gray-500 border-gray-400',
};

const SupporterDashboard = () => {
    const { user } = useAuth();
    const [claims, setClaims] = useState<MyClaim[]>([]);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState<string | null>(null);
    const [completeForms, setCompleteForms] = useState<Record<string, { note: string; comment: string; repost: string }>>({});

    useEffect(() => {
        if (user) loadClaims();
    }, [user]);

    const loadClaims = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('task_claims')
                .select(`
                    id, post_id, task_type, status, started_at, completed_at,
                    approved_at, rejected_at, supporter_note, comment_text, repost_text,
                    linkedin_posts!inner(linkedin_url, title)
                `)
                .eq('supporter_user_id', user!.id)
                .order('started_at', { ascending: false })
                .limit(50);
            if (error) throw error;
            const mapped = (data || []).map((c: Record<string, unknown>) => {
                const post = c['linkedin_posts'] as { linkedin_url: string; title: string | null } | null;
                return {
                    id: c['id'] as string,
                    post_id: c['post_id'] as string,
                    task_type: c['task_type'] as string,
                    status: c['status'] as string,
                    started_at: c['started_at'] as string,
                    completed_at: c['completed_at'] as string | null,
                    approved_at: c['approved_at'] as string | null,
                    rejected_at: c['rejected_at'] as string | null,
                    supporter_note: c['supporter_note'] as string | null,
                    comment_text: c['comment_text'] as string | null,
                    repost_text: c['repost_text'] as string | null,
                    linkedin_url: post?.linkedin_url ?? '',
                    post_title: post?.title ?? null,
                };
            });
            setClaims(mapped);
        } catch {
            toast.error("Failed to load claims");
        } finally {
            setLoading(false);
        }
    };

    const getForm = (claimId: string) => completeForms[claimId] ?? { note: '', comment: '', repost: '' };

    const updateForm = (claimId: string, field: string, value: string) => {
        setCompleteForms(prev => ({ ...prev, [claimId]: { ...getForm(claimId), [field]: value } }));
    };

    const handleComplete = async (claim: MyClaim) => {
        const form = getForm(claim.id);
        try {
            setCompleting(claim.id);
            await api.completeClaim({
                claim_id: claim.id,
                supporter_note: form.note || undefined,
                comment_text: claim.task_type === 'comment' ? form.comment || undefined : undefined,
                repost_text: claim.task_type === 'repost' ? form.repost || undefined : undefined,
            });
            toast.success("Claim marked as completed!");
            setClaims(prev => prev.map(c => c.id === claim.id ? { ...c, status: 'pending_review' } : c));
        } catch (error: unknown) {
            const msg = error && typeof error === "object" && "message" in error
                ? String((error as { message: unknown }).message) : "Failed to complete claim.";
            toast.error(msg);
        } finally {
            setCompleting(null);
        }
    };

    const active = claims.filter(c => ['claimed', 'completed', 'pending_review'].includes(c.status));
    const history = claims.filter(c => ['approved', 'rejected', 'cancelled', 'expired'].includes(c.status));

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 border-b-4 border-foreground">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-black">My Support Activity</h1>
                    <p className="text-muted-foreground">Track and complete your claimed tasks</p>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl space-y-8">
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
                ) : (
                    <>
                        {/* Active Claims */}
                        <section>
                            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" /> Active Claims ({active.length})
                            </h2>
                            {active.length === 0 ? (
                                <p className="text-muted-foreground font-medium py-6 text-center bg-muted border-2 border-dashed border-foreground/30">
                                    No active claims. Go to the showroom to claim tasks!
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {active.map(claim => {
                                        const Icon = TASK_ICONS[claim.task_type] ?? Clock;
                                        const form = getForm(claim.id);
                                        const canComplete = claim.status === 'claimed';
                                        return (
                                            <div key={claim.id} className="bg-card border-4 border-foreground p-4 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-sm truncate">{claim.post_title ?? 'LinkedIn Post'}</p>
                                                        <p className="text-xs text-muted-foreground capitalize">{claim.task_type} • {formatDistanceToNow(new Date(claim.started_at), { addSuffix: true })}</p>
                                                    </div>
                                                    <span className={`text-xs font-bold uppercase px-2 py-0.5 border ${STATUS_STYLES[claim.status] ?? ''}`}>
                                                        {claim.status.replace(/_/g, ' ')}
                                                    </span>
                                                </div>

                                                <a href={claim.linkedin_url} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                                                    <ExternalLink className="w-3 h-3" /> Open on LinkedIn
                                                </a>

                                                {canComplete && (
                                                    <div className="space-y-2 pt-2 border-t-2 border-muted">
                                                        <input
                                                            value={form.note}
                                                            onChange={e => updateForm(claim.id, 'note', e.target.value)}
                                                            placeholder="Optional note..."
                                                            className="w-full px-3 py-2 text-sm border-2 border-foreground bg-background focus:outline-none focus:border-primary"
                                                        />
                                                        {claim.task_type === 'comment' && (
                                                            <input
                                                                value={form.comment}
                                                                onChange={e => updateForm(claim.id, 'comment', e.target.value)}
                                                                placeholder="Paste your comment text..."
                                                                className="w-full px-3 py-2 text-sm border-2 border-foreground bg-background focus:outline-none focus:border-primary"
                                                            />
                                                        )}
                                                        {claim.task_type === 'repost' && (
                                                            <input
                                                                value={form.repost}
                                                                onChange={e => updateForm(claim.id, 'repost', e.target.value)}
                                                                placeholder="Paste your repost text..."
                                                                className="w-full px-3 py-2 text-sm border-2 border-foreground bg-background focus:outline-none focus:border-primary"
                                                            />
                                                        )}
                                                        <BrutalButton
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={() => handleComplete(claim)}
                                                            disabled={completing === claim.id}
                                                            className="w-full justify-center"
                                                        >
                                                            {completing === claim.id
                                                                ? <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                                                : <Send className="w-4 h-4 mr-1" />}
                                                            Mark as Completed
                                                        </BrutalButton>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* History */}
                        {history.length > 0 && (
                            <section>
                                <h2 className="text-xl font-black mb-4">History ({history.length})</h2>
                                <div className="space-y-2">
                                    {history.map(claim => {
                                        const Icon = TASK_ICONS[claim.task_type] ?? Clock;
                                        return (
                                            <div key={claim.id} className="flex items-center gap-3 bg-card border-2 border-foreground px-4 py-3">
                                                <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold truncate">{claim.post_title ?? 'LinkedIn Post'}</p>
                                                    <p className="text-xs text-muted-foreground capitalize">{claim.task_type}</p>
                                                </div>
                                                <span className={`text-xs font-bold uppercase px-2 py-0.5 border ${STATUS_STYLES[claim.status] ?? ''}`}>
                                                    {claim.status === 'approved' ? <CheckCircle className="w-3 h-3 inline mr-0.5" /> : null}
                                                    {claim.status === 'rejected' ? <XCircle className="w-3 h-3 inline mr-0.5" /> : null}
                                                    {claim.status.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default SupporterDashboard;
