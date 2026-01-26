import { useEffect, useState } from "react";
import { getLeaderboard, LeaderboardEntry } from "@/data/mockData";
import LeaderboardItem from "@/components/LeaderboardItem";
import { BrutalButton } from "@/components/ui/brutal-button";
import { ArrowLeft, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import HeroBackground from "@/components/HeroBackground";

const Leaderboard = () => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchParams() {
            setLoading(true);
            try {
                const data = await getLeaderboard();
                setEntries(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchParams();
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-black">
            <HeroBackground type="image" imageSrc="/assets/hero-bg.jpg" overlayOpacity={0.9} />

            <div className="relative z-10 container mx-auto px-4 py-10 max-w-4xl">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-display font-black uppercase text-primary drop-shadow-lg flex items-center gap-4">
                            <Trophy className="w-12 h-12 md:w-20 md:h-20" />
                            Leaderboard
                        </h1>
                        <p className="text-muted-foreground font-medium text-lg mt-2">
                            Top vibe creators ranked by valid community votes.
                        </p>
                    </div>

                    <Link to="/">
                        <BrutalButton variant="secondary" size="lg">
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back
                        </BrutalButton>
                    </Link>
                </div>

                {/* List */}
                <div className="bg-card border-4 border-foreground shadow-brutal-lg overflow-hidden">
                    <div className="max-h-[800px] overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="p-10 text-center font-bold text-xl anim-pulse">
                                Calculating vibes...
                            </div>
                        ) : entries.length === 0 ? (
                            <div className="p-10 text-center font-bold text-xl">
                                No votes yet! Be the first to vote.
                            </div>
                        ) : (
                            entries.map((entry, index) => (
                                <LeaderboardItem
                                    key={entry.project_id}
                                    entry={entry}
                                    rank={index + 1}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
