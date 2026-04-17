import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardStats from "@/components/DashboardStats";
import QuickActions from "@/components/QuickActions";
import TopProjects from "@/components/TopProjects";
import { ArrowRight, Sparkles, Users, TrendingUp, Trophy, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { BrutalButton } from "@/components/ui/brutal-button";
import { useTranslation } from "react-i18next";

const faqItems = [
  { q: "seo.faq1Q", a: "seo.faq1A" },
  { q: "seo.faq2Q", a: "seo.faq2A" },
  { q: "seo.faq3Q", a: "seo.faq3A" },
  { q: "seo.faq4Q", a: "seo.faq4A" },
  { q: "seo.faq5Q", a: "seo.faq5A" },
];

const features = [
  { title: "seo.feature1Title", desc: "seo.feature1Desc", icon: Users, color: "bg-primary/10 border-primary text-primary" },
  { title: "seo.feature2Title", desc: "seo.feature2Desc", icon: TrendingUp, color: "bg-secondary/10 border-secondary text-secondary" },
  { title: "seo.feature3Title", desc: "seo.feature3Desc", icon: Zap, color: "bg-accent/10 border-accent text-accent" },
  { title: "seo.feature4Title", desc: "seo.feature4Desc", icon: Trophy, color: "bg-highlight/10 border-highlight text-highlight" },
];

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-4 border-foreground p-6 md:p-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-sm font-bold uppercase text-primary">
                    {t("home.welcomeTo")}
                  </span>
                </div>
                <h1 className="font-display text-4xl md:text-6xl font-black mb-2">
                  hyped.today
                  <span className="sr-only"> – {t("seo.heroSubtitle")}</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  {t("home.tagline")}
                </p>
              </div>
              <Link to="/add-project">
                <BrutalButton variant="primary" size="lg" className="px-8">
                  {t("home.addYourProject")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </BrutalButton>
              </Link>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-lg font-bold uppercase mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary" />
            {t("home.platformStats")}
          </h2>
          <DashboardStats />
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-lg font-bold uppercase mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-secondary" />
            {t("home.quickActions")}
          </h2>
          <QuickActions />
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-accent" />
              {t("home.topProjects")}
            </h2>
            <Link
              to="/leaderboard"
              className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
            >
              {t("home.viewAll")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <TopProjects />
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="bg-primary border-4 border-foreground p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-black text-primary-foreground mb-4">
              {t("home.joinTitle")}
            </h2>
            <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
              {t("home.joinDesc")}
            </p>
            <a
              href="http://linkedin.com/company/hyped-today"
              target="_blank"
              rel="noopener noreferrer"
            >
              <BrutalButton variant="secondary" size="lg" className="px-12">
                {t("home.joinLinkedIn")}
              </BrutalButton>
            </a>
          </div>
        </motion.section>

        <section className="mb-12 max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black mb-6">{t("seo.whatIsTitle")}</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p dangerouslySetInnerHTML={{ __html: t("seo.whatIsP1") }} />
            <p dangerouslySetInnerHTML={{ __html: t("seo.whatIsP2") }} />
            <p dangerouslySetInnerHTML={{ __html: t("seo.whatIsP3") }} />
          </div>
        </section>

        <section className="mb-12 max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black mb-6">{t("seo.howTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[
              { title: "seo.howStep1Title", desc: "seo.howStep1Desc" },
              { title: "seo.howStep2Title", desc: "seo.howStep2Desc" },
              { title: "seo.howStep3Title", desc: "seo.howStep3Desc" },
            ].map((step, i) => (
              <div key={i} className="bg-card border-3 border-foreground p-6">
                <h3 className="font-bold text-lg mb-2">{t(step.title)}</h3>
                <p className="text-sm text-muted-foreground">{t(step.desc)}</p>
              </div>
            ))}
          </div>
          <h3 className="font-bold mb-3">{t("seo.howListTitle")}</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>{t("seo.howListItem1")}</li>
            <li>{t("seo.howListItem2")}</li>
            <li>{t("seo.howListItem3")}</li>
            <li>{t("seo.howListItem4")}</li>
          </ul>
        </section>

        <section className="mb-12 max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black mb-6">{t("seo.featuresTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <div key={i} className={`border-3 p-6 ${feature.color}`}>
                <feature.icon className="w-8 h-8 mb-3" />
                <h3 className="font-bold text-lg mb-2">{t(feature.title)}</h3>
                <p className="text-sm text-muted-foreground">{t(feature.desc)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12 max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black mb-6">{t("seo.whoTitle")}</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p dangerouslySetInnerHTML={{ __html: t("seo.whoP1") }} />
            <p dangerouslySetInnerHTML={{ __html: t("seo.whoP2") }} />
            <p dangerouslySetInnerHTML={{ __html: t("seo.whoP3") }} />
          </div>
        </section>

        <section className="mb-12 max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black mb-6">{t("seo.faqTitle")}</h2>
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <details key={i} className="group bg-card border-2 border-foreground">
                <summary className="cursor-pointer p-4 font-bold flex items-center justify-between hover:bg-muted/50 transition-colors list-none">
                  <span>{t(item.q)}</span>
                  <span className="text-primary transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                </summary>
                <div className="px-4 pb-4 text-muted-foreground">
                  {t(item.a)}
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
