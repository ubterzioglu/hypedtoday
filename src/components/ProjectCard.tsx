import { useState, useRef, useCallback } from "react";
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
    { id: 'ui_score', label: 'Visual Appeal' },
    { id: 'ux_score', label: 'Usability' },
    { id: 'stability_score', label: 'Reliability' },
    { id: 'innovation_score', label: 'Innovation' },
    { id: 'doc_score', label: 'Clarity' },
];

const SCORE_ROWS = [
    [1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10],
];

const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [scores, setScores] = useState<Record<string, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const descriptionRef = useRef<HTMLDivElement>(null);

    const scrollDescription = (direction: 'up' | 'down', e: React.MouseEvent) => {
        e.stopPropagation();
        if (descriptionRef.current) {
            descriptionRef.current.scrollBy({
                top: direction === 'down' ? 40 : -40,
                behavior: 'smooth'
            });
        }
    };

    const handleFlip = useCallback(() => {
        if (!isSubmitting) setIsFlipped(prev => !prev);
    }, [isSubmitting]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleFlip();
        }
    }, [handleFlip]);

    const handleScore = (category: string, score: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setScores(prev => ({ ...prev, [category]: score }));
    };

    const handlePreset = (score: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const newScores: Record<string, number> = {};
        CATEGORIES.forEach(cat => { newScores[cat.id] = score; });
        setScores(newScores);
    };

    const handleSubmit = async (e: React.MouseEvent) => {
        e.stopPropagation();

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
            setIsFlipped(false);
            setScores({});
        } catch {
            toast.error("Failed to submit vote");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className={`flip-card ${isFlipped ? 'is-flipped' : ''}`}
            onClick={handleFlip}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-expanded={isFlipped}
            aria-label={`${project.name} - tap to ${isFlipped ? 'view details' : 'vote'}`}
        >
            <div className="flip-inner">
                {/* FRONT FACE */}
                <div className="flip-front bg-card border-4 border-foreground flex flex-col overflow-hidden">
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
                    </div>

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
                <div className="flip-back bg-card border-4 border-primary flex flex-col overflow-hidden">
                    <div className="bg-primary p-3 border-b-4 border-foreground flex justify-between items-center">
                        <h3 className="font-bold text-primary-foreground uppercase tracking-wide text-sm">Vote: {project.name}</h3>
                        <RotateCw className="w-4 h-4 text-primary-foreground opacity-50" />
                    </div>

                    <div className="p-3 flex-1 overflow-y-auto no-scrollbar space-y-3">
                        {/* Preset buttons */}
                        <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                            {[7, 8, 9, 10].map(presetScore => (
                                <button
                                    key={presetScore}
                                    onClick={(e) => handlePreset(presetScore, e)}
                                    className="flex-1 py-1.5 text-[10px] font-bold uppercase bg-muted hover:bg-primary hover:text-primary-foreground border-2 border-foreground transition-all"
                                >
                                    All {presetScore}
                                </button>
                            ))}
                        </div>

                        {/* Categories */}
                        <div className="space-y-2.5">
                            {CATEGORIES.map(cat => (
                                <div key={cat.id} onClick={e => e.stopPropagation()}>
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground">{cat.label}</span>
                                        <span className="text-[10px] font-bold text-primary">{scores[cat.id] || '-'}</span>
                                    </div>
                                    <div className="grid grid-cols-5 gap-1">
                                        {SCORE_ROWS.flat().map(num => (
                                            <button
                                                key={num}
                                                onClick={(e) => handleScore(cat.id, num, e)}
                                                className={`
                                                    h-7 text-[11px] font-bold border border-foreground/50 transition-all
                                                    ${scores[cat.id] === num
                                                        ? 'bg-primary text-primary-foreground border-primary scale-105'
                                                        : 'bg-background hover:bg-muted text-muted-foreground hover:border-foreground'
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

                    <div className="p-3 border-t-4 border-foreground bg-muted" onClick={e => e.stopPropagation()}>
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
            </div>
        </div>
    );
};

export default ProjectCard;
