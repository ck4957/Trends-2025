CREATE OR REPLACE FUNCTION public.handle_new_ai_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if ai_summary has been updated and is not null
  IF (OLD.ai_summary IS NULL OR OLD.ai_summary <> NEW.ai_summary) AND NEW.ai_summary IS NOT NULL THEN
    -- Call the Edge Function to post to social media
    PERFORM
      net.http_post(
        url:= (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/post-to-social',
        body:= jsonb_build_object('id', NEW.id),
        headers:=jsonb_build_object(
          'Content-type', 'application/json',
          'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key')
        )
      );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;