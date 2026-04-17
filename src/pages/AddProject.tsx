import { motion } from "framer-motion";
import { Linkedin } from "lucide-react";
import ProjectSubmissionForm from "@/components/ProjectSubmissionForm";
import RequestCapacityWidget from "@/components/RequestCapacityWidget";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const AddProject = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            {/* Page Header */}
            <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 border-b-4 border-foreground">
                <div className="container mx-auto px-4 py-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary border-4 border-foreground flex items-center justify-center">
                            <Linkedin className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black">
                                Request Support
                            </h1>
                            <p className="text-muted-foreground font-medium text-lg">
                                Submit a LinkedIn post for community support
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-2xl mx-auto"
                >
                    {/* Request capacity */}
                    <div className="mb-4">
                        <RequestCapacityWidget />
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
                            Your post will be visible in the{" "}
                            <Link to="/showroom" className="text-primary font-bold hover:underline">
                                LinkedIn Feed
                            </Link>{" "}
                            for supporters to discover.
                        </p>
                    </motion.div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
};

export default AddProject;
