import { Link } from "react-router-dom";
import { Rocket, Github, Twitter, Linkedin } from "lucide-react";
import { useTranslation } from "react-i18next";

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/hypedtoday", label: "Twitter" },
  { icon: Linkedin, href: "https://www.linkedin.com/company/hyped-today/", label: "LinkedIn" },
  { icon: Github, href: "#", label: "GitHub" },
];

const Footer = () => {
  const { t } = useTranslation();

  const footerLinks = [
    { label: t("nav.home"), to: "/" },
    { label: t("nav.explore"), to: "/showroom" },
    { label: t("nav.addProject"), to: "/add-project" },
    { label: t("nav.leaderboard"), to: "/leaderboard" },
    { label: t("nav.howItWorks"), to: "/how-it-works" },
    { label: t("nav.contact"), to: "/contact" },
  ];

  return (
    <footer className="bg-card border-t-4 border-foreground mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary border-2 border-foreground flex items-center justify-center">
                <Rocket className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-black text-lg">HYPED</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Innovate. Connect. Create. Promote.
            </p>
          </div>

          <div>
            <h3 className="font-bold uppercase mb-4 text-sm">{t("footer.navigation")}</h3>
            <div className="grid grid-cols-2 gap-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold uppercase mb-4 text-sm">{t("footer.connect")}</h3>
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-muted border-2 border-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  title={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t-2 border-foreground/20 text-center">
          <p className="text-xs text-muted-foreground">
            {t("footer.rights", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
