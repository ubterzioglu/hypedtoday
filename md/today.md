Evet, bunu mutlaka eklemek lazım.

Çünkü sadece destek verenleri sınırlamak yetmez.
**İstek açan taraf** da kontrolsüz kalırsa sistem şu hale gelir:

* herkes sürekli post açar
* destek havuzu bölünür
* kaliteli istekler görünmez olur
* owner tarafı sadece talep eden role dönüşür
* puan ekonomisi bozulur
* admin tarafı kontrolsüz büyür

En sağlıklı yapı şu olur:

* **istek açanlara limit**
* **admin’e geniş yetki**
* **güçlü admin konsolu**
* **ince ayarlanabilir sistem config’i**

Aşağıya bunu entegre edilmiş, güncellenmiş ve daha güçlü bir versiyon olarak yazıyorum.

---

# HYPED.TODAY — LinkedIn Destek Takip Sistemi

## Güncellenmiş Teknik Dökümantasyon v2

## Owner Approval + Request Limits + Advanced Admin Console

---

# 1. Sistem amacı

Bu sistemin amacı, LinkedIn post desteğini topluluk içinde düzenli, ölçülebilir ve yönetilebilir hale getirmektir.

Temel problem:

* Kullanıcılar LinkedIn postlarını WhatsApp gruplarında paylaşıyor
* Destek sözü veriliyor ama kim destek verdi, kim vermedi net değil
* Süreç kaotik ilerliyor
* Destek isteyen çok, gerçekten destek veren az oluyor
* Sürekli istek açan kullanıcılar sistemi yorabiliyor

Temel çözüm:

* LinkedIn postu sisteme görev olarak eklenir
* Görevler ayrı ayrı yönetilir:

  * like
  * comment
  * repost
* Destek veren kullanıcı görevi claim eder
* Görevi tamamladığını beyan eder
* Post sahibi bunu onaylar veya reddeder
* Puan yalnızca onay sonrası verilir
* Aynı kullanıcı aynı postta üç görevi de tamamlayıp onaylatırsa bonus alır
* İstek açan tarafa da sınır konur
* Admin sistemi geniş yetkilerle yönetir

---

# 2. Yeni eklenen kritik kararlar

Bu sürümde aşağıdaki kararlar özellikle eklendi:

## 2.1 İstek açan kullanıcıya limit var

Her kullanıcı istediği kadar post/görev açamaz.

## 2.2 Admin konsolu geniş olacak

Admin yalnızca izlemeyecek; müdahale edebilecek.

## 2.3 Admin sistem ayarlarını yönetebilecek

Puan, limit, bonus, rate limit, görünürlük gibi şeyler config’ten değiştirilebilecek.

## 2.4 İstek ekonomisi kontrollü olacak

Sistemde sadece görev alma değil, görev açma da bir kaynak gibi yönetilecek.

---

# 3. Temel prensipler

## 3.1 LinkedIn aksiyonları otomatik doğrulanmaz

Sistem LinkedIn içindeki like/comment/repost aksiyonlarını ilk sürümde otomatik teknik olarak doğrulamaz.

## 3.2 Owner approval esas doğrulama mekanizmasıdır

Destek veren “tamamladım” der.
Post sahibi “onaylıyorum” veya “reddediyorum” der.

## 3.3 Like / comment / repost ayrı görevdir

Her biri ayrı claim edilir, ayrı tamamlanır, ayrı onaylanır.

## 3.4 Combo bonus vardır

Aynı kullanıcı aynı postta üç görevi de onaylatırsa ek bonus puan alır.

## 3.5 Request açma sınırlıdır

Sadece görev almak değil, görev açmak da kurallıdır.

## 3.6 Admin gerektiğinde override yapabilir

Admin sistemi sadece izleyen değil, yöneten taraftır.

---

# 4. Roller

## 4.1 Normal kullanıcı

Yapabilecekleri:

* post açabilir
* başkalarının postlarını görebilir
* görev claim edebilir
* görev tamamlayabilir
* kendi görev geçmişini görebilir
* kendi puanını görebilir
* leaderboard görebilir

## 4.2 Post sahibi

Ek olarak yapabilecekleri:

* kendi postlarına gelen claim’leri görür
* approve / reject yapar
* kendi postlarını pause / archive edebilir
* bekleyen talepleri yönetir

## 4.3 Admin

Geniş yetkiler:

* tüm postları görür
* tüm claim’leri görür
* tüm approval/rejection geçmişini görür
* manuel approve/reject override yapabilir
* puan ekleyebilir / silebilir
* kullanıcı suspend edebilir
* kullanıcı post açma limitini değiştirebilir
* postu archive / pause / hide edebilir
* sistem config’lerini değiştirebilir
* şüpheli ilişkileri izleyebilir
* claim ve post geçmişini audit edebilir
* leaderboard müdahalesi yapabilir
* kullanıcı bazlı veya global limit değiştirebilir

---

# 5. İstek açanlar için limit sistemi

Bu bölüm özellikle yeni eklendi.

Sistemde sadece destek verenler değil, **destek isteyenler** de kontrollü olmalı.

## 5.1 Neden gerekli?

Çünkü limitsiz request açılırsa:

* feed şişer
* değerli postlar kaybolur
* owner tarafı sistemi sömürür
* herkes sadece kendi postunu öne çıkarmaya çalışır
* topluluk dengesi bozulur

## 5.2 Uygulanabilecek limit türleri

### A. Günlük post açma limiti

Örnek:

* bir kullanıcı günde en fazla 2 post açabilir

### B. Haftalık post açma limiti

Örnek:

* haftada en fazla 5 post

### C. Aynı anda aktif post limiti

Örnek:

* aynı anda maksimum 3 aktif post

### D. Pending approval yük limiti

Örnek:

* owner’ın onay bekleyen toplam claim sayısı çok yükselirse yeni post açamaz

### E. Minimum katılım şartı

Örnek:

* son 7 günde hiç destek vermeyen kullanıcı yeni istek açamasın

### F. Puan bazlı request hakkı

Opsiyonel:

* post açmak için belirli puan gerekebilir

### G. Cooldown

Örnek:

* bir post açtıktan sonra 2 saat yeni post açamasın

---

# 6. Önerilen başlangıç limit modeli

İlk sürüm için en mantıklı sade model:

* günlük maksimum post açma: **2**
* haftalık maksimum post açma: **7**
* aynı anda aktif post: **3**
* onay bekleyen claim eşiği aşılırsa yeni post açma engeli
* yeni kullanıcı için başlangıçta daha düşük limit
* admin kullanıcı bazlı limit override yapabilir

Bu sade ama etkili olur.

---

# 7. Request limit iş kuralları

## 7.1 Yeni post açmadan önce sistem bunları kontrol eder

* kullanıcı aktif mi
* suspend değil mi
* günlük limiti aşmış mı
* haftalık limiti aşmış mı
* aktif post sayısı sınırı aşılmış mı
* pending review yükü aşılmış mı
* cooldown aktif mi

## 7.2 Limit aşılırsa ne olur

* yeni post oluşturulmaz
* kullanıcıya net hata verilir
* admin panelinde gerekiyorsa log oluşur

## 7.3 Admin override

Admin isterse:

* tek kullanıcı için limit yükseltir
* geçici istisna verir
* kullanıcıyı request-ban yapar
* global limitleri değiştirir

---

# 8. Güncellenmiş veri modeli

---

## 8.1 `users`

Alanlar:

* `id`
* `email`
* `full_name`
* `avatar_url`
* `role`
* `status`
* `points_total`
* `request_limit_daily` nullable
* `request_limit_weekly` nullable
* `active_post_limit` nullable
* `request_cooldown_until` nullable
* `is_request_banned` boolean
* `created_at`
* `updated_at`

Not:

* nullable ise global sistem ayarı kullanılır
* doluysa kullanıcıya özel override sayılır

---

## 8.2 `linkedin_posts`

Alanlar:

* `id`
* `owner_user_id`
* `linkedin_url`
* `linkedin_post_urn` nullable
* `title` nullable
* `description` nullable
* `requested_like` boolean
* `requested_comment` boolean
* `requested_repost` boolean
* `status`
* `expires_at` nullable
* `created_at`
* `updated_at`

Yeni status seçenekleri:

* `active`
* `paused`
* `archived`
* `hidden_by_admin`
* `deleted`

---

## 8.3 `post_tasks`

Alanlar:

* `id`
* `post_id`
* `task_type`
* `is_enabled`
* `base_points`
* `created_at`

---

## 8.4 `task_claims`

Alanlar:

* `id`
* `post_id`
* `task_type`
* `supporter_user_id`
* `owner_user_id`
* `status`
* `started_at`
* `completed_at`
* `approved_at`
* `rejected_at`
* `owner_decision_by`
* `owner_decision_note`
* `supporter_note`
* `comment_text`
* `repost_text`
* `proof_screenshot_url`
* `click_count`
* `source`
* `created_at`
* `updated_at`

---

## 8.5 `score_events`

Alanlar:

* `id`
* `user_id`
* `event_type`
* `points`
* `post_id`
* `task_claim_id`
* `metadata_json`
* `created_at`

---

## 8.6 `post_owner_reviews`

Alanlar:

* `id`
* `task_claim_id`
* `owner_user_id`
* `decision`
* `note`
* `created_at`

---

## 8.7 `post_click_events`

Alanlar:

* `id`
* `post_id`
* `task_claim_id`
* `user_id`
* `event_type`
* `referrer`
* `user_agent`
* `ip_hash`
* `created_at`

---

## 8.8 `admin_flags`

Alanlar:

* `id`
* `flag_type`
* `user_id` nullable
* `post_id` nullable
* `task_claim_id` nullable
* `reason`
* `status`
* `created_at`
* `updated_at`

---

## 8.9 `admin_actions`

Yeni tablo

Amaç:

* admin ne yaptı, ne zaman yaptı, loglansın

Alanlar:

* `id`
* `admin_user_id`
* `action_type`
* `target_user_id` nullable
* `target_post_id` nullable
* `target_claim_id` nullable
* `payload_json`
* `note`
* `created_at`

Örnek `action_type`:

* `user_suspended`
* `user_unsuspended`
* `post_hidden`
* `post_archived`
* `claim_override_approved`
* `claim_override_rejected`
* `score_adjusted_plus`
* `score_adjusted_minus`
* `request_limit_changed`
* `global_setting_changed`

---

## 8.10 `system_settings`

Yeni tablo

Amaç:

* sistemin yönetilebilir parametreleri

Alanlar:

* `key`
* `value`
* `updated_by`
* `updated_at`

Örnek key’ler:

* `points_like`
* `points_comment`
* `points_repost`
* `points_combo_all_three`
* `daily_post_limit`
* `weekly_post_limit`
* `active_post_limit`
* `pending_review_limit_per_owner`
* `request_cooldown_minutes`
* `max_active_claims_per_user`
* `fast_complete_seconds`
* `min_comment_length`

---

## 8.11 `request_limit_logs`

Yeni tablo

Amaç:

* request limit ile ilgili reddedilen denemeleri loglamak

Alanlar:

* `id`
* `user_id`
* `attempted_at`
* `reason_code`
* `reason_text`
* `snapshot_json`

Örnek `reason_code`:

* `daily_limit_reached`
* `weekly_limit_reached`
* `active_post_limit_reached`
* `pending_review_over_limit`
* `cooldown_active`
* `request_banned`

---

# 9. Yeni iş akışları

---

## 9.1 Post açma akışı — güncellenmiş

1. Kullanıcı LinkedIn URL girer
2. Sistem URL’yi doğrular
3. Sistem request limitleri kontrol eder
4. Sistem post açmaya izin verirse kayıt oluşturur
5. Görevler hazırlanır:

   * like
   * comment
   * repost
6. Feed’de gösterilir

Ek kontrol:

* kullanıcı request-ban aldıysa post açılamaz

---

## 9.2 Görev claim akışı

Değişmedi ama log tarafı genişletildi

1. Kullanıcı görevi alır
2. Claim oluşturulur
3. Tracking oluşur
4. LinkedIn’e gider
5. Döner
6. Complete eder
7. Owner review’a düşer

---

## 9.3 Owner review akışı

Değişmedi ama admin override eklendi

1. Owner pending claim’i görür
2. Approve/reject verir
3. Score oluşur veya oluşmaz
4. Gerekirse admin sonradan müdahale edebilir

---

## 9.4 Admin override akışı

Yeni

1. Admin claim detayını açar
2. Gerekirse mevcut owner kararını override eder
3. Score event düzeltmesi yapılır
4. Admin action log yazılır

Kurallar:

* override audit’lenmeli
* normal owner kararı silinmemeli, üstüne admin kararı eklenmeli

---

# 10. Geniş admin yetkileri

Admin şu aksiyonları yapabilmeli:

## 10.1 Kullanıcı yönetimi

* kullanıcıyı görüntüle
* kullanıcıyı suspend et
* kullanıcıyı unsuspend et
* kullanıcıyı request-ban yap
* request-ban kaldır
* kullanıcıya özel limit ata
* kullanıcı puanını düzelt
* kullanıcının tüm post geçmişini gör
* kullanıcının onay/red oranlarını gör

## 10.2 Post yönetimi

* tüm postları listele
* post detayını aç
* postu pause et
* postu archive et
* postu admin-hide yap
* postu tamamen sil
* owner’ı değiştir
* görev tiplerini kapat/aç

## 10.3 Claim yönetimi

* tüm claim’leri listele
* filtrele
* claim detayını aç
* complete edileni incele
* owner decision geçmişini gör
* manuel approve et
* manuel reject et
* claim’i cancel et
* claim’i expired yap

## 10.4 Puan yönetimi

* manuel puan ekle
* manuel puan sil
* combo bonus iptal et
* combo bonus elle ver
* score history gör
* belirli claim’e bağlı puanları geri al

## 10.5 Sistem yönetimi

* global puanları değiştir
* global request limitlerini değiştir
* cooldown ayarlarını değiştir
* comment min length değiştir
* claim limit ayarlarını değiştir
* leaderboard görünürlüğünü ayarla

## 10.6 İzleme ve denetim

* son admin işlemleri
* son reddedilen claim’ler
* en çok post açan kullanıcılar
* en çok approve veren owner’lar
* en çok reddedilen kullanıcılar
* mutual pattern listesi
* hızlı complete edilen claim’ler
* limit aşım denemeleri

---

# 11. Geniş admin konsolu

Admin panel sıradan bir CRUD panel olmamalı.
Modüler, filtrelenebilir ve operasyon odaklı olmalı.

## 11.1 Dashboard

Gösterilecek metrikler:

* toplam kullanıcı
* aktif kullanıcı
* toplam post
* aktif post
* toplam claim
* pending approval sayısı
* onay oranı
* red oranı
* günlük yeni post sayısı
* günlük tamamlanan görev sayısı
* combo bonus sayısı
* limit reddi sayısı

## 11.2 Users modülü

Kolonlar:

* kullanıcı adı
* e-posta
* rol
* durum
* toplam puan
* aktif post sayısı
* günlük request sayısı
* haftalık request sayısı
* onaylanan görev sayısı
* reddedilen görev sayısı
* request-ban durumu

Aksiyonlar:

* suspend
* unsuspend
* request-ban
* request-ban kaldır
* limit düzenle
* puan düzenle
* detay

## 11.3 Posts modülü

Kolonlar:

* post sahibi
* linkedin url
* oluşturulma tarihi
* status
* total claim sayısı
* pending claim sayısı
* approved claim sayısı
* rejected claim sayısı

Aksiyonlar:

* detay
* pause
* archive
* hide
* delete

## 11.4 Claims modülü

Filtreler:

* status
* task type
* owner
* supporter
* date range
* approved/rejected
* admin overridden

Kolonlar:

* claim id
* post
* task type
* supporter
* owner
* status
* started_at
* completed_at
* approved_at
* rejected_at

Aksiyonlar:

* detay
* approve override
* reject override
* cancel
* expire

## 11.5 Scores modülü

Gösterilecekler:

* score_events listesi
* kullanıcı bazlı puan hareketleri
* event type bazlı dağılım
* en çok puan alan görev tipleri

Aksiyonlar:

* manuel artı puan
* manuel eksi puan
* event rollback
* combo event sil

## 11.6 Limits modülü

Yeni

Gösterilecekler:

* global daily request limit
* global weekly request limit
* global active post limit
* pending review threshold
* request cooldown
* max active claims

Aksiyonlar:

* düzenle
* reset
* kullanıcıya özel override tanımla

## 11.7 Flags modülü

Gösterilecekler:

* fast complete pattern
* high rejection pattern
* mutual support clusters
* owner mass approval
* request limit abuse
* suspicious manual review needed

Aksiyonlar:

* reviewed
* ignored
* actioned
* user’a git
* post’a git
* claim’e git

## 11.8 Audit modülü

Gösterilecekler:

* admin_actions
* owner review log
* score log
* request limit log
* system setting change log

Bu modül özellikle önemli.

---

# 12. İstek açma ekonomisi

Bu bölüm yeni stratejik modül.

Sistemi daha dengeli yapmak için gelecekte şu modele açık kalınmalı:

## 12.1 Basit limit ekonomisi

Kullanıcı sadece limite göre post açar

## 12.2 Katılım şartlı ekonomi

Kullanıcı son X günde hiç destek vermediyse yeni post açamaz

## 12.3 Puan harcayarak post açma

İleri faz:

* post açmak puan tüketir
* böylece herkes sınırsız istek açamaz

İlk sürümde bunu zorunlu yapma.
Ama veri modelini buna açık kur.

---

# 13. Yeni validasyon kuralları

## 13.1 Request create validation

* request-ban değil
* daily limit aşılmamış
* weekly limit aşılmamış
* active post limiti aşılmamış
* pending review limiti aşılmamış
* cooldown bitmiş

## 13.2 Admin validation

* admin override log’suz yapılamaz
* admin puan değişikliği note’suz yapılamaz
* sistem ayarı değişikliği audit’siz yapılamaz

## 13.3 Owner validation

* owner kendi claim’ini approve edemez
* final status’ta tekrar owner kararı verilemez

---

# 14. Güncellenmiş anti-abuse kuralları

Ayrı trust score yine yok.
Ama flag ve limit mekanikleri güçlendirildi.

## 14.1 Request abuse kontrolleri

* çok sık post açma denemesi
* sürekli limit reddi alma
* çok fazla aktif ama düşük etkileşimli post
* yüksek pending review yükü

## 14.2 Owner abuse kontrolleri

* herkesi çok hızlı approve etme
* çok düşük red oranı ve anormal yoğunluk
* kendi networküne sürekli onay verme paterni

## 14.3 Supporter abuse kontrolleri

* aşırı hızlı complete
* çok yüksek reject oranı
* aynı kullanıcılarla tekrarlı pattern

## 14.4 Admin abuse önleme

* her admin aksiyonu loglanmalı
* rollback mümkün olmalı
* kritik aksiyonlara note zorunlu olmalı

---

# 15. Yeni API modülleri

## 15.1 Request Limit Service

Sorumluluklar:

* daily count hesapla
* weekly count hesapla
* active post count hesapla
* pending review count hesapla
* cooldown kontrol et
* create post öncesi izin ver / verme

Endpoint/servis mantığı:

* `canUserCreatePost(userId)`
* `getUserRequestLimits(userId)`
* `setUserRequestLimits(userId, overrides)`

## 15.2 Admin Settings Service

Sorumluluklar:

* global setting oku
* global setting güncelle
* değişiklikleri logla

## 15.3 Admin Audit Service

Sorumluluklar:

* tüm admin aksiyonlarını logla
* filtreli audit listesi döndür

---

# 16. Güncellenmiş küçük küçük TODO listesi

Aşağıya özellikle request limit ve admin konsolu eklendi.

## 16.1 DB TODO

* [ ] `admin_actions` tablosu oluştur
* [ ] `system_settings` tablosu oluştur
* [ ] `request_limit_logs` tablosu oluştur
* [ ] `users` tablosuna request limit override alanları ekle
* [ ] `users` tablosuna `is_request_banned` alanı ekle
* [ ] `linkedin_posts` tablosuna `hidden_by_admin` uyumlu status ekle
* [ ] yeni index: owner active post count
* [ ] yeni index: user request count daily
* [ ] yeni index: user request count weekly
* [ ] yeni index: pending approvals by owner

## 16.2 Request limit backend TODO

* [ ] `RequestLimitService` yaz
* [ ] daily post count query yaz
* [ ] weekly post count query yaz
* [ ] active post count query yaz
* [ ] pending review count query yaz
* [ ] cooldown checker yaz
* [ ] request-ban checker yaz
* [ ] create post öncesi gatekeeper yaz
* [ ] limit reddi log insert yaz

## 16.3 Request limit UI TODO

* [ ] kullanıcıya limit hatası componenti yap
* [ ] “bugün kaç request hakkım kaldı” widget yap
* [ ] “aktif post sayım” widget yap
* [ ] cooldown info text yap
* [ ] request-ban durum mesajı yap

## 16.4 Admin dashboard TODO

* [ ] dashboard summary cards yap
* [ ] daily request attempts chart yap
* [ ] pending approvals widget yap
* [ ] approval ratio widget yap
* [ ] rejection ratio widget yap
* [ ] limit reject count widget yap
* [ ] suspicious pattern summary widget yap

## 16.5 Admin users TODO

* [ ] users list ekranı yap
* [ ] user detail ekranı yap
* [ ] suspend action yap
* [ ] unsuspend action yap
* [ ] request-ban action yap
* [ ] request-ban kaldır action yap
* [ ] user-specific request limit form yap
* [ ] manual score adjustment form yap
* [ ] user activity timeline yap

## 16.6 Admin posts TODO

* [ ] posts list ekranı yap
* [ ] post detail ekranı yap
* [ ] post hide action yap
* [ ] post pause action yap
* [ ] post archive action yap
* [ ] post delete action yap
* [ ] owner swap action placeholder hazırla

## 16.7 Admin claims TODO

* [ ] claims list ekranı yap
* [ ] filters ekle
* [ ] claim detail drawer yap
* [ ] approve override action yap
* [ ] reject override action yap
* [ ] expire action yap
* [ ] cancel action yap

## 16.8 Admin scores TODO

* [ ] score events ekranı yap
* [ ] user score history ekranı yap
* [ ] add points action yap
* [ ] subtract points action yap
* [ ] rollback action yap
* [ ] combo event viewer yap

## 16.9 Admin settings TODO

* [ ] settings list ekranı yap
* [ ] editable config form yap
* [ ] config change confirmation modal yap
* [ ] config audit log yaz
* [ ] reset to default action yap

## 16.10 Admin audit TODO

* [ ] admin action log ekranı yap
* [ ] filter by admin yap
* [ ] filter by action type yap
* [ ] filter by target type yap
* [ ] target detail link ekle
* [ ] note display alanı yap

## 16.11 Flags TODO

* [ ] request abuse flag query yaz
* [ ] owner mass approval flag query yaz
* [ ] mutual pattern flag query yaz
* [ ] fast complete flag query yaz
* [ ] high rejection flag query yaz
* [ ] flags moderation ekranı yap

## 16.12 Permissions TODO

* [ ] admin-only middleware yaz
* [ ] owner-only approval middleware yaz
* [ ] request-ban middleware yaz
* [ ] suspended-user guard yaz
* [ ] action logging middleware yaz

## 16.13 Testing TODO

* [ ] daily limit reached testi
* [ ] weekly limit reached testi
* [ ] active post limit testi
* [ ] cooldown testi
* [ ] request-ban testi
* [ ] admin override approve testi
* [ ] admin override reject testi
* [ ] admin score adjustment testi
* [ ] settings change audit testi
* [ ] limit reject log testi

---

# 17. İlk sürüm için önerilen net kapsam

İlk çalışan sürümde mutlaka olsun:

* post create
* request limit kontrolü
* claim create
* claim complete
* owner approve/reject
* score event
* combo bonus
* leaderboard
* admin dashboard
* admin users modülü
* admin posts modülü
* admin claims modülü
* admin settings modülü
* audit log

Bu set, ürünü gerçekten yönetilebilir yapar.

---

# 18. Geliştirme sırası — güncellenmiş

## Faz 1

* çekirdek tablolar
* enumlar
* izin modeli

## Faz 2

* post create
* request limit service
* post listing

## Faz 3

* claim flow
* complete flow
* pending approvals

## Faz 4

* owner review
* score events
* combo bonus

## Faz 5

* leaderboard
* notifications

## Faz 6

* admin dashboard
* admin users
* admin posts
* admin claims

## Faz 7

* admin settings
* audit log
* limit logs
* flags

---

# 19. Çok kısa sistem özeti

Bu ürünün çekirdeği artık şu:

* LinkedIn postları görev olarak açılır
* Like / comment / repost ayrı görevdir
* Destek veren görevi claim eder
* Tamamladığını işaretler
* Owner onaylarsa puan alır
* Üç görev tamamlanırsa bonus alır
* İstek açanlara da limit vardır
* Admin sistemi geniş yetkiyle yönetir
* Her kritik aksiyon audit log’a yazılır

---

# 20. Geliştiriciye verilecek kısa çekirdek tanım

Bunu agent prompt’una aynen koyabilirsin:

**Bu sistemde LinkedIn aksiyonları otomatik doğrulanmaz. Like, comment ve repost ayrı görevlerdir. Her görev ayrı claim edilir, ayrı tamamlanır ve post sahibi tarafından ayrı onaylanır. Onaylanan görevler puan kazandırır. Aynı kullanıcı aynı post için üç görevi de onaylatırsa combo bonus alır. Ayrı trust score sistemi yoktur. Ayrıca post açan kullanıcılar için günlük, haftalık ve aktif post bazlı limitler vardır. Admin tarafı geniş yetkilidir; kullanıcı, post, claim, puan, sistem ayarları ve limitler admin konsolundan yönetilebilir. Tüm kritik aksiyonlar audit log’a yazılmalıdır.**

İstersen bunu şimdi bir sonraki mesajda doğrudan **Markdown dosyası gibi temiz başlıklı final formatta**, ya da **Cursor/Claude/Lovable’a verilecek ultra net build promptu** halinde çevireyim.
