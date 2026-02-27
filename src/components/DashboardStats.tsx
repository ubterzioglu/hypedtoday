import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Rocket, Trophy, Users, Vote } from "lucide-react";
import { getProjects, getLeaderboard } from "@/data/mockData";

interface Stats {
  totalProjects: number;
  totalVotes: number;
  topProjects: number;
  trProjects: number;
  globalProjects: number;
}

const DashboardStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    totalVotes: 0,
    topProjects: 0,
    trProjects: 0,
    globalProjects: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [projects, leaderboard] = await Promise.all([
        getProjects(),
        getLeaderboard(),
      ]);

      const totalVotes = leaderboard.reduce((sum, entry) => sum + entry.vote_count, 0);
      const trProjects = projects.filter((p) => p.country === "TR").length;

      setStats({
        totalProjects: projects.length,
        totalVotes,
        topProjects: leaderboard.length,
        trProjects,
        globalProjects: projects.length - trProjects,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: Rocket,
      label: "Total Projects",
      value: stats.totalProjects,
      color: "bg-primary",
      textColor: "text-primary-foreground",
    },
    {
      icon: Vote,
      label: "Total Votes",
      value: stats.totalVotes,
      color: "bg-secondary",
      textColor: "text-secondary-foreground",
    },
    {
      icon: Trophy,
      label: "Ranked Projects",
      value: stats.topProjects,
      color: "bg-accent",
      textColor: "text-accent-foreground",
    },
    {
      icon: Users,
      label: "TR / Global",
      value: `${stats.trProjects} / ${stats.globalProjects}`,
      color: "bg-tertiary",
      textColor: "text-tertiary-foreground",
      sublabel: "Projects",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 bg-muted border-2 border-foreground animate-pulse"
          />
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
            <span className={`text-2xl font-black ${stat.textColor}`}>
              {stat.value}
            </span>
          </div>
          <p className={`text-xs font-bold uppercase ${stat.textColor} opacity-80`}>
            {stat.label}
          </p>
          {stat.sublabel && (
            <p className={`text-[10px] ${stat.textColor} opacity-60`}>
              {stat.sublabel}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardStats;
