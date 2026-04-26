-- Accept Turkish mobile numbers in local 05xxxxxxxxx format
-- and all other numbers in +countrycode international format.

ALTER TABLE linkedin_profiles
    DROP CONSTRAINT IF EXISTS linkedin_profiles_whatsapp_number_format;

ALTER TABLE linkedin_profiles
    ADD CONSTRAINT linkedin_profiles_whatsapp_number_format
    CHECK (whatsapp_number ~ '^(05[0-9]{9}|\+[1-9][0-9]{7,14})$') NOT VALID;
