# Deploy Sonrasi Smoke Checklist

Her frontend push ve function deploy sonrasi bu listeyi dogrulayin.

## Otomatik (`npm run test:smoke`)

- [ ] `GET /` -> 200
- [ ] `GET /showroom` -> 200
- [ ] `GET /add-project` -> redirect veya 200 (500 yok)
- [ ] `GET /admin` -> redirect veya 200 (500 yok)
- [ ] `GET /leaderboard` -> 200
- [ ] Login page form gorunur
- [ ] Browser console auth/function hatasi yok
- [ ] Kritik edge function network hatasi yok

## Manuel Browser Kontrolleri

- [ ] hyped.today hatasiz yukleniyor
- [ ] Login akisi tamamlaniyor (Google/GitHub/Magic Link)
- [ ] Login redirect localhost'a donmuyor
- [ ] `/add-project` 401 veya "Failed to send request" gostermez
- [ ] `/admin` dashboard veri yukluyor (flags, settings, audit log)
- [ ] Settings input text gorunur ve duzenlenebilir
- [ ] Browser console'da auth/function hatasi yok
- [ ] `request-limits` edge function 200 donduruyor
- [ ] `admin-dashboard` edge function 200 donduruyor
- [ ] `admin-actions` edge function 200 donduruyor
- [ ] Hard-refresh (Ctrl+Shift+R) sonrasi duzgun calisiyor

## Deploy Sonrasi Dogrulama

- [ ] Coolify deployment loglarinda hata yok
- [ ] Supabase edge functions deploy edilmis (`supabase functions list`)
- [ ] `npm test` ile tum unit/integration testleri geciyor
- [ ] `npm run test:e2e` ile E2E testleri staging'de geciyor
