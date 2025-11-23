import { GoogleGenAI, Type } from "@google/genai";
import { TripItinerary } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert travel planner and local guide tailored for Chinese travelers. 
Your goal is to create highly detailed, realistic, and exciting travel itineraries in Simplified Chinese (简体中文).
You adhere to the user's budget and interests.
Return the response in strictly valid JSON format.
Ensure the 'budget_breakdown' adds up to a realistic total estimation for the trip duration (excluding international flights, focusing on local spend).
For 'budget_breakdown', provide 4-5 categories (e.g., 住宿, 餐饮, 交通, 活动/门票).
All text values must be in Chinese.
`;

export const generateItinerary = async (
  destination: string,
  duration: number,
  budget: string,
  interests: string[],
  travelers: string
): Promise<TripItinerary> => {
  const interestString = interests.length > 0 ? interests.join(", ") : "general sightseeing";
  
  const prompt = `
    Create a ${duration}-day trip to ${destination} for ${travelers}.
    Budget Level: ${budget}.
    Interests: ${interestString}.
    
    Provide a day-by-day itinerary.
    Include specific times, real location names, and descriptive activities.
    Include a packing list relevant to the destination and activities.
    Provide a budget breakdown estimation in CNY (人民币).
    Ensure all content is in Simplified Chinese.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          destination_name: { type: Type.STRING },
          trip_title: { type: Type.STRING },
          summary: { type: Type.STRING },
          packing_list: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          budget_breakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                amount: { type: Type.NUMBER, description: "Estimated cost in CNY" }
              }
            }
          },
          days: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day_number: { type: Type.INTEGER },
                theme: { type: Type.STRING },
                activities: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      time: { type: Type.STRING },
                      activity: { type: Type.STRING },
                      description: { type: Type.STRING },
                      location: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate itinerary");
  }

  return JSON.parse(response.text) as TripItinerary;
};

export const generateHeroImage = async (destination: string, vibe: string): Promise<string | null> => {
  try {
    // We add "China" or context if it's a domestic trip, but here we just ask for a great photo.
    // Translate the vibe to English for the image model to potentially understand better, 
    // although 2.5 flash image understands Chinese prompts too.
    const prompt = `A breathtaking, cinematic, high-resolution wide shot of ${destination}, capturing a ${vibe} atmosphere. Professional travel photography, golden hour light, photorealistic, 4k.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
         // Using default aspect ratio 1:1 for flash-image
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation failed:", error);
    return null;
  }
};