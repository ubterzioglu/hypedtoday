import { supabase } from '@/lib/supabase';
import { Project, ProjectFormData } from '@/types';

/**
 * Fetch all projects from Supabase
 */
export async function getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching projects:', error);
        throw error;
    }

    return data || [];
}

/**
 * Upload image to Supabase Storage
 */
async function uploadImage(file: File): Promise<string | null> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('project-images')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading image:', uploadError);
            return null;
        }

        const { data } = supabase.storage
            .from('project-images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error('Upload failed:', error);
        return null;
    }
}

/**
 * Add a new project to Supabase
 */
export async function addProject(formData: ProjectFormData): Promise<Project> {
    let imageUrl = null;

    // Handle image upload if file exists
    if (formData.imageFile) {
        imageUrl = await uploadImage(formData.imageFile);
    }

    const { data, error } = await supabase
        .from('projects')
        .insert([{
            name: formData.name,
            country: formData.country,
            image_url: imageUrl,
            project_url: formData.project_url,
            motto: formData.motto,
            description: formData.description,
            linkedin_url: formData.linkedin_url,
            is_anonymous: formData.is_anonymous,
            contact_email: formData.contact_email
        }])
        .select()
        .single();

    if (error) {
        console.error('Error adding project:', error);
        throw error;
    }

    return data;
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<void> {
    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting project:', error);
        throw error;
    }
}

/**
 * Update a project (admin only)
 */
export async function updateProject(
    id: string,
    formData: Partial<ProjectFormData>
): Promise<Project> {
    const { data, error } = await supabase
        .from('projects')
        .update({
            name: formData.name,
            country: formData.country,
            project_url: formData.project_url,
            motto: formData.motto,
            description: formData.description,
            linkedin_url: formData.linkedin_url,
            is_anonymous: formData.is_anonymous,
            contact_email: formData.contact_email
            // Note: Image update logic not implemented yet for admin edit
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating project:', error);
        throw error;
    }

    return data;
}
// Vote interface
export interface Vote {
    project_id: string;
    ui_score: number;
    ux_score: number;
    stability_score: number;
    innovation_score: number;
    doc_score: number;
}

/**
 * Submit a vote for a project
 */
export async function submitVote(vote: Vote): Promise<void> {
    const { error } = await supabase
        .from('votes')
        .insert([vote]);

    if (error) {
        console.error('Error submitting vote:', error);
        throw error;
    }
}

// Leaderboard Entry Interface
export interface LeaderboardEntry {
    project_id: string;
    name: string;
    country: 'TR' | 'OTHER';
    image_url?: string;
    motto?: string;
    vote_count: number;
    avg_ui: number;
    avg_ux: number;
    avg_stability: number;
    avg_innovation: number;
    avg_doc: number;
    total_score: number;
}

/**
 * Fetch leaderboard data
 */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
        .from('project_stats')
        .select('*')
        .order('total_score', { ascending: false }); // Sort by highest score

    if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }

    return data || [];
}
