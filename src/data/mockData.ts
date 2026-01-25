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
            image_url: imageUrl
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
            country: formData.country
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
