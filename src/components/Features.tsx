
import { useEffect, useState, useRef } from 'react';
import { Compass, LineChart, FileEdit, BarChart4 } from 'lucide-react';

const features = [
  {
    title: "Personalized Career Roadmaps",
    description: "Discover career paths tailored to your unique strengths, interests, and values. Get step-by-step guidance on education, skills, and experiences needed.",
    icon: Compass,
    color: "bg-green-50 text-green-600"
  },
  {
    title: "Skills Gap Analysis",
    description: "Upload your resume or LinkedIn profile and identify missing skills for your target roles, with personalized training recommendations.",
    icon: LineChart,
    color: "bg-purple-50 text-purple-600"
  },
  {
    title: "AI Resume and Interview Coach",
    description: "Generate optimized resumes for specific job postings and practice interviews with AI feedback on your answers.",
    icon: FileEdit,
    color: "bg-blue-50 text-blue-600"
  },
  {
    title: "Job Market Insights",
    description: "Stay ahead with real-time data on emerging roles, in-demand skills, and industry trends to future-proof your career.",
    icon: BarChart4,
    color: "bg-orange-50 text-orange-600"
  }
];

const Features = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = featureRefs.current.findIndex((ref) => ref === entry.target);
            if (index !== -1) {
              setActiveFeature(index);
            }
          }
        });
      },
      { threshold: 0.6 }
    );

    featureRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      featureRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  return (
    <section className="py-20 px-4 bg-secondary">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium mb-4">
            Key Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">Future-proof your career journey</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered tools provide the insights and guidance you need to navigate the rapidly changing job market.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
          <div className="sticky top-24 h-fit hidden lg:block">
            <div className="glass-card rounded-xl overflow-hidden aspect-square">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    activeFeature === index ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="h-full flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className={`${feature.color} mx-auto w-16 h-16 flex items-center justify-center rounded-full mb-6`}>
                        <feature.icon size={28} />
                      </div>
                      <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 lg:space-y-24">
            {features.map((feature, index) => (
              <div
                key={index}
                ref={(el) => (featureRefs.current[index] = el)}
                className="glass-card p-6 md:p-8 rounded-xl lg:translate-y-0 hover:translate-y-[-5px] transition-transform duration-300"
              >
                <div className="lg:hidden">
                  <div className={`${feature.color} w-12 h-12 flex items-center justify-center rounded-full mb-4`}>
                    <feature.icon size={24} />
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
