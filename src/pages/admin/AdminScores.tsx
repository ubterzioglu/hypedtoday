import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Star, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ScoreRow {
    user_id: string;
    display_name: string | null;
    avatar_url: string | null;
    total_points: number;
    event_count: number;
    combo_count: number;
}

const AdminScores = () => {
    const [rows, setRows] = useState<ScoreRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await supabase
                    .from('public_leaderboard')
                    .select('*')
                    .order('total_points', { ascending: false })
                    .limit(100);
                setRows(data || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-black uppercase">Scores &amp; History</h2>
            <div className="bg-card border-4 border-foreground overflow-hidden">
                <div className="grid grid-cols-5 bg-primary text-primary-foreground font-bold text-xs uppercase px-4 py-3 border-b-4 border-foreground">
                    <span className="col-span-2">User</span>
                    <span className="text-center">Points</span>
                    <span className="text-center">Supports</span>
                    <span className="text-center">Combos</span>
                </div>
                {rows.length === 0 ? (
                    <div className="p-10 text-center text-muted-foreground font-bold">No score data yet.</div>
                ) : (
                    rows.map((row, i) => (
                        <div key={row.user_id} className="grid grid-cols-5 items-center px-4 py-3 border-b-2 border-foreground/20 hover:bg-muted/50 transition-colors">
                            <div className="col-span-2 flex items-center gap-2">
                                <span className="text-xs font-bold text-muted-foreground w-6">#{i + 1}</span>
                                {row.avatar_url ? (
                                    <img src={row.avatar_url} className="w-8 h-8 rounded-full border-2 border-foreground" alt="" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-secondary border-2 border-foreground flex items-center justify-center font-black text-xs">
                                        {(row.display_name ?? 'A').charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="font-bold text-sm truncate">{row.display_name ?? 'Anonymous'}</span>
                            </div>
                            <div className="flex items-center justify-center gap-1 font-black text-primary">
                                <Star className="w-4 h-4" />
                                {row.total_points}
                            </div>
                            <div className="text-center font-bold text-sm">{row.event_count}</div>
                            <div className="flex items-center justify-center gap-1 text-sm font-bold text-purple-600">
                                {row.combo_count > 0 && <Zap className="w-3 h-3" />}
                                {row.combo_count}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminScores;
