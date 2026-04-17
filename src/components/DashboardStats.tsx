import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Linkedin, Trophy, Users, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";

interface Stats {
    totalPosts: number;
    totalSupporters: number;
    totalApprovedClaims: number;
    totalPoints: number;
}

const DashboardStats = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState<Stats>({
        totalPosts: 0,
        totalSupporters: 0,
        totalApprovedClaims: 0,
        totalPoints: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [postsRes, leaderboardRes] = await Promise.all([
                    supabase.from('public_posts').select('id', { count: 'exact', head: true }),
                    supabase.from('public_leaderboard').select('total_points, event_count'),
                ]);

                const leaderboard = leaderboardRes.data || [];
                const totalPoints = leaderboard.reduce((sum, r) => sum + (r.total_points ?? 0), 0);
                const totalClaims = leaderboard.reduce((sum, r) => sum + (r.event_count ?? 0), 0);

                setStats({
                    totalPosts: postsRes.count ?? 0,
                    totalSupporters: leaderboard.filter(r => r.event_count > 0).length,
                    totalApprovedClaims: totalClaims,
                    totalPoints,
                });
            } catch (error) {
                console.error("Failed to load stats:", error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    const statCards = [
        { icon: Linkedin, label: t("stats.activePosts"), value: stats.totalPosts, color: "bg-primary", textColor: "text-primary-foreground" },
        { icon: Users, label: t("stats.supporters"), value: stats.totalSupporters, color: "bg-secondary", textColor: "text-secondary-foreground" },
        { icon: Trophy, label: t("stats.approvedSupports"), value: stats.totalApprovedClaims, color: "bg-accent", textColor: "text-accent-foreground" },
        { icon: Zap, label: t("stats.totalPoints"), value: stats.totalPoints, color: "bg-tertiary", textColor: "text-tertiary-foreground" },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-muted border-2 border-foreground animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`${stat.color} border-4 border-foreground p-4 shadow-brutal`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                        <span className={`text-2xl font-black ${stat.textColor}`}>{stat.value}</span>
                    </div>
                    <p className={`text-xs font-bold uppercase ${stat.textColor} opacity-80`}>{stat.label}</p>
                </motion.div>
            ))}
        </div>
    );
};

export default DashboardStats;
