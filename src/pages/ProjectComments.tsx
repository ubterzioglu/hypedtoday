import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Project, Comment } from "@/types";
import { BrutalButton } from "@/components/ui/brutal-button";
import { ArrowLeft, Send, Loader2, MessageSquare, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ProjectComments = () => {
    const { id } = useParams<{ id: string }>();
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: project, isLoading: isProjectLoading } = useQuery({
        queryKey: ['project', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data as Project;
        },
        enabled: !!id
    });

    const { data: comments, isLoading: isCommentsLoading, refetch } = useQuery({
        queryKey: ['comments', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .eq('project_id', id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Comment[];
        },
        enabled: !!id
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !id) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('comments')
                .insert([
                    { project_id: id, content: newComment.trim() }
                ]);

            if (error) throw error;

            setNewComment("");
            toast.success("Comment added!");
            refetch();
        } catch (error) {
            toast.error("Failed to add comment");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isProjectLoading) {
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

    if (!project) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-xl font-bold">Project not found</p>
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
                            <h1 className="text-2xl font-black truncate">{project.name}</h1>
                            <p className="text-sm text-muted-foreground">Project Comments</p>
                        </div>
                        {project.project_url && (
                            <a
                                href={project.project_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground border-2 border-foreground font-bold hover:shadow-brutal transition-shadow"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Visit
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
                {/* Comments List */}
                <div className="bg-card border-4 border-foreground mb-6 min-h-[400px]">
                    <div className="p-4 border-b-2 border-foreground bg-muted">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            <span className="font-bold">
                                {comments?.length || 0} Comments
                            </span>
                        </div>
                    </div>

                    <div className="p-4 space-y-4">
                        {isCommentsLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : comments?.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2 opacity-60">
                                <MessageSquare className="w-12 h-12" />
                                <p className="font-bold">No comments yet. Be the first!</p>
                            </div>
                        ) : (
                            comments?.map((comment) => (
                                <div 
                                    key={comment.id} 
                                    className="bg-background border-2 border-foreground p-4 shadow-brutal-sm"
                                >
                                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                                    <p className="text-[10px] text-muted-foreground mt-2 font-bold text-right">
                                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Input Area */}
                <div className="bg-card border-4 border-foreground p-4 sticky bottom-4">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 bg-background border-4 border-foreground px-4 py-3 text-sm focus:outline-none focus:border-primary font-bold placeholder:font-normal"
                            disabled={isSubmitting}
                        />
                        <BrutalButton
                            type="submit"
                            disabled={!newComment.trim() || isSubmitting}
                            className="px-6"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </BrutalButton>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProjectComments;
