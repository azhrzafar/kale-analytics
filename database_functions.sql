CREATE OR REPLACE FUNCTION get_unique_leads_connected()
RETURNS bigint 
SECURITY DEFINER
SET search_path = public
AS $$
-- Use a more efficient approach for large datasets
SELECT COUNT(*) 
FROM (
    SELECT 1
    FROM "Leads" 
    WHERE "Email" IS NOT NULL AND "Email" <> ''
    GROUP BY "Email"
) unique_emails;
$$ LANGUAGE sql STABLE;

-- Function to get total emails sent, optionally filtered by platform
CREATE OR REPLACE FUNCTION get_total_emails_sent(platform text DEFAULT NULL)
RETURNS bigint 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT
      CASE
        WHEN platform IS NULL THEN
          (SELECT COUNT(*) FROM bison_sends) +
          (SELECT COUNT(*) FROM instantly_sends)
        WHEN platform = 'bison' THEN
          (SELECT COUNT(*) FROM bison_sends)
        WHEN platform = 'instantly' THEN
          (SELECT COUNT(*) FROM instantly_sends)
        ELSE 0
      END
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ===================================================================
-- MATERIALIZED VIEW FOR CLIENT STATISTICS
-- ===================================================================

-- Materialized view to cache expensive client statistics aggregation
CREATE MATERIALIZED VIEW IF NOT EXISTS client_statistics_mv AS
WITH email_stats AS (
    SELECT 
        l.client_id,
        SUM(CASE WHEN bs."Lead_id" IS NOT NULL THEN 1 ELSE 0 END) as bison_sends,
        SUM(CASE WHEN ins."Lead_id" IS NOT NULL THEN 1 ELSE 0 END) as instantly_sends
    FROM "Leads" l
    LEFT JOIN bison_sends bs ON bs."Lead_id" = l.id
    LEFT JOIN instantly_sends ins ON ins."Lead_id" = l.id
    GROUP BY l.client_id
),
reply_stats AS (
    SELECT 
        l.client_id,
        COUNT(mr.id) as total_replies,
        COUNT(mr.id) FILTER (
            WHERE TRIM(LOWER(mr.sentiment)) IN (
                'meeting request', 'positive', 'interested',
                'long-term prospect', 'long-term prospect (ltp)',
                'info request', 'referral'
            )
        ) as positive_replies_count,
        COUNT(mr.id) FILTER (
            WHERE TRIM(LOWER(mr.sentiment)) IN (
                'bounce', 'soft bounce', 'hard bounce', 'invalid inbox'
            )
        ) as bounces_count
    FROM "Leads" l
    INNER JOIN missive_replies mr ON mr.lead_id = l.id
    GROUP BY l.client_id
),
lead_stats AS (
    SELECT 
        l.client_id,
        COUNT(DISTINCT l.internal_id) as unique_leads_count
    FROM "Leads" l
    GROUP BY l.client_id
)
SELECT 
    c.id as client_id,
    c."Company Name" as client_name,
    c."Domain" as client_domain,
    c."Onboarding Date" as client_onboard_date,
    c."Services" as client_services,
    COALESCE(es.bison_sends, 0) + COALESCE(es.instantly_sends, 0) as emails_sent,
    COALESCE(rs.total_replies, 0) as replies,
    CASE 
        WHEN (COALESCE(es.bison_sends, 0) + COALESCE(es.instantly_sends, 0)) > 0 
        THEN ROUND((COALESCE(rs.total_replies, 0)::numeric / 
                   (COALESCE(es.bison_sends, 0) + COALESCE(es.instantly_sends, 0))::numeric) * 100, 2)
        ELSE 0::numeric 
    END as reply_rate,
    COALESCE(rs.positive_replies_count, 0) as positive_replies,
    CASE 
        WHEN (COALESCE(es.bison_sends, 0) + COALESCE(es.instantly_sends, 0)) > 0 
        THEN ROUND((COALESCE(rs.positive_replies_count, 0)::numeric / 
                   (COALESCE(es.bison_sends, 0) + COALESCE(es.instantly_sends, 0))::numeric) * 100, 2)
        ELSE 0::numeric 
    END as positive_reply_rate,
    COALESCE(rs.bounces_count, 0) as bounces,
    CASE 
        WHEN (COALESCE(es.bison_sends, 0) + COALESCE(es.instantly_sends, 0)) > 0 
        THEN ROUND((COALESCE(rs.bounces_count, 0)::numeric / 
                   (COALESCE(es.bison_sends, 0) + COALESCE(es.instantly_sends, 0))::numeric) * 100, 2)
        ELSE 0::numeric 
    END as bounce_rate,
    COALESCE(ls.unique_leads_count, 0) as unique_leads
FROM "Clients" c
LEFT JOIN email_stats es ON es.client_id = c.id
LEFT JOIN reply_stats rs ON rs.client_id = c.id
LEFT JOIN lead_stats ls ON ls.client_id = c.id;

-- Unique index to enable CONCURRENT refreshes
CREATE UNIQUE INDEX IF NOT EXISTS idx_client_statistics_mv_client_id ON client_statistics_mv (client_id);

-- Read function backed by the MV
CREATE OR REPLACE FUNCTION get_client_statistics_mat()
RETURNS TABLE (
    client_id bigint,
    client_name text,
    client_domain text,
    client_onboard_date date,
    client_services text,
    emails_sent bigint,
    replies bigint,
    reply_rate numeric,
    positive_replies bigint,
    positive_reply_rate numeric,
    bounces bigint,
    bounce_rate numeric,
    unique_leads bigint
)
SECURITY DEFINER
SET search_path = public
AS $$
SELECT 
    client_id,
    client_name,
    client_domain,
    client_onboard_date,
    client_services,
    emails_sent,
    replies,
    reply_rate,
    positive_replies,
    positive_reply_rate,
    bounces,
    bounce_rate,
    unique_leads
FROM client_statistics_mv
ORDER BY client_id;
$$ LANGUAGE sql STABLE;

-- Helper to refresh the MV
CREATE OR REPLACE FUNCTION refresh_client_statistics_mv(concurrent boolean DEFAULT true)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF concurrent THEN
        EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY client_statistics_mv';
    ELSE
        EXECUTE 'REFRESH MATERIALIZED VIEW client_statistics_mv';
    END IF;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Function to get total replies across all platforms
CREATE OR REPLACE FUNCTION get_total_replies(platform text DEFAULT NULL)
RETURNS bigint 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM missive_replies
    WHERE (
      platform IS NULL
      OR (platform = 'bison' AND bison_reply_id IS NOT NULL AND bison_reply_id <> 0)
      OR (platform = 'instantly' AND instantly_reply_id IS NOT NULL AND instantly_reply_id <> 0)
    )
  ) as total_replies;
END;
$$ LANGUAGE plpgsql STABLE;





CREATE OR REPLACE FUNCTION get_bounced_emails(platform text DEFAULT NULL)
RETURNS bigint
SECURITY DEFINER
SET search_path = public
AS $$

BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM missive_replies
    WHERE TRIM(LOWER(sentiment)) IN ('bounce', 'soft bounce', 'hard bounce', 'invalid inbox')
    AND (
      -- if platform is NULL → always true
      platform IS NULL
      OR (platform = 'bison' AND bison_reply_id IS NOT NULL AND bison_reply_id <> 0)
      OR (platform = 'instantly' AND instantly_reply_id IS NOT NULL AND instantly_reply_id <> 0)
    )
  );
END;
$$ LANGUAGE plpgsql STABLE;



CREATE OR REPLACE FUNCTION get_bounced_rate(platform text DEFAULT NULL)
RETURNS numeric 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_emails bigint;
    bounced_emails bigint;
BEGIN
    total_emails := get_total_emails_sent(platform);
    bounced_emails := get_bounced_emails(platform);
    
    IF total_emails = 0 THEN
        RETURN 0;
    ELSE
        RETURN ROUND((bounced_emails::numeric / total_emails::numeric) * 100, 2);
    END IF;
END;
$$ LANGUAGE plpgsql STABLE;



CREATE OR REPLACE FUNCTION get_positive_replies(platform text DEFAULT NULL)
RETURNS bigint
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM missive_replies
    WHERE TRIM(LOWER(sentiment)) IN (
      'meeting request',
      'positive',
      'interested',
      'long-term prospect',
      'long-term prospect (ltp)',
      'info request',
      'referral'
    )
    AND (
      -- if platform is NULL → always true
      platform IS NULL
      OR (platform = 'bison' AND bison_reply_id IS NOT NULL AND bison_reply_id <> 0)
      OR (platform = 'instantly' AND instantly_reply_id IS NOT NULL AND instantly_reply_id <> 0)
    )
  );
END;
$$ LANGUAGE plpgsql STABLE;


CREATE OR REPLACE FUNCTION get_positive_replies_rate(platform text DEFAULT NULL)
RETURNS numeric
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_emails bigint;
    positive_replies bigint;
BEGIN
    total_emails := get_total_emails_sent(platform);
    positive_replies := get_positive_replies(platform);

    IF total_emails = 0 THEN
        RETURN 0;
    ELSE
        RETURN ROUND((positive_replies::numeric / total_emails::numeric) * 100, 2);
    END IF;
END;
$$ LANGUAGE plpgsql STABLE;



CREATE OR REPLACE FUNCTION get_send_positive_ratio()
RETURNS text
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    emails bigint := get_total_emails_sent();
    positives bigint := get_positive_replies();
BEGIN
    IF emails = 0 OR positives = 0 THEN
        RETURN '0:0';
    END IF;
    RETURN ROUND(emails::numeric / positives::numeric, 0)::text || ':1';
END;
$$ LANGUAGE plpgsql STABLE;



-- Individual platform functions to avoid timeout
CREATE OR REPLACE FUNCTION get_bison_performance()
RETURNS TABLE (
    platform text,
    sends bigint,
    replies bigint,
    reply_rate numeric,
    positive_rate numeric,
    bounce_rate numeric,
    leads bigint,
    campaigns bigint
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
 PERFORM set_config('statement_timeout', '120000', true);
    RETURN QUERY
    SELECT 
        'Bison'::text as platform,
        (SELECT COUNT(*) FROM bison_sends) as sends,
        get_total_replies('bison') as replies,
        CASE 
            WHEN (SELECT COUNT(*) FROM bison_sends) > 0 
            THEN ROUND((get_total_replies('bison')::numeric / (SELECT COUNT(*) FROM bison_sends)::numeric) * 100, 2)
            ELSE 0::numeric 
        END as reply_rate,
        get_positive_replies_rate('bison') as positive_rate,
        get_bounced_rate('bison') as bounce_rate,
        (SELECT COUNT(DISTINCT lead_email) FROM bison_sends) as leads,
        (Select count (*) from bison_campaigns) as campaigns;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_instantly_performance()
RETURNS TABLE (
    platform text,
    sends bigint,
    replies bigint,
    reply_rate numeric,
    positive_rate numeric,
    bounce_rate numeric,
    leads bigint,
    campaigns bigint
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
 PERFORM set_config('statement_timeout', '120000', true);
    RETURN QUERY
    SELECT 
        'Instantly'::text as platform,
        (SELECT COUNT(*) FROM instantly_sends) as sends,
        get_total_replies('instantly') as replies,
        CASE 
            WHEN (SELECT COUNT(*) FROM instantly_sends) > 0 
            THEN ROUND((get_total_replies('instantly')::numeric / (SELECT COUNT(*) FROM instantly_sends)::numeric) * 100, 2)
            ELSE 0::numeric 
        END as reply_rate,
        get_positive_replies_rate('instantly') as positive_rate,
        get_bounced_rate('instantly') as bounce_rate,
        (SELECT COUNT(DISTINCT instantly_lead_email) FROM instantly_sends) as leads,
        (Select count (*) from instantly_campaigns) as campaigns;
END;
$$ LANGUAGE plpgsql STABLE;



-- Speeds up filtering/counting on reply IDs
CREATE INDEX IF NOT EXISTS idx_missive_bison_reply ON missive_replies(bison_reply_id);
CREATE INDEX IF NOT EXISTS idx_missive_instantly_reply ON missive_replies(instantly_reply_id);

-- Sentiment filter performance
CREATE INDEX IF NOT EXISTS idx_missive_sentiment ON missive_replies(LOWER(TRIM(sentiment)));

-- Speeds up DISTINCT on emails
CREATE INDEX IF NOT EXISTS idx_bison_email ON bison_sends(lead_email);
CREATE INDEX IF NOT EXISTS idx_instantly_email ON instantly_sends(instantly_lead_email);

-- Makes DISTINCT and filtering much faster
CREATE INDEX IF NOT EXISTS idx_leads_email ON "Leads"(LOWER("Email"));


-- Time series: send volume trends (daily) with optional platform filter
CREATE OR REPLACE FUNCTION get_send_volume_trends(
    start_date date DEFAULT NULL,
    end_date date DEFAULT NULL,
    platform_filter text DEFAULT NULL
)
RETURNS TABLE (
    date date,
    emails bigint,
    replies bigint,
    positive bigint,
    bounces bigint
)
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s_date date := COALESCE(start_date, (CURRENT_DATE - INTERVAL '29 days')::date);
  e_date date := COALESCE(end_date, CURRENT_DATE::date);
BEGIN
  PERFORM set_config('statement_timeout', '120000', true);
  RETURN QUERY
  WITH days AS (
    SELECT d::date AS day
    FROM generate_series(s_date, e_date, interval '1 day') AS g(d)
  ),
  sends as (
    SELECT date_trunc('day', created_at)::date AS day, COUNT(*) AS emails
    FROM (
      SELECT created_at
      FROM bison_sends
      WHERE (platform_filter IS NULL OR platform_filter = 'bison')
        AND created_at::date BETWEEN s_date AND e_date
      UNION ALL
      SELECT created_at
      FROM instantly_sends
      WHERE (platform_filter IS NULL OR platform_filter = 'instantly')
        AND created_at::date BETWEEN s_date AND e_date
    ) s
    GROUP BY 1
  ),
  replies as (
    SELECT 
      date_trunc('day', created_at)::date AS day,
      COUNT(*) FILTER (WHERE TRUE) AS replies,
      COUNT(*) FILTER (
        WHERE TRIM(LOWER(sentiment)) IN (
          'meeting request',
          'positive',
          'interested',
          'long-term prospect',
          'long-term prospect (ltp)',
          'info request',
          'referral'
        )
      ) AS positive,
      COUNT(*) FILTER (
        WHERE TRIM(LOWER(sentiment)) IN ('bounce', 'soft bounce', 'hard bounce', 'invalid inbox')
      ) AS bounces
    FROM missive_replies
    WHERE (
        platform_filter IS NULL
        OR (platform_filter = 'bison' AND bison_reply_id IS NOT NULL AND bison_reply_id <> 0)
        OR (platform_filter = 'instantly' AND instantly_reply_id IS NOT NULL AND instantly_reply_id <> 0)
      )
      AND created_at::date BETWEEN s_date AND e_date
    GROUP BY 1
  )
  SELECT 
    d.day as date,
    COALESCE(s.emails, 0) as emails,
    COALESCE(r.replies, 0) as replies,
    COALESCE(r.positive, 0) as positive,
    COALESCE(r.bounces, 0) as bounces
  FROM days d
  LEFT JOIN sends s ON s.day = d.day
  LEFT JOIN replies r ON r.day = d.day
  ORDER BY d.day;
END;
$$ LANGUAGE plpgsql STABLE;



CREATE OR REPLACE FUNCTION get_client_statistics()
RETURNS TABLE (
    client_id bigint,
    client_name text,
    client_domain text,
    client_onboard_date date,
    client_services text,
    emails_sent bigint,
    replies bigint,
    reply_rate numeric,
    positive_replies bigint,
    positive_reply_rate numeric,
    bounces bigint,
    bounce_rate numeric,
    unique_leads bigint
)
SECURITY DEFINER
SET search_path = public
AS $$
SELECT 
    c.id as client_id,
    c."Company Name" as client_name,
    c."Domain" as client_domain,
    c."Onboarding Date" as client_onboard_date,
    c."Services" as client_services,
    COALESCE(bs.emails_sent, 0) + COALESCE(inst.emails_sent, 0) as emails_sent,
    COALESCE(mr.replies, 0) as replies,
    CASE 
        WHEN (COALESCE(bs.emails_sent, 0) + COALESCE(inst.emails_sent, 0)) > 0 
        THEN ROUND((COALESCE(mr.replies, 0)::numeric / 
                   (COALESCE(bs.emails_sent, 0) + COALESCE(inst.emails_sent, 0))::numeric) * 100, 2)
        ELSE 0::numeric 
    END as reply_rate,
    COALESCE(mr.positive_replies, 0) as positive_replies,
    CASE 
        WHEN (COALESCE(bs.emails_sent, 0) + COALESCE(inst.emails_sent, 0)) > 0 
        THEN ROUND((COALESCE(mr.positive_replies, 0)::numeric / 
                   (COALESCE(bs.emails_sent, 0) + COALESCE(inst.emails_sent, 0))::numeric) * 100, 2)
        ELSE 0::numeric 
    END as positive_reply_rate,
    COALESCE(mr.bounces, 0) as bounces,
    CASE 
        WHEN (COALESCE(bs.emails_sent, 0) + COALESCE(inst.emails_sent, 0)) > 0 
        THEN ROUND((COALESCE(mr.bounces, 0)::numeric / 
                   (COALESCE(bs.emails_sent, 0) + COALESCE(inst.emails_sent, 0))::numeric) * 100, 2)
        ELSE 0::numeric 
    END as bounce_rate,
    COALESCE(ul.unique_leads, 0) as unique_leads
FROM "Clients" c
LEFT JOIN (
    SELECT 
        l.client_id,
        COUNT(*) as emails_sent
    FROM bison_sends bs
    INNER JOIN "Leads" l ON bs."Lead_id" = l.id
    GROUP BY l.client_id
) bs ON bs.client_id = c.id
LEFT JOIN (
    SELECT 
        l.client_id,
        COUNT(*) as emails_sent
    FROM instantly_sends ins
    INNER JOIN "Leads" l ON ins."Lead_id" = l.id
    GROUP BY l.client_id
) inst ON inst.client_id = c.id
LEFT JOIN (
    SELECT 
        l.client_id,
        COUNT(*) as replies,
        COUNT(*) FILTER (
            WHERE TRIM(LOWER(mr.sentiment)) IN (
                'meeting request',
                'positive',
                'interested',
                'long-term prospect',
                'long-term prospect (ltp)',
                'info request',
                'referral'
            )
        ) as positive_replies,
        COUNT(*) FILTER (
            WHERE TRIM(LOWER(mr.sentiment)) IN ('bounce', 'soft bounce', 'hard bounce', 'invalid inbox')
        ) as bounces
    FROM missive_replies mr
    INNER JOIN "Leads" l ON mr.lead_id = l.id
    GROUP BY l.client_id
) mr ON mr.client_id = c.id
LEFT JOIN (
    SELECT 
        "Leads".client_id,
        COUNT(DISTINCT "Leads".internal_id) as unique_leads
    FROM "Leads"
    GROUP BY "Leads".client_id
) ul ON ul.client_id = c.id
ORDER BY c.id;
$$ LANGUAGE sql STABLE;

-- Performance indexes for get_client_statistics() function
-- These indexes optimize the joins and filters used in the function

-- Index for Leads table client_id (used in multiple joins)
CREATE INDEX IF NOT EXISTS idx_leads_client_id ON "Leads" (client_id);

-- Index for bison_sends Lead_id (join with Leads table)
CREATE INDEX IF NOT EXISTS idx_bison_sends_lead_id ON bison_sends ("Lead_id");

-- Index for instantly_sends Lead_id (join with Leads table)
CREATE INDEX IF NOT EXISTS idx_instantly_sends_lead_id ON instantly_sends ("Lead_id");

-- Index for missive_replies lead_id (join with Leads table)
CREATE INDEX IF NOT EXISTS idx_missive_replies_lead_id ON missive_replies (lead_id);

-- Index for missive_replies sentiment (used in FILTER conditions)
CREATE INDEX IF NOT EXISTS idx_missive_replies_sentiment ON missive_replies (sentiment);

-- Composite index for missive_replies to optimize both join and filter
CREATE INDEX IF NOT EXISTS idx_missive_replies_lead_sentiment ON missive_replies (lead_id, sentiment);

-- Index for Leads internal_id and client_id for unique leads counting
CREATE INDEX IF NOT EXISTS idx_leads_client_internal ON "Leads" (client_id, internal_id);

-- Composite index for bison_sends optimization
CREATE INDEX IF NOT EXISTS idx_bison_sends_lead_client ON bison_sends ("Lead_id") 
INCLUDE (id) WHERE "Lead_id" IS NOT NULL;

-- Composite index for instantly_sends optimization  
CREATE INDEX IF NOT EXISTS idx_instantly_sends_lead_client ON instantly_sends ("Lead_id")
INCLUDE (id) WHERE "Lead_id" IS NOT NULL;


-- Speeds date filters in get_send_volume_trends
CREATE INDEX IF NOT EXISTS idx_bison_sends_created_at ON bison_sends (created_at);
CREATE INDEX IF NOT EXISTS idx_instantly_sends_created_at ON instantly_sends (created_at);
CREATE INDEX IF NOT EXISTS idx_missive_replies_created_at ON missive_replies (created_at);

-- Optional composites when platform filter + date are used
CREATE INDEX IF NOT EXISTS idx_missive_bison_created_at ON missive_replies (created_at) WHERE bison_reply_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_missive_inst_created_at ON missive_replies (created_at) WHERE instantly_reply_id IS NOT NULL;






-- ===================================================================
-- PERFORMANCE OPTIMIZED RPC FUNCTIONS
-- ===================================================================

-- Fast version of client statistics with materialized view approach
CREATE OR REPLACE FUNCTION get_client_statistics_fast()
RETURNS TABLE (
    client_id bigint,
    client_name text,
    client_domain text,
    client_onboard_date date,
    client_services text,
    emails_sent bigint,
    replies bigint,
    reply_rate numeric,
    positive_replies bigint,
    positive_reply_rate numeric,
    bounces bigint,
    bounce_rate numeric,
    unique_leads bigint
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Optimize for faster execution
    PERFORM set_config('statement_timeout', '120000', true); -- 2 minutes timeout
    PERFORM set_config('work_mem', '512MB', true); -- Increase work memory
    PERFORM set_config('enable_hashjoin', 'on', true);
    PERFORM set_config('enable_mergejoin', 'on', true);
    
    RETURN QUERY
    WITH email_stats AS (
        -- Pre-aggregate email sends by platform
        SELECT 
            l.client_id,
            SUM(CASE WHEN bs."Lead_id" IS NOT NULL THEN 1 ELSE 0 END) as bison_sends,
            SUM(CASE WHEN ins."Lead_id" IS NOT NULL THEN 1 ELSE 0 END) as instantly_sends
        FROM "Leads" l
        LEFT JOIN bison_sends bs ON bs."Lead_id" = l.id
        LEFT JOIN instantly_sends ins ON ins."Lead_id" = l.id
        GROUP BY l.client_id
    ),
    reply_stats AS (
        -- Pre-aggregate reply statistics
        SELECT 
            l.client_id,
            COUNT(mr.id) as total_replies,
            COUNT(mr.id) FILTER (
                WHERE TRIM(LOWER(mr.sentiment)) IN (
                    'meeting request', 'positive', 'interested',
                    'long-term prospect', 'long-term prospect (ltp)',
                    'info request', 'referral'
                )
            ) as positive_replies_count,
            COUNT(mr.id) FILTER (
                WHERE TRIM(LOWER(mr.sentiment)) IN (
                    'bounce', 'soft bounce', 'hard bounce', 'invalid inbox'
                )
            ) as bounces_count
        FROM "Leads" l
        INNER JOIN missive_replies mr ON mr.lead_id = l.id
        GROUP BY l.client_id
    ),
    lead_stats AS (
        -- Pre-aggregate unique leads
        SELECT 
            l.client_id,
            COUNT(DISTINCT l.internal_id) as unique_leads_count
        FROM "Leads" l
        GROUP BY l.client_id
    )
    SELECT 
        c.id as client_id,
        c."Company Name" as client_name,
        c."Domain" as client_domain,
        c."Onboarding Date" as client_onboard_date,
        c."Services" as client_services,
        COALESCE(es.bison_sends, 0) + COALESCE(es.instantly_sends, 0) as emails_sent,
        COALESCE(rs.total_replies, 0) as replies,
        CASE 
            WHEN (COALESCE(es.bison_sends, 0) + COALESCE(es.instantly_sends, 0)) > 0 
            THEN ROUND((COALESCE(rs.total_replies, 0)::numeric / 
                       (COALESCE(es.bison_sends, 0) + COALESCE(es.instantly_sends, 0))::numeric) * 100, 2)
            ELSE 0::numeric 
        END as reply_rate,
        COALESCE(rs.positive_replies_count, 0) as positive_replies,
        CASE 
            WHEN (COALESCE(es.bison_sends, 0) + COALESCE(es.instantly_sends, 0)) > 0 
            THEN ROUND((COALESCE(rs.positive_replies_count, 0)::numeric / 
                       (COALESCE(es.bison_sends, 0) + COALESCE(es.instantly_sends, 0))::numeric) * 100, 2)
            ELSE 0::numeric 
        END as positive_reply_rate,
        COALESCE(rs.bounces_count, 0) as bounces,
        CASE 
            WHEN (COALESCE(es.bison_sends, 0) + COALESCE(es.instantly_sends, 0)) > 0 
            THEN ROUND((COALESCE(rs.bounces_count, 0)::numeric / 
                       (COALESCE(es.bison_sends, 0) + COALESCE(es.instantly_sends, 0))::numeric) * 100, 2)
            ELSE 0::numeric 
        END as bounce_rate,
        COALESCE(ls.unique_leads_count, 0) as unique_leads
    FROM "Clients" c
    LEFT JOIN email_stats es ON es.client_id = c.id
    LEFT JOIN reply_stats rs ON rs.client_id = c.id
    LEFT JOIN lead_stats ls ON ls.client_id = c.id
    ORDER BY c.id;
END;
$$ LANGUAGE plpgsql STABLE;
