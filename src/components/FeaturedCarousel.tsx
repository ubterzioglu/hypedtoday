import { useEffect, useState } from "react";
import { getProjects } from "@/data/mockData";
import { Project } from "@/types";
import { motion } from "framer-motion";

const FeaturedCarousel = () => {
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        const fetchProjects = async () => {
            const data = await getProjects();
            // Get top 10 projects or just the first 10 for now
            setProjects(data.slice(0, 10));
        };
        fetchProjects();
    }, []);

    if (projects.length === 0) return null;

    // Duplicate projects for seamless infinite scroll
    const carouselItems = [...projects, ...projects, ...projects];

    return (
        <div className="w-full overflow-hidden bg-black border-t-4 border-b-4 border-foreground py-3">
            <motion.div
                className="flex gap-8 w-max"
                animate={{ x: ["0%", "-33.33%"] }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 30, // Adjust speed here (higher = slower)
                }}
            >
                {carouselItems.map((project, index) => (
                    <div
                        key={`${project.id}-${index}`}
                        className="flex items-center gap-3 bg-card border-2 border-foreground px-4 py-2 min-w-[200px] max-w-[300px] hover:bg-muted transition-colors select-none"
                    >
                        {/* Image / Placeholder */}
                        <div className="w-10 h-10 border-2 border-foreground overflow-hidden flex-shrink-0 bg-secondary flex items-center justify-center">
                            {project.image_url ? (
                                <img src={project.image_url} alt={project.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-black text-xs">{project.country === 'TR' ? 'TR' : 'GL'}</span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex flex-col overflow-hidden">
                            <span className="font-bold text-sm truncate uppercase text-foreground leading-tight">
                                {project.name}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground truncate">
                                {project.motto || "No motto"}
                            </span>
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default FeaturedCarousel;
