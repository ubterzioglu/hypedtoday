import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BrutalButton } from "@/components/ui/brutal-button";
import { Loader2, Ban, ShieldCheck, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface ProfileRow {
    id: string;
    email: string;
    display_name: string | null;
    role: string;
    request_banned: boolean;
    created_at: string;
}

const AdminUsers = () => {
    const [users, setUsers] = useState<ProfileRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editLimits, setEditLimits] = useState('');

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('id, email, display_name, role, request_banned, created_at')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setUsers(data ?? []);
        } catch {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleSuspend = async (userId: string) => {
        if (!confirm("Suspend this user?")) return;
        try {
            await api.adminAction({ action_type: 'user_suspended', target_user_id: userId, note: 'Suspended via admin panel' });
            toast.success("User suspended");
            loadUsers();
        } catch (err: unknown) {
            toast.error((err as { message?: string })?.message ?? "Failed");
        }
    };

    const handleUnsuspend = async (userId: string) => {
        try {
            await api.adminAction({ action_type: 'user_unsuspended', target_user_id: userId, note: 'Unsuspended via admin panel' });
            toast.success("User unsuspended");
            loadUsers();
        } catch (err: unknown) {
            toast.error((err as { message?: string })?.message ?? "Failed");
        }
    };

    const handleRequestBan = async (userId: string, ban: boolean) => {
        try {
            await api.adminAction({
                action_type: ban ? 'request_ban_set' : 'request_ban_removed',
                target_user_id: userId,
                note: `${ban ? 'Banned' : 'Unbanned'} from creating requests`,
            });
            toast.success(ban ? "User request-banned" : "User request-unbanned");
            loadUsers();
        } catch (err: unknown) {
            toast.error((err as { message?: string })?.message ?? "Failed");
        }
    };

    const handleSaveLimits = async (userId: string) => {
        try {
            const overrides = JSON.parse(editLimits);
            await api.adminAction({
                action_type: 'request_limit_changed',
                target_user_id: userId,
                payload: overrides,
                note: 'Updated request limits',
            });
            toast.success("Limits updated");
            setEditingId(null);
        } catch (err: unknown) {
            toast.error((err as { message?: string })?.message ?? "Invalid JSON");
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold uppercase">Users ({users.length})</h2>
            <div className="grid gap-3">
                {users.map(u => (
                    <div key={u.id} className="bg-card border-2 border-foreground p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                            <p className="font-bold">{u.display_name || u.email}</p>
                            <p className="text-xs text-muted-foreground">{u.email} &middot; {u.role} &middot; {u.request_banned ? 'BANNED' : 'Active'}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <BrutalButton variant="secondary" size="sm" onClick={() => handleRequestBan(u.id, !u.request_banned)}>
                                <Ban className="w-3 h-3 mr-1" /> {u.request_banned ? 'Unban' : 'Ban'} Requests
                            </BrutalButton>
                            {editingId === u.id ? (
                                <>
                                    <input
                                        value={editLimits}
                                        onChange={e => setEditLimits(e.target.value)}
                                        placeholder='{"daily_post_limit":5}'
                                        className="px-2 py-1 border-2 border-foreground text-xs font-mono w-48"
                                    />
                                    <BrutalButton variant="primary" size="sm" onClick={() => handleSaveLimits(u.id)}>Save</BrutalButton>
                                    <BrutalButton variant="secondary" size="sm" onClick={() => setEditingId(null)}>Cancel</BrutalButton>
                                </>
                            ) : (
                                <BrutalButton variant="secondary" size="sm" onClick={() => { setEditingId(u.id); setEditLimits(''); }}>
                                    <Edit2 className="w-3 h-3 mr-1" /> Limits
                                </BrutalButton>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminUsers;
