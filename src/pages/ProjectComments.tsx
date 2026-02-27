
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Project, Comment } from "@/types";
import { BrutalButton } from "@/components/ui/brutal-button";
import { ArrowLeft, Send, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const ProjectComments = () => {
    const { id } = useParams<{ id: string }>();
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Project Details
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

    // Fetch Comments
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
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    if (!project) {
        return <div className="min-h-screen flex items-center justify-center">Project not found</div>;
    }

    return (
        <div className="min-h-screen bg-background border-x-4 border-foreground max-w-2xl mx-auto flex flex-col">
            {/* Header */}
            <div className="p-4 border-b-4 border-foreground bg-card sticky top-0 z-10 flex items-center gap-4">
                <Link to="/" className="p-2 hover:bg-muted rounded-full transition-colors border-2 border-transparent hover:border-foreground">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold truncate">{project.name}</h1>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Comments</p>
                </div>
            </div>

            {/* Comments List */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {isCommentsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                ) : comments?.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2 opacity-60">
                        <MessageSquare className="w-12 h-12" />
                        <p className="font-bold">No comments yet. Be the first!</p>
                    </div>
                ) : (
                    comments?.map((comment) => (
                        <div key={comment.id} className="bg-card border-2 border-foreground p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                            <p className="text-[10px] text-muted-foreground mt-2 font-bold text-right">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </p>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t-4 border-foreground bg-background sticky bottom-0">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 bg-muted border-2 border-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-bold placeholder:font-normal"
                        disabled={isSubmitting}
                    />
                    <BrutalButton
                        type="submit"
                        disabled={!newComment.trim() || isSubmitting}
                        className="px-4"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </BrutalButton>
                </form>
            </div>
        </div>
    );
};

export default ProjectComments;
