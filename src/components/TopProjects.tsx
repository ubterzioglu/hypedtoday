import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { LeaderboardEntry } from "@/types";
import { Trophy, Medal, Award, Star, Zap } from "lucide-react";

const rankIcons = [
    { icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-400/20" },
    { icon: Medal, color: "text-gray-300", bg: "bg-gray-300/20" },
    { icon: Award, color: "text-amber-600", bg: "bg-amber-600/20" },
];

const TopProjects = () => {
    const [supporters, setSupporters] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await supabase
                    .from('public_leaderboard')
                    .select('*')
                    .gt('total_points', 0)
                    .limit(3);
                setSupporters(data || []);
            } catch (error) {
                console.error("Failed to load top supporters:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-40 bg-muted border-4 border-foreground animate-pulse" />
                ))}
            </div>
        );
    }

    if (supporters.length === 0) {
        return (
            <div className="text-center py-8 bg-muted border-4 border-foreground">
                <p className="text-muted-foreground font-bold">
                    No supporters yet. Be the first to earn points!
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {supporters.map((supporter, index) => {
                const rankConfig = rankIcons[index] ?? { icon: Star, color: "text-primary", bg: "bg-primary/20" };
                const RankIcon = rankConfig.icon;
                const displayName = supporter.display_name ?? 'Anonymous';
                const initial = displayName.charAt(0).toUpperCase();

                return (
                    <motion.div
                        key={supporter.user_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-card border-4 border-foreground p-4 shadow-brutal"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`flex items-center gap-2 px-3 py-1 ${rankConfig.bg} border-2 border-foreground`}>
                                <RankIcon className={`w-5 h-5 ${rankConfig.color}`} />
                                <span className="font-black text-lg">#{index + 1}</span>
                            </div>
                            <span className="text-xs font-bold text-muted-foreground">
                                {supporter.event_count} supports
                            </span>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                            {supporter.avatar_url ? (
                                <img src={supporter.avatar_url} alt={displayName} className="w-10 h-10 rounded-full border-2 border-foreground" loading="lazy" decoding="async" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-secondary border-2 border-foreground flex items-center justify-center font-black">
                                    {initial}
                                </div>
                            )}
                            <h3 className="font-bold text-lg truncate">{displayName}</h3>
                        </div>

                        <div className="flex items-center justify-between">
                            {supporter.combo_count > 0 && (
                                <span className="flex items-center gap-1 text-xs font-bold text-purple-600">
                                    <Zap className="w-3 h-3" /> {supporter.combo_count} combos
                                </span>
                            )}
                            <div className="ml-auto text-right">
                                <span className="text-xs text-muted-foreground">Points</span>
                                <span className="block font-black text-primary text-xl">{supporter.total_points}</span>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default TopProjects;
