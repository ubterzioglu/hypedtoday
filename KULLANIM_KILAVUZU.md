## MCP Ayarları ve Gerekli CLI Kurulumu Rehberi

### 1. MCP Ayarları

1. MCP sunucusu için gerekli dosyaları ve yapılandırmaları kontrol et:
   - `mcp-server` veya benzeri backend dosyası varsa, yapılandırmasını gözden geçir.
   - Gerekli environment dosyalarını (.env) oluştur ve API anahtarlarını ekle.
   - MCP ile ilgili bağımlılıkları yükle:
     ```
     npm install mcp-server
     ```
   - MCP sunucusunu başlatmak için:
     ```
     npm run mcp
     ```
   - MCP ile ilgili hata alırsan, logları incele ve eksik bağımlılıkları yükle.

### 2. Vercel CLI Kurulumu

- Vercel CLI ile projeni kolayca deploy edebilirsin.
- Kurulum:
  ```
  npm install -g vercel
  ```
- Giriş yap:
  ```
  vercel login
  ```
- Deploy etmek için:
  ```
  vercel
  ```

### 3. Supabase CLI Kurulumu

- Supabase ile veritabanı ve authentication işlemlerini yönetebilirsin.
- Kurulum:
  ```
  npm install -g supabase
  ```
  veya
  ```
  brew install supabase/tap/supabase
  ```
- Giriş yap:
  ```
  supabase login
  ```
- Projeyi başlatmak için:
  ```
  supabase start
  ```

### 4. GitHub CLI Kurulumu

- GitHub CLI ile repo yönetimi ve işbirliği kolaylaşır.
- Kurulum:
  ```
  npm install -g gh
  ```
  veya
  ```
  winget install --id GitHub.cli
  ```
- Giriş yap:
  ```
  gh auth login
  ```
- Repo klonlamak için:
  ```
  gh repo clone <kullanıcı>/<repo>
  ```

### 5. Ortak Çalışma İçin Ekstra İpuçları

- Tüm ekip üyeleri yukarıdaki CLI’ları kurmalı.
- Ortak .env dosyası ve config ayarlarını paylaşın.
- Geliştirme ve deploy süreçlerinde MCP, Vercel, Supabase ve GitHub CLI’larını aktif kullanın.

### 6. Sık Karşılaşılan Sorunlar ve Çözümleri

- Bağımlılık hatası: `npm install` ile eksik paketleri yükle.
- Yetki hatası: CLI’larda login işlemini tekrar yap.
- Deploy hatası: Vercel/Supabase dashboard’dan logları incele.
# 🎨 Landing Page Kullanım Kılavuzu

## 📁 Dosya Yapısı

```
src/
├── assets/
│   └── hero-bg.jpg          # Hero arka plan görseli
├── components/
│   ├── HeroSection.tsx       # Ana hero bileşeni (AYARLAR BURADA!)
│   ├── HeroBackground.tsx    # Arka plan sistemi
│   ├── FloatingShapes.tsx    # Animasyonlu şekiller
│   └── ui/
│       └── brutal-button.tsx # Neo-brutalist butonlar
├── pages/
│   └── Index.tsx             # Ana sayfa
└── index.css                 # Tasarım sistemi (renkler, fontlar)
```

---

## 🖼️ ARKA PLAN DEĞİŞTİRME

### Dosya: `src/components/HeroSection.tsx`

Dosyanın üst kısmındaki `BACKGROUND_CONFIG` bölümünü düzenle:

```tsx
const BACKGROUND_CONFIG = {
  // SEÇENEKLER: "video" | "image" | "animation"
  type: "image" as BackgroundType,
  
  // Görsel için:
  imageSrc: heroBg,
  
  // Video için:
  // videoSrc: "/videos/hero-video.mp4",
  
  // Karanlık overlay (0-1 arası)
  overlayOpacity: 0.6,
};
```

### Görsel Değiştirme:
1. Yeni görseli `src/assets/` klasörüne koy
2. `HeroSection.tsx` dosyasında import et:
   ```tsx
   import heroBg from "@/assets/yeni-gorsel.jpg";
   ```

### Video Ekleme:
1. Video dosyasını `public/videos/` klasörüne koy
2. Config'i güncelle:
   ```tsx
   const BACKGROUND_CONFIG = {
     type: "video" as BackgroundType,
     videoSrc: "/videos/hero-video.mp4",
     overlayOpacity: 0.5,
   };
   ```

### Animasyon Modu:
```tsx
const BACKGROUND_CONFIG = {
  type: "animation" as BackgroundType,
  overlayOpacity: 0.7,
};
```

---

## 🎨 RENK PALETİ

### Dosya: `src/index.css`

| Renk | Değişken | Kullanım |
|------|----------|----------|
| 🟢 Lime Yeşil | `--primary` | Ana buton, vurgular |
| 🟠 Coral | `--secondary` | İkincil buton |
| 🔵 Cyan | `--tertiary` | Üçüncül buton |
| 🟡 Hardal | `--accent` | Vurgular |
| 🩷 Hot Pink | `--highlight` | Özel vurgular |

### Renk Değiştirme:
```css
:root {
  /* HSL formatında: ton doygunluk% parlaklık% */
  --primary: 82 84% 55%;        /* Lime yeşil */
  --secondary: 16 100% 66%;     /* Coral */
  --tertiary: 180 100% 50%;     /* Cyan */
  --accent: 45 100% 51%;        /* Hardal */
  --highlight: 330 100% 64%;    /* Hot pink */
}
```

---

## 🔘 BUTONLAR

### 5 Buton Varyantı:

| Varyant | Renk | Kullanım |
|---------|------|----------|
| `primary` | Lime | Proje Ekle |
| `secondary` | Coral | Keşfet |
| `tertiary` | Cyan | Oyla |
| `accent` | Hardal | Sıralama |
| `highlight` | Pink | Nasıl Çalışır |

### Kullanım:
```tsx
import { BrutalButton } from "@/components/ui/brutal-button";

<BrutalButton variant="primary" size="lg">
  Buton Metni
</BrutalButton>
```

### Boyutlar: `sm` | `default` | `lg` | `xl`

---

## ✏️ METİN DEĞİŞTİRME

### Dosya: `src/components/HeroSection.tsx`

```tsx
{/* Ana Başlık */}
<span className="text-foreground">Projeni Paylaş,</span>
<span className="text-gradient-hero">Oylamayı Kazan</span>

{/* Alt Başlık */}
<motion.p>
  En yaratıcı projeler burada yarışıyor...
</motion.p>

{/* İstatistikler */}
<p className="text-3xl font-bold text-primary">1.2K+</p>
<p className="text-sm">Proje</p>
```

---

## 🔗 BUTONLARA LINK EKLEME

```tsx
import { Link } from "react-router-dom";

<Link to="/proje-ekle">
  <BrutalButton variant="primary">
    Proje Ekle
  </BrutalButton>
</Link>
```

---

## 📱 RESPONSİVE TASARIM

Tasarım otomatik olarak responsive:
- **Mobil:** 2 sütun grid
- **Desktop:** 5 sütun grid

---

## 🔤 FONTLAR

| Font | Kullanım |
|------|----------|
| **Syne** | Başlıklar (h1-h6) |
| **Space Grotesk** | Gövde metni |

Font değiştirmek için `src/index.css` ve `tailwind.config.ts` güncelle.

---

## 🚀 YENİ SAYFA EKLEME

1. `src/pages/` klasörüne yeni dosya oluştur:
   ```tsx
   // src/pages/ProjeEkle.tsx
   const ProjeEkle = () => {
     return <div>Proje Ekle Sayfası</div>;
   };
   export default ProjeEkle;
   ```

2. `src/App.tsx` dosyasına route ekle:
   ```tsx
   import ProjeEkle from "./pages/ProjeEkle";
   
   <Route path="/proje-ekle" element={<ProjeEkle />} />
   ```

---

## 💡 İPUÇLARI

1. **Overlay karanlık seviyesi:** Görsel çok parlaksa `overlayOpacity` değerini artır (0.7-0.8)
2. **Video boyutu:** Performans için videoyu 1080p ve max 10MB tut
3. **Görsel format:** WebP veya optimize edilmiş JPG kullan
4. **Animasyonlar:** `FloatingShapes.tsx` dosyasından şekilleri özelleştir

---

## 🎯 HIZLI REFERANS

| Değişiklik | Dosya |
|------------|-------|
| Arka plan türü | `HeroSection.tsx` → `BACKGROUND_CONFIG` |
| Renkler | `index.css` → `:root` |
| Buton stilleri | `brutal-button.tsx` |
| Animasyonlu şekiller | `FloatingShapes.tsx` |
| Metinler | `HeroSection.tsx` |
| Yeni sayfalar | `App.tsx` + `pages/` klasörü |

---

Başarılar! 🚀
