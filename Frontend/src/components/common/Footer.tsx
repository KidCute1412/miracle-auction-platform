import { Github, Facebook, Mail, MapPin, Trophy, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border text-foreground relative overflow-hidden transition-colors duration-300">
      {/* Background ambient glow */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/20 to-transparent"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand and Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Trophy className="text-accent" size={28} />
              <h3 className="font-heading text-2xl font-bold bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">
                Miracle
              </h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Vietnam's leading online auction platform. Delivering a fair, safe, and premium auction experience for everyone.
            </p>
            <div className="flex space-x-3 pt-2">
              <Link
                to="https://www.github.com/KidCute1412/Online-Auction"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-muted hover:bg-muted/80 text-muted-foreground hover:text-accent p-2.5 rounded-full transition-all duration-300"
              >
                <Github size={18} />
              </Link>
              <Link
                to="https://www.facebook.com/le.tuan.loc.39104/?locale=vi_VN"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-muted hover:bg-muted/80 text-muted-foreground hover:text-accent p-2.5 rounded-full transition-all duration-300"
              >
                <Facebook size={18} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-heading text-lg font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-accent transition-colors duration-200 flex items-center group">
                  <span className="w-0 group-hover:w-3.5 transition-all duration-200 overflow-hidden">→</span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-muted-foreground hover:text-accent transition-colors duration-200 flex items-center group">
                  <span className="w-0 group-hover:w-3.5 transition-all duration-200 overflow-hidden">→</span>
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-accent transition-colors duration-200 flex items-center group">
                  <span className="w-0 group-hover:w-3.5 transition-all duration-200 overflow-hidden">→</span>
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-heading text-lg font-semibold text-foreground">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-accent transition-colors duration-200 cursor-default">Sell Products</li>
              <li className="hover:text-accent transition-colors duration-200 cursor-default">Online Auctions</li>
              <li className="hover:text-accent transition-colors duration-200 cursor-default">Product Verification</li>
              <li className="hover:text-accent transition-colors duration-200 cursor-default">24/7 Support</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-heading text-lg font-semibold text-foreground">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3 text-muted-foreground">
                <MapPin size={18} className="text-accent flex-shrink-0 mt-0.5" />
                <span>227 Nguyen Van Cu, Ward 4, District 5, Ho Chi Minh City</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Mail size={18} className="text-accent flex-shrink-0" />
                <span>letuanloc1412@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-muted-foreground text-xs text-center md:text-left">
              © {currentYear} Miracle. All rights reserved.
              <span className="ml-2 text-accent">
                Made with <Heart size={12} className="inline animate-pulse text-red-500 fill-red-500" /> in Vietnam
              </span>
            </div>
            <div className="flex space-x-6 text-xs text-muted-foreground">
              <Link to="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-accent transition-colors">Terms</Link>
              <Link to="/cookies" className="hover:text-accent transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;