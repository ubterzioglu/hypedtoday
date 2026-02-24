import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface Project {
  id: string;
  name: string;
  description: string;
  motto: string;
  country: string;
  image_url: string;
  project_url: string;
  linkedin_url: string;
  contact_email: string;
  is_anonymous: boolean;
  votes: number;
  status?: string;
  tags?: string[];
}

const Demo = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    avgVotes: 0
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading projects:', error);
        return;
      }

      const projectsData = data || [];
      setProjects(projectsData);

      // Calculate stats
      const total = projectsData.length;
      const approved = projectsData.filter(p => !p.status || p.status === 'Approved').length;
      const pending = projectsData.filter(p => p.status === 'Pending').length;
      const totalVotes = projectsData.reduce((sum, p) => sum + (p.votes || 0), 0);
      const avgVotes = total > 0 ? Math.round(totalVotes / total) : 0;

      setStats({ total, approved, pending, avgVotes });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            hyped.today
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Support to Promote. Promote to Support.
          </p>
          <p className="text-sm text-gray-500">
            Demo sayfası - Mevcut durum görüntüleme
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-600">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Toplam Proje
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-600">
                {stats.approved}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Onaylanan
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-yellow-600">
                {stats.pending}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Bekleyen
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-purple-600">
                {stats.avgVotes}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Ortalama Oy
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        ) : (
          /* Projects Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Status Badge */}
                {project.status && (
                  <div className="absolute top-4 right-4">
                    <Badge variant={
                      project.status === 'Approved' ? 'default' :
                      project.status === 'Pending' ? 'secondary' : 'destructive'
                    }>
                      {project.status === 'Approved' ? 'Onaylandı' :
                       project.status === 'Pending' ? 'Beklemede' : 'Reddedildi'}
                    </Badge>
                  </div>
                )}

                {/* Project Image */}
                {project.image_url ? (
                  <div className="aspect-video w-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                    <img
                      src={project.image_url}
                      alt={project.name}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                    <div className="text-4xl font-bold text-purple-600">
                      {project.name.charAt(0)}
                    </div>
                  </div>
                )}

                <CardContent className="p-6">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold mb-2">
                      {project.name}
                    </CardTitle>
                    {project.motto && (
                      <CardDescription className="text-sm text-gray-600 mb-4">
                        "{project.motto}"
                      </CardDescription>
                    )}
                  </CardHeader>

                  <div className="space-y-3">
                    {/* Country */}
                    {project.country && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">🌍</span>
                        <span>{project.country}</span>
                      </div>
                    )}

                    {/* Description */}
                    {project.description && (
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {project.description}
                      </p>
                    )}

                    {/* Votes */}
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">👍</span>
                      <span className="font-semibold">{project.votes || 0} oy</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                      {project.project_url && (
                        <a
                          href={project.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          Proje Site
                        </a>
                      )}
                      <Link
                        to={`/project/${project.id}`}
                        className="flex-1 text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-sm font-medium"
                      >
                        Detaylar
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600 text-sm">
          <p className="mb-2">
            hyped.today Phase 1 - Database Schema Tamamlandı
          </p>
          <p>
            <Link to="/" className="text-purple-600 hover:underline">
              Ana Sayfaya Dön
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Demo;
