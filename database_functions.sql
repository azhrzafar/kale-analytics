CREATE OR REPLACE FUNCTION get_unique_leads_connected()
RETURNS bigint AS $$
-- Use a more efficient approach for large datasets
SELECT COUNT(*) 
FROM (
    SELECT 1
    FROM "Leads" 
    WHERE "Email" IS NOT NULL AND "Email" <> ''
    GROUP BY "Email"
) unique_emails;
$$ LANGUAGE sql STABLE;

-- Function to get total emails sent across all platforms
CREATE OR REPLACE FUNCTION get_total_emails_sent()
RETURNS bigint AS $$
SELECT 
    (SELECT COUNT(*) FROM bison_sends) +
    (SELECT COUNT(*) FROM instantly_sends) +
    (SELECT COUNT(*) FROM missive_sends) as total_emails;
$$ LANGUAGE sql STABLE;

-- Function to get total replies across all platforms
CREATE OR REPLACE FUNCTION get_total_replies()
RETURNS bigint AS $$
SELECT 
    (SELECT COUNT(*) FROM bison_replies) +
    (SELECT COUNT(*) FROM instantly_replies) +
    (SELECT COUNT(*) FROM missive_replies) as total_replies;
$$ LANGUAGE sql STABLE;

-- Function to get comprehensive KPI metrics
CREATE OR REPLACE FUNCTION get_kpi_metrics()
RETURNS TABLE (
    metric_name text,
    metric_value bigint,
    metric_type text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'unique_leads'::text, get_unique_leads_connected(), 'count'::text
    UNION ALL
    SELECT 'total_emails_sent'::text, get_total_emails_sent(), 'count'::text
    UNION ALL
    SELECT 'total_replies'::text, get_total_replies(), 'count'::text;
END;
$$ LANGUAGE plpgsql STABLE;


CREATE OR REPLACE FUNCTION get_bounced_emails()
RETURNS bigint
SECURITY DEFINER
SET search_path = public
AS $$
SELECT COUNT(*)
FROM "missive_replies"
WHERE "sentiment" = 'Bounce';
$$ LANGUAGE sql STABLE;


CREATE OR REPLACE FUNCTION get_bounced_rate()
RETURNS numeric AS $$
DECLARE
    total_emails bigint;
    bounced_emails bigint;
BEGIN
    total_emails := get_total_emails_sent();
    bounced_emails := get_bounced_emails();
    
    IF total_emails = 0 THEN
        RETURN 0;
    ELSE
        RETURN ROUND((bounced_emails::numeric / total_emails::numeric) * 100, 2);
    END IF;
END;
$$ LANGUAGE plpgsql STABLE;



CREATE OR REPLACE FUNCTION get_positive_replies()
RETURNS bigint
SECURITY DEFINER
SET search_path = public
AS $$
SELECT COUNT(*)
FROM "missive_replies"
WHERE TRIM(LOWER(sentiment)) IN (
  'meeting request',
  'positive',
  'interested',
  'long-term prospect',
  'long-term prospect (ltp)',
  'info request'
);
$$ LANGUAGE sql STABLE;


CREATE OR REPLACE FUNCTION get_positive_replies_rate()
RETURNS numeric
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_emails bigint;
    positive_replies bigint;
BEGIN
    total_emails := (SELECT COUNT(*) FROM missive_replies);
    positive_replies := get_positive_replies();
    
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
    bounce_rate numeric,
    leads bigint
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'Bison'::text as platform,
        (SELECT COUNT(*) FROM bison_sends) as sends,
        (SELECT COUNT(*) FROM bison_replies) as replies,
        CASE 
            WHEN (SELECT COUNT(*) FROM bison_sends) > 0 
            THEN ROUND(((SELECT COUNT(*) FROM bison_replies)::numeric / (SELECT COUNT(*) FROM bison_sends)::numeric) * 100, 2)
            ELSE 0::numeric 
        END as reply_rate,
        0::numeric as bounce_rate, -- Simplified for now
        (SELECT COUNT(DISTINCT lead_email) FROM bison_sends) as leads;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_instantly_performance()
RETURNS TABLE (
    platform text,
    sends bigint,
    replies bigint,
    reply_rate numeric,
    bounce_rate numeric,
    leads bigint
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'Instantly'::text as platform,
        (SELECT COUNT(*) FROM instantly_sends) as sends,
        (SELECT COUNT(*) FROM instantly_replies) as replies,
        CASE 
            WHEN (SELECT COUNT(*) FROM instantly_sends) > 0 
            THEN ROUND(((SELECT COUNT(*) FROM instantly_replies)::numeric / (SELECT COUNT(*) FROM instantly_sends)::numeric) * 100, 2)
            ELSE 0::numeric 
        END as reply_rate,
        0::numeric as bounce_rate, -- Simplified for now
        (SELECT COUNT(DISTINCT instantly_lead_email) FROM instantly_sends) as leads;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_missive_performance()
RETURNS TABLE (
    platform text,
    sends bigint,
    replies bigint,
    reply_rate numeric,
    bounce_rate numeric,
    leads bigint
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'Missive'::text as platform,
        (SELECT COUNT(*) FROM missive_sends) as sends,
        (SELECT COUNT(*) FROM missive_replies) as replies,
        CASE 
            WHEN (SELECT COUNT(*) FROM missive_sends) > 0 
            THEN ROUND(((SELECT COUNT(*) FROM missive_replies)::numeric / (SELECT COUNT(*) FROM missive_sends)::numeric) * 100, 2)
            ELSE 0::numeric 
        END as reply_rate,
        CASE 
            WHEN (SELECT COUNT(*) FROM missive_sends) > 0 
            THEN ROUND(((SELECT COUNT(*) FROM missive_replies WHERE sentiment = 'Bounce')::numeric / (SELECT COUNT(*) FROM missive_sends)::numeric) * 100, 2)
            ELSE 0::numeric 
        END as bounce_rate,
        (SELECT COUNT(DISTINCT to_email) FROM missive_sends) as leads;
END;
$$ LANGUAGE plpgsql STABLE;
