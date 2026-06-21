import {
  Linkedin,
  ArrowUp,
  MapPin,
  Mail,
  Phone,
  Facebook,
  Youtube,
  Instagram,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="pt-20 pb-10 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <img src="./images/main_logo.png" alt="Firstborn Technologies Logo" className="h-10 w-auto" />
            </div>
            <p className="text-gray-600 dark:text-gray-500 leading-relaxed">
              FirstBorn Technologies is an India-based technology and training company dedicated to developing global talent and delivering innovative digital solutions.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com/firstborntechnologies"
                className="w-10 h-10 rounded-full bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:bg-[#8B1E1E] hover:text-white transition-all text-gray-500 dark:text-gray-400 shadow-sm"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/firstborntechnologies"
                className="w-10 h-10 rounded-full bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:bg-[#8B1E1E] hover:text-white transition-all text-gray-500 dark:text-gray-400 shadow-sm"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/company/firstborntechnologies"
                className="w-10 h-10 rounded-full bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:bg-[#8B1E1E] hover:text-white transition-all text-gray-500 dark:text-gray-400 shadow-sm"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com/@firstborntechnologies"
                className="w-10 h-10 rounded-full bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:bg-[#8B1E1E] hover:text-white transition-all text-gray-500 dark:text-gray-400 shadow-sm"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-gray-900 dark:text-white font-bold mb-6 text-lg">
              Our Services
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="#programs"
                  className="text-gray-600 dark:text-gray-500 hover:text-[#8B1E1E] transition-colors"
                >
                  Industrial Training
                </a>
              </li>
              <li>
                <a
                  href="#programs"
                  className="text-gray-600 dark:text-gray-500 hover:text-[#8B1E1E] transition-colors"
                >
                  AI & LLM Programs
                </a>
              </li>
              <li>
                <a
                  href="#programs"
                  className="text-gray-600 dark:text-gray-500 hover:text-[#8B1E1E] transition-colors"
                >
                  Smart Classrooms
                </a>
              </li>
              <li>
                <a
                  href="#programs"
                  className="text-gray-600 dark:text-gray-500 hover:text-[#8B1E1E] transition-colors"
                >
                  Institutional Partnerships
                </a>
              </li>
              <li>
                <a
                  href="/register"
                  className="text-gray-600 dark:text-gray-500 hover:text-[#8B1E1E] transition-colors font-bold"
                >
                  Scholarship Application
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 dark:text-white font-bold mb-6 text-lg tracking-tight">
              Contact Us
            </h4>
            <div className="space-y-6">
              <div className="flex items-start space-x-4 group">
                <div className="w-10 h-10 rounded-xl bg-[#8B1E1E]/5 flex items-center justify-center shrink-0 border border-[#8B1E1E]/10 group-hover:bg-[#8B1E1E] group-hover:text-white transition-all">
                  <MapPin className="w-5 h-5 text-[#8B1E1E] group-hover:text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-bold text-gray-900 dark:text-white mb-1">India HQ</p>
                  <p className="text-gray-600 dark:text-gray-500 leading-relaxed">
                    Badala Road, near paradise homes,<br />140301 Punjab, India
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 group">
                <div className="w-10 h-10 rounded-xl bg-[#8B1E1E]/5 flex items-center justify-center shrink-0 border border-[#8B1E1E]/10 group-hover:bg-[#8B1E1E] group-hover:text-white transition-all">
                  <Mail className="w-5 h-5 text-[#8B1E1E] group-hover:text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-bold text-gray-900 dark:text-white mb-1">Email Support</p>
                  <a href="mailto:international@firstborn-technologies.com" className="text-gray-600 dark:text-gray-500 hover:text-[#8B1E1E] block transition-colors overflow-hidden text-ellipsis max-w-[150px] sm:max-w-none">
                    international@firstborn-technologies.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4 group">
                <div className="w-10 h-10 rounded-xl bg-[#8B1E1E]/5 flex items-center justify-center shrink-0 border border-[#8B1E1E]/10 group-hover:bg-[#8B1E1E] group-hover:text-white transition-all">
                  <Phone className="w-5 h-5 text-[#8B1E1E] group-hover:text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-bold text-gray-900 dark:text-white mb-1">International Hotline</p>
                  <a href="tel:+919872591306" className="text-gray-600 dark:text-gray-500 hover:text-[#8B1E1E] font-medium transition-colors">
                    +91 98725 91306
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-gray-900 dark:text-white font-bold mb-6 text-lg">
              Newsletter
            </h4>
            <p className="text-gray-600 dark:text-gray-500 mb-6">
              Stay updated with the latest research breakthroughs and campus
              news.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Email address"
                className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-gray-800 rounded-l-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none w-full"
              />
              <button className="bg-[#8B1E1E] text-white px-4 py-3 rounded-r-lg font-bold hover:bg-[#7a1a1a] transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <p>© 2026 Firstborn Technologies. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="#"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cookie Settings
            </a>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="mt-6 md:mt-0 p-3 rounded-full bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-group shadow-sm border-b-2 border-[#C5A03A] hover:border-[#8B1E1E]"
          >
            <ArrowUp className="w-5 h-5 group-hover:text-[#8B1E1E] text-gray-400" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
