import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getProjects, updateProject, deleteProject, getFeedbacks, deleteFeedback, Feedback } from "@/data/mockData";
import { Project, Country } from "@/types";
import { BrutalButton } from "@/components/ui/brutal-button";
import { useNavigate } from "react-router-dom";
import { Loader2, LogOut, Edit2, Trash2, Save, X, MessageSquare, LayoutGrid } from "lucide-react";
import { toast } from "sonner";

const AdminDashboard = () => {
    // Auth & Routing
    const navigate = useNavigate();

    // Tabs
    const [activeTab, setActiveTab] = useState<'projects' | 'feedback'>('projects');

    // Data State
    const [projects, setProjects] = useState<Project[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit State (Projects)
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ name: "", country: "TR" as Country });

    useEffect(() => {
        if (activeTab === 'projects') loadProjects();
        if (activeTab === 'feedback') loadFeedbacks();
    }, [activeTab]);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const data = await getProjects();
            setProjects(data);
        } catch (err) {
            toast.error("Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    const loadFeedbacks = async () => {
        try {
            setLoading(true);
            const data = await getFeedbacks();
            setFeedbacks(data);
        } catch (err) {
            toast.error("Failed to load feedback");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        navigate('/admin/login');
    };

    // --- Project Actions ---
    const startEdit = (project: Project) => {
        setEditingId(project.id);
        setEditForm({ name: project.name, country: project.country });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ name: "", country: "TR" });
    };

    const saveEdit = async (id: string) => {
        try {
            await updateProject(id, editForm);
            toast.success("Project updated");
            setEditingId(null);
            loadProjects();
        } catch (err) {
            toast.error("Failed to update");
        }
    };

    const handleDeleteProject = async (id: string, name: string) => {
        if (!confirm(`Delete project "${name}"?`)) return;
        try {
            await deleteProject(id);
            setProjects(prev => prev.filter(p => p.id !== id)); // Optimistic update
            toast.success("Project deleted");
        } catch (err) {
            toast.error("Failed to delete");
            loadProjects(); // Revert on failure
        }
    };

    // --- Feedback Actions ---
    const handleDeleteFeedback = async (id: string) => {
        if (!confirm("Delete this feedback?")) return;
        try {
            await deleteFeedback(id);
            toast.success("Feedback deleted");
            loadFeedbacks();
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    return (
        <div className="min-h-screen bg-background font-sans">
            {/* Header */}
            <header className="border-b-4 border-foreground bg-card sticky top-0 z-20">
                <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <h1 className="text-2xl md:text-3xl font-black uppercase flex items-center gap-2">
                        <span className="text-primary">Admin</span> Dashboard
                    </h1>

                    <div className="flex items-center gap-4">
                        {/* Tabs */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('projects')}
                                className={`px-4 py-2 font-bold border-2 transition-all flex items-center gap-2 ${activeTab === 'projects' ? 'bg-primary text-black border-primary' : 'bg-transparent text-white border-white hover:bg-white hover:text-black'}`}
                            >
                                <LayoutGrid className="w-4 h-4" /> Projects
                            </button>
                            <button
                                onClick={() => setActiveTab('feedback')}
                                className={`px-4 py-2 font-bold border-2 transition-all flex items-center gap-2 ${activeTab === 'feedback' ? 'bg-secondary text-black border-secondary' : 'bg-transparent text-white border-white hover:bg-white hover:text-black'}`}
                            >
                                <MessageSquare className="w-4 h-4" /> Feedback
                            </button>
                        </div>

                        <BrutalButton onClick={() => window.open('/', '_blank')} variant="secondary" size="sm">
                            <span className="font-bold">Home</span>
                        </BrutalButton>
                        <BrutalButton onClick={handleLogout} variant="tertiary" size="sm">
                            <LogOut className="w-4 h-4 mr-2" /> Logout
                        </BrutalButton>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-foreground" />
                    </div>
                ) : (
                    <>
                        {/* PROJECTS TAB */}
                        {activeTab === 'projects' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold uppercase">Total Projects: {projects.length}</h2>
                                </div>

                                <div className="grid gap-4">
                                    {projects.map((project) => (
                                        <motion.div
                                            key={project.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="bg-card border-4 border-foreground p-6 shadow-brutal flex flex-col md:flex-row md:items-center justify-between gap-4"
                                        >
                                            {editingId === project.id ? (
                                                <div className="flex-1 space-y-4">
                                                    <input
                                                        type="text"
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                        className="w-full px-4 py-2 border-4 border-foreground font-bold"
                                                    />
                                                    <div className="flex gap-4">
                                                        <label className="flex items-center gap-2 font-bold cursor-pointer">
                                                            <input type="radio" checked={editForm.country === "TR"} onChange={() => setEditForm({ ...editForm, country: "TR" })} /> 🔴 Turkey
                                                        </label>
                                                        <label className="flex items-center gap-2 font-bold cursor-pointer">
                                                            <input type="radio" checked={editForm.country === "OTHER"} onChange={() => setEditForm({ ...editForm, country: "OTHER" })} /> 🌍 Other
                                                        </label>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <BrutalButton onClick={() => saveEdit(project.id)} variant="primary" size="sm">Save</BrutalButton>
                                                        <BrutalButton onClick={cancelEdit} variant="secondary" size="sm">Cancel</BrutalButton>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div>
                                                        <h3 className="text-xl font-black">{project.name}</h3>
                                                        <p className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                                                            {project.country === "TR" ? "🔴 Turkey" : "🌍 Global"}
                                                            <span className="text-xs font-normal opacity-50">ID: {project.id.slice(0, 8)}</span>
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => startEdit(project)} className="p-2 border-2 border-foreground hover:bg-muted transition-colors"><Edit2 className="w-5 h-5" /></button>
                                                        <button onClick={() => handleDeleteProject(project.id, project.name)} className="p-2 border-2 border-white bg-red-600 text-white hover:bg-red-700 transition-colors font-bold"><Trash2 className="w-5 h-5" /></button>
                                                    </div>
                                                </>
                                            )}
                                        </motion.div>
                                    ))}
                                    {projects.length === 0 && <p className="text-center font-bold text-muted-foreground py-10">No projects yet.</p>}
                                </div>
                            </div>
                        )}

                        {/* FEEDBACK TAB */}
                        {activeTab === 'feedback' && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold uppercase">Inbox ({feedbacks.length})</h2>
                                <div className="grid gap-4">
                                    {feedbacks.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="bg-card border-4 border-foreground p-6 shadow-brutal relative group"
                                        >
                                            <p className="text-lg font-medium whitespace-pre-wrap mb-4 font-mono">"{item.message}"</p>
                                            <div className="flex justify-between items-end border-t-2 border-muted pt-4">
                                                <span className="text-xs font-bold text-muted-foreground">
                                                    {new Date(item.created_at).toLocaleString()}
                                                </span>
                                                <BrutalButton
                                                    onClick={() => handleDeleteFeedback(item.id)}
                                                    variant="primary"
                                                    size="sm"
                                                    className="bg-red-600 text-white border-2 border-white hover:bg-red-700 font-bold"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                </BrutalButton>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {feedbacks.length === 0 && <p className="text-center font-bold text-muted-foreground py-10">No feedback messages yet.</p>}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
