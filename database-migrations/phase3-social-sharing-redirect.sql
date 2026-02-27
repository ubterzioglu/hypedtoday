-- Phase 3: Social Sharing Redirect & Click Tracking
-- Purpose: Track clicks on shared social media links for the "Support Loop" feature

-- Create click tracking table
CREATE TABLE IF NOT EXISTS click_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    referrer_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL, -- User who shared (optional)
    platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'copy-link', 'direct')),
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET, -- For abuse prevention (can be NULL)
    user_agent TEXT, -- For analytics (can be NULL)
    metadata JSONB DEFAULT '{}'::jsonb -- Additional tracking data
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_click_tracking_project_id ON click_tracking(project_id);
CREATE INDEX IF NOT EXISTS idx_click_tracking_referrer_id ON click_tracking(referrer_id);
CREATE INDEX IF NOT EXISTS idx_click_tracking_platform ON click_tracking(platform);
CREATE INDEX IF NOT EXISTS idx_click_tracking_clicked_at ON click_tracking(clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_click_tracking_ip_address ON click_tracking(ip_address) WHERE ip_address IS NOT NULL;

-- Create view for click statistics
CREATE OR REPLACE VIEW click_statistics AS
SELECT
    project_id,
    platform,
    COUNT(*) as total_clicks,
    COUNT(DISTINCT ip_address) as unique_clicks,
    DATE(clicked_at) as click_date,
    COUNT(*) FILTER (WHERE DATE(clicked_at) = CURRENT_DATE) as clicks_today,
    COUNT(*) FILTER (WHERE clicked_at >= NOW() - INTERVAL '7 days') as clicks_last_7_days,
    COUNT(*) FILTER (WHERE clicked_at >= NOW() - INTERVAL '30 days') as clicks_last_30_days
FROM click_tracking
GROUP BY project_id, platform, DATE(clicked_at);

-- Create view for top sharing platforms per project
CREATE OR REPLACE VIEW project_sharing_stats AS
SELECT
    p.id as project_id,
    p.name as project_name,
    p.status,
    COALESCE(SUM(ct.total_clicks), 0) as total_clicks,
    COALESCE(SUM(ct.unique_clicks), 0) as unique_clicks,
    jsonb_agg(
        jsonb_build_object(
            'platform', ct.platform,
            'clicks', ct.total_clicks,
            'unique_clicks', ct.unique_clicks
        ) ORDER BY ct.total_clicks DESC
    ) FILTER (WHERE ct.total_clicks > 0) as platform_breakdown,
    COALESCE(MAX(ct.clicks_today), 0) as clicks_today,
    NOW() as calculated_at
FROM projects p
LEFT JOIN (
    SELECT
        project_id,
        platform,
        COUNT(*) as total_clicks,
        COUNT(DISTINCT ip_address) as unique_clicks,
        COUNT(*) FILTER (WHERE DATE(clicked_at) = CURRENT_DATE) as clicks_today
    FROM click_tracking
    GROUP BY project_id, platform
) ct ON p.id = ct.project_id
GROUP BY p.id, p.name, p.status;

-- Add RLS policies
ALTER TABLE click_tracking ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert clicks (for public sharing)
CREATE POLICY "Anyone can insert clicks"
    ON click_tracking
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Allow authenticated users to read their own click data
CREATE POLICY "Users can read their own project clicks"
    ON click_tracking
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = click_tracking.project_id
            AND projects.owner_id = auth.uid()
        )
    );

-- Allow admins to read all click data
CREATE POLICY "Admins can read all clicks"
    ON click_tracking
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND user_profiles.reputation_score >= 500 -- Admin threshold
        )
    );

-- Create function to get total clicks for a project
CREATE OR REPLACE FUNCTION get_project_clicks(p_project_id UUID)
RETURNS TABLE (
    total_clicks BIGINT,
    unique_clicks BIGINT,
    clicks_today BIGINT,
    platform_breakdown JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(COUNT(*), 0)::BIGINT as total_clicks,
        COALESCE(COUNT(DISTINCT ip_address), 0)::BIGINT as unique_clicks,
        COALESCE(COUNT(*) FILTER (WHERE DATE(clicked_at) = CURRENT_DATE), 0)::BIGINT as clicks_today,
        COALESCE(jsonb_agg(
            jsonb_build_object(
                'platform', platform,
                'clicks', COUNT(*),
                'unique_clicks', COUNT(DISTINCT ip_address)
            ) ORDER BY COUNT(*) DESC
        ) FILTER (WHERE COUNT(*) > 0), '[]'::jsonb) as platform_breakdown
    FROM click_tracking
    WHERE project_id = p_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log a click and award reputation
CREATE OR REPLACE FUNCTION log_click_award_reputation(
    p_project_id UUID,
    p_platform TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_project_owner_id UUID;
    v_reputation_points INTEGER;
    v_click_id UUID;
    v_time_bank_hours FLOAT;
BEGIN
    -- Get project owner
    SELECT owner_id INTO v_project_owner_id
    FROM projects
    WHERE id = p_project_id;

    IF v_project_owner_id IS NULL THEN
        RAISE EXCEPTION 'Project not found';
    END IF;

    -- Insert click tracking
    INSERT INTO click_tracking (project_id, platform, ip_address, user_agent)
    VALUES (p_project_id, p_platform, p_ip_address, p_user_agent)
    RETURNING id INTO v_click_id;

    -- Calculate reputation points (1 point per click, max 10 per day)
    -- Check today's clicks
    SELECT COUNT(*) INTO v_reputation_points
    FROM click_tracking
    WHERE project_id = p_project_id
    AND DATE(clicked_at) = CURRENT_DATE;

    -- Award reputation if under daily limit
    IF v_reputation_points <= 10 THEN
        -- Award 1 reputation point to owner
        UPDATE user_profiles
        SET
            reputation_score = reputation_score + 1,
            updated_at = NOW()
        WHERE user_id = v_project_owner_id;

        -- Log reputation change
        INSERT INTO reputation_logs (user_id, action_type, points_changed, related_project_id, metadata)
        VALUES (
            v_project_owner_id,
            'link_clicked',
            1,
            p_project_id,
            jsonb_build_object(
                'platform', p_platform,
                'click_id', v_click_id,
                'ip_address', p_ip_address
            )
        );
    END IF;

    -- Return result
    RETURN jsonb_build_object(
        'success', true,
        'click_id', v_click_id,
        'project_id', p_project_id,
        'owner_id', v_project_owner_id,
        'reputation_awarded', v_reputation_points <= 10,
        'clicks_today', v_reputation_points + 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
