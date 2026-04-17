import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BrutalButton } from "@/components/ui/brutal-button";
import { Loader2, Eye, Pause, Archive, Trash2, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface PostRow {
    id: string;
    linkedin_url: string;
    title: string | null;
    status: string;
    owner_user_id: string;
    created_at: string;
}

const AdminPosts = () => {
    const [posts, setPosts] = useState<PostRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadPosts(); }, []);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('linkedin_posts')
                .select('id, linkedin_url, title, status, owner_user_id, created_at')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setPosts(data ?? []);
        } catch {
            toast.error("Failed to load posts");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (postId: string, actionType: string) => {
        if (actionType === 'post_deleted' && !confirm("Delete this post permanently?")) return;
        try {
            await api.adminAction({ action_type: actionType, target_post_id: postId, note: `${actionType} via admin` });
            toast.success("Action completed");
            loadPosts();
        } catch (err: unknown) {
            toast.error((err as { message?: string })?.message ?? "Failed");
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold uppercase">Posts ({posts.length})</h2>
            <div className="grid gap-3">
                {posts.map(p => (
                    <div key={p.id} className="bg-card border-2 border-foreground p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <p className="font-bold truncate">{p.title || 'Untitled Post'}</p>
                            <p className="text-xs text-muted-foreground truncate">{p.linkedin_url}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Status: <span className="font-bold">{p.status}</span> &middot; {new Date(p.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {p.status === 'active' && (
                                <>
                                    <BrutalButton variant="secondary" size="sm" onClick={() => handleAction(p.id, 'post_paused')}><Pause className="w-3 h-3" /></BrutalButton>
                                    <BrutalButton variant="secondary" size="sm" onClick={() => handleAction(p.id, 'post_archived')}><Archive className="w-3 h-3" /></BrutalButton>
                                    <BrutalButton variant="secondary" size="sm" onClick={() => handleAction(p.id, 'post_hidden')}><EyeOff className="w-3 h-3" /></BrutalButton>
                                </>
                            )}
                            <BrutalButton variant="secondary" size="sm" className="bg-red-600 text-white" onClick={() => handleAction(p.id, 'post_deleted')}><Trash2 className="w-3 h-3" /></BrutalButton>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminPosts;
