-- Fix email addresses that have spaces due to multi-word first/last names.

DO $$
BEGIN
    UPDATE auth.users SET email = 'aslihan.cinar.yalcin@hyped.today' WHERE email = 'aslihan.cinar yalcin@hyped.today';
    UPDATE auth.identities SET identity_data = jsonb_set(identity_data, '{email}', '"aslihan.cinar.yalcin@hyped.today"') WHERE provider_id = 'aslihan.cinar yalcin@hyped.today';
    UPDATE auth.identities SET provider_id = 'aslihan.cinar.yalcin@hyped.today' WHERE provider_id = 'aslihan.cinar yalcin@hyped.today';

    UPDATE auth.users SET email = 'oguzkaan.atalay@hyped.today' WHERE email = 'oguz kaan.atalay@hyped.today';
    UPDATE auth.identities SET identity_data = jsonb_set(identity_data, '{email}', '"oguzkaan.atalay@hyped.today"') WHERE provider_id = 'oguz kaan.atalay@hyped.today';
    UPDATE auth.identities SET provider_id = 'oguzkaan.atalay@hyped.today' WHERE provider_id = 'oguz kaan.atalay@hyped.today';

    UPDATE auth.users SET email = 'rubiican.icliyurek@hyped.today' WHERE email = 'rubi can.icliyurek@hyped.today';
    UPDATE auth.identities SET identity_data = jsonb_set(identity_data, '{email}', '"rubiican.icliyurek@hyped.today"') WHERE provider_id = 'rubi can.icliyurek@hyped.today';
    UPDATE auth.identities SET provider_id = 'rubiican.icliyurek@hyped.today' WHERE provider_id = 'rubi can.icliyurek@hyped.today';

    UPDATE auth.users SET email = 'mehmetduran.yilmaz@hyped.today' WHERE email = 'mehmet duran.yilmaz@hyped.today';
    UPDATE auth.identities SET identity_data = jsonb_set(identity_data, '{email}', '"mehmetduran.yilmaz@hyped.today"') WHERE provider_id = 'mehmet duran.yilmaz@hyped.today';
    UPDATE auth.identities SET provider_id = 'mehmetduran.yilmaz@hyped.today' WHERE provider_id = 'mehmet duran.yilmaz@hyped.today';

    UPDATE auth.users SET email = 'gulcan.dag@hyped.today' WHERE email LIKE 'gulcan.dag%';
    UPDATE auth.identities SET identity_data = jsonb_set(identity_data, '{email}', '"gulcan.dag@hyped.today"') WHERE provider_id LIKE 'gulcan.dag%';
    UPDATE auth.identities SET provider_id = 'gulcan.dag@hyped.today' WHERE provider_id LIKE 'gulcan.dag%';
END $$;
