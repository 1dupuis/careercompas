
import { useState } from 'react';

const API_KEY = 'AIzaSyAtIJNuqJsnifU3Ez3CNEtjUrhQWbB1N7o';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface GeminiResponse {
  text: string;
  error?: string;
  loading: boolean;
}

export const useGeminiAnalysis = () => {
  const [response, setResponse] = useState<GeminiResponse>({
    text: '',
    loading: false,
  });

  const generateCareerInsights = async (interests: string[], dislikes: string[]) => {
    setResponse({ text: '', loading: true });
    
    try {
      const prompt = `
      You are CareerCompass AI, a career advisor that helps people discover suitable career paths.
      
      Based on the following information about a person:
      
      Interests/Strengths: ${interests.join(', ')}
      Things they dislike/Weaknesses: ${dislikes.join(', ')}
      
      Please provide:
      1. Three potential career paths that would match their interests while avoiding their dislikes
      2. For each career path, list 3-4 key skills they should develop
      3. A brief explanation of why this career path might be a good fit
      4. One emerging trend in each field they should be aware of
      
      Format your response in a clear, structured way with separate sections for each career option.
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
    } catch (error) {
      console.error('Error generating career insights:', error);
      setResponse({ 
        text: '', 
        error: 'An error occurred while connecting to the AI service. Please try again later.',
        loading: false 
      });
    }
  };

  return { response, generateCareerInsights };
};
