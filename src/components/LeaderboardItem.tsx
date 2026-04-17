import { LeaderboardEntry } from "@/types";
import { motion } from "framer-motion";
import { Trophy, Medal, Star, Zap } from "lucide-react";

interface LeaderboardItemProps {
    entry: LeaderboardEntry;
    rank: number;
}

const LeaderboardItem = ({ entry, rank }: LeaderboardItemProps) => {
    const getRankStyle = (r: number) => {
        if (r === 1) return "bg-yellow-400 border-yellow-600 text-yellow-900";
        if (r === 2) return "bg-gray-300 border-gray-500 text-gray-800";
        if (r === 3) return "bg-orange-300 border-orange-600 text-orange-900";
        return "bg-card border-foreground text-foreground";
    };

    const getRankIcon = (r: number) => {
        if (r === 1) return <Trophy className="w-8 h-8 text-yellow-800" fill="currentColor" />;
        if (r === 2) return <Medal className="w-8 h-8 text-gray-700" />;
        if (r === 3) return <Medal className="w-8 h-8 text-orange-800" />;
        return <span className="text-2xl font-black font-display">#{r}</span>;
    };

    const displayName = entry.display_name ?? 'Anonymous';
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(rank * 0.05, 0.5) }}
            className={`
                relative flex items-center gap-4 p-4 border-b-4 border-foreground
                ${getRankStyle(rank)}
                transition-transform hover:scale-[1.01]
            `}
        >
            <div className="flex-shrink-0 w-12 flex justify-center">
                {getRankIcon(rank)}
            </div>

            <div className="w-12 h-12 border-2 border-foreground overflow-hidden flex-shrink-0 rounded-full bg-secondary flex items-center justify-center">
                {entry.avatar_url ? (
                    <img src={entry.avatar_url} alt={displayName} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                ) : (
                    <span className="font-black text-sm">{initial}</span>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{displayName}</h3>
                <p className="text-xs opacity-70 font-medium">
                    {entry.event_count} supports
                    {entry.combo_count > 0 && (
                        <span className="ml-2 inline-flex items-center gap-0.5">
                            <Zap className="w-3 h-3" />{entry.combo_count} combos
                        </span>
                    )}
                </p>
            </div>

            <div className="flex flex-col items-end flex-shrink-0">
                <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="text-3xl font-black font-display tracking-tighter">
                        {entry.total_points}
                    </span>
                </div>
                <div className="text-xs font-bold opacity-70">pts</div>
            </div>
        </motion.div>
    );
};

export default LeaderboardItem;
