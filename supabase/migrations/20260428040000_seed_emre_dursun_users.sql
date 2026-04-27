-- Create new auth users for Emre Sulukan and Dursun Kokturk.
-- Delete Emre's old orphan user. Skip Umut (72c89ec2).
-- Dursun was incorrectly linked to Umut's ID; just reassign.

DO $$
DECLARE
    new_user_id UUID;
    email_addr TEXT;
    plain_pw TEXT := 'linkedindestek';
    old_emre_id UUID := 'd67b4811-348f-40df-a56a-b566338fc358';
BEGIN
    -- === EMRE SULUKAN ===
    email_addr := 'emre.sulukan@hyped.today';

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, confirmation_token, email_change,
        email_change_token_new, recovery_token, confirmation_sent_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        banned_until, reauthentication_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(), 'authenticated', 'authenticated',
        email_addr, crypt(plain_pw, gen_salt('bf')),
        NOW(), '', '', '', '', NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"first_name": "Emre", "last_name": "Sulukan"}',
        NOW(), NOW(), NULL, ''
    ) RETURNING id INTO new_user_id;

    INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, created_at, updated_at)
    VALUES (
        gen_random_uuid(), new_user_id, email_addr, 'email',
        jsonb_build_object('sub', new_user_id::text, 'email', email_addr, 'email_verified', true),
        NOW(), NOW()
    );

    UPDATE linkedin_profiles SET submitted_by = new_user_id
    WHERE id = '711d1199-c365-4b18-92ee-447e4029be4e';

    DELETE FROM auth.identities WHERE user_id = old_emre_id;
    DELETE FROM auth.users WHERE id = old_emre_id;

    RAISE NOTICE 'Emre Sulukan: new user %', new_user_id;

    -- === DURSUN KOKTURK ===
    email_addr := 'dursun.kokturk@hyped.today';

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, confirmation_token, email_change,
        email_change_token_new, recovery_token, confirmation_sent_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        banned_until, reauthentication_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(), 'authenticated', 'authenticated',
        email_addr, crypt(plain_pw, gen_salt('bf')),
        NOW(), '', '', '', '', NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"first_name": "Dursun", "last_name": "Kokturk"}',
        NOW(), NOW(), NULL, ''
    ) RETURNING id INTO new_user_id;

    INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, created_at, updated_at)
    VALUES (
        gen_random_uuid(), new_user_id, email_addr, 'email',
        jsonb_build_object('sub', new_user_id::text, 'email', email_addr, 'email_verified', true),
        NOW(), NOW()
    );

    UPDATE linkedin_profiles SET submitted_by = new_user_id
    WHERE id = 'f99f1fc5-9e71-49d7-a999-3ad3b8f2dc9f';

    RAISE NOTICE 'Dursun Kokturk: new user %', new_user_id;
END $$;
