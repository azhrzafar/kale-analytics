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
    leads bigint
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
        (SELECT COUNT(DISTINCT lead_email) FROM bison_sends) as leads;
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
    leads bigint
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
        (SELECT COUNT(DISTINCT instantly_lead_email) FROM instantly_sends) as leads;
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
