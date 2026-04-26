-- Store WhatsApp contact numbers for new /linkedin profile submissions.

ALTER TABLE linkedin_profiles
    ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
