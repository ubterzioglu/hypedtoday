import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PublicPost } from "@/types";
import { motion } from "framer-motion";
import { Linkedin } from "lucide-react";

const FeaturedCarousel = () => {
    const [posts, setPosts] = useState<PublicPost[]>([]);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await supabase
                    .from('public_posts')
                    .select('id, linkedin_url, title, owner_display_name')
                    .order('created_at', { ascending: false })
                    .limit(10);
                setPosts(data || []);
            } catch (error) {
                console.error("Failed to load featured posts:", error);
            }
        };
        fetch();
    }, []);

    if (posts.length === 0) return null;

    const carouselItems = [...posts, ...posts, ...posts];

    return (
        <div className="w-full overflow-hidden bg-black border-t-4 border-b-4 border-foreground py-3">
            <motion.div
                className="flex gap-8 w-max"
                animate={{ x: ["0%", "-33.33%"] }}
                transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
            >
                {carouselItems.map((post, index) => (
                    <div
                        key={`${post.id}-${index}`}
                        className="flex items-center gap-3 bg-card border-2 border-foreground px-4 py-2 min-w-[200px] max-w-[300px] hover:bg-muted transition-colors select-none"
                    >
                        <div className="w-10 h-10 border-2 border-foreground overflow-hidden flex-shrink-0 bg-secondary flex items-center justify-center">
                            <Linkedin className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="font-bold text-sm truncate uppercase text-foreground leading-tight">
                                {post.title ?? 'LinkedIn Post'}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground truncate">
                                {post.owner_display_name ?? 'Anonymous'}
                            </span>
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default FeaturedCarousel;
