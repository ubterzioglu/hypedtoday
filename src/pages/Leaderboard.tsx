import { useEffect, useState } from "react";
import { getLeaderboard, LeaderboardEntry } from "@/data/mockData";
import LeaderboardItem from "@/components/LeaderboardItem";
import { Trophy, Medal } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            {/* Page Header */}
            <div className="bg-gradient-to-r from-accent/20 via-primary/20 to-secondary/20 border-b-4 border-foreground">
                <div className="container mx-auto px-4 py-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-accent border-4 border-foreground flex items-center justify-center">
                            <Trophy className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black uppercase">
                                Leaderboard
                            </h1>
                            <p className="text-muted-foreground font-medium text-lg">
                                Top projects ranked by community votes
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leaderboard Content */}
            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                {/* Top 3 Podium */}
                {!loading && entries.length >= 3 && (
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {/* 2nd Place */}
                        <div className="flex flex-col items-center justify-end">
                            <div className="w-full bg-gray-300 border-4 border-foreground p-4 text-center">
                                <Medal className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                                <p className="font-bold text-sm truncate">{entries[1].name}</p>
                                <p className="text-xs text-muted-foreground">{entries[1].total_score.toFixed(1)}</p>
                            </div>
                            <div className="w-full h-24 bg-gray-300/50 border-x-4 border-b-4 border-foreground flex items-center justify-center font-black text-2xl">
                                2
                            </div>
                        </div>

                        {/* 1st Place */}
                        <div className="flex flex-col items-center justify-end -mt-4">
                            <div className="w-full bg-yellow-400 border-4 border-foreground p-4 text-center shadow-brutal">
                                <Trophy className="w-10 h-10 mx-auto mb-2 text-yellow-700" />
                                <p className="font-bold truncate">{entries[0].name}</p>
                                <p className="text-xs font-bold">{entries[0].total_score.toFixed(1)} pts</p>
                            </div>
                            <div className="w-full h-32 bg-yellow-400/50 border-x-4 border-b-4 border-foreground flex items-center justify-center font-black text-3xl">
                                1
                            </div>
                        </div>

                        {/* 3rd Place */}
                        <div className="flex flex-col items-center justify-end">
                            <div className="w-full bg-amber-600 border-4 border-foreground p-4 text-center text-white">
                                <Medal className="w-8 h-8 mx-auto mb-2" />
                                <p className="font-bold text-sm truncate">{entries[2].name}</p>
                                <p className="text-xs opacity-80">{entries[2].total_score.toFixed(1)}</p>
                            </div>
                            <div className="w-full h-16 bg-amber-600/50 border-x-4 border-b-4 border-foreground flex items-center justify-center font-black text-2xl">
                                3
                            </div>
                        </div>
                    </div>
                )}

                {/* Full List */}
                <div className="bg-card border-4 border-foreground shadow-brutal overflow-hidden">
                    <div className="bg-primary border-b-4 border-foreground px-4 py-3 flex items-center justify-between">
                        <span className="font-bold text-primary-foreground">Rank</span>
                        <span className="font-bold text-primary-foreground flex-1 text-center">Project</span>
                        <span className="font-bold text-primary-foreground">Score</span>
                    </div>
                    <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="p-10 text-center font-bold text-xl animate-pulse">
                                Calculating rankings...
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
            </main>

            <Footer />
        </div>
    );
};

export default Leaderboard;
