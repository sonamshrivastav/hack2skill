export async function generateMealPlan(formData) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured in .env file.");
  }

  const prompt = `
    You are an expert AI culinary planner.
    Generate a detailed meal plan based on the following user profile:
    - Name: ${formData.name}
    - People: ${formData.people}
    - Preference: ${formData.preference}
    - Budget: ${formData.budget}
    - Cooking Time: ${formData.time}
    - Dietary Restrictions: ${formData.diet || "None"}
    - Fitness Goal: ${formData.goal}
    - Available Ingredients: ${formData.ingredients || "None specified"}

    Please return ONLY a valid JSON object with the exact following keys:
    "breakfast", "lunch", "dinner", "groceryList", "substitutions", "budgetAnalysis".
    
    Each value MUST be a string formatted with basic HTML tags (e.g., <ul>, <li>, <strong>, <p>, <br>) for direct rendering.
    Make it detailed, engaging, and directly applicable to their profile.
    Do NOT wrap the JSON in Markdown code blocks like \`\`\`json. Return raw JSON.
  `;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Failed to fetch from Gemini API");
  }

  const data = await response.json();
  const rawText = data.candidates[0].content.parts[0].text;
  
  // Clean up any markdown formatting
  const cleanedText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("JSON parse error:", cleanedText);
    throw new Error("Received invalid format from AI.");
  }
}
