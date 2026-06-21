import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import Programs from "@/components/home/Programs";
import Footer from "@/components/home/Footer";
import PublicBlogSection from "@/components/home/PublicBlogSection";
import { Link } from "react-router";
import { 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Layers, 
  Network,
  Users,
  Compass
} from "lucide-react";

const Home = () => {
  return (
    <div className="bg-[#FCFCFC] dark:bg-[#121212] font-sans antialiased">
      <Navbar />
      
      <main className="overflow-hidden">
        <Hero />

        {/* About Firstborn Section - Elevated Visuals */}
        <section className="py-24 relative overflow-hidden bg-gray-50/50 dark:bg-[#161616]">
          {/* Subtle decorative background blobs */}
          <div className="absolute top-1/3 left-0 w-96 h-96 bg-[#8B1E1E]/5 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-[#8B1E1E]/10 border border-[#8B1E1E]/20 px-4 py-1.5 rounded-full text-[#8B1E1E] text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A03A]" />
                  <span>ISO 9001:2015 Certified Entity</span>
                </div>
                
                <h2 className="text-[#8B1E1E] font-bold tracking-widest uppercase text-sm border-l-4 border-[#C5A03A] pl-4 mb-2">
                  Who We Are
                </h2>
                
                <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                  Driving Digital Transformation & Capacity Building
                </h3>
                
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Firstborn Technologies operates as a professional digital solutions and capacity-building organization in India. We combine custom software development, cybersecurity solutions, and Outcome-driven industrial training to support digital growth across sectors.
                </p>
                
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Our operational structure allows us to collaborate with public institutions, private organizations, and international partners (especially in emerging markets like Africa and India) while maintaining high standards of professionalism, accountability, and trust.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  {[
                    "Hands-on, outcome-driven programs",
                    "Software development for B2B scale",
                    "Cybersecurity defensive auditing",
                    "Smart Classroom installations",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center space-x-3 bg-white dark:bg-[#1E1E1E] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-xs hover:border-[#8B1E1E]/20 transition-all duration-300">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 font-semibold text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graphical Frame */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#8B1E1E]/10 to-[#C5A03A]/10 rounded-3xl blur-2xl transform rotate-6 pointer-events-none"></div>
                
                <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 relative group">
                  <img
                    src="/images/about_training.png"
                    alt="Professional Digital Training and Onboarding"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <p className="text-white text-sm font-semibold">Practical Industrial Training & Software Labs</p>
                  </div>
                </div>

                {/* Overlapping Badge */}
                <div className="absolute -bottom-8 -left-8 bg-white dark:bg-[#1c1c1c] p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 hidden md:block transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                  <p className="text-4xl font-extrabold text-[#8B1E1E] flex items-center gap-1">
                    100% <TrendingUp className="w-6 h-6 text-[#C5A03A]" />
                  </p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Practical Education</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Partnership / Logo Cloud */}
        <section className="py-16 border-y border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-[0.3em] mb-10">
              Strategic Industry Partners & Collaborators
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              <img src="/images/partners_logo/cu-logo.webp" alt="Chandigarh University" className="h-12 md:h-14 object-contain" />
              <img src="/images/partners_logo/I._K._Gujral_Punjab_Technical_University_logo.webp" alt="IKGPTU" className="h-12 md:h-14 object-contain" />
              <img src="/images/partners_logo/images-2.webp" alt="Partner Logo" className="h-12 md:h-14 object-contain" />
              <img src="/images/partners_logo/Gemini_Generated_Image_8qrdph8qrdph8qrd.webp" alt="Industry Partner" className="h-12 md:h-14 object-contain" />
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                  FIRSTBORN<span className="text-[#8B1E1E]">LABS</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        <Stats />
        
        <Programs />

        {/* New Onboarding/Career Placement Section directly from Website */}
        <section className="py-24 bg-white dark:bg-[#121212] relative">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#C5A03A]/5 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-[#8B1E1E] font-bold tracking-widest uppercase text-sm border-b-2 border-[#C5A03A] inline-block pb-2">
                After Training Care
              </h2>
              <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Career Acceleration Roadmap
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                We believe that education must lead to real-world opportunities. That is why we provide structured guidance to help our graduates transition smoothly into global careers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Step 1 */}
              <div className="bg-gray-50 dark:bg-[#1C1C1C] border border-gray-100 dark:border-gray-800 p-8 rounded-3xl relative overflow-hidden group hover:border-[#8B1E1E]/20 transition-all duration-300">
                <span className="absolute top-6 right-6 text-5xl font-black text-[#8B1E1E]/10 group-hover:text-[#8B1E1E]/20 transition-colors">01</span>
                <div className="w-12 h-12 rounded-2xl bg-[#8B1E1E]/10 flex items-center justify-center text-[#8B1E1E] mb-6">
                  <Layers className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Portfolio Construction</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Build a professional code and project portfolio demonstrating technical capabilities, practical software development, and real-world system designs.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-gray-50 dark:bg-[#1C1C1C] border border-gray-100 dark:border-gray-800 p-8 rounded-3xl relative overflow-hidden group hover:border-[#8B1E1E]/20 transition-all duration-300">
                <span className="absolute top-6 right-6 text-5xl font-black text-[#8B1E1E]/10 group-hover:text-[#8B1E1E]/20 transition-colors">02</span>
                <div className="w-12 h-12 rounded-2xl bg-[#C5A03A]/10 flex items-center justify-center text-[#C5A03A] mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Profile Optimization</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Prepare professional resumes matching global recruitment standards and optimize LinkedIn profiles for international technical networking.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-gray-50 dark:bg-[#1C1C1C] border border-gray-100 dark:border-gray-800 p-8 rounded-3xl relative overflow-hidden group hover:border-[#8B1E1E]/20 transition-all duration-300">
                <span className="absolute top-6 right-6 text-5xl font-black text-[#8B1E1E]/10 group-hover:text-[#8B1E1E]/20 transition-colors">03</span>
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 mb-6">
                  <Compass className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Technical Interview Prep</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Conduct mock technical and non-technical interview sessions to build confidence and refine problem-solving representations.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-gray-50 dark:bg-[#1C1C1C] border border-gray-100 dark:border-gray-800 p-8 rounded-3xl relative overflow-hidden group hover:border-[#8B1E1E]/20 transition-all duration-300">
                <span className="absolute top-6 right-6 text-5xl font-black text-[#8B1E1E]/10 group-hover:text-[#8B1E1E]/20 transition-colors">04</span>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
                  <Network className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Global Gig Placement</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Identify and set up professional profiles on international freelancing platforms (Upwork, Fiverr) to secure freelance projects.
                </p>
              </div>

              {/* Step 5 */}
              <div className="bg-gray-50 dark:bg-[#1C1C1C] border border-gray-100 dark:border-gray-800 p-8 rounded-3xl relative overflow-hidden group hover:border-[#8B1E1E]/20 transition-all duration-300">
                <span className="absolute top-6 right-6 text-5xl font-black text-[#8B1E1E]/10 group-hover:text-[#8B1E1E]/20 transition-colors">05</span>
                <div className="w-12 h-12 rounded-2xl bg-[#8B1E1E]/10 flex items-center justify-center text-[#8B1E1E] mb-6">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">AI Productivity Tools</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Learn to configure and deploy AI assistants to write code, review logs, and increase overall software development competitiveness.
                </p>
              </div>

              {/* Step 6 */}
              <div className="bg-gray-50 dark:bg-[#1C1C1C] border border-gray-100 dark:border-gray-800 p-8 rounded-3xl relative overflow-hidden group hover:border-[#8B1E1E]/20 transition-all duration-300">
                <span className="absolute top-6 right-6 text-5xl font-black text-[#8B1E1E]/10 group-hover:text-[#8B1E1E]/20 transition-colors">06</span>
                <div className="w-12 h-12 rounded-2xl bg-[#C5A03A]/10 flex items-center justify-center text-[#C5A03A] mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Placement Support</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Map out a personalized roadmap and connect directly with strategic business partners, clients, and corporate opportunities.
                </p>
              </div>

            </div>
          </div>
        </section>

        <PublicBlogSection />

        {/* Testimonials */}
        <section className="py-24 bg-gray-50/50 dark:bg-[#161616] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-[#8B1E1E]/5 blur-[100px] rounded-full"></div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="mb-8 flex justify-center">
              <div className="w-16 h-1 bg-[#8B1E1E] rounded-full border-b border-[#C5A03A]"></div>
            </div>
            
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              Student Experiences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
              
              <div className="bg-white dark:bg-[#1c1c1c] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" alt="Google" className="h-4" />
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 italic">
                  "My experience at Firstborn Technologies so far is awesome. I highly recommend them for international students in India and also for internship purposes."
                </p>
                <div className="flex items-center space-x-4">
                  <img src="https://picsum.photos/seed/rosette/100/100" alt="Student" className="w-12 h-12 rounded-full border-2 border-[#8B1E1E]" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Agbor Rosette</p>
                    <p className="text-sm text-[#8B1E1E]">International Student • Verified Google Review</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1c1c1c] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" alt="Google" className="h-4" />
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 italic">
                  "Best Training Center for International Students in India. If you are in Africa and intend to travel to India for a training I also recommend them."
                </p>
                <div className="flex items-center space-x-4">
                  <img src="https://picsum.photos/seed/alain/100/100" alt="Student" className="w-12 h-12 rounded-full border-2 border-[#8B1E1E]" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Alain Moutem</p>
                    <p className="text-sm text-[#8B1E1E]">International Student • Verified Google Review</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-linear-to-r from-gray-50 to-white dark:from-[#1c1c1c] dark:to-[#2a2a2a] rounded-[3rem] p-12 md:p-20 text-center border border-gray-200 dark:border-gray-800 relative overflow-hidden shadow-xl dark:shadow-none">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#8B1E1E] border-b border-[#C5A03A]"></div>
              
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Start Your Global Career
              </h2>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
                Applications for our **Outcome-Driven Industrial Training** are now open.
                Take the first step towards a boundary-breaking career with industry experts.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/login" className="bg-[#8B1E1E] text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-[#7a1a1a] transition-all transform hover:scale-105 shadow-lg shadow-[#8B1E1E]/20 border-b-2 border-[#C5A03A]">
                  Apply for Admission
                </Link>
                <button className="bg-transparent border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                  Contact Admissions
                </button>
              </div>

            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
