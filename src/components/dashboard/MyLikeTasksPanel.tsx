import { ExternalLink, Loader2, ThumbsUp } from "lucide-react";
import { format } from "date-fns";
import { BrutalButton } from "@/components/ui/brutal-button";
import type { DashboardTask, TrackingStatus } from "@/types";

interface MyLikeTasksPanelProps {
    tasks: DashboardTask[];
    updatingTrackingId: string | null;
    onUpdateStatus: (trackingId: string, status: Exclude<TrackingStatus, "pending">) => void;
}

function formatDateTime(value: string): string {
    return format(new Date(value), "dd.MM.yyyy HH:mm");
}

const taskBadgeStyles = {
    pending: "bg-muted text-foreground",
    liked: "bg-primary text-primary-foreground",
    not_yet: "bg-secondary text-secondary-foreground",
    skipped: "bg-destructive text-destructive-foreground",
} as const;

const taskLabels = {
    pending: "Bekliyor",
    liked: "Begendim",
    not_yet: "Daha Sonra",
    skipped: "Geciyorum",
} as const;

const MyLikeTasksPanel = ({ tasks, updatingTrackingId, onUpdateStatus }: MyLikeTasksPanelProps) => (
    <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-black uppercase">Benden Beklenenler</h2>
                <p className="text-sm font-bold text-muted-foreground">Diger uyelerin acik postlari burada gorunur.</p>
            </div>
            <div className="border-4 border-foreground bg-card px-3 py-2 text-sm font-black">
                {tasks.length} kayit
            </div>
        </div>

        {tasks.length === 0 ? (
            <div className="border-4 border-dashed border-foreground/40 bg-card p-6">
                <p className="font-black">Su an senden beklenen acik bir post yok.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {tasks.map((task) => (
                    <article key={task.tracking_id} className="border-4 border-foreground bg-card p-5 shadow-brutal">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`border-2 border-foreground px-2 py-0.5 text-xs font-black uppercase ${taskBadgeStyles[task.status]}`}>
                                        {taskLabels[task.status]}
                                    </span>
                                    <span className="text-xs font-bold uppercase text-muted-foreground">
                                        Yayin: {formatDateTime(task.published_at)}
                                    </span>
                                </div>
                                <p className="mt-3 text-lg font-black">{task.owner_name}</p>
                                <a
                                    href={task.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-flex max-w-full items-center gap-2 text-sm font-bold text-primary underline"
                                >
                                    <span className="truncate">{task.linkedin_url}</span>
                                    <ExternalLink className="h-4 w-4 shrink-0" />
                                </a>
                                {task.post_note && (
                                    <p className="mt-3 border-2 border-foreground bg-background px-3 py-2 text-sm font-medium">
                                        {task.post_note}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2 sm:grid-cols-3">
                                <BrutalButton
                                    type="button"
                                    variant="primary"
                                    size="sm"
                                    disabled={updatingTrackingId === task.tracking_id}
                                    onClick={() => onUpdateStatus(task.tracking_id, "liked")}
                                >
                                    {updatingTrackingId === task.tracking_id ? (
                                        <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Kaydediliyor</>
                                    ) : (
                                        <><ThumbsUp className="mr-1 h-4 w-4" /> Begendim</>
                                    )}
                                </BrutalButton>
                                <BrutalButton
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    disabled={updatingTrackingId === task.tracking_id}
                                    onClick={() => onUpdateStatus(task.tracking_id, "not_yet")}
                                >
                                    Daha Sonra
                                </BrutalButton>
                                <BrutalButton
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="bg-destructive text-destructive-foreground"
                                    disabled={updatingTrackingId === task.tracking_id}
                                    onClick={() => onUpdateStatus(task.tracking_id, "skipped")}
                                >
                                    Geciyorum
                                </BrutalButton>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        )}
    </section>
);

export default MyLikeTasksPanel;
