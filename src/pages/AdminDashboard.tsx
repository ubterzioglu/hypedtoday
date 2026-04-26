import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { BrutalButton, brutalButtonVariants } from "@/components/ui/brutal-button";
import { Loader2, Users, FileText, CheckSquare, AlertTriangle, Activity, Settings, Shield, LogOut, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import AdminUsers from "./admin/AdminUsers";
import AdminPosts from "./admin/AdminPosts";
import AdminClaims from "./admin/AdminClaims";
import AdminSettings from "./admin/AdminSettings";
import AdminScores from "./admin/AdminScores";
import AdminFlags from "./admin/AdminFlags";
import AdminAudit from "./admin/AdminAudit";
import { useAuth } from "@/lib/auth";

interface DashboardStats {
    total_users: number;
    total_posts: number;
    total_claims: number;
    pending_approvals: number;
    approved_claims: number;
    rejected_claims: number;
    approval_rate: number;
    rejection_rate: number;
    total_points_distributed: number;
    open_flags: number;
    limit_rejections_today: number;
}

type AdminTab = 'dashboard' | 'users' | 'posts' | 'claims' | 'scores' | 'flags' | 'audit' | 'settings';

const AdminDashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    const handleLogout = async () => {
        await signOut();
        navigate('/admin/login');
    };

    useEffect(() => {
        if (activeTab === 'dashboard') loadDashboard();
    }, [activeTab]);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminDashboard() as DashboardStats;
            setStats(data);
        } catch {
            toast.error("Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    };

    const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
        { key: 'dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
        { key: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
        { key: 'posts', label: 'Posts', icon: <FileText className="w-4 h-4" /> },
        { key: 'claims', label: 'Claims', icon: <CheckSquare className="w-4 h-4" /> },
        { key: 'scores', label: 'Scores', icon: <AlertTriangle className="w-4 h-4" /> },
        { key: 'flags', label: 'Flags', icon: <AlertTriangle className="w-4 h-4" /> },
        { key: 'audit', label: 'Audit', icon: <Shield className="w-4 h-4" /> },
        { key: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen bg-background">
            <div className="bg-primary border-b-4 border-foreground">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-foreground border-2 border-foreground flex items-center justify-center">
                                <Shield className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black uppercase text-primary-foreground">Admin</h1>
                                <p className="text-primary-foreground/70 text-xs font-bold">{user?.email}</p>
                            </div>
                        </div>
                        <nav className="flex items-center gap-1 flex-wrap">
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`px-3 py-2 font-bold text-sm border-2 border-foreground transition-all flex items-center gap-1.5 ${
                                        activeTab === tab.key
                                            ? 'bg-card text-foreground'
                                            : 'bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30'
                                    }`}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                            <Link to="/adminlink" className={brutalButtonVariants({ variant: "secondary", size: "sm" })}>
                                <ExternalLink className="w-4 h-4 mr-1" /> LinkedIn Onay
                            </Link>
                        </nav>
                        <BrutalButton onClick={handleLogout} variant="secondary" size="sm" className="ml-2">
                            <LogOut className="w-4 h-4 mr-1" /> Logout
                        </BrutalButton>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8">
                {activeTab === 'dashboard' && (
                    loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        </div>
                    ) : stats ? (
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatCard label="Total Users" value={stats.total_users} />
                                <StatCard label="Total Posts" value={stats.total_posts} />
                                <StatCard label="Total Claims" value={stats.total_claims} />
                                <StatCard label="Total Points" value={stats.total_points_distributed} />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatCard label="Pending Approvals" value={stats.pending_approvals} accent />
                                <StatCard label="Approved" value={stats.approved_claims} />
                                <StatCard label="Rejected" value={stats.rejected_claims} />
                                <StatCard label="Open Flags" value={stats.open_flags} accent={stats.open_flags > 0} />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <StatCard label="Approval Rate" value={`${stats.approval_rate}%`} />
                                <StatCard label="Rejection Rate" value={`${stats.rejection_rate}%`} />
                                <StatCard label="Limit Rejections Today" value={stats.limit_rejections_today} accent={stats.limit_rejections_today > 0} />
                            </div>
                        </div>
                    ) : null
                )}
                {activeTab === 'users' && <AdminUsers />}
                {activeTab === 'posts' && <AdminPosts />}
                {activeTab === 'claims' && <AdminClaims />}
                {activeTab === 'scores' && <AdminScores />}
                {activeTab === 'flags' && <AdminFlags />}
                {activeTab === 'audit' && <AdminAudit />}
                {activeTab === 'settings' && <AdminSettings />}
            </main>
        </div>
    );
};

const StatCard = ({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) => (
    <div className={`bg-card border-4 border-foreground p-4 shadow-brutal ${accent ? 'ring-2 ring-primary' : ''}`}>
        <p className="text-xs font-bold uppercase text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-black">{value}</p>
    </div>
);

export default AdminDashboard;
