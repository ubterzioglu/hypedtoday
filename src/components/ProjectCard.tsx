import { motion } from "framer-motion";
import { Project } from "@/types";

interface ProjectCardProps {
    project: Project;
    index: number;
}

const bgColors = [
    'bg-primary',
    'bg-secondary',
    'bg-tertiary',
    'bg-accent',
    'bg-highlight',
];

const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.4,
                delay: index * 0.05,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            whileHover={{
                scale: 1.02,
                y: -4,
                transition: { duration: 0.2 },
            }}
            className="group relative bg-card border-4 border-foreground hover:shadow-brutal transition-all cursor-pointer"
        >
            <div className="aspect-video bg-muted border-b-4 border-foreground relative overflow-hidden group">
                {project.image_url ? (
                    <img
                        src={project.image_url}
                        alt={project.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className={`w-full h-full ${bgColors[index % bgColors.length]} flex items-center justify-center`}>
                        <span className="text-4xl font-black text-foreground/20 uppercase tracking-tighter">
                            {project.country === 'TR' ? 'TR' : 'GL'}
                        </span>
                    </div>
                )}

                {/* Country Badge */}
                <div className="absolute top-2 right-2 px-2 py-1 bg-background border-2 border-foreground text-xs font-bold uppercase">
                    {project.country === 'TR' ? '🇹🇷 Turkey' : '🌍 Global'}
                </div>
            </div>

            <div className="p-6">
                {/* Project Name */}
                <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {project.name}
                </h3>

                {/* Decorative corner accent */}
                <div className="absolute top-2 right-2 w-3 h-3 bg-primary" />
            </div>
        </motion.div>
    );
};

export default ProjectCard;
