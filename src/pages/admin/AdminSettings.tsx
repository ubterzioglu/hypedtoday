import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BrutalButton } from "@/components/ui/brutal-button";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface SettingRow {
    key: string;
    value: string;
    updated_at: string;
}

const SETTINGS_LABELS: Record<string, string> = {
    points_like: 'Points per Like',
    points_comment: 'Points per Comment',
    points_repost: 'Points per Repost',
    points_combo_all_three: 'Combo Bonus (All 3)',
    daily_post_limit: 'Daily Post Limit',
    weekly_post_limit: 'Weekly Post Limit',
    active_post_limit: 'Active Post Limit',
    pending_review_limit_per_owner: 'Pending Review Limit per Owner',
    request_cooldown_minutes: 'Cooldown (minutes)',
    max_active_claims_per_user: 'Max Active Claims per User',
    fast_complete_seconds: 'Fast Complete Threshold (sec)',
    min_comment_length: 'Min Comment Length',
};

const AdminSettings = () => {
    const [settings, setSettings] = useState<SettingRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [editValues, setEditValues] = useState<Record<string, string>>({});

    useEffect(() => { loadSettings(); }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from('system_settings').select('*').order('key');
            if (error) throw error;
            setSettings(data ?? []);
            const vals: Record<string, string> = {};
            for (const s of data ?? []) vals[s.key] = s.value;
            setEditValues(vals);
        } catch {
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (key: string) => {
        const value = editValues[key];
        if (!value) { toast.error("Value cannot be empty"); return; }
        try {
            await api.adminAction({
                action_type: 'global_setting_changed',
                payload: { key, value },
                note: `Changed ${key} to ${value}`,
            });
            toast.success(`${key} updated`);
            loadSettings();
        } catch (err: unknown) {
            toast.error((err as { message?: string })?.message ?? "Failed");
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold uppercase">System Settings</h2>
            <div className="grid gap-3">
                {settings.map(s => (
                    <div key={s.key} className="bg-card border-2 border-foreground p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                            <p className="font-bold">{SETTINGS_LABELS[s.key] || s.key}</p>
                            <p className="text-xs text-muted-foreground">Key: {s.key} &middot; Last updated: {new Date(s.updated_at).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={editValues[s.key] ?? ''}
                                onChange={e => setEditValues(prev => ({ ...prev, [s.key]: e.target.value }))}
                                className="px-3 py-2 border-2 border-foreground bg-background text-foreground font-mono text-sm w-32 text-right placeholder:text-muted-foreground"
                            />
                            <BrutalButton variant="primary" size="sm" onClick={() => handleSave(s.key)}>
                                <Save className="w-3 h-3" />
                            </BrutalButton>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminSettings;
