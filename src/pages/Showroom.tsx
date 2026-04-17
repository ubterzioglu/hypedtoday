import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { PublicPost } from "@/types";
import ProjectCard from "@/components/ProjectCard";
import { Loader2, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { BrutalButton } from "@/components/ui/brutal-button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Showroom = () => {
    const [posts, setPosts] = useState<PublicPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const { data, error: err } = await supabase
                .from('public_posts')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
            if (err) throw err;
            setPosts(data || []);
        } catch (err) {
            console.error('Failed to load posts:', err);
            setError('Failed to load posts. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <div className="bg-card border-b-4 border-foreground">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-secondary border-4 border-foreground flex items-center justify-center">
                            <Linkedin className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black">LinkedIn Post Feed</h1>
                            <p className="text-muted-foreground">
                                Support posts by liking, commenting, or reposting
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-destructive text-xl mb-4">{error}</p>
                        <BrutalButton onClick={loadPosts} variant="primary">Try Again</BrutalButton>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 bg-card border-4 border-foreground">
                        <p className="text-muted-foreground text-xl mb-4">
                            No posts yet. Be the first to request support!
                        </p>
                        <Link to="/add-project">
                            <BrutalButton variant="primary">Submit a Post</BrutalButton>
                        </Link>
                    </div>
                ) : (
                    <>
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center text-muted-foreground mb-6"
                        >
                            <span className="text-primary font-bold">{posts.length}</span> post{posts.length !== 1 && 's'} need support
                        </motion.p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post, index) => (
                                <ProjectCard key={post.id} post={post} index={index} />
                            ))}
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Showroom;
