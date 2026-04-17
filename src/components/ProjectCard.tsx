import { useState, useCallback } from "react";
import { PublicPost, TaskType } from "@/types";
import { ExternalLink, ThumbsUp, MessageSquare, Repeat2, RotateCw, Loader2, CheckCheck, LogIn } from "lucide-react";
import { BrutalButton } from "./ui/brutal-button";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const bgColors = ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-accent', 'bg-highlight'];

interface TaskConfig {
    type: TaskType;
    label: string;
    icon: React.ElementType;
    enabled: boolean;
}

const ProjectCard = ({ post, index }: { post: PublicPost; index: number }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isFlipped, setIsFlipped] = useState(false);
    const [claiming, setClaiming] = useState<TaskType | null>(null);

    const tasks: TaskConfig[] = [
        { type: 'like', label: 'Like', icon: ThumbsUp, enabled: post.requested_like },
        { type: 'comment', label: 'Comment', icon: MessageSquare, enabled: post.requested_comment },
        { type: 'repost', label: 'Repost', icon: Repeat2, enabled: post.requested_repost },
    ].filter(t => t.enabled);

    const handleFlip = useCallback(() => {
        if (!claiming) setIsFlipped(prev => !prev);
    }, [claiming]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleFlip();
        }
    }, [handleFlip]);

    const handleClaim = async (taskType: TaskType, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!user) {
            navigate('/login');
            return;
        }

        try {
            setClaiming(taskType);
            await api.claimTask({ post_id: post.id, task_type: taskType });
            toast.success(`${taskType} task claimed!`, {
                description: "Go to LinkedIn and complete it, then mark as done.",
            });
            setIsFlipped(false);
        } catch (error: unknown) {
            const msg = error && typeof error === "object" && "message" in error
                ? String((error as { message: unknown }).message)
                : "Failed to claim task.";
            toast.error(msg);
        } finally {
            setClaiming(null);
        }
    };

    const hostname = (() => {
        try { return new URL(post.linkedin_url).hostname; } catch { return 'linkedin.com'; }
    })();

    return (
        <div
            className={`flip-card ${isFlipped ? 'is-flipped' : ''}`}
            onClick={handleFlip}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-expanded={isFlipped}
            aria-label={`${post.title ?? hostname} - tap to support`}
        >
            <div className="flip-inner">
                {/* FRONT FACE */}
                <div className="flip-front bg-card border-4 border-foreground flex flex-col overflow-hidden">
                    <div className={`h-16 border-b-4 border-foreground flex items-center px-4 ${bgColors[index % bgColors.length]}`}>
                        <ExternalLink className="w-5 h-5 text-foreground/60 mr-2 flex-shrink-0" />
                        <a
                            href={post.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="text-sm font-bold truncate hover:underline"
                        >
                            {hostname}
                        </a>
                    </div>

                    <div className="p-4 flex-1 flex flex-col gap-3">
                        {post.title && (
                            <h3 className="text-lg font-bold leading-tight line-clamp-2">{post.title}</h3>
                        )}
                        {post.description && (
                            <p className="text-xs text-muted-foreground line-clamp-3">{post.description}</p>
                        )}

                        {post.owner_display_name && (
                            <div className="flex items-center gap-2 mt-auto pt-2 border-t-2 border-muted">
                                {post.owner_avatar_url ? (
                                    <img src={post.owner_avatar_url} alt={post.owner_display_name} className="w-6 h-6 rounded-full border border-foreground" loading="lazy" decoding="async" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-secondary border border-foreground flex items-center justify-center text-xs font-bold">
                                        {post.owner_display_name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="text-xs font-medium truncate">{post.owner_display_name}</span>
                            </div>
                        )}

                        {/* Task badges */}
                        <div className="flex flex-wrap gap-1.5">
                            {post.requested_like && (
                                <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 bg-blue-100 border border-blue-400 text-blue-700">
                                    <ThumbsUp className="w-3 h-3" /> Like
                                </span>
                            )}
                            {post.requested_comment && (
                                <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 bg-green-100 border border-green-400 text-green-700">
                                    <MessageSquare className="w-3 h-3" /> Comment
                                </span>
                            )}
                            {post.requested_repost && (
                                <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 bg-purple-100 border border-purple-400 text-purple-700">
                                    <Repeat2 className="w-3 h-3" /> Repost
                                </span>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex gap-3 text-xs text-muted-foreground font-medium">
                            <span><span className="text-primary font-bold">{post.approved_count}</span> approved</span>
                            <span><span className="text-secondary font-bold">{post.pending_count}</span> pending</span>
                        </div>
                    </div>

                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-xs font-bold rounded flex items-center gap-1 backdrop-blur-sm">
                        <RotateCw className="w-3 h-3" /> Support
                    </div>
                </div>

                {/* BACK FACE — Claim tasks */}
                <div className="flip-back bg-card border-4 border-primary flex flex-col overflow-hidden">
                    <div className="bg-primary p-3 border-b-4 border-foreground flex justify-between items-center">
                        <h3 className="font-bold text-primary-foreground uppercase tracking-wide text-sm truncate">
                            {post.title ?? 'Support This Post'}
                        </h3>
                        <RotateCw className="w-4 h-4 text-primary-foreground opacity-50 flex-shrink-0" />
                    </div>

                    <div className="p-4 flex-1 flex flex-col gap-3 justify-center">
                        {!user && (
                            <p className="text-center text-sm text-muted-foreground font-medium mb-2">
                                Sign in to claim support tasks
                            </p>
                        )}

                        {tasks.length === 0 ? (
                            <p className="text-center text-muted-foreground font-bold">No tasks available</p>
                        ) : (
                            tasks.map(({ type, label, icon: Icon }) => (
                                <BrutalButton
                                    key={type}
                                    onClick={(e) => handleClaim(type, e)}
                                    variant="primary"
                                    className="w-full py-3 justify-center"
                                    disabled={claiming !== null}
                                >
                                    {claiming === type ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : user ? (
                                        <CheckCheck className="w-4 h-4 mr-2" />
                                    ) : (
                                        <LogIn className="w-4 h-4 mr-2" />
                                    )}
                                    {user ? `Claim ${label}` : `Login to ${label}`}
                                </BrutalButton>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
