import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getProjects } from "@/data/mockData";
import { Project, Country } from "@/types";
import ProjectCard from "@/components/ProjectCard";
import { Loader2, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { BrutalButton } from "@/components/ui/brutal-button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type FilterType = 'ALL' | Country;

const Showroom = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterType>('ALL');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const data = await getProjects();
            setProjects(data);
        } catch (err) {
            console.error('Failed to load projects:', err);
            setError('Failed to load projects. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = filter === 'ALL'
        ? projects
        : projects.filter(p => p.country === filter);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            {/* Page Header */}
            <div className="bg-card border-b-4 border-foreground">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-secondary border-4 border-foreground flex items-center justify-center">
                            <Compass className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black">Project Showroom</h1>
                            <p className="text-muted-foreground">
                                Discover and vote on amazing projects
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="border-b-4 border-foreground bg-muted">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-wrap justify-center gap-2">
                        {(['ALL', 'TR', 'OTHER'] as FilterType[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-2 font-bold text-sm uppercase border-4 transition-all ${
                                    filter === f
                                        ? f === 'TR'
                                            ? 'bg-[#ff4d4d] text-white border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                            : f === 'OTHER'
                                            ? 'bg-[#00f3ff] text-black border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                            : 'bg-primary text-primary-foreground border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                        : 'bg-card border-transparent hover:border-foreground'
                                }`}
                            >
                                {f === 'ALL' && '🌍 All Projects'}
                                {f === 'TR' && '🔴 Turkey'}
                                {f === 'OTHER' && '🌐 Global'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Projects Grid */}
            <main className="flex-1 container mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-destructive text-xl mb-4">{error}</p>
                        <BrutalButton onClick={loadProjects} variant="primary">
                            Try Again
                        </BrutalButton>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="text-center py-20 bg-card border-4 border-foreground">
                        <p className="text-muted-foreground text-xl mb-4">
                            No projects found{filter !== 'ALL' && ` in ${filter === 'TR' ? 'Turkey' : 'Other Countries'}`}.
                        </p>
                        <Link to="/add-project">
                            <BrutalButton variant="primary">Add First Project</BrutalButton>
                        </Link>
                    </div>
                ) : (
                    <>
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center text-muted-foreground mb-6"
                        >
                            Showing <span className="text-primary font-bold">{filteredProjects.length}</span> project{filteredProjects.length !== 1 && 's'}
                            {filter !== 'ALL' && (
                                <span> in <span className="text-secondary font-bold">{filter === 'TR' ? 'Turkey' : 'Other Countries'}</span></span>
                            )}
                        </motion.p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map((project, index) => (
                                <ProjectCard key={project.id} project={project} index={index} />
                            ))}
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Showroom;
