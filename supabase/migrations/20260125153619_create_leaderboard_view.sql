-- Create a view to calculate average scores for each project
CREATE OR REPLACE VIEW project_stats AS
SELECT 
    p.id as project_id,
    p.name,
    p.country,
    p.image_url,
    p.motto,
    COUNT(v.id) as vote_count,
    ROUND(AVG(v.ui_score), 1) as avg_ui,
    ROUND(AVG(v.ux_score), 1) as avg_ux,
    ROUND(AVG(v.stability_score), 1) as avg_stability,
    ROUND(AVG(v.innovation_score), 1) as avg_innovation,
    ROUND(AVG(v.doc_score), 1) as avg_doc,
    -- Calculate total average
    ROUND(
        (AVG(v.ui_score) + AVG(v.ux_score) + AVG(v.stability_score) + AVG(v.innovation_score) + AVG(v.doc_score)) / 5, 
        1
    ) as total_score
FROM projects p
LEFT JOIN votes v ON p.id = v.project_id
GROUP BY p.id;

-- Grant access to the view
GRANT SELECT ON project_stats TO anon, authenticated;
