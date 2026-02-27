import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrutalButton } from "@/components/ui/brutal-button";
import { motion } from "framer-motion";
import { Lock, Shield } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AdminLogin = () => {
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "PPPlll!11321132") {
            localStorage.setItem("isAdmin", "true");
            navigate("/admin");
            toast.success("Welcome back, Admin!");
        } else {
            toast.error("Invalid password");
            setPassword("");
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            {/* Page Header */}
            <div className="bg-gradient-to-r from-primary/20 via-card to-secondary/20 border-b-4 border-foreground">
                <div className="container mx-auto px-4 py-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary border-4 border-foreground flex items-center justify-center">
                            <Shield className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black uppercase">
                                Admin Access
                            </h1>
                            <p className="text-muted-foreground font-medium text-lg">
                                Restricted area - Authorized personnel only
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
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-16 h-16 bg-muted border-4 border-foreground flex items-center justify-center">
                                <Lock className="w-8 h-8 text-primary" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-center mb-2">Admin Login</h2>
                        <p className="text-muted-foreground text-center mb-8 text-sm">
                            Enter admin password to continue
                        </p>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label htmlFor="password" className="block text-sm font-bold mb-2 uppercase tracking-wide">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-background border-4 border-foreground font-bold text-foreground focus:outline-none focus:border-primary transition-colors"
                                    placeholder="Enter password"
                                    autoFocus
                                />
                            </div>

                            <BrutalButton
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="w-full"
                            >
                                Login
                            </BrutalButton>
                        </form>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
};

export default AdminLogin;
