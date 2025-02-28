
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
      
      Format your response in a clear, structured way with separate sections for each career option.
      Use markdown formatting with ** for bold text and * for italic text.
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
      setResponse({ text: generatedText, loading: false });
      
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
