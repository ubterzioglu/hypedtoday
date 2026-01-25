import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { BrutalButton } from "@/components/ui/brutal-button";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

const AdminLogin = () => {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD;

        if (password === correctPassword) {
            sessionStorage.setItem('adminAuth', 'true');
            navigate('/admin');
        } else {
            setError("Invalid password");
            setPassword("");
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

                    <form onSubmit={handleSubmit} className="space-y-6">
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
                            {error && (
                                <p className="mt-2 text-sm text-destructive font-semibold">
                                    {error}
                                </p>
                            )}
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
