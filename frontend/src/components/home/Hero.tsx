import { ArrowRight, Play, Loader2, Send } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const Hero = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    course: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post("/public/inquiry", formData);
      toast.success("Inquiry submitted! We'll contact you soon.");
      setFormData({ name: "", email: "", phone: "", course: "" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="home"
      className="relative pt-32 pb-20 overflow-hidden min-h-screen flex items-center"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#8B1E1E] opacity-5 dark:opacity-5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-[#C5A03A] opacity-10 dark:opacity-10 blur-[120px] rounded-full"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-[#8B1E1E]/10 border border-[#8B1E1E]/20 px-3 py-1 rounded-full text-[#8B1E1E] text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5A03A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C5A03A]"></span>
              </span>
              <span>2026 Admissions are now open</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Industrial <span className="text-[#8B1E1E]">Training</span> & IT Solutions
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-xl leading-relaxed">
              At FirstBorn Technologies, we deliver practical training, innovative technology solutions, and smart learning tools designed to meet real-world needs.
            </p>

            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/login" className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-[#8B1E1E] text-white px-8 py-4 rounded-lg font-bold hover:bg-[#7a1a1a] transition-all transform hover:translate-y-[-2px] shadow-lg shadow-[#8B1E1E]/20 border-b-2 border-[#C5A03A]">
                <span>Access Student Portal</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-transparent text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:border-[#C5A03A] px-8 py-4 rounded-lg font-bold transition-all">
                <Play className="w-4 h-4 text-[#8B1E1E] fill-[#8B1E1E]" />
                <span>Watch Virtual Tour</span>
              </button>
            </div>

            <div className="flex items-center space-x-6 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  12k+
                </p>
                <p className="text-sm text-gray-500">Active Students</p>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-800"></div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  98%
                </p>
                <p className="text-sm text-gray-500">Graduate Hire Rate</p>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-800"></div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  #1
                </p>
                <p className="text-sm text-gray-500">Tech Innovation</p>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            {/* The Form Container */}
            <div className="relative bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl p-8 lg:p-10 backdrop-blur-sm">
               
               {/* Header */}
               <div className="mb-8">
                 <p className="text-sm font-semibold text-[#8B1E1E] mb-2 uppercase tracking-wider border-l-4 border-[#C5A03A] pl-3">
                   Request Information
                 </p>
                 <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                   Start Your Journey
                 </h2>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                   Leave your details and our admission board will reach out.
                 </p>
               </div>

               {/* Form */}
               <form onSubmit={handleInquirySubmit} className="space-y-5">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                   <input
                     required
                     type="text"
                     name="name"
                     value={formData.name}
                     onChange={handleInputChange}
                     placeholder="John Doe"
                     className="w-full border-gray-300 dark:border-gray-700 rounded-lg shadow-sm p-3 bg-gray-50 dark:bg-[#121212] focus:border-[#8B1E1E] focus:ring-[#8B1E1E] transition-colors dark:text-white"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                   <input
                     required
                     type="email"
                     name="email"
                     value={formData.email}
                     onChange={handleInputChange}
                     placeholder="john@example.com"
                     className="w-full border-gray-300 dark:border-gray-700 rounded-lg shadow-sm p-3 bg-gray-50 dark:bg-[#121212] focus:border-[#8B1E1E] focus:ring-[#8B1E1E] transition-colors dark:text-white"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                   <input
                     required
                     type="tel"
                     name="phone"
                     value={formData.phone}
                     onChange={handleInputChange}
                     placeholder="+1 (555) 000-0000"
                     className="w-full border-gray-300 dark:border-gray-700 rounded-lg shadow-sm p-3 bg-gray-50 dark:bg-[#121212] focus:border-[#8B1E1E] focus:ring-[#8B1E1E] transition-colors dark:text-white"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Interested In</label>
                   <select
                     required
                     name="course"
                     value={formData.course}
                     onChange={handleInputChange}
                     className="w-full border-gray-300 dark:border-gray-700 rounded-lg shadow-sm p-3 bg-gray-50 dark:bg-[#121212] focus:border-[#8B1E1E] focus:ring-[#8B1E1E] transition-colors dark:text-white"
                   >
                     <option value="" disabled>Select a discipline</option>
                     <option value="Software Engineering">Software Engineering</option>
                     <option value="Data Science & AI">Data Science & AI</option>
                     <option value="Cybersecurity">Cybersecurity</option>
                     <option value="Cloud Computing">Cloud Computing</option>
                     <option value="Corporate IT Training">Corporate IT Training</option>
                   </select>
                 </div>

                 <button
                   type="submit"
                   disabled={isSubmitting}
                   className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-[#8B1E1E] to-[#6a1515] text-white px-6 py-4 rounded-lg font-bold hover:shadow-lg hover:shadow-[#8B1E1E]/30 transition-all disabled:opacity-70 mt-4 border-b-2 border-[#C5A03A]"
                 >
                   {isSubmitting ? (
                     <>
                       <Loader2 className="w-5 h-5 animate-spin" />
                       <span>Submitting...</span>
                     </>
                   ) : (
                     <>
                       <span>Request Information</span>
                       <Send className="w-4 h-4" />
                     </>
                   )}
                 </button>
               </form>
            </div>

            {/* Decorative Overlay Frame Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-[#C5A03A] to-yellow-600 rounded-full opacity-20 blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-[#8B1E1E] to-red-800 rounded-full opacity-20 blur-2xl hidden md:block"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
