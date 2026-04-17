import { motion } from "framer-motion";
import { BrutalButton } from "@/components/ui/brutal-button";
import { Rocket, Compass, Vote, Trophy, HelpCircle, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const QuickActions = () => {
  const { t } = useTranslation();

  const actions = [
    { icon: Rocket, label: t("quickActions.addProject"), description: t("quickActions.addProjectDesc"), to: "/add-project", variant: "primary" as const },
    { icon: Compass, label: t("quickActions.explore"), description: t("quickActions.exploreDesc"), to: "/showroom", variant: "secondary" as const },
    { icon: Vote, label: t("quickActions.vote"), description: t("quickActions.voteDesc"), to: "/showroom", variant: "tertiary" as const },
    { icon: Trophy, label: t("quickActions.leaderboard"), description: t("quickActions.leaderboardDesc"), to: "/leaderboard", variant: "accent" as const },
    { icon: HelpCircle, label: t("quickActions.howItWorks"), description: t("quickActions.howItWorksDesc"), to: "/how-it-works", variant: "highlight" as const },
    { icon: Mail, label: t("quickActions.contact"), description: t("quickActions.contactDesc"), to: "/contact", variant: "secondary" as const },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {actions.map((action, index) => (
        <motion.div
          key={action.to + action.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <Link to={action.to}>
            <BrutalButton variant={action.variant} className="w-full flex-col h-auto py-4 gap-2">
              <action.icon className="w-6 h-6" />
              <div className="text-center">
                <span className="block text-sm font-bold">{action.label}</span>
                <span className="block text-[10px] opacity-70">{action.description}</span>
              </div>
            </BrutalButton>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default QuickActions;
