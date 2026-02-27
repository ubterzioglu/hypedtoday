import { LeaderboardEntry } from "@/data/mockData";
import { motion } from "framer-motion";
import { Trophy, Medal, Star, ExternalLink } from "lucide-react";

interface LeaderboardItemProps {
    entry: LeaderboardEntry;
    rank: number;
}

const LeaderboardItem = ({ entry, rank }: LeaderboardItemProps) => {
    // Rank styling
    const getRankStyle = (r: number) => {
        if (r === 1) return "bg-yellow-400 border-yellow-600 text-yellow-900"; // Gold
        if (r === 2) return "bg-gray-300 border-gray-500 text-gray-800";       // Silver
        if (r === 3) return "bg-orange-300 border-orange-600 text-orange-900"; // Bronze
        return "bg-card border-foreground text-foreground";                     // Others
    };

    const getRankIcon = (r: number) => {
        if (r === 1) return <Trophy className="w-8 h-8 text-yellow-800" fill="currentColor" />;
        if (r === 2) return <Medal className="w-8 h-8 text-gray-700" />;
        if (r === 3) return <Medal className="w-8 h-8 text-orange-800" />;
        return <span className="text-2xl font-black font-display">#{r}</span>;
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: rank * 0.1 }}
            className={`
                relative flex items-center gap-4 p-4 border-b-4 border-foreground 
                ${getRankStyle(rank)} 
                transition-transform hover:scale-[1.01]
            `}
        >
            {/* Rank */}
            <div className="flex-shrink-0 w-12 flex justify-center">
                {getRankIcon(rank)}
            </div>

            {/* Image (Small) */}
            <div className="w-16 h-16 bg-muted border-2 border-foreground overflow-hidden flex-shrink-0">
                {entry.image_url ? (
                    <img src={entry.image_url} alt={entry.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-background text-foreground font-bold text-xs">
                        {entry.country}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate flex items-center gap-2">
                    {entry.name}
                    {entry.country === 'TR' && <span className="text-sm">🔴</span>}
                </h3>
                {entry.motto && (
                    <p className="text-sm opacity-80 truncate font-medium">{entry.motto}</p>
                )}
            </div>

            {/* Score */}
            <div className="flex flex-col items-end flex-shrink-0">
                <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="text-3xl font-black font-display tracking-tighter">
                        {entry.total_score}
                    </span>
                </div>
                <div className="text-xs font-bold opacity-70">
                    {entry.vote_count} votes
                </div>
            </div>
        </motion.div>
    );
};

export default LeaderboardItem;
