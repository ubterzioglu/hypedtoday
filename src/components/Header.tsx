import { Link, useLocation, useNavigate } from "react-router-dom";
import { Rocket, Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "react-i18next";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();

  const navItems = [
    { label: t("nav.home"), to: "/" },
    { label: t("nav.explore"), to: "/showroom" },
    { label: t("nav.addProject"), to: "/add-project" },
    { label: t("nav.leaderboard"), to: "/leaderboard" },
    { label: t("nav.howItWorks"), to: "/how-it-works" },
    { label: t("nav.contact"), to: "/contact" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === "tr" ? "en" : "tr");
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b-4 border-foreground">
      <div className="bg-accent text-accent-foreground border-b-2 border-foreground">
        <div className="container mx-auto px-4 py-2 text-center text-xs sm:text-sm font-bold uppercase tracking-wide">
          {t("header.banner")}
        </div>
      </div>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary border-2 border-foreground flex items-center justify-center">
              <Rocket className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-black text-xl hidden sm:block">
              HYPED
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-4 py-2 text-sm font-bold uppercase transition-all border-2 border-transparent hover:border-foreground ${
                  location.pathname === item.to
                    ? "bg-primary text-primary-foreground border-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l-2 border-foreground">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.displayName || ""} className="w-8 h-8 border-2 border-foreground object-cover" loading="lazy" decoding="async" />
                ) : (
                  <div className="w-8 h-8 bg-primary border-2 border-foreground flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <span className="text-sm font-bold max-w-[120px] truncate">{user.displayName || user.email}</span>
                <Link
                  to="/my-claims"
                  className="px-3 py-1 text-xs font-bold uppercase bg-secondary text-secondary-foreground border-2 border-foreground hover:bg-secondary/80"
                >
                  {t("header.myClaims")}
                </Link>
                <Link
                  to="/my-reviews"
                  className="px-3 py-1 text-xs font-bold uppercase bg-accent text-accent-foreground border-2 border-foreground hover:bg-accent/80"
                >
                  {t("header.myReviews")}
                </Link>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="px-3 py-1 text-xs font-bold uppercase bg-primary text-primary-foreground border-2 border-foreground hover:bg-primary/80"
                  >
                    {t("header.admin")}
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="p-2 border-2 border-foreground hover:bg-muted transition-colors"
                  title={t("header.signOut")}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="px-4 py-2 text-sm font-bold uppercase border-2 border-foreground hover:bg-muted transition-all ml-2"
              >
                {t("header.signIn")}
              </Link>
            )}

            <button
              onClick={toggleLang}
              className="ml-2 px-3 py-1 text-xs font-black uppercase border-2 border-foreground hover:bg-muted transition-colors"
            >
              {i18n.language === "tr" ? "EN" : "TR"}
            </button>
          </nav>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="px-3 py-1 text-xs font-black uppercase border-2 border-foreground hover:bg-muted transition-colors"
            >
              {i18n.language === "tr" ? "EN" : "TR"}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 bg-muted border-2 border-foreground flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-t-2 border-foreground overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 text-sm font-bold uppercase border-2 border-foreground ${
                    location.pathname === item.to
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 border-2 border-foreground bg-muted">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-6 h-6 border border-foreground object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    <span className="font-bold text-sm truncate">{user.displayName || user.email}</span>
                  </div>
                  <Link to="/my-claims" onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-bold uppercase bg-secondary text-secondary-foreground border-2 border-foreground">
                    {t("header.myClaims")}
                  </Link>
                  <Link to="/my-reviews" onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-bold uppercase bg-accent text-accent-foreground border-2 border-foreground">
                    {t("header.myReviews")}
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 text-sm font-bold uppercase bg-primary text-primary-foreground border-2 border-foreground"
                    >
                      {t("header.adminDashboard")}
                    </Link>
                  )}
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                    className="px-4 py-3 text-sm font-bold uppercase bg-destructive text-white border-2 border-foreground flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> {t("header.signOut")}
                  </button>
                </>
              ) : (
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-bold uppercase border-2 border-foreground hover:bg-muted"
                >
                  {t("header.signIn")}
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
