import { ArrowLeft, LogOut, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { BrutalButton, brutalButtonVariants } from "@/components/ui/brutal-button";
import { useAuth } from "@/lib/auth";
import AdminLinkedinProfiles from "./admin/AdminLinkedinProfiles";

const AdminLinkedinPage = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate("/admin/login");
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="bg-primary border-b-4 border-foreground">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-foreground border-2 border-foreground flex items-center justify-center">
                                <Shield className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black uppercase text-primary-foreground">AdminLink</h1>
                                <p className="text-xs font-bold text-primary-foreground/80">
                                    LinkedIn kullanici onay ekranı
                                </p>
                                <p className="text-xs font-bold text-primary-foreground/70">{user?.email}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Link to="/admin" className={brutalButtonVariants({ variant: "secondary", size: "sm" })}>
                                <ArrowLeft className="w-4 h-4 mr-1" /> Admin'e Don
                            </Link>
                            <BrutalButton onClick={handleLogout} variant="secondary" size="sm">
                                <LogOut className="w-4 h-4 mr-1" /> Logout
                            </BrutalButton>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8">
                <AdminLinkedinProfiles />
            </main>
        </div>
    );
};

export default AdminLinkedinPage;
