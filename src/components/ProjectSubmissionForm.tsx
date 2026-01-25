import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addProject } from "@/data/mockData";
import { ProjectFormData } from "@/types";
import { BrutalButton } from "@/components/ui/brutal-button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Upload, Link as LinkIcon, Linkedin, Mail, AlignLeft, Target } from "lucide-react";

const projectSchema = z.object({
    name: z.string().min(3, "Project name must be at least 3 characters").max(100).trim(),
    motto: z.string().min(3, "Motto must be at least 3 characters").max(60, "Motto max 60 characters").trim(),
    description: z.string().min(10, "Description must be at least 10 characters").max(1000).trim(),
    project_url: z.string().url("Invalid URL").optional().or(z.literal("")),
    country: z.enum(["TR", "OTHER"], { required_error: "Select a country" }),
    linkedin_url: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
    contact_email: z.string().email("Invalid email address"),
    is_anonymous: z.boolean().default(false),
    imageFile: z.instanceof(File).optional(),
}).refine(data => {
    if (!data.is_anonymous && (!data.linkedin_url || data.linkedin_url === "")) {
        return false;
    }
    return true;
}, {
    message: "LinkedIn profile is required unless you want to be anonymous",
    path: ["linkedin_url"],
});

const ProjectSubmissionForm = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch
    } = useForm<ProjectFormData>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            is_anonymous: false,
            country: "TR"
        }
    });

    const isAnonymous = watch("is_anonymous");

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setValue("imageFile", file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: ProjectFormData) => {
        try {
            setIsSubmitting(true);
            // Clean up empty strings
            const cleanedData = {
                ...data,
                project_url: data.project_url === "" ? undefined : data.project_url,
                linkedin_url: data.linkedin_url === "" ? undefined : data.linkedin_url,
            };

            await addProject(cleanedData);

            toast.success("Project added successfully! 🎉", {
                description: `"${data.name}" is now visible in the showroom.`,
            });

            reset();
            setTimeout(() => navigate("/showroom"), 1000);
        } catch (error) {
            console.error("Error submitting project:", error);
            toast.error("Error adding project", {
                description: "Please try again later.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-2xl mx-auto space-y-8">

            {/* 1. Basic Info */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold border-b-2 border-foreground pb-2">1. Project Details</h3>

                {/* Project Name */}
                <div>
                    <label className="block text-sm font-bold mb-2 uppercase">Project Name *</label>
                    <input
                        {...register("name")}
                        className="w-full px-4 py-3 bg-background border-4 border-foreground focus:outline-none focus:border-primary transition-colors"
                        placeholder="e.g., Vibecoding AI"
                    />
                    {errors.name && <p className="mt-1 text-sm text-destructive font-bold">{errors.name.message}</p>}
                </div>

                {/* Motto */}
                <div>
                    <label className="block text-sm font-bold mb-2 uppercase flex items-center gap-2">
                        <Target className="w-4 h-4" /> Motto *
                    </label>
                    <input
                        {...register("motto")}
                        className="w-full px-4 py-3 bg-background border-4 border-foreground focus:outline-none focus:border-primary transition-colors"
                        placeholder="Short slogan (e.g., AI for everyone)"
                    />
                    {errors.motto && <p className="mt-1 text-sm text-destructive font-bold">{errors.motto.message}</p>}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-bold mb-2 uppercase flex items-center gap-2">
                        <AlignLeft className="w-4 h-4" /> Description *
                    </label>
                    <textarea
                        {...register("description")}
                        rows={4}
                        className="w-full px-4 py-3 bg-background border-4 border-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                        placeholder="Tell us about your project..."
                    />
                    {errors.description && <p className="mt-1 text-sm text-destructive font-bold">{errors.description.message}</p>}
                </div>

                {/* Project URL */}
                <div>
                    <label className="block text-sm font-bold mb-2 uppercase flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" /> Project URL
                    </label>
                    <input
                        {...register("project_url")}
                        type="url"
                        className="w-full px-4 py-3 bg-background border-4 border-foreground focus:outline-none focus:border-primary transition-colors"
                        placeholder="https://..."
                    />
                    {errors.project_url && <p className="mt-1 text-sm text-destructive font-bold">{errors.project_url.message}</p>}
                </div>
            </div>

            {/* 2. Visuals */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold border-b-2 border-foreground pb-2">2. Visuals & Region</h3>

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-bold mb-2 uppercase flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Project Image
                    </label>
                    <div className="bg-card border-4 border-foreground p-4">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full text-sm font-medium file:mr-4 file:py-2 file:px-4 file:border-2 file:border-foreground file:text-sm file:font-bold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground mt-2 font-bold">
                            Recommended: 16:9 ratio (e.g., 1280x720). Max 5MB.
                        </p>

                        {imagePreview && (
                            <div className="mt-4 relative group w-fit">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="h-32 w-auto object-cover border-2 border-foreground shadow-brutal"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setValue("imageFile", undefined);
                                        setImagePreview(null);
                                    }}
                                    className="absolute -top-2 -right-2 bg-destructive text-white border-2 border-foreground p-1 hover:scale-110 transition-transform"
                                >
                                    <span className="sr-only">Remove</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Country */}
                <div>
                    <label className="block text-sm font-bold mb-2 uppercase">Region *</label>
                    <div className="flex gap-4">
                        <label className="flex-1 cursor-pointer">
                            <input {...register("country")} type="radio" value="TR" className="peer sr-only" />
                            <div className="p-4 border-4 border-foreground peer-checked:bg-primary peer-checked:text-primary-foreground transition-all text-center font-bold">
                                🇹🇷 Turkey
                            </div>
                        </label>
                        <label className="flex-1 cursor-pointer">
                            <input {...register("country")} type="radio" value="OTHER" className="peer sr-only" />
                            <div className="p-4 border-4 border-foreground peer-checked:bg-secondary peer-checked:text-secondary-foreground transition-all text-center font-bold">
                                🌍 Global
                            </div>
                        </label>
                    </div>
                    {errors.country && <p className="mt-1 text-sm text-destructive font-bold">{errors.country.message}</p>}
                </div>
            </div>

            {/* 3. Creator Info */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold border-b-2 border-foreground pb-2">3. Creator Info</h3>

                {/* Contact Email (Private) */}
                <div>
                    <label className="block text-sm font-bold mb-2 uppercase flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Contact Email * <span className="text-xs normal-case font-normal text-muted-foreground">(Private, only for us)</span>
                    </label>
                    <input
                        {...register("contact_email")}
                        type="email"
                        className="w-full px-4 py-3 bg-background border-4 border-foreground focus:outline-none focus:border-primary transition-colors"
                        placeholder="your@email.com"
                    />
                    {errors.contact_email && <p className="mt-1 text-sm text-destructive font-bold">{errors.contact_email.message}</p>}
                </div>

                {/* Anonymity */}
                <div>
                    <label className="flex items-center gap-3 cursor-pointer p-4 border-4 border-foreground/20 hover:border-foreground transition-colors bg-card">
                        <input
                            type="checkbox"
                            {...register("is_anonymous")}
                            className="w-6 h-6 border-4 border-foreground accent-primary"
                        />
                        <div>
                            <span className="font-bold text-lg">I want to stay anonymous</span>
                            <p className="text-sm text-muted-foreground">Your name and profile will be hidden from public.</p>
                        </div>
                    </label>
                </div>

                {/* LinkedIn (Conditional) */}
                {!isAnonymous && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block text-sm font-bold mb-2 uppercase flex items-center gap-2">
                            <Linkedin className="w-4 h-4" /> LinkedIn Profile *
                        </label>
                        <input
                            {...register("linkedin_url")}
                            type="url"
                            className="w-full px-4 py-3 bg-background border-4 border-foreground focus:outline-none focus:border-primary transition-colors"
                            placeholder="https://linkedin.com/in/..."
                        />
                        {errors.linkedin_url && <p className="mt-1 text-sm text-destructive font-bold">{errors.linkedin_url.message}</p>}
                    </div>
                )}
            </div>

            <BrutalButton type="submit" variant="primary" size="lg" className="w-full text-xl py-6" disabled={isSubmitting}>
                {isSubmitting ? (
                    <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Submitting...</>
                ) : (
                    "🚀 Submit Project"
                )}
            </BrutalButton>

        </form>
    );
};

export default ProjectSubmissionForm;
