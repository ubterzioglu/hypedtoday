import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardStats from "@/components/DashboardStats";
import QuickActions from "@/components/QuickActions";
import TopProjects from "@/components/TopProjects";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { BrutalButton } from "@/components/ui/brutal-button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Hero Section */}
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
                    Welcome to
                  </span>
                </div>
                <h1 className="font-display text-4xl md:text-6xl font-black mb-2">
                  supporttopromote
                </h1>
                <p className="text-lg text-muted-foreground">
                  Innovate. Connect. Create. Promote.
                </p>
              </div>
              <Link to="/add-project">
                <BrutalButton variant="primary" size="lg" className="px-8">
                  Add Your Project
                  <ArrowRight className="w-5 h-5 ml-2" />
                </BrutalButton>
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-lg font-bold uppercase mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary" />
            Platform Stats
          </h2>
          <DashboardStats />
        </motion.section>

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-lg font-bold uppercase mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-secondary" />
            Quick Actions
          </h2>
          <QuickActions />
        </motion.section>

        {/* Top Projects */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-accent" />
              Top Projects
            </h2>
            <Link
              to="/leaderboard"
              className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <TopProjects />
        </motion.section>

        {/* Join CTA */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <div className="bg-primary border-4 border-foreground p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-black text-primary-foreground mb-4">
              Join Our Community!
            </h2>
            <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
              Connect with other creators, get feedback on your projects, and
              discover amazing work from around the world.
            </p>
            <a
              href="https://www.linkedin.com/groups/16927008/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <BrutalButton
                variant="secondary"
                size="lg"
                className="px-12"
              >
                Join LinkedIn Group 🚀
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
