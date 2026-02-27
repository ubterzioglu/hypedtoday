import { Link } from "react-router-dom";
import { Rocket, Github, Twitter, Linkedin } from "lucide-react";

const footerLinks = [
  { label: "Home", to: "/" },
  { label: "Explore", to: "/showroom" },
  { label: "Add Project", to: "/add-project" },
  { label: "Leaderboard", to: "/leaderboard" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "Contact", to: "/contact" },
];

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/supporttopromote", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com/groups/16927008", label: "LinkedIn" },
  { icon: Github, href: "#", label: "GitHub" },
];

const Footer = () => {
  return (
    <footer className="bg-card border-t-4 border-foreground mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
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

          {/* Links */}
          <div>
            <h3 className="font-bold uppercase mb-4 text-sm">Navigation</h3>
            <div className="grid grid-cols-2 gap-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold uppercase mb-4 text-sm">Connect</h3>
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

        {/* Copyright */}
        <div className="mt-8 pt-4 border-t-2 border-foreground/20 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} HYPED. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
