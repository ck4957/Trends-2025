-- Create or replace the trigger
DROP TRIGGER IF EXISTS on_ai_summary_created ON public.trends;
CREATE TRIGGER on_ai_summary_created
  AFTER UPDATE ON public.trends
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_ai_summary();