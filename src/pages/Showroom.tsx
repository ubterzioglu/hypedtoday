import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getProjects } from "@/data/mockData";
import { Project, Country } from "@/types";
import ProjectCard from "@/components/ProjectCard";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { BrutalButton } from "@/components/ui/brutal-button";

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
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b-4 border-foreground bg-card sticky top-0 z-50">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <Link to="/">
                            <BrutalButton variant="primary" size="default">
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Home
                            </BrutalButton>
                        </Link>

                        <h1 className="text-3xl md:text-5xl font-bold text-center">
                            <span className="text-gradient-hero">Project Showroom</span>
                        </h1>

                        <div className="w-32" /> {/* Spacer for centering */}
                    </div>
                </div>
            </header>

            {/* Filter Tabs */}
            <div className="border-b-4 border-foreground bg-card">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex gap-3 justify-center">
                        <BrutalButton
                            variant={filter === 'ALL' ? 'accent' : 'primary'}
                            size="default"
                            onClick={() => setFilter('ALL')}
                            className="min-w-[120px]"
                        >
                            🌍 All Projects
                        </BrutalButton>
                        <BrutalButton
                            variant={filter === 'TR' ? 'accent' : 'secondary'}
                            size="default"
                            onClick={() => setFilter('TR')}
                            className="min-w-[120px]"
                        >
                            🇹🇷 Turkey
                        </BrutalButton>
                        <BrutalButton
                            variant={filter === 'OTHER' ? 'accent' : 'tertiary'}
                            size="default"
                            onClick={() => setFilter('OTHER')}
                            className="min-w-[120px]"
                        >
                            🌐 Other Countries
                        </BrutalButton>
                    </div>
                </div>
            </div>

            {/* Projects Grid */}
            <main className="container mx-auto px-4 py-12">
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
                    <div className="text-center py-20">
                        <p className="text-muted-foreground text-xl mb-4">
                            No projects found{filter !== 'ALL' && ` in ${filter === 'TR' ? 'Turkey' : 'Other Countries'}`}. Be the first to add one!
                        </p>
                        <Link to="/add-project">
                            <BrutalButton variant="primary">Add Project</BrutalButton>
                        </Link>
                    </div>
                ) : (
                    <>
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center text-muted-foreground mb-8"
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
        </div>
    );
};

export default Showroom;
