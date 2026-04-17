import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardStats from "@/components/DashboardStats";
import QuickActions from "@/components/QuickActions";
import TopProjects from "@/components/TopProjects";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { BrutalButton } from "@/components/ui/brutal-button";
import { useTranslation } from "react-i18next";

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
          className="mt-12"
        >
          <div className="bg-primary border-4 border-foreground p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-black text-primary-foreground mb-4">
              {t("home.joinTitle")}
            </h2>
            <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
              {t("home.joinDesc")}
            </p>
            <a
              href="https://www.linkedin.com/company/hyped-today/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <BrutalButton variant="secondary" size="lg" className="px-12">
                {t("home.joinLinkedIn")}
              </BrutalButton>
            </a>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
