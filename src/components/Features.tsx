
import { useEffect, useState, useRef } from 'react';
import { Compass, LineChart, FileEdit, BarChart4, Shield, Zap, BrainCircuit, ArrowRight } from 'lucide-react';
import Button from './Button';
import { useToast } from "@/hooks/use-toast";

const features = [
  {
    title: "Personalized Career Roadmaps",
    description: "Discover career paths tailored to your unique strengths, interests, and values. Get step-by-step guidance on education, skills, and experiences needed.",
    icon: Compass,
    color: "bg-green-50 text-green-600",
    hoverColor: "group-hover:bg-green-100 group-hover:text-green-700"
  },
  {
    title: "Skills Gap Analysis",
    description: "Upload your resume or LinkedIn profile and identify missing skills for your target roles, with personalized training recommendations.",
    icon: LineChart,
    color: "bg-purple-50 text-purple-600",
    hoverColor: "group-hover:bg-purple-100 group-hover:text-purple-700"
  },
  {
    title: "AI Resume and Interview Coach",
    description: "Generate optimized resumes for specific job postings and practice interviews with AI feedback on your answers.",
    icon: FileEdit,
    color: "bg-blue-50 text-blue-600",
    hoverColor: "group-hover:bg-blue-100 group-hover:text-blue-700"
  },
  {
    title: "Job Market Insights",
    description: "Stay ahead with real-time data on emerging roles, in-demand skills, and industry trends to future-proof your career.",
    icon: BarChart4,
    color: "bg-orange-50 text-orange-600",
    hoverColor: "group-hover:bg-orange-100 group-hover:text-orange-700"
  },
  {
    title: "AI-Powered Mentor Network",
    description: "Connect with AI mentors that simulate real professionals in your target field, available 24/7 to answer questions and provide guidance.",
    icon: BrainCircuit,
    color: "bg-teal-50 text-teal-600",
    hoverColor: "group-hover:bg-teal-100 group-hover:text-teal-700"
  },
  {
    title: "Career Security Analysis",
    description: "Evaluate how automation and AI might impact your chosen career path over the next decade, with strategies to stay relevant.",
    icon: Shield,
    color: "bg-red-50 text-red-600",
    hoverColor: "group-hover:bg-red-100 group-hover:text-red-700"
  },
  {
    title: "Accelerated Learning Paths",
    description: "Custom learning roadmaps that help you acquire new skills in the shortest possible time based on your learning style.",
    icon: Zap,
    color: "bg-amber-50 text-amber-600",
    hoverColor: "group-hover:bg-amber-100 group-hover:text-amber-700"
  }
];

const Features = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [visibleFeatures, setVisibleFeatures] = useState<number[]>([]);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<typeof features[0] | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = featureRefs.current.findIndex((ref) => ref === entry.target);
            if (index !== -1) {
              setActiveFeature(index);
              setVisibleFeatures(prev => 
                prev.includes(index) ? prev : [...prev, index]
              );
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

  const handleFeatureClick = (feature: typeof features[0]) => {
    setSelectedFeature(feature);
    setShowModal(true);
  };

  const handleLearnMore = () => {
    toast({
      title: "Feature details",
      description: `Learn more about ${selectedFeature?.title}`,
      duration: 3000,
    });
    setShowModal(false);
  };

  return (
    <section id="features-section" className="py-20 px-4 bg-secondary relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl"></div>

      <div className="container mx-auto relative z-10">
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
            <div className="glass-modern rounded-xl overflow-hidden aspect-square shadow-lg">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    activeFeature === index ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="h-full flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className={`${feature.color} mx-auto w-16 h-16 flex items-center justify-center rounded-full mb-6 transition-all duration-300`}>
                        <feature.icon size={28} />
                      </div>
                      <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                      <Button 
                        variant="outline" 
                        className="mt-6"
                        onClick={() => handleFeatureClick(feature)}
                      >
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 lg:space-y-12">
            {features.map((feature, index) => (
              <div
                key={index}
                ref={(el) => (featureRefs.current[index] = el)}
                className={`glass-card p-6 md:p-8 rounded-xl lg:translate-y-0 hover:translate-y-[-5px] transition-transform duration-300 group cursor-pointer ${
                  visibleFeatures.includes(index) ? 'animate-fadeIn' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleFeatureClick(feature)}
              >
                <div className="flex items-start">
                  <div className={`${feature.color} ${feature.hoverColor} w-12 h-12 flex items-center justify-center rounded-full mb-4 transition-colors duration-300 mr-4 flex-shrink-0`}>
                    <feature.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                    <div className="mt-4 flex items-center text-primary text-sm font-medium">
                      <span>Learn more</span>
                      <ArrowRight size={16} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature detail modal */}
        {showModal && selectedFeature && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center mb-4">
                <div className={`${selectedFeature.color} w-12 h-12 flex items-center justify-center rounded-full mr-4`}>
                  <selectedFeature.icon size={24} />
                </div>
                <h3 className="text-2xl font-bold">{selectedFeature.title}</h3>
              </div>
              <p className="text-muted-foreground mb-6">{selectedFeature.description}</p>
              
              <div className="space-y-4 mb-6">
                <h4 className="font-semibold text-lg">How it works:</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Advanced AI algorithms analyze your profile, skills, and preferences</li>
                  <li>Real-time data from thousands of job postings informs recommendations</li>
                  <li>Personalized results tailored to your specific career goals</li>
                  <li>Step-by-step guidance to help you implement the insights</li>
                </ul>
                
                <h4 className="font-semibold text-lg mt-6">Benefits:</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Make informed career decisions with confidence</li>
                  <li>Save hundreds of hours on research and planning</li>
                  <li>Focus your learning on skills that matter most</li>
                  <li>Adapt quickly to changing job market conditions</li>
                </ul>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Close
                </Button>
                <Button onClick={handleLearnMore}>
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Features;
