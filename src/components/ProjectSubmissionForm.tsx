import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addProject } from "@/data/mockData";
import { ProjectFormData } from "@/types";
import { BrutalButton } from "@/components/ui/brutal-button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const projectSchema = z.object({
    name: z
        .string()
        .min(3, "Project name must be at least 3 characters")
        .max(100, "Project name must be at most 100 characters")
        .trim(),
    country: z.enum(["TR", "OTHER"], {
        required_error: "Please select a country",
    }),
    imageFile: z.instanceof(File).optional(),
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
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setValue("imageFile", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: ProjectFormData) => {
        try {
            setIsSubmitting(true);
            await addProject(data);

            toast.success("Project added successfully! 🎉", {
                description: `"${data.name}" is now visible in the showroom.`,
            });

            reset();

            // Navigate to showroom after a brief delay
            setTimeout(() => {
                navigate("/showroom");
            }, 1000);
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
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-6">
            {/* Project Name Input */}
            <div>
                <label htmlFor="name" className="block text-sm font-bold mb-2 uppercase tracking-wide">
                    Project Name *
                </label>
                <input
                    {...register("name")}
                    id="name"
                    type="text"
                    placeholder="e.g., AI Chat Assistant"
                    className={`
            w-full px-4 py-3 bg-background border-4 
            ${errors.name ? "border-destructive" : "border-foreground"}
            font-medium text-foreground
            focus:outline-none focus:ring-0 focus:border-primary
            transition-colors
            placeholder:text-muted-foreground
          `}
                    disabled={isSubmitting}
                />
                {errors.name && (
                    <p className="mt-2 text-sm text-destructive font-semibold">
                        {errors.name.message}
                    </p>
                )}
            </div>

            {/* Image Upload */}
            <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-wide">
                    Project Image (Optional)
                </label>
                <div className="border-4 border-dashed border-foreground/30 p-6 text-center hover:bg-muted/30 transition-colors relative cursor-pointer group">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    {imagePreview ? (
                        <div className="relative">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="h-48 w-full object-cover border-2 border-foreground mx-auto"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold">
                                Change Image
                            </div>
                        </div>
                    ) : (
                        <div className="py-4">
                            <p className="text-muted-foreground font-medium group-hover:text-primary transition-colors">
                                Drop image here or click to upload
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Max 5MB • JPG, PNG, GIF
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Country Selection */}
            <div>
                <label className="block text-sm font-bold mb-3 uppercase tracking-wide">
                    Country *
                </label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            {...register("country")}
                            type="radio"
                            value="TR"
                            className="w-4 h-4 border-4 border-foreground accent-primary"
                            disabled={isSubmitting}
                        />
                        <span className="font-semibold">🇹🇷 Turkey</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            {...register("country")}
                            type="radio"
                            value="OTHER"
                            className="w-4 h-4 border-4 border-foreground accent-secondary"
                            disabled={isSubmitting}
                        />
                        <span className="font-semibold">🌍 Other Countries</span>
                    </label>
                </div>
                {errors.country && (
                    <p className="mt-2 text-sm text-destructive font-semibold">
                        {errors.country.message}
                    </p>
                )}
            </div>

            {/* Submit Button */}
            <BrutalButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Adding...
                    </>
                ) : (
                    "Add Project"
                )}
            </BrutalButton>

            <p className="text-xs text-muted-foreground text-center">
                * Required field
            </p>
        </form>
    );
};

export default ProjectSubmissionForm;
