-- Seed approved LinkedIn members as Supabase auth users.
-- For each approved linkedin_profile that has no submitted_by yet,
-- create an auth.users row with email first.last@hyped.today,
-- then link it back via submitted_by.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    rec RECORD;
    user_id UUID;
    email_addr TEXT;
    clean_first TEXT;
    clean_last TEXT;
    plain_pw TEXT := 'linkedindestek';
BEGIN
    FOR rec IN
        SELECT id, first_name, last_name
        FROM linkedin_profiles
        WHERE approval_status = 'approved'
          AND submitted_by IS NULL
        ORDER BY created_at ASC
    LOOP
        clean_first := lower(
            replace(replace(replace(replace(replace(replace(
                rec.first_name,
                'ç', 'c'), 'Ç', 'c'),
                'ğ', 'g'), 'Ğ', 'g'),
                'ı', 'i'), 'İ', 'i')
        );
        clean_first := lower(replace(replace(replace(replace(replace(replace(
            clean_first,
            'ö', 'o'), 'Ö', 'o'),
            'ş', 's'), 'Ş', 's'),
            'ü', 'u'), 'Ü', 'u'));

        clean_last := lower(
            replace(replace(replace(replace(replace(replace(
                rec.last_name,
                'ç', 'c'), 'Ç', 'c'),
                'ğ', 'g'), 'Ğ', 'g'),
                'ı', 'i'), 'İ', 'i')
        );
        clean_last := lower(replace(replace(replace(replace(replace(replace(
            clean_last,
            'ö', 'o'), 'Ö', 'o'),
            'ş', 's'), 'Ş', 's'),
            'ü', 'u'), 'Ü', 'u'));

        email_addr := clean_first || '.' || clean_last || '@hyped.today';

        IF EXISTS (SELECT 1 FROM auth.users WHERE email = email_addr) THEN
            RAISE NOTICE 'Skipping duplicate email: %', email_addr;
            CONTINUE;
        END IF;

        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token,
            confirmation_sent_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            banned_until,
            reauthentication_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            email_addr,
            crypt(plain_pw, gen_salt('bf')),
            NOW(),
            '',
            '',
            '',
            '',
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            jsonb_build_object('first_name', rec.first_name, 'last_name', rec.last_name),
            NOW(),
            NOW(),
            NULL,
            ''
        ) RETURNING id INTO user_id;

        INSERT INTO auth.identities (
            id,
            user_id,
            provider_id,
            provider,
            identity_data,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            user_id,
            email_addr,
            'email',
            jsonb_build_object(
                'sub', user_id::text,
                'email', email_addr,
                'email_verified', true
            ),
            NOW(),
            NOW()
        );

        UPDATE linkedin_profiles
        SET submitted_by = user_id
        WHERE id = rec.id;

        RAISE NOTICE 'Created user % with email %', user_id, email_addr;
    END LOOP;
END $$;
