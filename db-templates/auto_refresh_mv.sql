-- ================================================================
-- AUTOMATIC MATERIALIZED VIEW REFRESH SETUP
-- ================================================================

-- 1. Enable pg_cron extension (requires superuser privileges)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Create a simple refresh function using existing functions
CREATE OR REPLACE FUNCTION refresh_all_mvs_simple()
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use the existing refresh_all_analytics_mvs function
  PERFORM refresh_all_analytics_mvs(true);
  -- Also refresh the client detail analytics MV (not included in the main function)
  PERFORM refresh_client_detail_analytics_mv(true);
  
  RAISE NOTICE 'All materialized views refreshed successfully at %', NOW();
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 3. Schedule the refresh job to run every 10 minutes
SELECT cron.schedule(
    'refresh-all-mvs-every-10min',
    '*/10 * * * *',  -- Every 10 minutes
    'SELECT refresh_all_mvs_simple();'
);

-- ================================================================
-- MANUAL REFRESH COMMANDS (using existing functions)
-- ================================================================

-- To refresh all MVs immediately (using existing function):
-- SELECT refresh_all_analytics_mvs(true);

-- To refresh specific MVs immediately (using existing functions):
-- SELECT refresh_unified_sends_mv(true);
-- SELECT refresh_unified_replies_mv(true);
-- SELECT refresh_kpi_overview_mv(true);
-- SELECT refresh_platform_comparison_mv(true);
-- SELECT refresh_send_volume_trend_mv(true);
-- SELECT refresh_client_statistics_mv(true);
-- SELECT refresh_client_detail_analytics_mv(true);


