import { Cpu, Brain, Database, ShieldCheck, Monitor, Globe, ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const programs = [
  {
    title: "Smart Classroom Solutions",
    icon: Monitor,
    desc: "Supply and installation of interactive digital boards and modern learning tools.",
    tags: ["EdTech", "Hardware", "Setup"],
  },
  {
    title: "LLMs & AI Training",
    icon: Brain,
    desc: "Practical training on Large Language Models and Artificial Intelligence ecosystems.",
    tags: ["AI", "Prompting", "ML"],
  },
  {
    title: "Industrial Training",
    icon: Cpu,
    desc: "Industry-focused programs (3-12 months) for international students in India.",
    tags: ["Internship", "Hands-on", "Career"],
  },
  {
    title: "Institutional Partnerships",
    icon: Globe,
    desc: "Strategic collaborations with colleges and schools for digital transformation.",
    tags: ["Partnership", "Growth", "B2B"],
  },
  {
    title: "Enterprise Software",
    icon: Database,
    desc: "Custom software development for businesses including school systems and scalable web apps.",
    tags: ["Dev", "Scale", "B2B"],
  },
  {
    title: "Cyber Security",
    icon: ShieldCheck,
    desc: "Advanced offensive and defensive security training with industry experts.",
    tags: ["Security", "Linux", "Ethical"],
  },
];

const Programs = () => {
  return (
    <section id="programs" className="py-24 bg-gray-50/30 dark:bg-[#121212]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <h2 className="text-[#8B1E1E] font-bold tracking-widest uppercase text-sm border-l-4 border-[#C5A03A] pl-4 mb-2">
              Academic Programs
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              Find Your Domain
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-md text-lg leading-relaxed">
            Our curriculum is designed in partnership with industry giants to
            ensure our graduates are day-one ready.
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full relative px-4"
        >
          <CarouselContent className="-ml-4 md:-ml-6">
            {programs.map((program, idx) => (
              <CarouselItem key={idx} className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3 py-4">
                <div className="group relative h-full bg-white dark:bg-[#1c1c1c] border border-gray-100 dark:border-gray-800 p-8 rounded-[2.5rem] hover:border-[#8B1E1E]/30 transition-all duration-500 shadow-sm hover:shadow-2xl flex flex-col">
                  {/* Decorative Icon Background */}
                  <div className="absolute top-0 right-0 p-8 opacity-10 transition-opacity group-hover:opacity-20 pointer-events-none">
                    <program.icon size={100} className="text-[#8B1E1E]" />
                  </div>

                  {/* Icon Header */}
                  <div className="bg-[#8B1E1E]/5 dark:bg-[#8B1E1E]/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-[#8B1E1E] transition-all duration-500 shadow-inner">
                    <program.icon className="text-[#8B1E1E] group-hover:text-white w-8 h-8 transition-colors duration-500" />
                  </div>

                  {/* Content */}
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-[#8B1E1E] transition-colors">
                    {program.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-sm grow">
                    {program.desc}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {program.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-4 py-1.5 bg-gray-50 dark:bg-[#252525] border border-gray-100 dark:border-gray-700 rounded-full text-[10px] font-black uppercase tracking-widest text-[#C5A03A]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer Action */}
                  <div className="pt-6 border-t border-gray-50 dark:border-gray-800">
                    <button className="flex items-center text-[#8B1E1E] text-xs font-black uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
                      Explore Course <ArrowRight className="ml-2 w-4 h-4 text-[#C5A03A]" />
                    </button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Controls */}
          <div className="flex justify-center md:justify-end gap-4 mt-12 md:absolute md:-top-24 md:right-4">
            <CarouselPrevious className="relative static translate-y-0 h-12 w-12 rounded-2xl border-gray-200 dark:border-gray-800 hover:bg-[#8B1E1E] hover:text-white transition-all shadow-sm" />
            <CarouselNext className="relative static translate-y-0 h-12 w-12 rounded-2xl border-gray-200 dark:border-gray-800 hover:bg-[#8B1E1E] hover:text-white transition-all shadow-sm" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};
export default Programs;
