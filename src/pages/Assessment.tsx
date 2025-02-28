
import { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { useGeminiAnalysis, type CareerPath, type SkillGap } from '@/lib/gemini';
import { generateUniqueId, getNoteColorsByType, formatTimeframe } from '@/lib/utils';
import { 
  PlusCircle, XCircle, Loader2, ThumbsUp, ThumbsDown, 
  Save, Download, Lightbulb, Trophy, Brain, Award,
  Layers, BarChart3, DollarSign, TrendingUp, Briefcase,
  BookOpen, Sparkles, ArrowRight, ScanSearch, Palette, RotateCw, FileDown, Wand2,
  GraduationCap, ExternalLink
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface NoteProps {
  id: string;
  text: string;
  type: 'interest' | 'dislike' | 'skill' | 'goal';
  position: { x: number; y: number };
  timeframe?: number; // years (for goals only)
  onRemove: (id: string) => void;
  color?: string; // Optional custom color
  aiGenerated?: boolean; // Flag for AI-generated notes
}

const Note = ({ id, text, type, position, timeframe, onRemove, color, aiGenerated }: NoteProps) => {
  const [pos, setPos] = useState(position);
  const [isDragging, setIsDragging] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);

  const colors = color ? { 
    bg: `bg-${color}-50`, 
    border: `border-${color}-200`,
    shadow: `shadow-${color}-100`,
    icon: `text-${color}-500`
  } : getNoteColorsByType(type);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button only
      setIsDragging(true);
    }
  };

  const handleDoubleClick = () => {
    setIsFlipped(!isFlipped);
  };

  const getIconByType = () => {
    switch (type) {
      case 'interest': return <ThumbsUp size={14} className={colors.icon} />;
      case 'dislike': return <ThumbsDown size={14} className={colors.icon} />;
      case 'skill': return <Brain size={14} className={colors.icon} />;
      case 'goal': return <Trophy size={14} className={colors.icon} />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'interest': return 'Interest/Strength';
      case 'dislike': return 'Dislike/Weakness';
      case 'skill': return 'Current Skill';
      case 'goal': return timeframe ? `Goal (${formatTimeframe(timeframe)})` : 'Career Goal';
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && noteRef.current) {
        const boardRect = noteRef.current.parentElement?.getBoundingClientRect();
        if (boardRect) {
          const newX = Math.min(
            Math.max(0, e.clientX - boardRect.left - noteRef.current.clientWidth / 2),
            boardRect.width - noteRef.current.clientWidth
          );
          const newY = Math.min(
            Math.max(0, e.clientY - boardRect.top - noteRef.current.clientHeight / 2),
            boardRect.height - noteRef.current.clientHeight
          );
          
          setPos({ x: newX, y: newY });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Random related skills based on the note type
  const getRelatedSkills = () => {
    const skillsByType = {
      interest: ['Critical thinking', 'Self-motivation', 'Research skills'],
      dislike: ['Adaptability', 'Emotional intelligence', 'Problem-solving'],
      skill: ['Communication', 'Time management', 'Leadership'],
      goal: ['Strategic planning', 'Networking', 'Resilience']
    };
    
    return skillsByType[type];
  };

  return (
    <div
      ref={noteRef}
      className={`absolute p-3 rounded-lg border ${colors.bg} ${colors.border} ${colors.shadow} shadow-md w-48 cursor-move transition-all duration-300 hover:shadow-lg perspective`}
      style={{ 
        left: `${pos.x}px`, 
        top: `${pos.y}px`,
        transform: isDragging ? 'rotate(2deg) scale(1.05)' : isFlipped ? 'rotateY(180deg)' : 'rotate(0deg) scale(1)',
        zIndex: isDragging ? 10 : 1,
        transformStyle: 'preserve-3d'
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <div className={`relative ${isFlipped ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
        <button 
          className="absolute -top-2 -right-2 text-gray-500 hover:text-gray-700 bg-white rounded-full shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
        >
          <XCircle size={18} />
        </button>
        <div className="flex items-center mb-2">
          {getIconByType()}
          <span className="text-xs font-medium ml-1 flex items-center">
            {getTypeLabel()}
            {aiGenerated && (
              <span className="ml-1 text-purple-500">
                <Sparkles size={10} className="inline" />
              </span>
            )}
          </span>
        </div>
        <p className="text-sm">{text}</p>
      </div>

      {/* Back of the note (shown when flipped) */}
      <div 
        className={`absolute inset-0 p-3 bg-white rounded-lg transform rotateY-180 backface-hidden ${isFlipped ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        style={{ transform: 'rotateY(180deg)' }}
      >
        <h4 className="text-xs font-medium mb-1">Related skills:</h4>
        <ul className="text-xs text-gray-600 list-disc ml-4 mb-2">
          {getRelatedSkills().map((skill, index) => (
            <li key={index}>{skill}</li>
          ))}
        </ul>
        <div className="text-xs text-gray-500 italic">
          Double-click to flip back
        </div>
      </div>
    </div>
  );
};

// Helper function to format the Gemini output with better styling
const formatGeminiResponse = (text: string) => {
  // Format career option titles (e.g., "Career Option 1: Software Developer")
  let formattedText = text.replace(
    /\*\*(Career Option \d+:[^*]+)\*\*/g, 
    '<h2 class="text-xl font-bold mb-3 mt-6 pb-2 border-b text-primary">$1</h2>'
  );
  
  // Format section titles (e.g., "Key Skills to Develop:")
  formattedText = formattedText.replace(
    /\*\*([^:*]+:)\*\*/g, 
    '<h3 class="text-lg font-semibold mt-4 mb-2 text-primary-800">$1</h3>'
  );
  
  // Format list items with bullet points
  formattedText = formattedText.replace(
    /\* \*\*([^:*]+:)\*\*([^*]+)/g, 
    '<div class="ml-3 mb-3"><span class="font-semibold">• $1</span>$2</div>'
  );
  
  // Format regular bullet points
  formattedText = formattedText.replace(
    /\* ([^*]+)/g, 
    '<li class="ml-5 mb-1">$1</li>'
  );
  
  // Wrap lists in ul tags
  formattedText = formattedText.replace(
    /(<li[^>]*>.*?<\/li>\n)+/gs, 
    '<ul class="list-disc my-2">$&</ul>'
  );
  
  // Format bold text
  formattedText = formattedText.replace(
    /\*\*([^*]+)\*\*/g, 
    '<span class="font-bold">$1</span>'
  );
  
  // Format italic text
  formattedText = formattedText.replace(
    /\*([^*]+)\*/g, 
    '<span class="italic">$1</span>'
  );
  
  // Format paragraphs - consecutive lines that aren't part of other formatting
  formattedText = formattedText.replace(
    /^([^<].+)$/gm, 
    '<p class="mb-3">$1</p>'
  );
  
  // Remove excess empty paragraphs
  formattedText = formattedText.replace(/<p class="mb-3"><\/p>/g, '');
  
  return formattedText;
};

// Career match card component
const CareerMatchCard = ({ career }: { career: CareerPath }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-100 hover:shadow-md transition-all card-hover-rise">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">{career.title}</h3>
        <div className={`${career.match >= 80 ? 'bg-green-50 text-green-700' : career.match >= 60 ? 'bg-blue-50 text-blue-700' : 'bg-primary-50 text-primary'} rounded-full px-2 py-1 text-xs font-medium`}>
          {career.match}% Match
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{career.description}</p>
      
      <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
        <DollarSign size={16} className="text-green-500" />
        <span>{career.salary.currency} {career.salary.min.toLocaleString()} - {career.salary.max.toLocaleString()}</span>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
        <TrendingUp size={16} className="text-blue-500" />
        <span>{career.growth}</span>
      </div>
      
      <div className="mb-1 text-xs font-medium text-gray-500">Required Skills:</div>
      <div className="flex flex-wrap gap-1">
        {career.requiredSkills.map((skill, index) => (
          <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
            {skill}
          </span>
        ))}
      </div>
      
      {expanded && (
        <div className="mt-4 pt-4 border-t text-sm">
          <h4 className="font-medium mb-2 text-primary">Learning Resources</h4>
          <ul className="space-y-2 list-disc pl-4">
            <li>
              <a href="#" className="text-blue-600 hover:underline flex items-center gap-1">
                <GraduationCap size={14} /> Online courses on {career.title}
                <ExternalLink size={12} className="ml-1" />
              </a>
            </li>
            <li>
              <a href="#" className="text-blue-600 hover:underline flex items-center gap-1">
                <BookOpen size={14} /> Recommended books for beginners
                <ExternalLink size={12} className="ml-1" />
              </a>
            </li>
            <li>
              <a href="#" className="text-blue-600 hover:underline flex items-center gap-1">
                <Briefcase size={14} /> Career path planning guide
                <ExternalLink size={12} className="ml-1" />
              </a>
            </li>
          </ul>
        </div>
      )}
      
      <button 
        onClick={() => setExpanded(!expanded)} 
        className="mt-3 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
      >
        {expanded ? 'Show less' : 'Show more resources'}
        <ArrowRight size={12} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>
    </div>
  );
};

// Skill gap card component
const SkillGapCard = ({ skillGap }: { skillGap: SkillGap }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-100 hover:shadow-md transition-all card-hover-rise">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold flex items-center gap-1">
          {skillGap.skill}
          {skillGap.importance >= 8 && (
            <span className="ml-2 bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">
              High Priority
            </span>
          )}
        </h3>
        <div className="flex items-center gap-1">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">
            {skillGap.importance}
          </div>
          <div className="text-xs text-gray-500">/10</div>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
        <div 
          className="bg-blue-600 h-1.5 rounded-full" 
          style={{ width: `${skillGap.importance * 10}%` }}
        ></div>
      </div>
      
      <div className="mb-2 text-xs font-medium text-gray-700 flex items-center gap-1">
        <BookOpen size={14} className="text-blue-600" />
        <span>Recommended Resources:</span>
      </div>
      <ul className="space-y-2">
        {skillGap.resources.map((resource, index) => (
          <li key={index} className="text-sm text-gray-600 pl-1 flex items-start gap-2">
            <span className="inline-block rounded-full bg-blue-100 text-blue-800 w-5 h-5 flex-shrink-0 flex items-center justify-center text-xs font-medium">
              {index + 1}
            </span>
            <span>{resource}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Custom theme colors for notes
const noteThemes = [
  { name: 'Default', colors: {} },
  { name: 'Colorful', colors: { interest: 'green', dislike: 'red', skill: 'blue', goal: 'purple' } },
  { name: 'Pastel', colors: { interest: 'emerald', dislike: 'rose', skill: 'sky', goal: 'violet' } },
  { name: 'Monochrome', colors: { interest: 'gray', dislike: 'gray', skill: 'gray', goal: 'gray' } },
  { name: 'Vibrant', colors: { interest: 'lime', dislike: 'pink', skill: 'cyan', goal: 'amber' } },
];

const Assessment = () => {
  const [notes, setNotes] = useState<Array<{
    id: string;
    text: string;
    type: 'interest' | 'dislike' | 'skill' | 'goal';
    position: { x: number; y: number };
    timeframe?: number; // for goals only
    color?: string;
    aiGenerated?: boolean;
  }>>([]);
  
  const [inputValue, setInputValue] = useState('');
  const [selectedType, setSelectedType] = useState<'interest' | 'dislike' | 'skill' | 'goal'>('interest');
  const [timeframeValue, setTimeframeValue] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'text' | 'matches' | 'skills'>('text');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [boardBackground, setBoardBackground] = useState('cork');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  const boardRef = useRef<HTMLDivElement>(null);
  const { 
    response, 
    generateCareerInsights, 
    recommendCareerPaths,
    analyzeSkillGaps,
    careerPaths,
    skillGaps 
  } = useGeminiAnalysis();
  const { toast } = useToast();
  const [savedResult, setSavedResult] = useState('');

  // Template presets for quick start
  const templates = [
    {
      name: "Tech Career",
      notes: [
        { type: 'interest' as const, text: 'Programming' },
        { type: 'interest' as const, text: 'Problem solving' },
        { type: 'interest' as const, text: 'Technology trends' },
        { type: 'skill' as const, text: 'JavaScript' },
        { type: 'skill' as const, text: 'Data structures' },
        { type: 'dislike' as const, text: 'Repetitive tasks' },
        { type: 'goal' as const, text: 'Become a senior developer', timeframe: 3 }
      ]
    },
    {
      name: "Creative Professional",
      notes: [
        { type: 'interest' as const, text: 'Visual design' },
        { type: 'interest' as const, text: 'Storytelling' },
        { type: 'interest' as const, text: 'User experience' },
        { type: 'skill' as const, text: 'Adobe Creative Suite' },
        { type: 'skill' as const, text: 'UI/UX fundamentals' },
        { type: 'dislike' as const, text: 'Rigid structures' },
        { type: 'goal' as const, text: 'Lead a creative team', timeframe: 5 }
      ]
    },
    {
      name: "Business & Management",
      notes: [
        { type: 'interest' as const, text: 'Strategic planning' },
        { type: 'interest' as const, text: 'Team leadership' },
        { type: 'interest' as const, text: 'Market analysis' },
        { type: 'skill' as const, text: 'Project management' },
        { type: 'skill' as const, text: 'Negotiation' },
        { type: 'dislike' as const, text: 'Micromanagement' },
        { type: 'goal' as const, text: 'Executive leadership position', timeframe: 5 }
      ]
    },
    {
      name: "Healthcare",
      notes: [
        { type: 'interest' as const, text: 'Helping others' },
        { type: 'interest' as const, text: 'Medical science' },
        { type: 'interest' as const, text: 'Research' },
        { type: 'skill' as const, text: 'Empathy' },
        { type: 'skill' as const, text: 'Attention to detail' },
        { type: 'dislike' as const, text: 'Desk jobs' },
        { type: 'goal' as const, text: 'Make a positive impact on lives', timeframe: 2 }
      ]
    }
  ];

  const addNote = () => {
    if (!inputValue.trim()) return;
    
    // Generate random position within the board
    const boardRect = boardRef.current?.getBoundingClientRect();
    const maxWidth = boardRect ? boardRect.width - 200 : 400;
    const maxHeight = boardRect ? boardRect.height - 150 : 400;
    
    const randomX = Math.random() * maxWidth;
    const randomY = Math.random() * maxHeight;
    
    // Get theme color if applicable
    const themeColors = noteThemes[selectedTheme].colors;
    const color = themeColors[selectedType as keyof typeof themeColors];
    
    const newNote = {
      id: generateUniqueId(),
      text: inputValue,
      type: selectedType,
      position: { x: randomX, y: randomY },
      color,
      ...(selectedType === 'goal' ? { timeframe: timeframeValue } : {})
    };
    
    setNotes(prev => [...prev, newNote]);
    setInputValue('');
    
    toast({
      title: "Note added to the board",
      description: `Added "${inputValue}" as ${selectedType}`,
      duration: 2000,
    });
  };
  
  const removeNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };
  
  const handleGenerateInsights = async () => {
    const interests = notes.filter(note => note.type === 'interest').map(note => note.text);
    const dislikes = notes.filter(note => note.type === 'dislike').map(note => note.text);
    const skills = notes.filter(note => note.type === 'skill').map(note => note.text);
    const goals = notes.filter(note => note.type === 'goal').map(note => note.text);
    
    if (interests.length === 0 && dislikes.length === 0) {
      toast({
        title: "No items on the board",
        description: "Please add some interests and dislikes to the corkboard first.",
        variant: "destructive",
      });
      return;
    }
    
    // Generate detailed insights
    generateCareerInsights(interests, dislikes, skills, goals);
    
    // Also get career path recommendations
    await recommendCareerPaths(interests, dislikes, skills);
    
    // If skills are provided, analyze skill gaps
    if (skills.length > 0) {
      analyzeSkillGaps(interests, skills);
    }
  };

  const handleSaveResults = () => {
    if (response.text) {
      setSavedResult(response.text);
      toast({
        title: "Results saved",
        description: "Your career insights have been saved to your profile.",
      });
    }
  };

  const handleDownloadResults = () => {
    if (!response.text) return;
    
    const element = document.createElement("a");
    const file = new Blob([response.text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "career-insights.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Results downloaded",
      description: "Your career insights have been downloaded as a text file.",
    });
  };
  
  const generateAISuggestions = async () => {
    setAiLoading(true);
    const interests = notes.filter(note => note.type === 'interest').map(note => note.text);
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAtIJNuqJsnifU3Ez3CNEtjUrhQWbB1N7o`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { 
                  text: `Based on these interests/strengths: ${interests.join(', ')}, 
                  suggest 5 additional potential interests or strengths that might be relevant.
                  Return only a comma-separated list of these 5 suggestions, without numbering or additional text.` 
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 256,
          }
        }),
      });

      const data = await response.json();
      
      if (!data.error && data.candidates && data.candidates[0].content) {
        const text = data.candidates[0].content.parts[0].text;
        const suggestions = text.split(',').map(s => s.trim()).filter(s => s);
        setAiSuggestions(suggestions);
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setAiLoading(false);
    }
  };
  
  const addSuggestionToBoard = (suggestion: string) => {
    // Generate random position within the board
    const boardRect = boardRef.current?.getBoundingClientRect();
    const maxWidth = boardRect ? boardRect.width - 200 : 400;
    const maxHeight = boardRect ? boardRect.height - 150 : 400;
    
    const randomX = Math.random() * maxWidth;
    const randomY = Math.random() * maxHeight;
    
    // Get theme color if applicable
    const themeColors = noteThemes[selectedTheme].colors;
    const color = themeColors['interest' as keyof typeof themeColors];
    
    const newNote = {
      id: generateUniqueId(),
      text: suggestion,
      type: 'interest' as const,
      position: { x: randomX, y: randomY },
      color,
      aiGenerated: true
    };
    
    setNotes(prev => [...prev, newNote]);
    
    // Remove from suggestions
    setAiSuggestions(prev => prev.filter(s => s !== suggestion));
    
    toast({
      title: "Suggestion added",
      description: `Added "${suggestion}" to your board`,
      duration: 1500,
    });
  };
  
  const clearBoard = () => {
    if (notes.length === 0) return;
    
    if (confirm("Are you sure you want to clear the corkboard? This will remove all your notes.")) {
      setNotes([]);
      toast({
        title: "Board cleared",
        description: "All notes have been removed from your corkboard.",
      });
    }
  };

  const handleAutoArrange = () => {
    if (notes.length === 0) return;
    
    // Create a copy of the notes
    const notesCopy = [...notes];
    
    // Calculate grid spacing
    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;
    
    const noteWidth = 200; // Approximate note width
    const noteHeight = 150; // Approximate note height
    const margin = 20;
    
    const cols = Math.floor((boardRect.width - margin) / (noteWidth + margin));
    const rows = Math.ceil(notes.length / cols);
    
    // Position each note in a grid layout
    const arrangedNotes = notesCopy.map((note, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      return {
        ...note,
        position: {
          x: margin + col * (noteWidth + margin),
          y: margin + row * (noteHeight + margin)
        }
      };
    });
    
    setNotes(arrangedNotes);
    
    toast({
      title: "Notes arranged",
      description: "Your notes have been automatically arranged in a grid layout.",
      duration: 2000,
    });
  };

  const applyTemplate = (templateIndex: number) => {
    const template = templates[templateIndex];
    
    // Generate positions for each note
    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;
    
    const maxWidth = boardRect.width - 200;
    const maxHeight = boardRect.height - 150;
    
    // Get theme colors if applicable
    const themeColors = noteThemes[selectedTheme].colors;
    
    const templateNotes = template.notes.map(note => {
      const randomX = Math.random() * maxWidth;
      const randomY = Math.random() * maxHeight;
      
      const color = themeColors[note.type as keyof typeof themeColors];
      
      return {
        id: generateUniqueId(),
        text: note.text,
        type: note.type,
        position: { x: randomX, y: randomY },
        timeframe: note.timeframe,
        color
      };
    });
    
    setNotes(templateNotes);
    setShowTemplateModal(false);
    
    toast({
      title: "Template applied",
      description: `The "${template.name}" template has been applied to your board.`,
      duration: 2000,
    });
  };

  const exportBoard = () => {
    const boardData = {
      notes,
      theme: selectedTheme,
      background: boardBackground
    };
    
    const dataStr = JSON.stringify(boardData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'career-assessment-board.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setShowExportModal(false);
    
    toast({
      title: "Board exported",
      description: "Your board data has been exported as a JSON file.",
      duration: 2000,
    });
  };

  const importBoard = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.notes) {
          setNotes(data.notes);
          
          // Optionally restore theme and background
          if (typeof data.theme === 'number') {
            setSelectedTheme(data.theme);
          }
          
          if (data.background) {
            setBoardBackground(data.background);
          }
          
          toast({
            title: "Board imported",
            description: "Your board has been successfully imported.",
            duration: 2000,
          });
        } else {
          throw new Error('Invalid board data format');
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "The selected file is not a valid board export.",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
    setShowExportModal(false);
  };

  // Board backgrounds
  const backgrounds = {
    cork: {
      color: "bg-[#F9F7F5]",
      pattern: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23cdcdcd' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`
    },
    grid: {
      color: "bg-white",
      pattern: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f1f1f1' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/svg%3E")`
    },
    dots: {
      color: "bg-slate-50",
      pattern: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d1d5db' fill-opacity='0.4' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`
    },
    gradient: {
      color: "bg-gradient-to-br from-blue-50 to-indigo-50",
      pattern: ''
    },
    modern: {
      color: "bg-white",
      pattern: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    }
  };

  const createSparkleBurst = () => {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = `${Math.random() * 100}vw`;
    document.body.appendChild(sparkle);
    
    // Remove the sparkle element after animation completes
    setTimeout(() => {
      document.body.removeChild(sparkle);
    }, 3000);
  };

  useEffect(() => {
    // Add some sparkles when the component first loads
    for (let i = 0; i < 5; i++) {
      setTimeout(() => createSparkleBurst(), i * 300);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-slate-50">
      <Navbar />
      
      <main className="flex-1 px-4 py-16 mt-16">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">Career Assessment</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Pin your interests, strengths, dislikes, and weaknesses to the corkboard below. 
              Our AI will analyze them to suggest the best career paths for you.
            </p>
          </div>
          
          {/* Toolbar for the corkboard */}
          <div className="glass-modern p-4 rounded-xl mb-6 shadow-lg">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Add an interest, skill, goal, or dislike..."
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
                onKeyDown={(e) => e.key === 'Enter' && addNote()}
              />
              
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant={selectedType === 'interest' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('interest')}
                    className="flex items-center gap-1 btn-hover-effect"
                  >
                    <ThumbsUp size={14} />
                    <span>Interest</span>
                  </Button>
                  <Button
                    variant={selectedType === 'dislike' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('dislike')}
                    className="flex items-center gap-1 btn-hover-effect"
                  >
                    <ThumbsDown size={14} />
                    <span>Dislike</span>
                  </Button>
                  <Button
                    variant={selectedType === 'skill' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('skill')}
                    className="flex items-center gap-1 btn-hover-effect"
                  >
                    <Brain size={14} />
                    <span>Skill</span>
                  </Button>
                  <Button
                    variant={selectedType === 'goal' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('goal')}
                    className="flex items-center gap-1 btn-hover-effect"
                  >
                    <Trophy size={14} />
                    <span>Goal</span>
                  </Button>
                </div>
                
                {selectedType === 'goal' && (
                  <select 
                    value={timeframeValue}
                    onChange={(e) => setTimeframeValue(Number(e.target.value))}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  >
                    <option value={0.5}>Short-term (&lt; 1 year)</option>
                    <option value={1}>Medium-term (1-3 years)</option>
                    <option value={5}>Long-term (3+ years)</option>
                  </select>
                )}
                
                <Button onClick={addNote} size="sm" className="flex items-center gap-1 ml-auto">
                  <PlusCircle size={16} />
                  <span className="hidden sm:inline">Add to Board</span>
                </Button>
              </div>
            </div>
            
            {/* Additional tools row */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 border-t pt-3">
              {/* Left side - AI Assistant toggle */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setShowAIAssistant(!showAIAssistant);
                    if (!showAIAssistant && notes.filter(n => n.type === 'interest').length > 0) {
                      generateAISuggestions();
                    }
                  }}
                  className="text-sm flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                >
                  <Lightbulb size={16} className="text-amber-500" />
                  <span>{showAIAssistant ? 'Hide AI Assistant' : 'Show AI Assistant'}</span>
                </button>
                
                <div className="h-4 border-r border-gray-300 mx-1"></div>
                  
                <button 
                  onClick={() => setShowTemplateModal(true)}
                  className="text-sm flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                >
                  <FileDown size={16} />
                  <span>Templates</span>
                </button>
              </div>
              
              {/* Right side - Theme and tools */}
              <div className="flex items-center gap-2">
                <select 
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(Number(e.target.value))}
                  className="h-8 text-xs rounded-md border border-input bg-background px-2 py-0 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {noteThemes.map((theme, index) => (
                    <option key={index} value={index}>{theme.name}</option>
                  ))}
                </select>
                
                <select 
                  value={boardBackground}
                  onChange={(e) => setBoardBackground(e.target.value as keyof typeof backgrounds)}
                  className="h-8 text-xs rounded-md border border-input bg-background px-2 py-0 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="cork">Cork Background</option>
                  <option value="grid">Grid Background</option>
                  <option value="dots">Dots Background</option>
                  <option value="gradient">Gradient</option>
                  <option value="modern">Modern Patterns</option>
                </select>
                
                <div className="flex items-center gap-1">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={handleAutoArrange}
                    title="Auto-arrange notes"
                  >
                    <RotateCw size={14} />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => setShowExportModal(true)}
                    title="Export/Import board"
                  >
                    <ScanSearch size={14} />
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={clearBoard} className="h-8">
                    Clear Board
                  </Button>
                </div>
              </div>
            </div>
            
            {/* AI Assistant suggestions */}
            {showAIAssistant && (
              <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={16} className="text-amber-600" />
                  <h3 className="text-sm font-medium">AI Powered Suggestions</h3>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={generateAISuggestions}
                    disabled={aiLoading || notes.filter(n => n.type === 'interest').length === 0}
                    className="ml-auto h-7 px-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 size={12} className="mr-1 animate-spin" />
                        <span>Thinking...</span>
                      </>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Wand2 size={12} />
                        Generate Suggestions
                      </span>
                    )}
                  </Button>
                </div>
                
                {notes.filter(n => n.type === 'interest').length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2 bg-white/60 rounded">
                    Add some interests to the board to get AI suggestions.
                  </p>
                ) : aiLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 size={20} className="animate-spin text-primary" />
                  </div>
                ) : aiSuggestions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => addSuggestionToBoard(suggestion)}
                        className="text-xs px-3 py-1.5 bg-white border border-primary/20 rounded-full hover:bg-primary/10 transition-colors flex items-center gap-1 group shadow-sm"
                      >
                        <Sparkles size={10} className="text-amber-500 opacity-70 group-hover:opacity-100" />
                        <span>{suggestion}</span>
                        <PlusCircle size={12} className="ml-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground p-2 bg-white/60 rounded">
                    Click "Generate Suggestions" to get AI-powered interest recommendations.
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/5">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600">Your Career Board</h3>
                <span className="text-xs text-gray-500">Powered by Gemini 2.0</span>
              </div>
              <div 
                ref={boardRef}
                className={`h-[500px] rounded-xl relative overflow-hidden border shadow-md p-4 ${backgrounds[boardBackground as keyof typeof backgrounds].color}`}
                style={{
                  backgroundImage: backgrounds[boardBackground as keyof typeof backgrounds].pattern,
                }}
              >
                {notes.map(note => (
                  <Note
                    key={note.id}
                    id={note.id}
                    text={note.text}
                    type={note.type}
                    position={note.position}
                    timeframe={note.timeframe}
                    color={note.color}
                    aiGenerated={note.aiGenerated}
                    onRemove={removeNote}
                  />
                ))}
                
                {notes.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center p-5 rounded-lg bg-white/80 backdrop-blur-sm shadow-lg">
                      <Sparkles size={32} className="mx-auto mb-2 text-blue-500" />
                      <p className="mb-2 font-medium">Your corkboard is empty</p>
                      <p className="text-sm mb-3">Add interests, skills, goals, and dislikes using the form above</p>
                      <button 
                        className="text-blue-600 text-sm hover:underline flex items-center gap-1 mx-auto"
                        onClick={() => setShowTemplateModal(true)}
                      >
                        <FileDown size={14} />
                        Use a template to get started
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Double-click hint if there are notes */}
                {notes.length > 0 && (
                  <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded-md shadow-sm">
                    Double-click notes to flip them
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-muted-foreground flex items-center gap-4">
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full">
                    <ThumbsUp size={14} className="text-green-500" />
                    {notes.filter(n => n.type === 'interest').length}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-1 rounded-full">
                    <ThumbsDown size={14} className="text-rose-500" />
                    {notes.filter(n => n.type === 'dislike').length}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                    <Brain size={14} className="text-blue-500" />
                    {notes.filter(n => n.type === 'skill').length}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                    <Trophy size={14} className="text-purple-500" />
                    {notes.filter(n => n.type === 'goal').length}
                  </span>
                </div>
                <Button 
                  onClick={handleGenerateInsights} 
                  disabled={response.loading || (notes.length === 0)}
                  className="min-w-[150px] group bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 transition-all shadow-md"
                >
                  {response.loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Generate Insights
                      <Sparkles size={16} className="ml-2 text-primary-foreground/70 group-hover:text-primary-foreground" />
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="lg:w-2/5">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <div className="flex bg-gradient-to-r from-blue-600 to-indigo-700 text-white overflow-hidden">
                  <button 
                    className={`px-4 py-3 flex-1 text-sm font-medium text-center ${activeTab === 'text' ? 'bg-white/10' : 'hover:bg-white/5 transition-colors'}`}
                    onClick={() => setActiveTab('text')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <BookOpen size={14} />
                      <span>Career Report</span>
                    </div>
                  </button>
                  <button 
                    className={`px-4 py-3 flex-1 text-sm font-medium text-center ${activeTab === 'matches' ? 'bg-white/10' : 'hover:bg-white/5 transition-colors'}`}
                    onClick={() => setActiveTab('matches')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Briefcase size={14} />
                      <span>Matches</span>
                      {careerPaths.length > 0 && (
                        <span className="bg-white text-indigo-700 rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold ml-1">
                          {careerPaths.length}
                        </span>
                      )}
                    </div>
                  </button>
                  <button 
                    className={`px-4 py-3 flex-1 text-sm font-medium text-center ${activeTab === 'skills' ? 'bg-white/10' : 'hover:bg-white/5 transition-colors'}`}
                    onClick={() => setActiveTab('skills')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Layers size={14} />
                      <span>Skill Gaps</span>
                      {skillGaps.length > 0 && (
                        <span className="bg-white text-indigo-700 rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold ml-1">
                          {skillGaps.length}
                        </span>
                      )}
                    </div>
                  </button>
                </div>
                
                <div className="glass-modern p-6 h-[500px] overflow-y-auto">
                  {activeTab === 'text' && (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">Career Insights</h3>
                        {response.text && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleSaveResults} className="shadow-sm">
                              <Save size={14} className="mr-1" />
                              Save
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleDownloadResults} className="shadow-sm">
                              <Download size={14} className="mr-1" />
                              Download
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {response.loading ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="mb-4 relative w-16 h-16 mx-auto">
                              <div className="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                              <div className="absolute inset-2 border-4 border-t-transparent border-r-indigo-500 border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
                            </div>
                            <p className="text-muted-foreground">Analyzing your profile and generating career insights...</p>
                          </div>
                        </div>
                      ) : response.error ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center text-destructive">
                            <p className="font-medium mb-2">Error</p>
                            <p className="text-sm">{response.error}</p>
                          </div>
                        </div>
                      ) : response.text ? (
                        <div className="prose prose-sm max-w-none rounded-md bg-white p-4 shadow-sm">
                          <div dangerouslySetInnerHTML={{ __html: formatGeminiResponse(response.text) }} />
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                          <div className="p-6 bg-white/50 rounded-xl shadow-sm max-w-xs">
                            <BookOpen size={32} className="mx-auto mb-4 text-blue-500/50" />
                            <p className="mb-2 font-medium">Your career insights will appear here</p>
                            <p className="text-sm">Add items to the corkboard and click "Generate Insights" to get personalized career recommendations</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {activeTab === 'matches' && (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">Top Career Matches</h3>
                      </div>
                      
                      {response.loading ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="mb-4 relative w-16 h-16 mx-auto">
                              <div className="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                              <div className="absolute inset-2 border-4 border-t-transparent border-r-indigo-500 border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
                            </div>
                            <p className="text-muted-foreground">Finding your best career matches...</p>
                          </div>
                        </div>
                      ) : careerPaths.length > 0 ? (
                        <div className="space-y-4">
                          {careerPaths.map((career, index) => (
                            <CareerMatchCard key={index} career={career} />
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                          <div className="p-6 bg-white/50 rounded-xl shadow-sm max-w-xs">
                            <Briefcase size={32} className="mx-auto mb-4 text-blue-500/50" />
                            <p className="mb-2 font-medium">No career matches yet</p>
                            <p className="text-sm">Generate insights to see your top personalized career recommendations</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {activeTab === 'skills' && (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">Skill Gap Analysis</h3>
                      </div>
                      
                      {response.loading ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="mb-4 relative w-16 h-16 mx-auto">
                              <div className="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                              <div className="absolute inset-2 border-4 border-t-transparent border-r-indigo-500 border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
                            </div>
                            <p className="text-muted-foreground">Analyzing your skill gaps...</p>
                          </div>
                        </div>
                      ) : skillGaps.length > 0 ? (
                        <div className="space-y-4">
                          {skillGaps.map((skillGap, index) => (
                            <SkillGapCard key={index} skillGap={skillGap} />
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                          <div className="p-6 bg-white/50 rounded-xl shadow-sm max-w-xs">
                            <Award size={32} className="mx-auto mb-4 text-blue-500/50" />
                            <p className="mb-2 font-medium">No skill gap analysis yet</p>
                            <p className="text-sm">Add some skills to the board and generate insights to see your skill development opportunities</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Template modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <h3 className="text-xl font-bold mb-4">Choose a Template</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {templates.map((template, index) => (
                <div 
                  key={index}
                  className="p-4 border rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors cursor-pointer"
                  onClick={() => applyTemplate(index)}
                >
                  <h4 className="font-medium">{template.name}</h4>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {template.notes.slice(0, 5).map((note, noteIndex) => (
                      <span 
                        key={noteIndex}
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          note.type === 'interest' ? 'bg-green-100 text-green-800' :
                          note.type === 'dislike' ? 'bg-red-100 text-red-800' :
                          note.type === 'skill' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {note.text}
                      </span>
                    ))}
                    {template.notes.length > 5 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                        +{template.notes.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Export/Import modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-4">Export or Import Board</h3>
            
            <div className="space-y-4 mb-6">
              <div className="p-4 border rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                onClick={exportBoard}
              >
                <div className="flex items-center">
                  <FileDown size={20} className="mr-2 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Export Board</h4>
                    <p className="text-sm text-muted-foreground">Save your current board as a JSON file</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg hover:bg-blue-50 transition-colors">
                <div className="flex items-center mb-2">
                  <ScanSearch size={20} className="mr-2 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Import Board</h4>
                    <p className="text-sm text-muted-foreground">Load a previously exported board</p>
                  </div>
                </div>
                <input 
                  type="file"
                  accept=".json"
                  onChange={importBoard}
                  className="w-full text-sm p-1"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowExportModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Assessment;
