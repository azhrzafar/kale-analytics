-- Base, reusable views per platform (fast to create, no storage)
CREATE OR REPLACE VIEW unified_bison_sends_v AS
SELECT
  'bison'::text AS platform,
  bs.id          AS send_id,
  bs.created_at  AS created_at,
  bs.lead_email  AS lead_email,
  bs."Lead_id"   AS lead_id,
  bs.inbox_sender_account AS inbox_id,
  bs.raw_message_id AS raw_message_id,
  bs.subject     AS subject,
  bc.id          AS campaign_pk,
  COALESCE(bc.campaign_id::text, NULL) AS campaign_external_id,
  bc.name        AS campaign_name,
  l.client_id    AS client_id 
FROM bison_sends bs
LEFT JOIN bison_campaigns bc ON bc.id = bs.campaign_id
LEFT JOIN "Leads" l ON l.id = bs."Lead_id";

CREATE OR REPLACE VIEW unified_instantly_sends_v AS
SELECT
  'instantly'::text AS platform,
  ins.id            AS send_id,
  ins.created_at    AS created_at,
  ins.instantly_lead_email AS lead_email,
  ins."Lead_id"     AS lead_id,
  ins.inbox_id      AS inbox_id,
  ins.raw_message_id AS raw_message_id,
  ins.subject       AS subject,
  ic.id             AS campaign_pk,
  ic.campaign_id    AS campaign_external_id,
  ic.name           AS campaign_name,
  l.client_id       AS client_id
FROM instantly_sends ins
LEFT JOIN instantly_campaigns ic ON ic.id = ins.campaign_id
LEFT JOIN "Leads" l ON l.id = ins."Lead_id";

-- Materialize per-platform first (smaller, faster to refresh)
CREATE OR REPLACE MATERIALIZED VIEW bison_sends_mv AS
SELECT * FROM unified_bison_sends_v

CREATE OR REPLACE MATERIALIZED VIEW instantly_sends_mv AS
SELECT * FROM unified_instantly_sends_v

-- Indexes for per-platform MVs
CREATE UNIQUE INDEX IF NOT EXISTS idx_bison_sends_mv_unique ON bison_sends_mv (send_id);
CREATE INDEX IF NOT EXISTS idx_bison_sends_mv_created_at ON bison_sends_mv (created_at);
CREATE INDEX IF NOT EXISTS idx_bison_sends_mv_client_id ON bison_sends_mv (client_id);
CREATE INDEX IF NOT EXISTS idx_bison_sends_mv_campaign_pk ON bison_sends_mv (campaign_pk);
CREATE INDEX IF NOT EXISTS idx_bison_sends_mv_lead_id ON bison_sends_mv (lead_id);
CREATE INDEX IF NOT EXISTS idx_bison_sends_mv_raw_msg_id ON bison_sends_mv (raw_message_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_instantly_sends_mv_unique ON instantly_sends_mv (send_id);
CREATE INDEX IF NOT EXISTS idx_instantly_sends_mv_created_at ON instantly_sends_mv (created_at);
CREATE INDEX IF NOT EXISTS idx_instantly_sends_mv_client_id ON instantly_sends_mv (client_id);
CREATE INDEX IF NOT EXISTS idx_instantly_sends_mv_campaign_pk ON instantly_sends_mv (campaign_pk);
CREATE INDEX IF NOT EXISTS idx_instantly_sends_mv_lead_id ON instantly_sends_mv (lead_id);
CREATE INDEX IF NOT EXISTS idx_instantly_sends_mv_raw_msg_id ON instantly_sends_mv (raw_message_id);

-- Final unified MV now unions the pre-materialized per-platform data
CREATE OR REPLACE MATERIALIZED VIEW unified_sends_mv AS
SELECT * FROM bison_sends_mv
UNION ALL
SELECT * FROM instantly_sends_mv


-- Unique index required for CONCURRENTLY refresh (assumes send_id is unique per platform)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unified_sends_mv_unique
  ON unified_sends_mv (platform, send_id);

-- Helpful query indexes on the MV (pick what you actually filter by)
CREATE INDEX IF NOT EXISTS idx_unified_sends_mv_created_at ON unified_sends_mv (created_at);
CREATE INDEX IF NOT EXISTS idx_unified_sends_mv_client_id  ON unified_sends_mv (client_id);
CREATE INDEX IF NOT EXISTS idx_unified_sends_mv_campaign_pk ON unified_sends_mv (campaign_pk);
CREATE INDEX IF NOT EXISTS idx_unified_sends_mv_inbox_id   ON unified_sends_mv (inbox_id);
CREATE INDEX IF NOT EXISTS idx_unified_sends_mv_lead_id    ON unified_sends_mv (lead_id);
CREATE INDEX IF NOT EXISTS idx_unified_sends_mv_raw_msg_id ON unified_sends_mv (raw_message_id);


-- ================================================================
-- 2) Unified Replies via Missive (links to platform replies) - OPTIMIZED
-- ================================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS unified_replies_mv AS
SELECT
  mr.id                  AS reply_id,
  mr.created_at          AS created_at,
  mr.delivered_at        AS delivered_at,
  mr.inbox_id            AS inbox_id,
  mr.lead_id             AS lead_id,
  mr.raw_message_id      AS raw_message_id,
  mr.sentiment           AS sentiment,
  normalize_sentiment(mr.sentiment) AS sentiment_label,
  mr.lead_category       AS lead_category,
  CASE 
    WHEN mr.bison_reply_id IS NOT NULL THEN 'bison'
    WHEN mr.instantly_reply_id IS NOT NULL THEN 'instantly'
    ELSE NULL
  END::text              AS platform,
  mr.bison_reply_id      AS bison_reply_id,
  mr.instantly_reply_id  AS instantly_reply_id,
  -- Campaign linkage (platform-specific)
  COALESCE(br.campaign_id, ir.campaign_id)        AS platform_campaign_pk,
  COALESCE(bc.campaign_id::text, ic.campaign_id)  AS campaign_external_id,
  COALESCE(bc.name, ic.name)                      AS campaign_name,
  l.client_id                                     AS client_id
FROM missive_replies mr
LEFT JOIN "Leads" l ON l.id = mr.lead_id
LEFT JOIN bison_replies br ON br.id = mr.bison_reply_id
LEFT JOIN bison_campaigns bc ON bc.id = br.campaign_id
LEFT JOIN instantly_replies ir ON ir.id = mr.instantly_reply_id
LEFT JOIN instantly_campaigns ic ON ic.id = ir.campaign_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unified_replies_mv_unique
  ON unified_replies_mv (reply_id);

-- ================================================================
-- 4) KPI Overview (single row) – totals and rates
-- ================================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS kpi_overview_mv AS
WITH
  sends AS (
    SELECT COUNT(*) AS total_emails_sent FROM unified_sends_mv
  ),
  replies AS (
    SELECT 
      COUNT(*) AS total_replies,
      COUNT(*) FILTER (WHERE sentiment_label = 'positive') AS positive_replies,
      COUNT(*) FILTER (WHERE sentiment_label = 'negative') AS total_bounce
    FROM unified_replies_mv
  ),
  leads AS (
    SELECT COUNT(*) AS unique_leads_connected
    FROM (
      SELECT 1 FROM "Leads" WHERE "Email" IS NOT NULL AND "Email" <> '' GROUP BY LOWER("Email")
    ) t
  )
SELECT 
  1 AS id,
  s.total_emails_sent,
  r.total_replies,
  CASE WHEN s.total_emails_sent > 0 THEN ROUND((r.total_replies::numeric / s.total_emails_sent::numeric) * 100, 2) ELSE 0::numeric END AS reply_rate,
  r.total_bounce,
  CASE WHEN s.total_emails_sent > 0 THEN ROUND((r.total_bounce::numeric / s.total_emails_sent::numeric) * 100, 2) ELSE 0::numeric END AS bounce_rate,
  r.positive_replies,
  CASE WHEN r.total_replies > 0 THEN ROUND((r.positive_replies::numeric / r.total_replies::numeric) * 100, 2) ELSE 0::numeric END AS positive_replies_rate,
  l.unique_leads_connected,
  CASE 
    WHEN s.total_emails_sent = 0 OR r.positive_replies = 0 THEN '0:0'
    ELSE (ROUND((s.total_emails_sent::numeric / NULLIF(r.positive_replies,0)::numeric), 0)::text || ':1')
  END AS send_positive_ratio
FROM sends s, replies r, leads l;

CREATE UNIQUE INDEX IF NOT EXISTS idx_kpi_overview_mv_id ON kpi_overview_mv (id);

-- ================================================================
-- 5) Platform Comparison – sends, replies, rates, leads, campaigns
-- ================================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS platform_comparison_mv AS
WITH platforms AS (
  SELECT unnest(ARRAY['bison','instantly'])::text AS platform
),
send_stats AS (
  SELECT platform, COUNT(*) AS sends, COUNT(DISTINCT lead_email) AS leads
  FROM unified_sends_mv
  GROUP BY platform
),
reply_stats AS (
  SELECT platform,
         COUNT(*) AS replies,
         COUNT(*) FILTER (WHERE sentiment_label = 'positive') AS positive,
         COUNT(*) FILTER (WHERE sentiment_label = 'negative') AS bounces
  FROM unified_replies_mv
  GROUP BY platform
),
campaign_counts AS (
  SELECT 'bison'::text AS platform, COUNT(*) AS campaigns FROM bison_campaigns
  UNION ALL
  SELECT 'instantly'::text AS platform, COUNT(*) AS campaigns FROM instantly_campaigns
)
SELECT 
  p.platform,
  COALESCE(ss.sends, 0) AS sends,
  COALESCE(rs.replies, 0) AS replies,
  CASE WHEN COALESCE(ss.sends,0) > 0 THEN ROUND((COALESCE(rs.replies,0)::numeric / ss.sends::numeric) * 100, 2) ELSE 0::numeric END AS reply_rate,
  CASE WHEN COALESCE(rs.replies,0) > 0 THEN ROUND((COALESCE(rs.positive,0)::numeric / rs.replies::numeric) * 100, 2) ELSE 0::numeric END AS positive_rate,
  CASE WHEN COALESCE(ss.sends,0) > 0 THEN ROUND((COALESCE(rs.bounces,0)::numeric / ss.sends::numeric) * 100, 2) ELSE 0::numeric END AS bounce_rate,
  COALESCE(ss.leads, 0) AS leads,
  COALESCE(cc.campaigns, 0) AS campaigns
FROM platforms p
LEFT JOIN send_stats ss ON ss.platform = p.platform
LEFT JOIN reply_stats rs ON rs.platform = p.platform
LEFT JOIN campaign_counts cc ON cc.platform = p.platform
ORDER BY p.platform;

CREATE UNIQUE INDEX IF NOT EXISTS idx_platform_comparison_mv_platform ON platform_comparison_mv (platform);

-- ================================================================
-- 6) Send Volume Trend – by day, aggregated across platforms - OPTIMIZED
-- ================================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS send_volume_trend_mv AS
WITH days AS (
  SELECT d::date AS day
  FROM generate_series(
    (CURRENT_DATE - INTERVAL '90 days')::date,  -- Fixed range for better performance
    CURRENT_DATE::date,
    interval '1 day'
  ) AS g(d)
),
sends AS (
  SELECT date_trunc('day', created_at)::date AS day, COUNT(*) AS emails
  FROM unified_sends_mv
  GROUP BY 1
),
replies AS (
  SELECT 
    date_trunc('day', created_at)::date AS day,
    COUNT(*) FILTER (WHERE TRUE) AS replies,
    COUNT(*) FILTER (WHERE sentiment_label = 'positive') AS positive,
    COUNT(*) FILTER (WHERE sentiment_label = 'negative') AS bounces
  FROM unified_replies_mv
  GROUP BY 1
)
SELECT 
  d.day AS date,
  COALESCE(s.emails, 0)   AS emails,
  COALESCE(r.replies, 0)  AS replies,
  COALESCE(r.positive, 0) AS positive,
  COALESCE(r.bounces, 0)  AS bounces
FROM days d
LEFT JOIN sends s ON s.day = d.day
LEFT JOIN replies r ON r.day = d.day
ORDER BY d.day;

CREATE UNIQUE INDEX IF NOT EXISTS idx_send_volume_trend_mv_date ON send_volume_trend_mv (date);


-- ================================================================
-- 7) Client Statistics (per client)
-- ================================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS client_statistics_mv AS
WITH send_stats AS (
  SELECT 
    client_id,
    COUNT(*) AS emails_sent,
    COUNT(DISTINCT lead_id) FILTER (WHERE lead_id IS NOT NULL) AS unique_leads
  FROM unified_sends_mv
  GROUP BY client_id
),
reply_stats AS (
  SELECT 
    client_id,
    COUNT(*) AS replies,
    COUNT(*) FILTER (
      WHERE sentiment_label = 'positive'
    ) AS positive_replies,
    COUNT(*) FILTER (
      WHERE sentiment_label = 'negative'
    ) AS bounces
  FROM unified_replies_mv
  GROUP BY client_id
)
SELECT 
  c.id AS client_id,
  c."Company Name" AS client_name,
  c."Domain" AS client_domain,
  c."Onboarding Date" AS client_onboard_date,
  c."Services" AS client_services,
  COALESCE(ss.emails_sent, 0) AS emails_sent,
  COALESCE(rs.replies, 0) AS replies,
  CASE WHEN COALESCE(ss.emails_sent, 0) > 0 THEN ROUND((COALESCE(rs.replies, 0)::numeric / ss.emails_sent::numeric) * 100, 2) ELSE 0::numeric END AS reply_rate,
  COALESCE(rs.positive_replies, 0) AS positive_replies,
  CASE WHEN COALESCE(ss.emails_sent, 0) > 0 THEN ROUND((COALESCE(rs.positive_replies, 0)::numeric / ss.emails_sent::numeric) * 100, 2) ELSE 0::numeric END AS positive_reply_rate,
  COALESCE(rs.bounces, 0) AS bounces,
  CASE WHEN COALESCE(ss.emails_sent, 0) > 0 THEN ROUND((COALESCE(rs.bounces, 0)::numeric / ss.emails_sent::numeric) * 100, 2) ELSE 0::numeric END AS bounce_rate,
  COALESCE(ss.unique_leads, 0) AS unique_leads
FROM "Clients" c
LEFT JOIN send_stats ss ON ss.client_id = c.id
LEFT JOIN reply_stats rs ON rs.client_id = c.id
ORDER BY c.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_client_statistics_mv_client_id ON client_statistics_mv (client_id);

-- ================================================================
-- SENTIMENT NORMALIZATION FUNCTION
-- ================================================================
CREATE OR REPLACE FUNCTION normalize_sentiment(input_sentiment text)
RETURNS text
IMMUTABLE
AS $$
BEGIN
  RETURN CASE 
    WHEN input_sentiment IS NULL THEN NULL
    WHEN TRIM(LOWER(input_sentiment)) IN (
      'meeting request','positive','interested','long-term prospect','long-term prospect (ltp)','info request','referral'
    ) THEN 'positive'
    WHEN TRIM(LOWER(input_sentiment)) IN ('bounce','soft bounce','hard bounce','invalid inbox') THEN 'negative'
    ELSE NULL
  END;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- REFRESH FUNCTIONS
-- ================================================================
CREATE OR REPLACE FUNCTION refresh_unified_sends_mv(concurrent boolean DEFAULT true)
RETURNS void
SECURITY DEFINER
SET search_path = public
SET statement_timeout = '0'
AS $$
DECLARE
  row_count bigint;
  bison_count bigint;
  instantly_count bigint;
BEGIN
  -- Refresh per-platform MVs first (faster, smaller)
  SELECT COUNT(*) INTO bison_count FROM bison_sends_mv;
  IF bison_count = 0 OR NOT concurrent THEN
    EXECUTE 'REFRESH MATERIALIZED VIEW bison_sends_mv';
  ELSE
    EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY bison_sends_mv';
  END IF;
  
  SELECT COUNT(*) INTO instantly_count FROM instantly_sends_mv;
  IF instantly_count = 0 OR NOT concurrent THEN
    EXECUTE 'REFRESH MATERIALIZED VIEW instantly_sends_mv';
  ELSE
    EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY instantly_sends_mv';
  END IF;

  -- Now refresh the unified MV
  SELECT COUNT(*) INTO row_count FROM unified_sends_mv;
  IF row_count = 0 OR NOT concurrent THEN
    EXECUTE 'REFRESH MATERIALIZED VIEW unified_sends_mv';
  ELSE
    EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY unified_sends_mv';
  END IF;
  ANALYZE unified_sends_mv;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION refresh_unified_replies_mv(concurrent boolean DEFAULT true)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF concurrent THEN
    EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY unified_replies_mv';
  ELSE
    EXECUTE 'REFRESH MATERIALIZED VIEW unified_replies_mv';
  END IF;
  ANALYZE unified_replies_mv;
END;
$$ LANGUAGE plpgsql VOLATILE;



CREATE OR REPLACE FUNCTION refresh_kpi_overview_mv(concurrent boolean DEFAULT true)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF concurrent THEN
    EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY kpi_overview_mv';
  ELSE
    EXECUTE 'REFRESH MATERIALIZED VIEW kpi_overview_mv';
  END IF;
  ANALYZE kpi_overview_mv;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION refresh_platform_comparison_mv(concurrent boolean DEFAULT true)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF concurrent THEN
    EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY platform_comparison_mv';
  ELSE
    EXECUTE 'REFRESH MATERIALIZED VIEW platform_comparison_mv';
  END IF;
  ANALYZE platform_comparison_mv;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION refresh_send_volume_trend_mv(concurrent boolean DEFAULT true)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF concurrent THEN
    EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY send_volume_trend_mv';
  ELSE
    EXECUTE 'REFRESH MATERIALIZED VIEW send_volume_trend_mv';
  END IF;
  ANALYZE send_volume_trend_mv;
END;
$$ LANGUAGE plpgsql VOLATILE;



-- Refresh function for client statistics
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
  ANALYZE client_statistics_mv;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ================================================================
-- 8) Refresh All MVs
-- ================================================================

-- Convenience function to refresh all
CREATE OR REPLACE FUNCTION refresh_all_analytics_mvs(concurrent boolean DEFAULT true)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM refresh_unified_sends_mv(concurrent);
  PERFORM refresh_unified_replies_mv(concurrent);
  PERFORM refresh_kpi_overview_mv(concurrent);
  PERFORM refresh_platform_comparison_mv(concurrent);
  PERFORM refresh_send_volume_trend_mv(concurrent);
  PERFORM refresh_client_statistics_mv(concurrent);
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ================================================================
-- FILTERED FUNCTIONS (parameterized functions)
-- Supports: date range, platform (NULL = all), client_id (NULL = all)
-- ================================================================

-- 1) Unified Sends (filtered)
CREATE OR REPLACE FUNCTION get_unified_sends_filtered(
  start_date date DEFAULT NULL,
  end_date date DEFAULT NULL,
  platform_filter text DEFAULT NULL,
  client_id_filter bigint DEFAULT NULL
)
RETURNS TABLE (
  platform text,
  send_id bigint,
  created_at timestamptz,
  lead_email text,
  lead_id bigint,
  inbox_id uuid,
  raw_message_id text,
  subject text,
  campaign_pk bigint,
  campaign_external_id text,
  campaign_name text,
  client_id bigint
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.platform,
    s.send_id,
    s.created_at,
    s.lead_email,
    s.lead_id,
    s.inbox_id,
    s.raw_message_id,
    s.subject,
    s.campaign_pk,
    s.campaign_external_id,
    s.campaign_name,
    s.client_id
  FROM unified_sends_mv s
  WHERE (start_date IS NULL OR s.created_at >= start_date::timestamptz)
    AND (end_date   IS NULL OR s.created_at < (end_date + INTERVAL '1 day')::timestamptz)
    AND (platform_filter IS NULL OR s.platform = platform_filter)
    AND (client_id_filter IS NULL OR s.client_id = client_id_filter)
  ORDER BY s.created_at DESC, s.platform, s.send_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- 2) Unified Replies (filtered)
CREATE OR REPLACE FUNCTION get_unified_replies_filtered(
  start_date date DEFAULT NULL,
  end_date date DEFAULT NULL,
  platform_filter text DEFAULT NULL,
  client_id_filter bigint DEFAULT NULL
)
RETURNS TABLE (
  reply_id uuid,
  created_at timestamptz,
  delivered_at timestamptz,
  inbox_id uuid,
  lead_id bigint,
  raw_message_id text,
  sentiment text,
  sentiment_label text,
  lead_category text,
  platform text,
  bison_reply_id bigint,
  instantly_reply_id bigint,
  platform_campaign_pk bigint,
  campaign_external_id text,
  campaign_name text,
  client_id bigint
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.reply_id,
    r.created_at,
    r.delivered_at,
    r.inbox_id,
    r.lead_id,
    r.raw_message_id,
    r.sentiment,
    r.sentiment_label,
    r.lead_category,
    r.platform,
    r.bison_reply_id,
    r.instantly_reply_id,
    r.platform_campaign_pk,
    r.campaign_external_id,
    r.campaign_name,
    r.client_id
  FROM unified_replies_mv r
  WHERE (start_date IS NULL OR r.created_at >= start_date::timestamptz)
    AND (end_date   IS NULL OR r.created_at < (end_date + INTERVAL '1 day')::timestamptz)
    AND (platform_filter IS NULL OR r.platform = platform_filter)
    AND (client_id_filter IS NULL OR r.client_id = client_id_filter)
  ORDER BY r.created_at DESC, r.platform, r.reply_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- 3) KPI Overview (filtered)
CREATE OR REPLACE FUNCTION get_kpi_overview_filtered(
  start_date date DEFAULT NULL,
  end_date date DEFAULT NULL,
  platform_filter text DEFAULT NULL,
  client_id_filter bigint DEFAULT NULL
)
RETURNS TABLE (
  total_emails_sent bigint,
  total_replies bigint,
  reply_rate numeric,
  total_bounce bigint,
  bounce_rate numeric,
  positive_replies bigint,
  positive_replies_rate numeric,
  unique_leads_connected bigint,
  send_positive_ratio text
) 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  emails_sent bigint := 0;
  total_replies bigint := 0;
  positive_replies bigint := 0;
  total_bounce bigint := 0;
  unique_leads bigint := 0;
BEGIN
  -- Get emails sent count
  SELECT COUNT(*) INTO emails_sent
  FROM unified_sends_mv s
  WHERE (start_date IS NULL OR s.created_at >= start_date::timestamptz)
    AND (end_date IS NULL OR s.created_at < (end_date + INTERVAL '1 day')::timestamptz)
    AND (platform_filter IS NULL OR s.platform = platform_filter)
    AND (client_id_filter IS NULL OR s.client_id = client_id_filter);

  -- Get replies count
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE sentiment_label = 'positive'),
    COUNT(*) FILTER (WHERE sentiment_label = 'negative')
  INTO total_replies, positive_replies, total_bounce
  FROM unified_replies_mv r
  WHERE (start_date IS NULL OR r.created_at >= start_date::timestamptz)
    AND (end_date IS NULL OR r.created_at < (end_date + INTERVAL '1 day')::timestamptz)
    AND (platform_filter IS NULL OR r.platform = platform_filter)
    AND (client_id_filter IS NULL OR r.client_id = client_id_filter);

  -- Get unique leads count
  SELECT COUNT(*) INTO unique_leads
  FROM (
    SELECT DISTINCT lead_id FROM unified_sends_mv s
    WHERE (start_date IS NULL OR s.created_at >= start_date::timestamptz)
      AND (end_date IS NULL OR s.created_at < (end_date + INTERVAL '1 day')::timestamptz)
      AND (platform_filter IS NULL OR s.platform = platform_filter)
      AND (client_id_filter IS NULL OR s.client_id = client_id_filter)
      AND lead_id IS NOT NULL
    UNION
    SELECT DISTINCT lead_id FROM unified_replies_mv r
    WHERE (start_date IS NULL OR r.created_at >= start_date::timestamptz)
      AND (end_date IS NULL OR r.created_at < (end_date + INTERVAL '1 day')::timestamptz)
      AND (platform_filter IS NULL OR r.platform = platform_filter)
      AND (client_id_filter IS NULL OR r.client_id = client_id_filter)
      AND lead_id IS NOT NULL
  ) u;

  RETURN QUERY
  SELECT 
    emails_sent,
    total_replies,
    CASE WHEN emails_sent > 0 THEN ROUND((total_replies::numeric / emails_sent::numeric) * 100, 2) ELSE 0::numeric END AS reply_rate,
    total_bounce,
    CASE WHEN emails_sent > 0 THEN ROUND((total_bounce::numeric / emails_sent::numeric) * 100, 2) ELSE 0::numeric END AS bounce_rate,
    positive_replies,
    CASE WHEN total_replies > 0 THEN ROUND((positive_replies::numeric / total_replies::numeric) * 100, 2) ELSE 0::numeric END AS positive_replies_rate,
    unique_leads,
    CASE 
      WHEN emails_sent = 0 OR positive_replies = 0 THEN '0:0'
      ELSE (ROUND((emails_sent::numeric / NULLIF(positive_replies,0)::numeric), 0)::text || ':1')
    END AS send_positive_ratio;
END;
$$ LANGUAGE plpgsql STABLE;


-- 4) Platform Comparison (filtered)
CREATE OR REPLACE FUNCTION get_platform_comparison_filtered(
  start_date date DEFAULT NULL,
  end_date date DEFAULT NULL,
  client_id_filter bigint DEFAULT NULL
)
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
  RETURN QUERY
  WITH send_stats AS (
    SELECT s.platform, COUNT(*) AS sends, COUNT(DISTINCT s.lead_id) AS leads,
           COUNT(DISTINCT s.campaign_pk) AS campaigns
    FROM unified_sends_mv s
    WHERE (start_date IS NULL OR s.created_at >= start_date::timestamptz)
      AND (end_date   IS NULL OR s.created_at < (end_date + INTERVAL '1 day')::timestamptz)
      AND (client_id_filter IS NULL OR s.client_id = client_id_filter)
    GROUP BY 1
  ),
  reply_stats AS (
    SELECT r.platform, COUNT(*) AS replies,
           COUNT(*) FILTER (WHERE r.sentiment_label = 'positive') AS positive,
           COUNT(*) FILTER (WHERE r.sentiment_label = 'negative') AS bounces
    FROM unified_replies_mv r
    WHERE (start_date IS NULL OR r.created_at >= start_date::timestamptz)
      AND (end_date   IS NULL OR r.created_at < (end_date + INTERVAL '1 day')::timestamptz)
      AND (client_id_filter IS NULL OR r.client_id = client_id_filter)
    GROUP BY 1
  )
  SELECT 
    ss.platform,
    COALESCE(ss.sends, 0) AS sends,
    COALESCE(rs.replies, 0) AS replies,
    CASE WHEN COALESCE(ss.sends,0) > 0 THEN ROUND((COALESCE(rs.replies,0)::numeric / ss.sends::numeric) * 100, 2) ELSE 0::numeric END AS reply_rate,
    CASE WHEN COALESCE(rs.replies,0) > 0 THEN ROUND((COALESCE(rs.positive,0)::numeric / rs.replies::numeric) * 100, 2) ELSE 0::numeric END AS positive_rate,
    CASE WHEN COALESCE(ss.sends,0) > 0 THEN ROUND((COALESCE(rs.bounces,0)::numeric / ss.sends::numeric) * 100, 2) ELSE 0::numeric END AS bounce_rate,
    COALESCE(ss.leads, 0) AS leads,
    COALESCE(ss.campaigns, 0) AS campaigns
  FROM send_stats ss
  LEFT JOIN reply_stats rs ON rs.platform = ss.platform
  ORDER BY ss.platform;
END;
$$ LANGUAGE plpgsql STABLE;


-- 5) Send Volume Trend (filtered)
CREATE OR REPLACE FUNCTION get_send_volume_trend_filtered(
  start_date date DEFAULT NULL,
  end_date date DEFAULT NULL,
  platform_filter text DEFAULT NULL,
  client_id_filter bigint DEFAULT NULL
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
  RETURN QUERY
  WITH sends AS (
    SELECT date_trunc('day', s.created_at)::date AS day, COUNT(*) AS emails
    FROM unified_sends_mv s
    WHERE s.created_at >= s_date::timestamptz
      AND s.created_at < (e_date + INTERVAL '1 day')::timestamptz
      AND (platform_filter IS NULL OR s.platform = platform_filter)
      AND (client_id_filter IS NULL OR s.client_id = client_id_filter)
    GROUP BY 1
  ),
  replies AS (
    SELECT date_trunc('day', r.created_at)::date AS day,
           COUNT(*) FILTER (WHERE TRUE) AS replies,
           COUNT(*) FILTER (WHERE r.sentiment_label = 'positive') AS positive,
           COUNT(*) FILTER (WHERE r.sentiment_label = 'negative') AS bounces
    FROM unified_replies_mv r
    WHERE r.created_at >= s_date::timestamptz
      AND r.created_at < (e_date + INTERVAL '1 day')::timestamptz
      AND (platform_filter IS NULL OR r.platform = platform_filter)
      AND (client_id_filter IS NULL OR r.client_id = client_id_filter)
    GROUP BY 1
  )
  SELECT 
    d.day AS date,
    COALESCE(s.emails, 0)   AS emails,
    COALESCE(rr.replies, 0)  AS replies,
    COALESCE(rr.positive, 0) AS positive,
    COALESCE(rr.bounces, 0)  AS bounces
  FROM (
    SELECT generate_series(s_date, e_date, interval '1 day')::date AS day
  ) d
  LEFT JOIN sends s ON s.day = d.day
  LEFT JOIN replies rr ON rr.day = d.day
  ORDER BY d.day;
END;
$$ LANGUAGE plpgsql STABLE;



-- 6) Client Statistics (per client)
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

-- ================================================================
-- ESSENTIAL INDEXES

-- Covering index for platform distribution queries (most common)
CREATE INDEX IF NOT EXISTS idx_unified_sends_mv_platform_covering
  ON unified_sends_mv (platform)
  INCLUDE (send_id, created_at, lead_email, lead_id, campaign_name, client_id);

-- Covering index for date range + platform filtering
CREATE INDEX IF NOT EXISTS idx_unified_sends_mv_date_platform_covering
  ON unified_sends_mv (created_at DESC, platform)
  INCLUDE (send_id, lead_email, lead_id,  campaign_name, client_id, subject);

-- Covering index for client-specific analytics
CREATE INDEX IF NOT EXISTS idx_unified_sends_mv_client_covering
  ON unified_sends_mv (client_id, created_at DESC)
  INCLUDE (platform, send_id, lead_email, lead_id,  campaign_name);

-- Covering index for campaign performance queries

-- UNIFIED REPLIES MV - Covering indexes for reply analytics
-- ================================================================

-- Covering index for sentiment analysis queries
CREATE INDEX IF NOT EXISTS idx_unified_replies_mv_sentiment_covering
  ON unified_replies_mv (sentiment_label, created_at DESC)
  INCLUDE (reply_id, platform, lead_id,  campaign_name, client_id);

-- Covering index for platform + date filtering
CREATE INDEX IF NOT EXISTS idx_unified_replies_mv_platform_date_covering
  ON unified_replies_mv (platform, created_at DESC)
  INCLUDE (reply_id, sentiment_label, lead_id,  campaign_name, client_id);

-- Covering index for client-specific reply analytics
CREATE INDEX IF NOT EXISTS idx_unified_replies_mv_client_covering
  ON unified_replies_mv (client_id, created_at DESC)
  INCLUDE (platform, reply_id, sentiment_label, lead_id,  campaign_name);

-- ================================================================
-- PLATFORM COMPARISON MV - Covering indexes for platform analytics
-- ================================================================

-- Covering index for platform comparison dashboard
CREATE INDEX IF NOT EXISTS idx_platform_comparison_mv_platform_covering
  ON platform_comparison_mv (platform)
  INCLUDE (sends, replies, reply_rate, positive_rate, bounce_rate, leads, campaigns);

-- ================================================================
-- CLIENT STATISTICS MV - Covering indexes for client analytics
-- ================================================================

-- Covering index for client performance dashboard
CREATE INDEX IF NOT EXISTS idx_client_statistics_mv_client_covering
  ON client_statistics_mv (client_id)
  INCLUDE (client_name, emails_sent, replies, reply_rate, positive_reply_rate, bounce_rate, unique_leads);

-- Covering index for client search/filtering
CREATE INDEX IF NOT EXISTS idx_client_statistics_mv_name_covering
  ON client_statistics_mv (client_name)
  INCLUDE (client_id, emails_sent, replies, reply_rate, positive_reply_rate, bounce_rate);

-- ================================================================
-- SEND VOLUME TREND MV - Covering indexes for trend analytics
-- ================================================================

-- Covering index for trend analysis (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_send_volume_trend_mv_date_covering
  ON send_volume_trend_mv (date DESC)
  INCLUDE (emails, replies, positive, bounces);

-- ================================================================
-- COMPOSITE COVERING INDEXES FOR COMPLEX DASHBOARD QUERIES
-- ================================================================

-- Multi-column covering index for advanced filtering
CREATE INDEX IF NOT EXISTS idx_unified_sends_mv_advanced_covering
  ON unified_sends_mv (platform, client_id, created_at DESC)
  INCLUDE (send_id, lead_email, lead_id,  campaign_name, subject);

-- Multi-column covering index for reply analytics
CREATE INDEX IF NOT EXISTS idx_unified_replies_mv_advanced_covering
  ON unified_replies_mv (platform, client_id, sentiment_label, created_at DESC)
  INCLUDE (reply_id, lead_id,  campaign_name);

-- ================================================================
-- PARTIAL COVERING INDEXES FOR COMMON FILTER PATTERNS
-- ================================================================

-- Partial covering index for positive replies only
CREATE INDEX IF NOT EXISTS idx_unified_replies_mv_positive_covering
  ON unified_replies_mv (platform, created_at DESC)
  INCLUDE (reply_id, lead_id, campaign_name, client_id)
  WHERE sentiment_label = 'positive';



-- ================================================================
-- MATERIALIZED VIEW INDEXES FOR DASHBOARD FILTERS
-- ================================================================

-- Unified Sends MV indexes for filtering (consolidated)
CREATE INDEX IF NOT EXISTS idx_unified_sends_mv_platform_client_created_at
  ON unified_sends_mv (platform, client_id, created_at DESC);

-- Unified Replies MV indexes for filtering (consolidated)
CREATE INDEX IF NOT EXISTS idx_unified_replies_mv_platform_client_created_at
  ON unified_replies_mv (platform, client_id, created_at DESC);

 

-- Client Statistics MV indexes
 
CREATE INDEX IF NOT EXISTS idx_client_statistics_mv_client_name ON client_statistics_mv (client_name);

-- BRIN for huge append-only timestamp column (cheap, small index)
CREATE INDEX IF NOT EXISTS brin_bison_sends_created_at ON bison_sends USING BRIN (created_at);

-- ================================================================
-- SOURCE TABLE INDEXES
-- ================================================================

-- Bison tables
CREATE INDEX IF NOT EXISTS idx_bison_sends_created_at ON bison_sends (created_at);
CREATE INDEX IF NOT EXISTS idx_bison_sends_lead_id ON bison_sends ("Lead_id");
CREATE INDEX IF NOT EXISTS idx_bison_sends_campaign_id ON bison_sends (campaign_id);
CREATE INDEX IF NOT EXISTS idx_bison_sends_client_id ON bison_sends (inbox_sender_account);

-- Instantly tables
CREATE INDEX IF NOT EXISTS idx_instantly_sends_created_at ON instantly_sends (created_at);
CREATE INDEX IF NOT EXISTS idx_instantly_sends_lead_id ON instantly_sends ("Lead_id");
CREATE INDEX IF NOT EXISTS idx_instantly_sends_campaign_id ON instantly_sends (campaign_id);
CREATE INDEX IF NOT EXISTS idx_instantly_sends_client_id ON instantly_sends (inbox_id);

-- Missive tables
CREATE INDEX IF NOT EXISTS idx_missive_replies_created_at ON missive_replies (created_at);
CREATE INDEX IF NOT EXISTS idx_missive_replies_lead_id ON missive_replies (lead_id);
CREATE INDEX IF NOT EXISTS idx_missive_replies_sentiment ON missive_replies (sentiment);

-- Core tables
CREATE INDEX IF NOT EXISTS idx_leads_client_id ON "Leads" (client_id);
CREATE INDEX IF NOT EXISTS idx_leads_campaign_id ON "Leads" (campaign_id);
CREATE INDEX IF NOT EXISTS idx_bison_campaigns_workspace_id ON bison_campaigns (bison_workspace_id);
CREATE INDEX IF NOT EXISTS idx_bison_workspaces_client_id ON bison_workspaces (client_id);
CREATE INDEX IF NOT EXISTS idx_instantly_campaigns_workspace_id ON instantly_campaigns (workspace_id);
CREATE INDEX IF NOT EXISTS idx_instantly_workspaces_client_id ON instantly_workspaces (client_id);

-- ================================================================
-- CLIENT DETAIL ANALYTICS - Comprehensive client performance data
-- ================================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS client_detail_analytics_mv AS
WITH client_send_stats AS (
  SELECT 
    s.client_id,
    COUNT(*) AS total_emails_sent,
    COUNT(DISTINCT s.lead_id) FILTER (WHERE s.lead_id IS NOT NULL) AS unique_leads_contacted,
    COUNT(DISTINCT s.campaign_pk) AS total_campaigns,
    COUNT(DISTINCT s.platform) AS platforms_used,
    MIN(s.created_at) AS first_send_date,
    MAX(s.created_at) AS last_send_date,
    -- Daily averages for trend calculation
    COUNT(*) / GREATEST(EXTRACT(EPOCH FROM (MAX(s.created_at) - MIN(s.created_at))) / 86400, 1) AS avg_daily_sends,
    -- Platform breakdown
    COUNT(*) FILTER (WHERE s.platform = 'bison') AS bison_sends,
    COUNT(*) FILTER (WHERE s.platform = 'instantly') AS instantly_sends
  FROM unified_sends_mv s
  GROUP BY s.client_id
),
client_reply_stats AS (
  SELECT 
    r.client_id,
    COUNT(*) AS total_replies,
    COUNT(*) FILTER (WHERE r.sentiment_label = 'positive') AS positive_replies,
    COUNT(*) FILTER (WHERE r.sentiment_label = 'negative') AS negative_replies,
    COUNT(*) FILTER (WHERE r.sentiment_label IS NULL) AS neutral_replies,
    -- Reply rates by platform
    COUNT(*) FILTER (WHERE r.platform = 'bison') AS bison_replies,
    COUNT(*) FILTER (WHERE r.platform = 'instantly') AS instantly_replies,
    COUNT(*) FILTER (WHERE r.platform = 'bison' AND r.sentiment_label = 'positive') AS bison_positive,
    COUNT(*) FILTER (WHERE r.platform = 'instantly' AND r.sentiment_label = 'positive') AS instantly_positive
  FROM unified_replies_mv r
  GROUP BY r.client_id
),
client_campaign_performance AS (
  SELECT 
    s.client_id,
    s.campaign_pk,
    s.campaign_name,
    s.platform,
    COUNT(*) AS campaign_sends,
    COUNT(DISTINCT s.lead_id) FILTER (WHERE s.lead_id IS NOT NULL) AS campaign_leads,
    COALESCE(r.campaign_replies, 0) AS campaign_replies,
    COALESCE(r.campaign_positive, 0) AS campaign_positive,
    COALESCE(r.campaign_negative, 0) AS campaign_negative,
    CASE WHEN COUNT(*) > 0 THEN 
      ROUND((COALESCE(r.campaign_replies, 0)::numeric / COUNT(*)::numeric) * 100, 2) 
    ELSE 0 END AS reply_rate,
    CASE WHEN COALESCE(r.campaign_replies, 0) > 0 THEN 
      ROUND((COALESCE(r.campaign_positive, 0)::numeric / r.campaign_replies::numeric) * 100, 2) 
    ELSE 0 END AS positive_rate,
    CASE WHEN COUNT(*) > 0 THEN 
      ROUND((COALESCE(r.campaign_negative, 0)::numeric / COUNT(*)::numeric) * 100, 2) 
    ELSE 0 END AS bounce_rate,
    CASE WHEN COALESCE(r.campaign_positive, 0) > 0 THEN 
      ROUND(COUNT(*)::numeric / r.campaign_positive::numeric, 1) 
    ELSE 0 END AS send_to_positive_ratio
  FROM unified_sends_mv s
  LEFT JOIN (
    SELECT 
      r.client_id,
      r.platform_campaign_pk AS campaign_pk,
      COUNT(*) AS campaign_replies,
      COUNT(*) FILTER (WHERE r.sentiment_label = 'positive') AS campaign_positive,
      COUNT(*) FILTER (WHERE r.sentiment_label = 'negative') AS campaign_negative
    FROM unified_replies_mv r
    GROUP BY r.client_id, r.platform_campaign_pk
  ) r ON r.client_id = s.client_id AND r.campaign_pk = s.campaign_pk
  GROUP BY s.client_id, s.campaign_pk, s.campaign_name, s.platform, r.campaign_replies, r.campaign_positive, r.campaign_negative
),
client_daily_trends AS (
  SELECT 
    s.client_id,
    date_trunc('day', s.created_at)::date AS day,
    COUNT(*) AS daily_sends,
    COALESCE(r.daily_replies, 0) AS daily_replies,
    COALESCE(r.daily_positive, 0) AS daily_positive,
    COALESCE(r.daily_negative, 0) AS daily_negative
  FROM unified_sends_mv s
  LEFT JOIN (
    SELECT 
      r.client_id,
      date_trunc('day', r.created_at)::date AS day,
      COUNT(*) AS daily_replies,
      COUNT(*) FILTER (WHERE r.sentiment_label = 'positive') AS daily_positive,
      COUNT(*) FILTER (WHERE r.sentiment_label = 'negative') AS daily_negative
    FROM unified_replies_mv r
    GROUP BY r.client_id, date_trunc('day', r.created_at)::date
  ) r ON r.client_id = s.client_id AND r.day = date_trunc('day', s.created_at)::date
  GROUP BY s.client_id, date_trunc('day', s.created_at)::date, r.daily_replies, r.daily_positive, r.daily_negative
),
client_recent_replies AS (
  SELECT 
    r.client_id,
    r.reply_id,
    r.created_at,
    r.sentiment_label,
    r.platform,
    r.campaign_name,
    r.lead_id,
    -- Get lead email from sends table
    s.lead_email,
    -- Sample content (in real implementation, this would come from a replies content table)
    CASE 
      WHEN r.sentiment_label = 'positive' THEN 'Positive reply received'
      WHEN r.sentiment_label = 'negative' THEN 'Bounce or negative response'
      ELSE 'Neutral response'
    END AS reply_content
  FROM unified_replies_mv r
  LEFT JOIN unified_sends_mv s ON s.lead_id = r.lead_id AND s.platform = r.platform
  WHERE r.created_at >= (CURRENT_DATE - INTERVAL '30 days')
  ORDER BY r.created_at DESC
  LIMIT 50
)
SELECT 
  c.id AS client_id,
  c."Company Name" AS client_name,
  c."Domain" AS client_domain,
  c."Primary Email" AS client_email,
  c."Primary Number" AS client_phone,
  c."Contact Title" AS contact_title,
  c."Industry" AS industry,
  c."Services" AS services,
  c."Onboarding Date" AS onboarding_date,
  -- KPI Data
  COALESCE(ss.total_emails_sent, 0) AS total_emails_sent,
  COALESCE(rs.total_replies, 0) AS total_replies,
  CASE WHEN COALESCE(ss.total_emails_sent, 0) > 0 THEN 
    ROUND((COALESCE(rs.total_replies, 0)::numeric / ss.total_emails_sent::numeric) * 100, 2) 
  ELSE 0 END AS reply_rate,
  COALESCE(rs.positive_replies, 0) AS positive_replies,
  CASE WHEN COALESCE(rs.total_replies, 0) > 0 THEN 
    ROUND((COALESCE(rs.positive_replies, 0)::numeric / rs.total_replies::numeric) * 100, 2) 
  ELSE 0 END AS positive_reply_rate,
  COALESCE(rs.negative_replies, 0) AS bounces,
  CASE WHEN COALESCE(ss.total_emails_sent, 0) > 0 THEN 
    ROUND((COALESCE(rs.negative_replies, 0)::numeric / ss.total_emails_sent::numeric) * 100, 2) 
  ELSE 0 END AS bounce_rate,
  COALESCE(ss.unique_leads_contacted, 0) AS unique_leads_contacted,
  COALESCE(ss.total_campaigns, 0) AS total_campaigns,
  COALESCE(ss.platforms_used, 0) AS platforms_used,
  -- Platform breakdown
  COALESCE(ss.bison_sends, 0) AS bison_sends,
  COALESCE(ss.instantly_sends, 0) AS instantly_sends,
  COALESCE(rs.bison_replies, 0) AS bison_replies,
  COALESCE(rs.instantly_replies, 0) AS instantly_replies,
  COALESCE(rs.bison_positive, 0) AS bison_positive,
  COALESCE(rs.instantly_positive, 0) AS instantly_positive,
  -- Activity dates
  ss.first_send_date,
  ss.last_send_date,
  ss.avg_daily_sends,
  -- Campaign performance (as JSON for easy frontend consumption)
  COALESCE(
    json_agg(
      json_build_object(
        'campaign_id', cp.campaign_pk,
        'campaign_name', cp.campaign_name,
        'platform', cp.platform,
        'sends', cp.campaign_sends,
        'leads', cp.campaign_leads,
        'replies', cp.campaign_replies,
        'positive', cp.campaign_positive,
        'reply_rate', cp.reply_rate,
        'positive_rate', cp.positive_rate,
        'bounce_rate', cp.bounce_rate,
        'send_to_positive_ratio', cp.send_to_positive_ratio
      ) ORDER BY cp.campaign_sends DESC
    ) FILTER (WHERE cp.campaign_pk IS NOT NULL), 
    '[]'::json
  ) AS campaigns_data,
  -- Recent replies (as JSON)
  COALESCE(
    json_agg(
      json_build_object(
        'reply_id', cr.reply_id,
        'created_at', cr.created_at,
        'sentiment', cr.sentiment_label,
        'platform', cr.platform,
        'campaign_name', cr.campaign_name,
        'lead_email', cr.lead_email,
        'content', cr.reply_content
      ) ORDER BY cr.created_at DESC
    ) FILTER (WHERE cr.reply_id IS NOT NULL),
    '[]'::json
  ) AS recent_replies,
  -- Daily trends (last 30 days as JSON)
  COALESCE(
    json_agg(
      json_build_object(
        'date', ct.day,
        'sends', ct.daily_sends,
        'replies', ct.daily_replies,
        'positive', ct.daily_positive,
        'negative', ct.daily_negative
      ) ORDER BY ct.day DESC
    ) FILTER (WHERE ct.day IS NOT NULL),
    '[]'::json
  ) AS daily_trends
FROM "Clients" c
LEFT JOIN client_send_stats ss ON ss.client_id = c.id
LEFT JOIN client_reply_stats rs ON rs.client_id = c.id
LEFT JOIN client_campaign_performance cp ON cp.client_id = c.id
LEFT JOIN client_recent_replies cr ON cr.client_id = c.id
LEFT JOIN client_daily_trends ct ON ct.client_id = c.id AND ct.day >= (CURRENT_DATE - INTERVAL '30 days')
GROUP BY 
  c.id, c."Company Name", c."Domain", c."Primary Email", c."Primary Number", 
  c."Contact Title", c."Industry", c."Services", c."Onboarding Date",
  ss.total_emails_sent, ss.unique_leads_contacted, ss.total_campaigns, ss.platforms_used,
  ss.bison_sends, ss.instantly_sends, ss.first_send_date, ss.last_send_date, ss.avg_daily_sends,
  rs.total_replies, rs.positive_replies, rs.negative_replies, rs.bison_replies, 
  rs.instantly_replies, rs.bison_positive, rs.instantly_positive
ORDER BY c.id;

-- Unique index for client detail analytics
CREATE UNIQUE INDEX IF NOT EXISTS idx_client_detail_analytics_mv_client_id 
  ON client_detail_analytics_mv (client_id);

-- Covering indexes for client detail queries
CREATE INDEX IF NOT EXISTS idx_client_detail_analytics_mv_covering
  ON client_detail_analytics_mv (client_id)
  INCLUDE (client_name, total_emails_sent, total_replies, reply_rate, positive_reply_rate, bounce_rate);

-- Index for client search/filtering
CREATE INDEX IF NOT EXISTS idx_client_detail_analytics_mv_name_covering
  ON client_detail_analytics_mv (client_name)
  INCLUDE (client_id, total_emails_sent, reply_rate, positive_reply_rate, bounce_rate);

-- ================================================================
-- CLIENT DETAIL REFRESH FUNCTION
-- ================================================================
CREATE OR REPLACE FUNCTION refresh_client_detail_analytics_mv(concurrent boolean DEFAULT true)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF concurrent THEN
    EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY client_detail_analytics_mv';
  ELSE
    EXECUTE 'REFRESH MATERIALIZED VIEW client_detail_analytics_mv';
  END IF;
  ANALYZE client_detail_analytics_mv;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ================================================================
-- CLIENT DETAIL FILTERED FUNCTION
-- ================================================================
CREATE OR REPLACE FUNCTION get_client_detail_analytics(client_id_filter bigint DEFAULT NULL)
RETURNS TABLE (
  client_id bigint,
  client_name text,
  client_domain text,
  client_email text,
  client_phone text,
  contact_title text,
  industry text,
  services text,
  onboarding_date date,
  total_emails_sent bigint,
  total_replies bigint,
  reply_rate numeric,
  positive_replies bigint,
  positive_reply_rate numeric,
  bounces bigint,
  bounce_rate numeric,
  unique_leads_contacted bigint,
  total_campaigns bigint,
  platforms_used bigint,
  bison_sends bigint,
  instantly_sends bigint,
  bison_replies bigint,
  instantly_replies bigint,
  bison_positive bigint,
  instantly_positive bigint,
  first_send_date timestamptz,
  last_send_date timestamptz,
  avg_daily_sends numeric,
  campaigns_data json,
  recent_replies json,
  daily_trends json
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cda.client_id,
    cda.client_name,
    cda.client_domain,
    cda.client_email,
    cda.client_phone,
    cda.contact_title,
    cda.industry,
    cda.services,
    cda.onboarding_date,
    cda.total_emails_sent,
    cda.total_replies,
    cda.reply_rate,
    cda.positive_replies,
    cda.positive_reply_rate,
    cda.bounces,
    cda.bounce_rate,
    cda.unique_leads_contacted,
    cda.total_campaigns,
    cda.platforms_used,
    cda.bison_sends,
    cda.instantly_sends,
    cda.bison_replies,
    cda.instantly_replies,
    cda.bison_positive,
    cda.instantly_positive,
    cda.first_send_date,
    cda.last_send_date,
    cda.avg_daily_sends,
    cda.campaigns_data,
    cda.recent_replies,
    cda.daily_trends
  FROM client_detail_analytics_mv cda
  WHERE (client_id_filter IS NULL OR cda.client_id = client_id_filter)
  ORDER BY cda.client_id;
END;
$$ LANGUAGE plpgsql STABLE;




