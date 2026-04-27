import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardSummaryCards from "@/components/dashboard/DashboardSummaryCards";
import MyLikeTasksPanel from "@/components/dashboard/MyLikeTasksPanel";
import MyPostsPanel from "@/components/dashboard/MyPostsPanel";
import { BrutalButton } from "@/components/ui/brutal-button";
import { api } from "@/lib/api";
import type { DashboardPayload, TrackingStatus, TrackedPost } from "@/types";

const initialPayload: DashboardPayload = {
    summary: {
        open_posts: 0,
        my_pending_actions: 0,
        my_posts_liked: 0,
        approved_members: 0,
    },
    my_posts: [],
    my_tasks: [],
};

function normalizeDashboardAfterStatusUpdate(
    payload: DashboardPayload,
    trackingId: string,
    nextStatus: Exclude<TrackingStatus, "pending">,
): DashboardPayload {
    const previousTask = payload.my_tasks.find((task) => task.tracking_id === trackingId);
    if (!previousTask) return payload;

    const previousStatus = previousTask.status;
    const myTasks = payload.my_tasks.map((task) =>
        task.tracking_id === trackingId
            ? { ...task, status: nextStatus, marked_at: new Date().toISOString() }
            : task,
    );

    const myPosts = payload.my_posts.map((post) => {
        if (post.id !== previousTask.post_id) return post;

        const tracking = post.tracking.map((row) =>
            row.tracking_id === trackingId
                ? { ...row, status: nextStatus, marked_at: new Date().toISOString() }
                : row,
        );

        const counts = { ...post.counts };
        counts[previousStatus === "pending" ? "pending" : previousStatus] = Math.max(0, counts[previousStatus === "pending" ? "pending" : previousStatus] - 1);
        counts[nextStatus] += 1;

        return { ...post, tracking, counts };
    });

    const myPendingActions = payload.summary.my_pending_actions + (
        (previousStatus === "pending" || previousStatus === "not_yet" ? -1 : 0) +
        (nextStatus === "not_yet" ? 1 : 0)
    );

    return {
        ...payload,
        my_tasks: myTasks,
        my_posts: myPosts,
        summary: {
            ...payload.summary,
            my_pending_actions: Math.max(0, myPendingActions),
        },
    };
}

const Dashboard = () => {
    const [payload, setPayload] = useState<DashboardPayload>(initialPayload);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [updatingTrackingId, setUpdatingTrackingId] = useState<string | null>(null);
    const [closingPostId, setClosingPostId] = useState<string | null>(null);
    const [form, setForm] = useState({
        linkedin_url: "",
        published_at: "",
        note: "",
    });

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setPayload(await api.getDashboardData());
        } catch (error: unknown) {
            const message = error && typeof error === "object" && "message" in error
                ? String((error as { message: unknown }).message)
                : "Dashboard yuklenemedi.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadDashboard();
    }, []);

    const handleCreatePost = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            setSubmitting(true);
            await api.createTrackedPost({
                linkedin_url: form.linkedin_url.trim(),
                published_at: new Date(form.published_at).toISOString(),
                note: form.note.trim() || undefined,
            });
            toast.success("Post dashboard'a eklendi.");
            setForm({ linkedin_url: "", published_at: "", note: "" });
            await loadDashboard();
        } catch (error: unknown) {
            const message = error && typeof error === "object" && "message" in error
                ? String((error as { message: unknown }).message)
                : "Post eklenemedi.";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateStatus = async (trackingId: string, status: Exclude<TrackingStatus, "pending">) => {
        const previousPayload = payload;
        setPayload((current) => normalizeDashboardAfterStatusUpdate(current, trackingId, status));
        setUpdatingTrackingId(trackingId);

        try {
            await api.updateTrackingStatus({ tracking_id: trackingId, status });
            toast.success("Durum guncellendi.");
        } catch (error: unknown) {
            setPayload(previousPayload);
            const message = error && typeof error === "object" && "message" in error
                ? String((error as { message: unknown }).message)
                : "Durum kaydedilemedi.";
            toast.error(message);
        } finally {
            setUpdatingTrackingId(null);
        }
    };

    const handleClosePost = async (postId: string) => {
        const previousPosts = payload.my_posts;
        setPayload((current) => ({
            ...current,
            my_posts: current.my_posts.map((post) => post.id === postId ? { ...post, status: "closed" } : post),
            summary: {
                ...current.summary,
                open_posts: Math.max(0, current.summary.open_posts - 1),
            },
        }));
        setClosingPostId(postId);

        try {
            await api.closeTrackedPost({ post_id: postId });
            toast.success("Post kapatildi.");
        } catch (error: unknown) {
            setPayload((current) => ({
                ...current,
                my_posts: previousPosts,
                summary: {
                    ...current.summary,
                    open_posts: previousPosts.filter((post) => post.status === "open").length,
                },
            }));
            const message = error && typeof error === "object" && "message" in error
                ? String((error as { message: unknown }).message)
                : "Post kapatilamadi.";
            toast.error(message);
        } finally {
            setClosingPostId(null);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <div className="border-b-4 border-foreground bg-gradient-to-r from-primary/20 via-card to-accent/20">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-4xl font-black uppercase">Dashboard</h1>
                    <p className="mt-2 max-w-3xl text-sm font-bold text-muted-foreground">
                        LinkedIn postlarini yayin saatine gore ekle, diger uyelerin durumunu takip et, kendi bekleyen postlarini buradan yonet.
                    </p>
                </div>
            </div>

            <main className="container mx-auto flex-1 space-y-8 px-4 py-8">
                <section className="border-4 border-foreground bg-card p-5 shadow-brutal md:p-6">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center border-4 border-foreground bg-primary text-primary-foreground">
                            <Plus className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase">Yeni Post Ekle</h2>
                            <p className="text-sm font-bold text-muted-foreground">Gunde 1 yeni post acabilirsin. Acik post sayisinda ust limit yok.</p>
                        </div>
                    </div>
                    <form className="grid gap-4 lg:grid-cols-[1.4fr_220px_1fr_auto]" onSubmit={handleCreatePost}>
                        <input
                            type="url"
                            value={form.linkedin_url}
                            onChange={(event) => setForm((current) => ({ ...current, linkedin_url: event.target.value }))}
                            placeholder="https://www.linkedin.com/posts/..."
                            className="w-full border-4 border-foreground bg-background px-4 py-3 font-bold focus:border-primary focus:outline-none"
                        />
                        <input
                            type="datetime-local"
                            value={form.published_at}
                            onChange={(event) => setForm((current) => ({ ...current, published_at: event.target.value }))}
                            className="w-full border-4 border-foreground bg-background px-4 py-3 font-bold focus:border-primary focus:outline-none"
                        />
                        <input
                            type="text"
                            value={form.note}
                            onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                            placeholder="Istege bagli not"
                            className="w-full border-4 border-foreground bg-background px-4 py-3 font-bold focus:border-primary focus:outline-none"
                        />
                        <BrutalButton type="submit" variant="primary" size="lg" disabled={submitting}>
                            {submitting ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Ekleniyor</> : "Postu Ac"}
                        </BrutalButton>
                    </form>
                </section>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        <DashboardSummaryCards summary={payload.summary} />
                        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
                            <MyPostsPanel posts={payload.my_posts} closingPostId={closingPostId} onClosePost={handleClosePost} />
                            <MyLikeTasksPanel tasks={payload.my_tasks} updatingTrackingId={updatingTrackingId} onUpdateStatus={handleUpdateStatus} />
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Dashboard;
