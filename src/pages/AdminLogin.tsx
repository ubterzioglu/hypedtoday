import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BrutalButton } from "@/components/ui/brutal-button";
import { motion } from "framer-motion";
import { Shield, Github, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { signInWithGoogle, signInWithGitHub, signInWithMagicLink, user } = useAuth();
    const nextPath = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const next = params.get("next");
        return next && next.startsWith("/") ? next : "/";
    }, [location.search]);

    useEffect(() => {
        if (!user) return;
        navigate(user.role === 'admin' && nextPath === "/" ? "/admin" : nextPath, { replace: true });
    }, [navigate, nextPath, user]);

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error("Please enter your email");
            return;
        }
        setIsSubmitting(true);
        try {
            await signInWithMagicLink(email, nextPath);
            setMagicLinkSent(true);
            toast.success("Check your email for a login link!");
        } catch {
            toast.error("Failed to send magic link");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle(nextPath);
        } catch {
            toast.error("Failed to sign in with Google");
        }
    };

    const handleGitHubSignIn = async () => {
        try {
            await signInWithGitHub(nextPath);
        } catch {
            toast.error("Failed to sign in with GitHub");
        }
    };

    if (user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <div className="bg-gradient-to-r from-primary/20 via-card to-secondary/20 border-b-4 border-foreground">
                <div className="container mx-auto px-4 py-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary border-4 border-foreground flex items-center justify-center">
                            <Shield className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black uppercase">
                                Sign In
                            </h1>
                            <p className="text-muted-foreground font-medium text-lg">
                                Sign in to manage projects and access admin features
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-card border-4 border-foreground p-8 shadow-brutal">
                        <h2 className="text-2xl font-bold text-center mb-2">Welcome</h2>
                        <p className="text-muted-foreground text-center mb-8 text-sm">
                            Choose a sign-in method to continue
                        </p>

                        <div className="space-y-4">
                            <BrutalButton
                                onClick={handleGoogleSignIn}
                                variant="primary"
                                size="lg"
                                className="w-full flex items-center justify-center gap-3"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Continue with Google
                            </BrutalButton>

                            <BrutalButton
                                onClick={handleGitHubSignIn}
                                variant="secondary"
                                size="lg"
                                className="w-full flex items-center justify-center gap-3"
                            >
                                <Github className="w-5 h-5" />
                                Continue with GitHub
                            </BrutalButton>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t-2 border-foreground"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-card px-4 font-bold text-muted-foreground">OR</span>
                                </div>
                            </div>

                            {magicLinkSent ? (
                                <div className="text-center p-4 bg-primary/10 border-2 border-foreground">
                                    <Mail className="w-8 h-8 mx-auto mb-2 text-primary" />
                                    <p className="font-bold">Check your email!</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        We sent a login link to <span className="font-bold">{email}</span>
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleMagicLink} className="space-y-4">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-bold mb-2 uppercase tracking-wide">
                                            Email for Magic Link
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 bg-background border-4 border-foreground font-bold text-foreground focus:outline-none focus:border-primary transition-colors"
                                            placeholder="you@example.com"
                                            autoFocus
                                        />
                                    </div>
                                    <BrutalButton
                                        type="submit"
                                        variant="secondary"
                                        size="lg"
                                        className="w-full flex items-center justify-center gap-2"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                                        ) : (
                                            <><Mail className="w-4 h-4" /> Send Magic Link</>
                                        )}
                                    </BrutalButton>
                                </form>
                            )}
                        </div>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
};

export default AdminLogin;
