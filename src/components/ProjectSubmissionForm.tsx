import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { BrutalButton } from "@/components/ui/brutal-button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Linkedin, ThumbsUp, MessageSquare, Repeat2 } from "lucide-react";

const postSchema = z.object({
    linkedin_url: z
        .string()
        .url("Must be a valid URL")
        .refine(u => u.includes("linkedin.com"), "Must be a LinkedIn URL"),
    title: z.string().max(200).optional().or(z.literal("")),
    description: z.string().max(1000).optional().or(z.literal("")),
    requested_like: z.boolean(),
    requested_comment: z.boolean(),
    requested_repost: z.boolean(),
}).refine(
    d => d.requested_like || d.requested_comment || d.requested_repost,
    { message: "Select at least one task type", path: ["requested_like"] }
);

type PostFormData = z.infer<typeof postSchema>;

const TASKS = [
    { key: "requested_like" as const, label: "Like", icon: ThumbsUp, desc: "Supporters will like this post" },
    { key: "requested_comment" as const, label: "Comment", icon: MessageSquare, desc: "Supporters will leave a comment" },
    { key: "requested_repost" as const, label: "Repost", icon: Repeat2, desc: "Supporters will repost it" },
];

const ProjectSubmissionForm = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        reset,
    } = useForm<PostFormData>({
        resolver: zodResolver(postSchema),
        defaultValues: {
            requested_like: true,
            requested_comment: false,
            requested_repost: false,
        },
    });

    const watched = watch();

    const onSubmit = async (data: PostFormData) => {
        try {
            setIsSubmitting(true);
            await api.createPost({
                linkedin_url: data.linkedin_url,
                title: data.title || undefined,
                description: data.description || undefined,
                requested_like: data.requested_like,
                requested_comment: data.requested_comment,
                requested_repost: data.requested_repost,
            });

            toast.success("Post submitted for support!", {
                description: "Others can now like, comment, or repost it.",
            });

            reset();
            setTimeout(() => navigate("/showroom"), 1000);
        } catch (error: unknown) {
            const msg = error && typeof error === "object" && "message" in error
                ? String((error as { message: unknown }).message)
                : "Please try again later.";
            toast.error("Submission failed", { description: msg });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-2xl mx-auto space-y-8">

            {/* LinkedIn URL */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold border-b-2 border-foreground pb-2">
                    1. LinkedIn Post URL
                </h3>
                <div>
                    <label className="block text-sm font-bold mb-2 uppercase flex items-center gap-2">
                        <Linkedin className="w-4 h-4" /> Post URL *
                    </label>
                    <input
                        {...register("linkedin_url")}
                        type="url"
                        className="w-full px-4 py-3 bg-background border-4 border-foreground focus:outline-none focus:border-primary transition-colors"
                        placeholder="https://www.linkedin.com/posts/..."
                    />
                    {errors.linkedin_url && (
                        <p className="mt-1 text-sm text-destructive font-bold">{errors.linkedin_url.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2 uppercase">Title (optional)</label>
                    <input
                        {...register("title")}
                        className="w-full px-4 py-3 bg-background border-4 border-foreground focus:outline-none focus:border-primary transition-colors"
                        placeholder="Short title for this post..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2 uppercase">Description (optional)</label>
                    <textarea
                        {...register("description")}
                        rows={3}
                        className="w-full px-4 py-3 bg-background border-4 border-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                        placeholder="What is this post about?"
                    />
                </div>
            </div>

            {/* Task Types */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold border-b-2 border-foreground pb-2">
                    2. Support Tasks Needed *
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {TASKS.map(({ key, label, icon: Icon, desc }) => {
                        const checked = watched[key];
                        return (
                            <label
                                key={key}
                                className={`cursor-pointer p-4 border-4 transition-all flex flex-col items-center gap-2 text-center
                                    ${checked
                                        ? "border-primary bg-primary/10 shadow-brutal"
                                        : "border-foreground/30 hover:border-foreground bg-card"
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    {...register(key)}
                                    className="sr-only"
                                    onChange={e => setValue(key, e.target.checked)}
                                />
                                <Icon className={`w-8 h-8 ${checked ? "text-primary" : "text-muted-foreground"}`} />
                                <span className="font-bold uppercase">{label}</span>
                                <span className="text-xs text-muted-foreground">{desc}</span>
                            </label>
                        );
                    })}
                </div>
                {errors.requested_like && (
                    <p className="text-sm text-destructive font-bold">{errors.requested_like.message}</p>
                )}
            </div>

            <BrutalButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full text-xl py-6"
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Submitting...</>
                ) : (
                    "Request Support"
                )}
            </BrutalButton>
        </form>
    );
};

export default ProjectSubmissionForm;
