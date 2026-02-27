import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { BrutalButton } from "@/components/ui/brutal-button";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner for toast notifications

const AdminLogin = () => {
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple hardcoded auth for demo/MVP
        // In production, use Supabase Auth or proper backend verification
        if (password === "PPPlll!11321132") {
            localStorage.setItem("isAdmin", "true");
            navigate("/admin");
            toast.success("Welcome back, Admin!");
        } else {
            toast.error("Invalid password");
            setPassword(""); // Keep this to clear the password field on error
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-card border-4 border-foreground p-8 shadow-brutal">
                    <div className="flex items-center justify-center mb-6">
                        <Lock className="w-12 h-12 text-primary" />
                    </div>

                    <h1 className="text-3xl font-bold text-center mb-2">Admin Login</h1>
                    <p className="text-muted-foreground text-center mb-8">
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
                                className="w-full px-4 py-3 bg-background border-4 border-foreground font-medium text-foreground focus:outline-none focus:ring-0 focus:border-primary transition-colors"
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
        </div>
    );
};

export default AdminLogin;
