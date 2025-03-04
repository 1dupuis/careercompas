
import { useState } from 'react';

const API_KEY = 'AIzaSyAtIJNuqJsnifU3Ez3CNEtjUrhQWbB1N7o';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface GeminiResponse {
  text: string;
  error?: string;
  loading: boolean;
}

export interface SkillGap {
  skill: string;
  importance: number; // 1-10
  resources: string[];
}

export interface CareerPath {
  title: string;
  match: number; // percentage match 0-100
  description: string;
  requiredSkills: string[];
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  growth: string;
}

export const useGeminiAnalysis = () => {
  const [response, setResponse] = useState<GeminiResponse>({
    text: '',
    loading: false,
  });
  
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  
  // Enhanced markdown parser with better styling and formatting
  const parseMarkdownFormatting = (text: string) => {
    let formatted = text;
    
    // First, handle triple dashes (horizontal rules) with appropriate styling
    formatted = formatted.replace(/^---$/gm, '<hr class="my-6 border-t-2 border-gray-200" />');
    
    // Process headings with proper styling (extract and style the headings better)
    formatted = formatted.replace(/### (.*?)(?:\n|$)/g, '<h3 class="text-xl font-bold text-primary-700 mt-8 mb-3">$1</h3>');
    formatted = formatted.replace(/## (.*?)(?:\n|$)/g, '<h2 class="text-2xl font-bold text-primary-800 mt-10 mb-4 pb-2 border-b border-primary-200">$1</h2>');
    formatted = formatted.replace(/# (.*?)(?:\n|$)/g, '<h1 class="text-3xl font-bold text-primary-900 mt-12 mb-6">$1</h1>');
    
    // Process lists - numbered lists with attractive styling
    formatted = formatted.replace(/^\d+\.\s+(.*?)$/gm, 
      '<div class="flex gap-3 items-start mb-3 group hover:bg-primary-50 p-2 rounded-md transition-colors">' +
      '<div class="flex-shrink-0 w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-sm shadow-sm group-hover:bg-primary-200 transition-colors">•</div>' +
      '<div class="flex-1">$1</div>' +
      '</div>'
    );
    
    // Process bullet points with attractive styling
    formatted = formatted.replace(/^\*\s+(.*?)$/gm, 
      '<div class="flex gap-3 items-start mb-2.5 group hover:bg-blue-50 p-1.5 rounded-md transition-colors">' +
      '<div class="flex-shrink-0 w-1.5 h-1.5 mt-2 bg-blue-400 rounded-full group-hover:bg-blue-500 transition-colors"></div>' +
      '<div class="flex-1 text-gray-700">$1</div>' +
      '</div>'
    );
    
    // Group consecutive list items (may not be needed with the new approach)
    // formatted = formatted.replace(/(<li.*?>.*?<\/li>\n)+/g, '<ul class="mb-4 list-disc pl-5">$&</ul>');
    
    // Convert bold and italic
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-gray-900">$1</span>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<span class="italic text-gray-800">$1</span>');
    
    // Handle paragraphs - any line that's not already wrapped in HTML tags
    formatted = formatted.replace(/^(?!<[a-z]).+$/gm, '<p class="mb-4 text-gray-700 leading-relaxed">$&</p>');
    
    // Replace consecutive line breaks with a single one
    formatted = formatted.replace(/\n\n+/g, '\n\n');
    
    // Make more beautiful Career Path headings with visual enhancements
    formatted = formatted.replace(
      /<h[23].*?>(Career (?:Option|Path) \d+:.*?)<\/h[23]>/g, 
      '<div class="bg-gradient-to-r from-primary-50 via-blue-50 to-primary-50 p-5 rounded-lg border border-primary-100 shadow-sm mt-10 mb-6 relative overflow-hidden">' +
      '<div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full -translate-y-1/2 translate-x-1/2 opacity-60"></div>' +
      '<h3 class="text-2xl font-bold text-primary-800 mb-2 relative">$1</h3>' +
      '<div class="w-20 h-1.5 bg-primary-500 rounded-full mb-3 relative"></div>' +
      '</div>'
    );
    
    // Add specific styling for section headers like "Key Skills to Develop:"
    formatted = formatted.replace(
      /<h3.*?>(Key Skills to Develop:)<\/h3>/g,
      '<div class="bg-blue-50 px-5 py-4 rounded-md border-l-4 border-blue-500 flex items-center gap-3 mt-8 mb-5 shadow-sm">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path></svg>' +
      '<h3 class="font-semibold text-lg text-blue-700">$1</h3>' +
      '</div>'
    );
    
    // Handle explanation sections with nice styling
    formatted = formatted.replace(
      /<h3.*?>(.*?Explanation:)<\/h3>/g,
      '<div class="bg-emerald-50 px-5 py-4 rounded-md border-l-4 border-emerald-500 flex items-center gap-3 mt-8 mb-5 shadow-sm">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-600"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>' +
      '<h3 class="font-semibold text-lg text-emerald-700">$1</h3>' +
      '</div>'
    );
    
    // Handle trend sections with nice styling
    formatted = formatted.replace(
      /<h3.*?>(.*?Trend:)<\/h3>/g,
      '<div class="bg-amber-50 px-5 py-4 rounded-md border-l-4 border-amber-500 flex items-center gap-3 mt-8 mb-5 shadow-sm">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-600"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>' +
      '<h3 class="font-semibold text-lg text-amber-700">$1</h3>' +
      '</div>'
    );
    
    // Make any "TODO:" items highlighted with a visually distinctive style
    formatted = formatted.replace(
      /TODO:(.*?)(?:\n|$)/g,
      '<div class="bg-red-50 text-red-800 p-4 rounded-md border-l-4 border-red-500 my-4 flex items-start gap-2 animate-pulse">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-600 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>' +
      '<div><span class="font-semibold">TODO:</span>$1</div>' +
      '</div>'
    );
    
    // Add card-like styling to content sections for better visual separation
    formatted = formatted.replace(
      /(<div class="bg-gradient-to-r from-primary-50.*?<\/div>)(.*?)(?=<div class="bg-gradient-to-r from-primary-50|$)/gs,
      '$1<div class="bg-white rounded-lg shadow-sm p-6 mb-10 border border-gray-100">$2</div>'
    );
    
    return formatted;
  };
  
  const generateCareerInsights = async (
    interests: string[], 
    dislikes: string[],
    skills: string[] = [],
    goals: string[] = []
  ) => {
    setResponse({ text: '', loading: true });
    
    try {
      const prompt = `
      You are CareerCompass AI, a career advisor that helps people discover suitable career paths.
      
      Based on the following information about a person:
      
      Interests/Strengths: ${interests.join(', ')}
      Things they dislike/Weaknesses: ${dislikes.join(', ')}
      ${skills.length > 0 ? `Current Skills: ${skills.join(', ')}` : ''}
      ${goals.length > 0 ? `Career Goals: ${goals.join(', ')}` : ''}
      
      Please provide:
      1. Three potential career paths that would match their interests while avoiding their dislikes
      2. For each career path, list 3-4 key skills they should develop
      3. A brief explanation of why this career path might be a good fit
      4. One emerging trend in each field they should be aware of
      
      Format your response with proper markdown, using:
      - # for main title
      - ## for section titles 
      - ### for subsections
      - Numbered lists for main points
      - * for bullet points
      - ** for bold text and * for italic text
      
      Start with a brief introduction titled "CareerCompass AI: Personalized Career Recommendations"
      then format each career option as "Career Path 1: [Title]", "Career Path 2: [Title]", etc.
      `;

      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          }
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        setResponse({ 
          text: '', 
          error: data.error.message || 'An error occurred while generating insights',
          loading: false 
        });
        return;
      }
      
      const generatedText = data.candidates[0].content.parts[0].text;
      // Process the markdown to convert it to styled HTML
      const formattedText = parseMarkdownFormatting(generatedText);
      setResponse({ text: formattedText, loading: false });
      
      // Also analyze for skill gaps if career paths are provided
      if (skills.length > 0) {
        analyzeSkillGaps(interests, skills);
      }
    } catch (error) {
      console.error('Error generating career insights:', error);
      setResponse({ 
        text: '', 
        error: 'An error occurred while connecting to the AI service. Please try again later.',
        loading: false 
      });
    }
  };
  
  const analyzeSkillGaps = async (interests: string[], currentSkills: string[]) => {
    try {
      const prompt = `
      Based on the person's interests: ${interests.join(', ')}
      And their current skills: ${currentSkills.join(', ')}
      
      Identify the top 5 skill gaps they should focus on developing for career advancement.
      For each skill gap, assign an importance score from 1-10, and suggest 2-3 specific resources 
      (courses, books, or practice platforms) to develop that skill.
      
      Format your response as a JSON array with the following structure:
      [
        {
          "skill": "Skill name",
          "importance": importance score (1-10),
          "resources": ["Resource 1", "Resource 2", "Resource 3"]
        }
      ]
      `;

      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024,
          }
        }),
      });

      const data = await response.json();
      
      if (!data.error && data.candidates && data.candidates[0].content) {
        const generatedText = data.candidates[0].content.parts[0].text;
        try {
          // Extract JSON from response (might be wrapped in markdown code blocks)
          const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || 
                           generatedText.match(/```\n([\s\S]*?)\n```/) ||
                           [null, generatedText];
          
          const jsonText = jsonMatch[1] || generatedText;
          const skillGapsData = JSON.parse(jsonText);
          setSkillGaps(skillGapsData);
        } catch (parseError) {
          console.error('Error parsing skill gaps JSON:', parseError);
        }
      }
    } catch (error) {
      console.error('Error analyzing skill gaps:', error);
    }
  };
  
  const recommendCareerPaths = async (
    interests: string[], 
    dislikes: string[],
    skills: string[] = []
  ) => {
    try {
      const prompt = `
      Based on the following information:
      
      Interests/Strengths: ${interests.join(', ')}
      Things they dislike/Weaknesses: ${dislikes.join(', ')}
      ${skills.length > 0 ? `Current Skills: ${skills.join(', ')}` : ''}
      
      Identify the top 3 career paths that would be the best match.
      For each career path, provide a percentage match (0-100), a brief description,
      list of 3-5 required skills, and salary range with currency.
      Also add a brief statement about the projected growth of this field.
      
      Format your response as a JSON array with the following structure:
      [
        {
          "title": "Career title",
          "match": match percentage (0-100),
          "description": "Brief description",
          "requiredSkills": ["Skill 1", "Skill 2", "Skill 3"],
          "salary": {
            "min": minimum salary,
            "max": maximum salary,
            "currency": "USD"
          },
          "growth": "Growth projection statement"
        }
      ]
      `;

      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024,
          }
        }),
      });

      const data = await response.json();
      
      if (!data.error && data.candidates && data.candidates[0].content) {
        const generatedText = data.candidates[0].content.parts[0].text;
        try {
          // Extract JSON from response (might be wrapped in markdown code blocks)
          const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || 
                           generatedText.match(/```\n([\s\S]*?)\n```/) ||
                           [null, generatedText];
          
          const jsonText = jsonMatch[1] || generatedText;
          const careerPathsData = JSON.parse(jsonText);
          setCareerPaths(careerPathsData);
          return careerPathsData;
        } catch (parseError) {
          console.error('Error parsing career paths JSON:', parseError);
          return [];
        }
      }
      return [];
    } catch (error) {
      console.error('Error recommending career paths:', error);
      return [];
    }
  };

  return { 
    response, 
    generateCareerInsights,
    analyzeSkillGaps,
    recommendCareerPaths,
    careerPaths,
    skillGaps
  };
};
