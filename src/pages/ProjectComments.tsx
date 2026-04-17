import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import type { PublicPost } from "@/types";
import { ArrowLeft, Loader2, MessageSquare, ExternalLink, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ProjectComments = () => {
    const { id } = useParams<{ id: string }>();

    const { data: post, isLoading: isPostLoading } = useQuery({
        queryKey: ['post', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('public_posts')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw new Error('Failed to load post: ' + error.message);
            return data as PublicPost;
        },
        enabled: !!id,
    });

    const { data: comments, isLoading: isCommentsLoading } = useQuery({
        queryKey: ['post-comments', id],
        queryFn: () => api.getPostComments(id!),
        enabled: !!id,
    });

    if (isPostLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
                <Footer />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-xl font-bold">Post not found</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            {/* Page Header */}
            <div className="bg-gradient-to-r from-tertiary/20 via-primary/20 to-secondary/20 border-b-4 border-foreground">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <Link to="/showroom">
                            <div className="w-12 h-12 bg-card border-4 border-foreground flex items-center justify-center hover:bg-muted transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-black truncate">
                                {post.title ?? 'LinkedIn Post'}
                            </h1>
                            <p className="text-sm text-muted-foreground">Approved Comments</p>
                        </div>
                        <a
                            href={post.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground border-2 border-foreground font-bold hover:shadow-brutal transition-shadow"
                        >
                            <ExternalLink className="w-4 h-4" />
                            View Post
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
                <div className="bg-card border-4 border-foreground min-h-[400px]">
                    <div className="p-4 border-b-2 border-foreground bg-muted">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            <span className="font-bold">
                                {comments?.length ?? 0} Approved Comment{(comments?.length ?? 0) !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 space-y-4">
                        {isCommentsLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : !comments?.length ? (
                            <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2 opacity-60">
                                <MessageSquare className="w-12 h-12" />
                                <p className="font-bold">No approved comments yet.</p>
                                <p className="text-sm">Comments appear here once the post owner approves them.</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="bg-background border-2 border-foreground p-4 shadow-brutal-sm"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <span className="text-xs font-bold text-muted-foreground">
                                            {comment.supporter_display_name ?? 'Anonymous'}
                                        </span>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap">{comment.comment_text}</p>
                                    <p className="text-[10px] text-muted-foreground mt-2 font-bold text-right">
                                        {formatDistanceToNow(new Date(comment.approved_at), { addSuffix: true })}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProjectComments;
