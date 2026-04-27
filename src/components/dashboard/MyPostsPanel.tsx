import { ExternalLink, Lock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { BrutalButton } from "@/components/ui/brutal-button";
import type { TrackedPost } from "@/types";

interface MyPostsPanelProps {
    posts: TrackedPost[];
    closingPostId: string | null;
    onClosePost: (postId: string) => void;
}

function formatDateTime(value: string): string {
    return format(new Date(value), "dd.MM.yyyy HH:mm");
}

const statusBadgeStyles: Record<TrackedPost["status"], string> = {
    open: "bg-primary text-primary-foreground",
    closed: "bg-secondary text-secondary-foreground",
    archived: "bg-muted text-foreground",
};

const trackingBadgeStyles = {
    pending: "bg-muted text-foreground",
    liked: "bg-primary text-primary-foreground",
    not_yet: "bg-secondary text-secondary-foreground",
    skipped: "bg-destructive text-destructive-foreground",
} as const;

const trackingLabels = {
    pending: "Bekliyor",
    liked: "Begendi",
    not_yet: "Daha Sonra",
    skipped: "Geciyor",
} as const;

const MyPostsPanel = ({ posts, closingPostId, onClosePost }: MyPostsPanelProps) => (
    <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-black uppercase">Benim Postlarim</h2>
                <p className="text-sm font-bold text-muted-foreground">Her post icin kim ne durumda tek yerden takip et.</p>
            </div>
            <div className="border-4 border-foreground bg-card px-3 py-2 text-sm font-black">
                {posts.length} post
            </div>
        </div>

        {posts.length === 0 ? (
            <div className="border-4 border-dashed border-foreground/40 bg-card p-6">
                <p className="font-black">Henuz dashboard postun yok.</p>
                <p className="mt-1 text-sm text-muted-foreground">Yukardaki formdan ilk LinkedIn postunu ekleyebilirsin.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {posts.map((post) => (
                    <article key={post.id} className="border-4 border-foreground bg-card p-5 shadow-brutal">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`border-2 border-foreground px-2 py-0.5 text-xs font-black uppercase ${statusBadgeStyles[post.status]}`}>
                                        {post.status}
                                    </span>
                                    <span className="text-xs font-bold uppercase text-muted-foreground">
                                        Yayin: {formatDateTime(post.published_at)}
                                    </span>
                                </div>
                                <a
                                    href={post.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-3 inline-flex max-w-full items-center gap-2 text-sm font-bold text-primary underline"
                                >
                                    <span className="truncate">{post.linkedin_url}</span>
                                    <ExternalLink className="h-4 w-4 shrink-0" />
                                </a>
                                {post.note && (
                                    <p className="mt-3 max-w-2xl border-2 border-foreground bg-background px-3 py-2 text-sm font-medium">
                                        {post.note}
                                    </p>
                                )}
                                <div className="mt-4 flex flex-wrap gap-2 text-xs font-black uppercase">
                                    <span className="border-2 border-foreground bg-muted px-2 py-1">Bekleyen {post.counts.pending}</span>
                                    <span className="border-2 border-foreground bg-primary px-2 py-1 text-primary-foreground">Begenen {post.counts.liked}</span>
                                    <span className="border-2 border-foreground bg-secondary px-2 py-1 text-secondary-foreground">Daha Sonra {post.counts.not_yet}</span>
                                    <span className="border-2 border-foreground bg-destructive px-2 py-1 text-destructive-foreground">Gecen {post.counts.skipped}</span>
                                </div>
                            </div>

                            <BrutalButton
                                type="button"
                                variant="secondary"
                                size="sm"
                                disabled={post.status !== "open" || closingPostId === post.id}
                                onClick={() => onClosePost(post.id)}
                            >
                                {closingPostId === post.id ? (
                                    <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Kapatiliyor</>
                                ) : (
                                    <><Lock className="mr-1 h-4 w-4" /> Postu Kapat</>
                                )}
                            </BrutalButton>
                        </div>

                        <div className="mt-5 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                            {post.tracking.map((tracking) => (
                                <div key={tracking.tracking_id} className="border-2 border-foreground bg-background p-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate font-black">{tracking.member_name}</p>
                                            {tracking.member_linkedin_url && (
                                                <a
                                                    href={tracking.member_linkedin_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-1 inline-flex max-w-full items-center gap-1 text-xs font-bold text-primary underline"
                                                >
                                                    <span className="truncate">Profili Ac</span>
                                                    <ExternalLink className="h-3 w-3 shrink-0" />
                                                </a>
                                            )}
                                        </div>
                                        <span className={`shrink-0 border-2 border-foreground px-2 py-0.5 text-[11px] font-black uppercase ${trackingBadgeStyles[tracking.status]}`}>
                                            {trackingLabels[tracking.status]}
                                        </span>
                                    </div>
                                    {tracking.note && (
                                        <p className="mt-2 text-xs font-medium text-muted-foreground">{tracking.note}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </article>
                ))}
            </div>
        )}
    </section>
);

export default MyPostsPanel;
