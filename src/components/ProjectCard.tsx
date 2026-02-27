import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Project } from "@/types";
import { ExternalLink, Linkedin, RotateCw, CheckCheck, Loader2, MessageSquare, ChevronUp, ChevronDown } from "lucide-react";
import { BrutalButton } from "./ui/brutal-button";
import { submitVote } from "@/data/mockData";
import { toast } from "sonner";

const bgColors = [
    'bg-primary',
    'bg-secondary',
    'bg-tertiary',
    'bg-accent',
    'bg-highlight',
];

const CATEGORIES = [
    { id: 'ui_score', label: 'Visual Appeal & Aesthetics' },
    { id: 'ux_score', label: 'Usability & User Flow' },
    { id: 'stability_score', label: 'Performance & Reliability' },
    { id: 'innovation_score', label: 'Originality & Innovation' },
    { id: 'doc_score', label: 'Documentation & Clarity' },
];

const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [scores, setScores] = useState<Record<string, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const descriptionRef = useRef<HTMLDivElement>(null);

    const scrollDescription = (direction: 'up' | 'down', e: React.MouseEvent) => {
        e.stopPropagation();
        if (descriptionRef.current) {
            const scrollAmount = 40;
            descriptionRef.current.scrollBy({
                top: direction === 'down' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleFlip = () => {
        if (!isSubmitting) setIsFlipped(!isFlipped);
    };

    const handleScore = (category: string, score: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setScores(prev => ({ ...prev, [category]: score }));
    };

    const handlePreset = (score: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const newScores: Record<string, number> = {};
        CATEGORIES.forEach(cat => newScores[cat.id] = score);
        setScores(newScores);
    };

    const handleSubmit = async (e: React.MouseEvent) => {
        e.stopPropagation();

        // Validation
        const missing = CATEGORIES.some(cat => !scores[cat.id]);
        if (missing) {
            toast.error("Please rate all 5 categories!");
            return;
        }

        try {
            setIsSubmitting(true);
            await submitVote({
                project_id: project.id,
                ui_score: scores['ui_score'],
                ux_score: scores['ux_score'],
                stability_score: scores['stability_score'],
                innovation_score: scores['innovation_score'],
                doc_score: scores['doc_score']
            });
            toast.success("Vote submitted! 🎉");
            setIsFlipped(false); // Flip back
            setScores({}); // Reset
        } catch (error) {
            toast.error("Failed to submit vote");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="h-[420px] w-full perspective-1000 cursor-pointer group"
            onClick={handleFlip}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                className="relative w-full h-full transform-style-3d"
            >
                {/* FRONT FACE (Summary) */}
                <div className="absolute inset-0 backface-hidden bg-card border-4 border-foreground flex flex-col overflow-hidden">
                    {/* Image Section */}
                    <div className="h-48 bg-muted border-b-4 border-foreground relative overflow-hidden">
                        {project.image_url ? (
                            <img
                                src={project.image_url}
                                alt={project.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className={`w-full h-full ${bgColors[index % bgColors.length]} flex items-center justify-center`}>
                                <span className="text-4xl font-black text-foreground/20 uppercase tracking-tighter">
                                    {project.country === 'TR' ? 'TR' : 'GL'}
                                </span>
                            </div>
                        )}

                        {project.image_url ? (
                            <img
                                src={project.image_url}
                                alt={project.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className={`w-full h-full ${bgColors[index % bgColors.length]} flex items-center justify-center`}>
                                <span className="text-4xl font-black text-foreground/20 uppercase tracking-tighter">
                                    {project.country === 'TR' ? 'TR' : 'GL'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="p-4 flex-1 flex flex-col">
                        <div className="mb-2 flex justify-between items-start gap-2">
                            <div className="min-w-0 flex-1">
                                <h3 className="text-xl font-bold text-foreground leading-tight mb-0.5 truncate">
                                    {project.name}
                                </h3>
                                {project.motto && (
                                    <p className="text-[11px] font-bold text-secondary uppercase tracking-tight line-clamp-2 leading-tight">
                                        {project.motto}
                                    </p>
                                )}
                            </div>
                            {/* Country Badge */}
                            <div className="px-2 py-1 bg-background border-2 border-foreground text-[10px] font-bold uppercase shrink-0">
                                {project.country === 'TR' ? '🔴 Turkey' : '🌍 Global'}
                            </div>
                        </div>

                        {project.description && (
                            <div className="relative flex-1 min-h-0 mb-3 group/desc">
                                <div
                                    ref={descriptionRef}
                                    className="description-scroll h-full max-h-[72px] overflow-y-auto custom-scrollbar pr-1"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <p className="text-muted-foreground text-xs leading-relaxed">
                                        {project.description}
                                    </p>
                                </div>
                                {/* Scroll arrows */}
                                <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-center gap-0.5 opacity-0 group-hover/desc:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => scrollDescription('up', e)}
                                        className="p-0.5 rounded bg-muted/80 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <ChevronUp className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={(e) => scrollDescription('down', e)}
                                        className="p-0.5 rounded bg-muted/80 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <ChevronDown className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="description-fade absolute bottom-0 left-0 right-6 h-4 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                            </div>
                        )}

                        <div className="flex items-center gap-3 pt-4 border-t-2 border-muted mt-auto" onClick={e => e.stopPropagation()}>
                            {project.project_url && (
                                <a
                                    href={project.project_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-sm font-bold hover:text-primary transition-colors hover:underline"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Visit
                                </a>
                            )}

                            {!project.is_anonymous && project.linkedin_url && (
                                <a
                                    href={project.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-sm font-bold hover:text-primary transition-colors hover:underline text-muted-foreground"
                                >
                                    <Linkedin className="w-4 h-4" />
                                    Creator
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Actions - Comments & Flip Hint */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-2 z-20">
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/project/${project.id}/comments`;
                            }}
                            className="px-2 py-1 bg-black/50 hover:bg-black/70 text-white text-xs font-bold rounded flex items-center gap-1 backdrop-blur-sm cursor-pointer transition-colors"
                        >
                            <MessageSquare className="w-3 h-3" /> Comments
                        </div>

                        <div className="px-2 py-1 bg-black/50 text-white text-xs font-bold rounded flex items-center gap-1 backdrop-blur-sm">
                            <RotateCw className="w-3 h-3" /> Tap to Vote
                        </div>
                    </div>
                </div>

                {/* BACK FACE (Voting) */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-card border-4 border-primary flex flex-col overflow-hidden">
                    <div className="bg-primary p-3 border-b-4 border-foreground flex justify-between items-center">
                        <h3 className="font-bold text-primary-foreground uppercase tracking-wide">Vote Project</h3>
                        <RotateCw className="w-4 h-4 text-primary-foreground opacity-50" />
                    </div>


                    <div className="p-4 flex-1 overflow-y-auto no-scrollbar space-y-4">
                        {/* Categories */}
                        <div className="space-y-3">
                            {CATEGORIES.map(cat => (
                                <div key={cat.id}>
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-xs font-black uppercase text-muted-foreground">{cat.label}</span>
                                        <span className="text-xs font-bold text-primary">{scores[cat.id] || '-'}</span>
                                    </div>
                                    <div className="grid grid-cols-7 gap-0.5">
                                        {[1, 2, 3, 4, 5, 6, 7].map(num => (
                                            <button
                                                key={num}
                                                onClick={(e) => handleScore(cat.id, num, e)}
                                                className={`
                                                    h-6 text-[10px] font-bold border border-foreground transition-all
                                                    ${scores[cat.id] === num
                                                        ? 'bg-primary text-primary-foreground transform scale-110 z-10 border-2'
                                                        : 'bg-background hover:bg-muted text-muted-foreground'
                                                    }
                                                `}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 border-t-4 border-foreground bg-muted">
                        <BrutalButton
                            onClick={handleSubmit}
                            variant="primary"
                            className="w-full py-2"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCheck className="w-4 h-4 mr-2" />}
                            Submit Vote
                        </BrutalButton>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProjectCard;
