
import { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { useGeminiAnalysis } from '@/lib/gemini';
import { generateUniqueId } from '@/lib/utils';
import { PlusCircle, XCircle, Loader2, ThumbsUp, ThumbsDown, Save, Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface NoteProps {
  id: string;
  text: string;
  type: 'interest' | 'dislike';
  position: { x: number; y: number };
  onRemove: (id: string) => void;
}

const Note = ({ id, text, type, position, onRemove }: NoteProps) => {
  const [pos, setPos] = useState(position);
  const [isDragging, setIsDragging] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);

  const colors = {
    interest: 'bg-green-50 border-green-200 shadow-green-100',
    dislike: 'bg-red-50 border-red-200 shadow-red-100'
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
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
      className={`absolute p-3 rounded-md border ${colors[type]} shadow w-48 cursor-move transition-shadow hover:shadow-md`}
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
        {type === 'interest' ? (
          <ThumbsUp size={14} className="text-green-500 mr-1" />
        ) : (
          <ThumbsDown size={14} className="text-red-500 mr-1" />
        )}
        <span className="text-xs font-medium">
          {type === 'interest' ? 'Interest/Strength' : 'Dislike/Weakness'}
        </span>
      </div>
      <p className="text-sm">{text}</p>
    </div>
  );
};

const Assessment = () => {
  const [notes, setNotes] = useState<Array<{
    id: string;
    text: string;
    type: 'interest' | 'dislike';
    position: { x: number; y: number };
  }>>([]);
  
  const [inputValue, setInputValue] = useState('');
  const [selectedType, setSelectedType] = useState<'interest' | 'dislike'>('interest');
  const boardRef = useRef<HTMLDivElement>(null);
  const { response, generateCareerInsights } = useGeminiAnalysis();
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
      position: { x: randomX, y: randomY }
    };
    
    setNotes(prev => [...prev, newNote]);
    setInputValue('');
    
    toast({
      title: "Note added to the board",
      description: `Added "${inputValue}" as ${selectedType === 'interest' ? 'an interest' : 'a dislike'}`,
      duration: 2000,
    });
  };
  
  const removeNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };
  
  const handleGenerateInsights = () => {
    const interests = notes.filter(note => note.type === 'interest').map(note => note.text);
    const dislikes = notes.filter(note => note.type === 'dislike').map(note => note.text);
    
    if (interests.length === 0 && dislikes.length === 0) {
      toast({
        title: "No items on the board",
        description: "Please add some interests and dislikes to the corkboard first.",
        variant: "destructive",
      });
      return;
    }
    
    generateCareerInsights(interests, dislikes);
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
                placeholder="Add an interest or dislike..."
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
                onKeyDown={(e) => e.key === 'Enter' && addNote()}
              />
              
              <div className="flex items-center gap-3">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={selectedType === 'interest' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('interest')}
                    className="flex items-center gap-1"
                  >
                    <ThumbsUp size={14} />
                    <span>Interest/Strength</span>
                  </Button>
                  <Button
                    variant={selectedType === 'dislike' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('dislike')}
                    className="flex items-center gap-1"
                  >
                    <ThumbsDown size={14} />
                    <span>Dislike/Weakness</span>
                  </Button>
                </div>
                
                <Button onClick={addNote} size="sm" className="flex items-center gap-1">
                  <PlusCircle size={16} />
                  <span className="hidden sm:inline">Add to Board</span>
                </Button>
              </div>
            </div>
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
                    onRemove={removeNote}
                  />
                ))}
                
                {notes.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <p className="mb-2">Your corkboard is empty</p>
                      <p className="text-sm">Add your interests and dislikes using the form above</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {notes.filter(n => n.type === 'interest').length} interests, {notes.filter(n => n.type === 'dislike').length} dislikes
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
              <div className="glass-card p-6 rounded-xl h-[500px] overflow-y-auto">
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
                  <div className="prose prose-sm max-w-none">
                    <div style={{ whiteSpace: 'pre-line' }}>
                      {response.text}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                    <div>
                      <p className="mb-2">Your career insights will appear here</p>
                      <p className="text-sm">Add items to the corkboard and click "Generate Insights"</p>
                    </div>
                  </div>
                )}
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
