import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { BrutalButton } from "@/components/ui/brutal-button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, CheckCircle, XCircle, Clock, ThumbsUp, MessageSquare, Repeat2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface PendingReview {
    claim_id: string;
    post_id: string;
    task_type: string;
    supporter_user_id: string;
    supporter_display_name: string | null;
    supporter_avatar_url: string | null;
    started_at: string;
    completed_at: string | null;
    supporter_note: string | null;
    comment_text: string | null;
    repost_text: string | null;
    linkedin_url: string;
    post_title: string | null;
}

const TASK_ICONS: Record<string, React.ElementType> = {
    like: ThumbsUp,
    comment: MessageSquare,
    repost: Repeat2,
};

const OwnerReviews = () => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<PendingReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<PendingReview | null>(null);
    const [note, setNote] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user) loadReviews();
    }, [user]);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('owner_pending_reviews')
                .select('*')
                .order('completed_at', { ascending: false });
            if (error) throw error;
            setReviews(data || []);
        } catch {
            toast.error("Failed to load pending reviews");
        } finally {
            setLoading(false);
        }
    };

    const handleDecision = async (decision: 'approved' | 'rejected') => {
        if (!selected) return;
        try {
            setSubmitting(true);
            await api.reviewClaim({
                claim_id: selected.claim_id,
                decision,
                note: note.trim() || undefined,
            });
            toast.success(`Claim ${decision}!`);
            setReviews(prev => prev.filter(r => r.claim_id !== selected.claim_id));
            setSelected(null);
            setNote("");
        } catch (error: unknown) {
            const msg = error && typeof error === "object" && "message" in error
                ? String((error as { message: unknown }).message)
                : "Action failed.";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <div className="bg-gradient-to-r from-secondary/20 via-primary/20 to-tertiary/20 border-b-4 border-foreground">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-secondary border-4 border-foreground flex items-center justify-center">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black">Pending Reviews</h1>
                            <p className="text-muted-foreground">Approve or reject supporter completions</p>
                        </div>
                        {reviews.length > 0 && (
                            <span className="ml-auto bg-destructive text-destructive-foreground font-black px-3 py-1 border-2 border-foreground">
                                {reviews.length} pending
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-20 bg-card border-4 border-foreground">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                        <p className="text-xl font-bold">All caught up!</p>
                        <p className="text-muted-foreground mt-2">No pending supporter reviews.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Review list */}
                        <div className="space-y-3">
                            {reviews.map(review => {
                                const Icon = TASK_ICONS[review.task_type] ?? Clock;
                                const isSelected = selected?.claim_id === review.claim_id;
                                return (
                                    <button
                                        key={review.claim_id}
                                        onClick={() => { setSelected(review); setNote(""); }}
                                        className={`w-full text-left bg-card border-4 p-4 transition-all hover:shadow-brutal ${isSelected ? 'border-primary shadow-brutal' : 'border-foreground'}`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-secondary border-2 border-foreground flex items-center justify-center font-black text-xs flex-shrink-0">
                                                {(review.supporter_display_name ?? 'A').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm truncate">{review.supporter_display_name ?? 'Anonymous'}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {review.completed_at
                                                        ? formatDistanceToNow(new Date(review.completed_at), { addSuffix: true })
                                                        : 'Recently'}
                                                </p>
                                            </div>
                                            <span className="flex items-center gap-1 text-xs font-bold uppercase px-2 py-1 bg-muted border border-foreground/30">
                                                <Icon className="w-3 h-3" /> {review.task_type}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {review.post_title ?? review.linkedin_url}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Detail panel */}
                        {selected ? (
                            <div className="bg-card border-4 border-foreground p-6 space-y-4 self-start">
                                <div>
                                    <h3 className="font-black text-lg mb-1">{selected.supporter_display_name ?? 'Anonymous'}</h3>
                                    <p className="text-xs text-muted-foreground uppercase font-bold">{selected.task_type} task</p>
                                </div>

                                <a
                                    href={selected.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                                >
                                    <ExternalLink className="w-4 h-4" /> View LinkedIn Post
                                </a>

                                {selected.supporter_note && (
                                    <div className="bg-muted border-2 border-foreground p-3">
                                        <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Supporter Note</p>
                                        <p className="text-sm">{selected.supporter_note}</p>
                                    </div>
                                )}
                                {selected.comment_text && (
                                    <div className="bg-blue-50 border-2 border-blue-300 p-3">
                                        <p className="text-xs font-bold uppercase text-blue-600 mb-1">Comment Text</p>
                                        <p className="text-sm">{selected.comment_text}</p>
                                    </div>
                                )}
                                {selected.repost_text && (
                                    <div className="bg-purple-50 border-2 border-purple-300 p-3">
                                        <p className="text-xs font-bold uppercase text-purple-600 mb-1">Repost Text</p>
                                        <p className="text-sm">{selected.repost_text}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1">Decision Note (optional)</label>
                                    <textarea
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                        rows={2}
                                        placeholder="Reason for rejection, or leave empty..."
                                        className="w-full px-3 py-2 border-2 border-foreground bg-background text-sm focus:outline-none focus:border-primary resize-none"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <BrutalButton
                                        variant="primary"
                                        className="flex-1 justify-center"
                                        onClick={() => handleDecision('approved')}
                                        disabled={submitting}
                                    >
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                                        Approve
                                    </BrutalButton>
                                    <BrutalButton
                                        variant="secondary"
                                        className="flex-1 justify-center"
                                        onClick={() => handleDecision('rejected')}
                                        disabled={submitting}
                                    >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Reject
                                    </BrutalButton>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden lg:flex items-center justify-center bg-muted border-4 border-dashed border-foreground/30 min-h-[200px]">
                                <p className="text-muted-foreground font-bold">Select a review to decide</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default OwnerReviews;
