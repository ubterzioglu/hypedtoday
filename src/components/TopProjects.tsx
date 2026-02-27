import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getLeaderboard, LeaderboardEntry } from "@/data/mockData";
import { Trophy, Medal, Award, Star } from "lucide-react";
import { Link } from "react-router-dom";

const rankIcons = [
  { icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-400/20" },
  { icon: Medal, color: "text-gray-300", bg: "bg-gray-300/20" },
  { icon: Award, color: "text-amber-600", bg: "bg-amber-600/20" },
];

const TopProjects = () => {
  const [projects, setProjects] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopProjects();
  }, []);

  const loadTopProjects = async () => {
    try {
      const data = await getLeaderboard();
      setProjects(data.slice(0, 3)); // Top 3
    } catch (error) {
      console.error("Failed to load top projects:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-40 bg-muted border-4 border-foreground animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-8 bg-muted border-4 border-foreground">
        <p className="text-muted-foreground font-bold">
          No ranked projects yet. Be the first to vote!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {projects.map((project, index) => {
        const rankConfig = rankIcons[index] || {
          icon: Star,
          color: "text-primary",
          bg: "bg-primary/20",
        };
        const RankIcon = rankConfig.icon;

        return (
          <motion.div
            key={project.project_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={`/project/${project.project_id}/comments`}>
              <div className="bg-card border-4 border-foreground p-4 hover:shadow-brutal-lg transition-shadow cursor-pointer group">
                {/* Rank Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`flex items-center gap-2 px-3 py-1 ${rankConfig.bg} border-2 border-foreground`}
                  >
                    <RankIcon className={`w-5 h-5 ${rankConfig.color}`} />
                    <span className="font-black text-lg">#{index + 1}</span>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">
                    {project.vote_count} votes
                  </span>
                </div>

                {/* Project Info */}
                <h3 className="font-bold text-lg mb-1 truncate group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                {project.motto && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {project.motto}
                  </p>
                )}

                {/* Country Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-1 border-2 border-foreground ${
                      project.country === "TR"
                        ? "bg-[#ff4d4d] text-white"
                        : "bg-[#00f3ff] text-black"
                    }`}
                  >
                    {project.country === "TR" ? "🔴 Turkey" : "🌐 Global"}
                  </span>

                  {/* Score */}
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Score</span>
                    <span className="block font-black text-primary">
                      {project.total_score.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
};

export default TopProjects;
