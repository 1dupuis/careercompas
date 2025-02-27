
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
  BookOpen
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface NoteProps {
  id: string;
  text: string;
  type: 'interest' | 'dislike' | 'skill' | 'goal';
  position: { x: number; y: number };
  timeframe?: number; // years (for goals only)
  onRemove: (id: string) => void;
}

const Note = ({ id, text, type, position, timeframe, onRemove }: NoteProps) => {
  const [pos, setPos] = useState(position);
  const [isDragging, setIsDragging] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);

  const colors = getNoteColorsByType(type);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
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

  return (
    <div
      ref={noteRef}
      className={`absolute p-3 rounded-md border ${colors.bg} ${colors.border} ${colors.shadow} shadow w-48 cursor-move transition-shadow hover:shadow-md`}
      style={{ 
        left: `${pos.x}px`, 
        top: `${pos.y}px`,
        transform: isDragging ? 'rotate(2deg) scale(1.02)' : 'rotate(0deg) scale(1)',
        zIndex: isDragging ? 10 : 1
      }}
      onMouseDown={handleMouseDown}
    >
      <button 
        className="absolute -top-2 -right-2 text-gray-500 hover:text-gray-700"
        onClick={() => onRemove(id)}
      >
        <XCircle size={18} />
      </button>
      <div className="flex items-center mb-2">
        {getIconByType()}
        <span className="text-xs font-medium ml-1">
          {getTypeLabel()}
        </span>
      </div>
      <p className="text-sm">{text}</p>
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
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">{career.title}</h3>
        <div className="bg-primary-50 text-primary rounded-full px-2 py-1 text-xs font-medium">
          {career.match}% Match
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{career.description}</p>
      
      <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
        <DollarSign size={14} className="text-green-500" />
        <span>{career.salary.currency} {career.salary.min.toLocaleString()} - {career.salary.max.toLocaleString()}</span>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
        <TrendingUp size={14} className="text-blue-500" />
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
    </div>
  );
};

// Skill gap card component
const SkillGapCard = ({ skillGap }: { skillGap: SkillGap }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{skillGap.skill}</h3>
        <div className="bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 text-xs font-medium">
          Importance: {skillGap.importance}/10
        </div>
      </div>
      
      <div className="mb-1 text-xs font-medium text-gray-500">Resources:</div>
      <ul className="text-sm text-gray-600 pl-5 list-disc">
        {skillGap.resources.map((resource, index) => (
          <li key={index}>{resource}</li>
        ))}
      </ul>
    </div>
  );
};

const Assessment = () => {
  const [notes, setNotes] = useState<Array<{
    id: string;
    text: string;
    type: 'interest' | 'dislike' | 'skill' | 'goal';
    position: { x: number; y: number };
    timeframe?: number; // for goals only
  }>>([]);
  
  const [inputValue, setInputValue] = useState('');
  const [selectedType, setSelectedType] = useState<'interest' | 'dislike' | 'skill' | 'goal'>('interest');
  const [timeframeValue, setTimeframeValue] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'text' | 'matches' | 'skills'>('text');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  
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

  const addNote = () => {
    if (!inputValue.trim()) return;
    
    // Generate random position within the board
    const boardRect = boardRef.current?.getBoundingClientRect();
    const maxWidth = boardRect ? boardRect.width - 200 : 400;
    const maxHeight = boardRect ? boardRect.height - 150 : 400;
    
    const randomX = Math.random() * maxWidth;
    const randomY = Math.random() * maxHeight;
    
    const newNote = {
      id: generateUniqueId(),
      text: inputValue,
      type: selectedType,
      position: { x: randomX, y: randomY },
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
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAtIJNuqJsnifU3Ez3CNEtjUrhQWbB1N7o`, {
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
    
    const newNote = {
      id: generateUniqueId(),
      text: suggestion,
      type: 'interest' as const,
      position: { x: randomX, y: randomY }
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 px-4 py-16 mt-16">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Career Assessment</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Pin your interests, strengths, dislikes, and weaknesses to the corkboard below. 
              Our AI will analyze them to suggest the best career paths for you.
            </p>
          </div>
          
          <div className="glass-card p-4 rounded-xl mb-8">
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
                    className="flex items-center gap-1"
                  >
                    <ThumbsUp size={14} />
                    <span>Interest</span>
                  </Button>
                  <Button
                    variant={selectedType === 'dislike' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('dislike')}
                    className="flex items-center gap-1"
                  >
                    <ThumbsDown size={14} />
                    <span>Dislike</span>
                  </Button>
                  <Button
                    variant={selectedType === 'skill' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('skill')}
                    className="flex items-center gap-1"
                  >
                    <Brain size={14} />
                    <span>Skill</span>
                  </Button>
                  <Button
                    variant={selectedType === 'goal' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('goal')}
                    className="flex items-center gap-1"
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
            
            {/* AI Assistant toggle */}
            <div className="mt-3 flex items-center">
              <button 
                onClick={() => {
                  setShowAIAssistant(!showAIAssistant);
                  if (!showAIAssistant && notes.filter(n => n.type === 'interest').length > 0) {
                    generateAISuggestions();
                  }
                }}
                className="text-sm flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
              >
                <Lightbulb size={16} />
                <span>{showAIAssistant ? 'Hide AI Assistant' : 'Show AI Assistant'}</span>
              </button>
              
              <Button variant="outline" size="sm" onClick={clearBoard} className="ml-auto">
                Clear Board
              </Button>
            </div>
            
            {/* AI Assistant suggestions */}
            {showAIAssistant && (
              <div className="mt-3 p-3 bg-primary/5 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={16} className="text-primary" />
                  <h3 className="text-sm font-medium">AI Interest Suggestions</h3>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={generateAISuggestions}
                    disabled={aiLoading || notes.filter(n => n.type === 'interest').length === 0}
                    className="ml-auto h-7 px-2"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 size={12} className="mr-1 animate-spin" />
                        <span>Thinking...</span>
                      </>
                    ) : (
                      <span>Refresh</span>
                    )}
                  </Button>
                </div>
                
                {notes.filter(n => n.type === 'interest').length === 0 ? (
                  <p className="text-sm text-muted-foreground">
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
                        className="text-xs px-2 py-1 bg-white border border-primary/20 rounded-full hover:bg-primary/10 transition-colors"
                      >
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Click "Refresh" to generate suggestions based on your interests.
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/5">
              <div 
                ref={boardRef}
                className="h-[500px] rounded-xl relative overflow-hidden border border-dashed border-muted-foreground/30 p-4 bg-[#F9F7F5]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23cdcdcd' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
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
                    onRemove={removeNote}
                  />
                ))}
                
                {notes.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <p className="mb-2">Your corkboard is empty</p>
                      <p className="text-sm">Add interests, skills, goals, and dislikes using the form above</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  <span className="inline-flex items-center">
                    <ThumbsUp size={14} className="text-green-500 mr-1" />
                    {notes.filter(n => n.type === 'interest').length}
                  </span>
                  <span className="mx-2">·</span>
                  <span className="inline-flex items-center">
                    <ThumbsDown size={14} className="text-red-500 mr-1" />
                    {notes.filter(n => n.type === 'dislike').length}
                  </span>
                  <span className="mx-2">·</span>
                  <span className="inline-flex items-center">
                    <Brain size={14} className="text-blue-500 mr-1" />
                    {notes.filter(n => n.type === 'skill').length}
                  </span>
                  <span className="mx-2">·</span>
                  <span className="inline-flex items-center">
                    <Trophy size={14} className="text-purple-500 mr-1" />
                    {notes.filter(n => n.type === 'goal').length}
                  </span>
                </div>
                <Button 
                  onClick={handleGenerateInsights} 
                  disabled={response.loading || (notes.length === 0)}
                  className="min-w-[150px]"
                >
                  {response.loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : "Generate Insights"}
                </Button>
              </div>
            </div>
            
            <div className="lg:w-2/5">
              <div className="rounded-xl overflow-hidden shadow-sm">
                <div className="flex bg-muted overflow-hidden">
                  <button 
                    className={`px-4 py-2 flex-1 text-sm font-medium text-center ${activeTab === 'text' ? 'bg-white shadow-sm' : 'hover:bg-white/30 transition-colors'}`}
                    onClick={() => setActiveTab('text')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <BookOpen size={14} />
                      <span>Career Report</span>
                    </div>
                  </button>
                  <button 
                    className={`px-4 py-2 flex-1 text-sm font-medium text-center ${activeTab === 'matches' ? 'bg-white shadow-sm' : 'hover:bg-white/30 transition-colors'}`}
                    onClick={() => setActiveTab('matches')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Briefcase size={14} />
                      <span>Matches</span>
                      {careerPaths.length > 0 && <span className="bg-primary text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">{careerPaths.length}</span>}
                    </div>
                  </button>
                  <button 
                    className={`px-4 py-2 flex-1 text-sm font-medium text-center ${activeTab === 'skills' ? 'bg-white shadow-sm' : 'hover:bg-white/30 transition-colors'}`}
                    onClick={() => setActiveTab('skills')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Layers size={14} />
                      <span>Skill Gaps</span>
                      {skillGaps.length > 0 && <span className="bg-primary text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">{skillGaps.length}</span>}
                    </div>
                  </button>
                </div>
                
                <div className="glass-card p-6 h-[500px] overflow-y-auto">
                  {activeTab === 'text' && (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">Career Insights</h3>
                        {response.text && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleSaveResults}>
                              <Save size={14} className="mr-1" />
                              Save
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleDownloadResults}>
                              <Download size={14} className="mr-1" />
                              Download
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {response.loading ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
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
                          <div>
                            <p className="mb-2">Your career insights will appear here</p>
                            <p className="text-sm">Add items to the corkboard and click "Generate Insights"</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {activeTab === 'matches' && (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">Top Career Matches</h3>
                      </div>
                      
                      {response.loading ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
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
                          <div>
                            <BarChart3 size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="mb-2">No career matches yet</p>
                            <p className="text-sm">Generate insights to see your top career matches</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {activeTab === 'skills' && (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">Skill Gap Analysis</h3>
                      </div>
                      
                      {response.loading ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
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
                          <div>
                            <Award size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="mb-2">No skill gap analysis yet</p>
                            <p className="text-sm">Add some skills to the board and generate insights to see your skill gaps</p>
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
      
      <Footer />
    </div>
  );
};

export default Assessment;
