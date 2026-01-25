import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getProjects, updateProject, deleteProject } from "@/data/mockData";
import { Project, Country } from "@/types";
import { BrutalButton } from "@/components/ui/brutal-button";
import { useNavigate } from "react-router-dom";
import { Loader2, LogOut, Edit2, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";

const AdminDashboard = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ name: "", country: "TR" as Country });
    const navigate = useNavigate();

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const data = await getProjects();
            setProjects(data);
        } catch (err) {
            console.error('Failed to load projects:', err);
            toast.error("Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminAuth');
        navigate('/admin/login');
    };

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
            toast.success("Project updated successfully");
            setEditingId(null);
            loadProjects();
        } catch (err) {
            toast.error("Failed to update project");
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete project "${name}"?`)) return;

        try {
            await deleteProject(id);
            toast.success("Project deleted");
            loadProjects();
        } catch (err) {
            toast.error("Failed to delete project");
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b-4 border-foreground bg-card">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl md:text-4xl font-bold">
                            <span className="text-gradient-hero">Admin Dashboard</span>
                        </h1>
                        <BrutalButton onClick={handleLogout} variant="primary">
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </BrutalButton>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <p className="text-2xl font-bold">
                                Total Projects: <span className="text-primary">{projects.length}</span>
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {projects.map((project) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-card border-4 border-foreground p-6 shadow-brutal"
                                >
                                    {editingId === project.id ? (
                                        // Edit Mode
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold mb-2">Project Name</label>
                                                <input
                                                    type="text"
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                    className="w-full px-4 py-2 border-4 border-foreground bg-background"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold mb-2">Country</label>
                                                <div className="flex gap-4">
                                                    <label className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            value="TR"
                                                            checked={editForm.country === "TR"}
                                                            onChange={(e) => setEditForm({ ...editForm, country: e.target.value as Country })}
                                                        />
                                                        🇹🇷 Turkey
                                                    </label>
                                                    <label className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            value="OTHER"
                                                            checked={editForm.country === "OTHER"}
                                                            onChange={(e) => setEditForm({ ...editForm, country: e.target.value as Country })}
                                                        />
                                                        🌍 Other
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <BrutalButton onClick={() => saveEdit(project.id)} variant="primary" size="default">
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Save
                                                </BrutalButton>
                                                <BrutalButton onClick={cancelEdit} variant="secondary" size="default">
                                                    <X className="w-4 h-4 mr-2" />
                                                    Cancel
                                                </BrutalButton>
                                            </div>
                                        </div>
                                    ) : (
                                        // View Mode
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-2xl font-bold mb-1">{project.name}</h3>
                                                <p className="text-muted-foreground">
                                                    {project.country === "TR" ? "🇹🇷 Turkey" : "🌍 Other Countries"} •
                                                    {new Date(project.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <BrutalButton onClick={() => startEdit(project)} variant="secondary" size="default">
                                                    <Edit2 className="w-4 h-4 mr-2" />
                                                    Edit
                                                </BrutalButton>
                                                <BrutalButton
                                                    onClick={() => handleDelete(project.id, project.name)}
                                                    variant="primary"
                                                    size="default"
                                                    className="bg-destructive hover:bg-destructive/90"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </BrutalButton>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {projects.length === 0 && (
                            <div className="text-center py-20">
                                <p className="text-muted-foreground text-xl">No projects yet</p>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
