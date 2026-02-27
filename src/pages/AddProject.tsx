import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { BrutalButton } from "@/components/ui/brutal-button";
import ProjectSubmissionForm from "@/components/ProjectSubmissionForm";

const AddProject = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b-4 border-foreground bg-card">
                <div className="container mx-auto px-4 py-6">
                    <Link to="/">
                        <BrutalButton variant="primary" size="default">
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Home
                        </BrutalButton>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-2xl mx-auto"
                >
                    {/* Title */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">
                            <span className="text-gradient-hero">Add New Project</span>
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Share your project with the community!
                        </p>
                    </div>

                    {/* Form Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="bg-card border-4 border-foreground p-8 shadow-brutal"
                    >
                        <ProjectSubmissionForm />
                    </motion.div>

                    {/* Info */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-8 text-center text-sm text-muted-foreground"
                    >
                        <p>
                            Your project will appear immediately in the{" "}
                            <Link to="/showroom" className="text-primary font-bold hover:underline">
                                Project Showroom
                            </Link>
                            .
                        </p>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
};

export default AddProject;
