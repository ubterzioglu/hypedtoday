import { motion } from "framer-motion";
import { Construction, Rocket, TimerReset } from "lucide-react";

const Index = () => {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      <div className="min-h-screen px-4 py-8 flex items-center justify-center relative">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <div className="h-full w-full bg-[linear-gradient(90deg,currentColor_1px,transparent_1px),linear-gradient(currentColor_1px,transparent_1px)] bg-[size:44px_44px]" />
        </div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-4xl border-4 border-foreground bg-card shadow-brutal"
        >
          <div className="grid md:grid-cols-[1fr_280px]">
            <div className="p-7 md:p-12">
              <div className="inline-flex items-center gap-2 border-2 border-foreground bg-primary px-3 py-2 font-black text-primary-foreground uppercase text-sm mb-8">
                <Construction className="w-4 h-4" />
                Yapım Aşamasında
              </div>

              <h1 className="font-display text-5xl md:text-7xl font-black leading-none mb-6">
                hyped.today
              </h1>

              <p className="text-2xl md:text-3xl font-black leading-tight mb-4">
                Projemiz yenileniyor.
              </p>

              <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Hyped.today şu anda yayından geçici olarak kaldırıldı. Daha net,
                daha güvenli ve daha kullanışlı bir sürümle tekrar hayata geçeceğiz.
              </p>

              <div className="mt-10 grid sm:grid-cols-2 gap-4">
                <div className="border-2 border-foreground p-4 bg-background">
                  <TimerReset className="w-6 h-6 text-primary mb-3" />
                  <p className="font-black uppercase text-sm mb-1">Durum</p>
                  <p className="text-sm text-muted-foreground">Kapalı beta hazırlığı</p>
                </div>
                <div className="border-2 border-foreground p-4 bg-background">
                  <Rocket className="w-6 h-6 text-secondary mb-3" />
                  <p className="font-black uppercase text-sm mb-1">Sıradaki Adım</p>
                  <p className="text-sm text-muted-foreground">Yeni ürün deneyimi</p>
                </div>
              </div>
            </div>

            <div className="border-t-4 md:border-t-0 md:border-l-4 border-foreground bg-primary p-7 md:p-8 flex flex-col justify-between min-h-[260px]">
              <div>
                <div className="w-16 h-16 border-4 border-foreground bg-background flex items-center justify-center shadow-brutal-sm mb-6">
                  <Rocket className="w-8 h-8" />
                </div>
                <p className="font-black uppercase text-primary-foreground text-3xl leading-none">
                  Soon.
                  <br />
                  Better.
                  <br />
                  Focused.
                </p>
              </div>

              <div className="mt-8 border-2 border-foreground bg-background px-4 py-3">
                <p className="text-xs font-black uppercase tracking-wide">hyped.today</p>
                <p className="text-xs text-muted-foreground mt-1">Geri döneceğiz.</p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
};

export default Index;
