const { getGenModel } = require('../config/gemini');

/**
 * Suggest category and tags for a card based on its title and description.
 * @param {string} title 
 * @param {string} description 
 * @param {string[]} allowedCategories 
 * @returns {Promise<{category: string, tags: string[]}>}
 */
const suggestCategoryAndTags = async (title, description, allowedCategories) => {
  try {
    const model = getGenModel();
    if (!model) {
      throw new Error('Gemini model is not initialized. Please verify GEMINI_API_KEY.');
    }

    const prompt = `Analyze the following developer note and suggest a category and tags:
Title: "${title}"
Description: "${description}"

Allowed categories: ${allowedCategories.join(', ')}

Return a JSON object in this exact format:
{
  "category": "Suggested Category from the Allowed list or a new logical category",
  "tags": ["tag1", "tag2", "tag3"]
}

Rules:
1. Try to match one of the allowed categories. If none fit, you can generate a short, logical new category (maximum 2 words, title case).
2. The "tags" array should contain a maximum of 3 (1 to 3) relevant technology keywords, frameworks, or concepts (lowercase, letters and hyphens only).
3. Output ONLY valid JSON. Do not write explanation text.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = await result.response.text();
    console.log('AI suggest output:', responseText);

    try {
      const parsed = JSON.parse(responseText.trim());
      return {
        category: parsed.category || 'Debugging',
        tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 3) : []
      };
    } catch (parseErr) {
      console.error('JSON parsing failed for AI suggestion:', parseErr);
      // Fallback parser in case of bad JSON formatting
      return {
        category: 'Debugging',
        tags: []
      };
    }
  } catch (error) {
    console.error('AI suggest service error:', error);
    throw error;
  }
};

/**
 * Explain a card's content (code snippet + description).
 * @param {string} title 
 * @param {string} description 
 * @param {string} codeSnippet 
 * @param {string} language 
 * @returns {Promise<string>}
 */
const explainCardContent = async (title, description, codeSnippet, language) => {
  try {
    const model = getGenModel();
    if (!model) {
      throw new Error('Gemini model is not initialized. Please verify GEMINI_API_KEY.');
    }

    const codeSection = codeSnippet
      ? `Code Snippet (${language || 'text'}):\n\`\`\`${language || 'text'}\n${codeSnippet}\n\`\`\``
      : 'No code snippet provided.';

    const prompt = `Explain this developer note.
Title: ${title}
Description: ${description}
${codeSection}

Instructions:
1. If a code snippet is present, explain clearly what the code does, why it works, and provide its time complexity and space complexity (if applicable).
2. If it is conceptual/theory, explain it in simpler technical language with a short practical example or breakdown.
3. Answer in clear, concise markdown format with proper code highlighting. Avoid long essays. Keep it strictly focused and professional.`;

    const result = await model.generateContent(prompt);
    return await result.response.text();
  } catch (error) {
    console.error('AI explain service error:', error);
    throw error;
  }
};

/**
 * Chat as AI Mentor on a specific card context.
 * @param {object} card 
 * @param {string} question 
 * @returns {Promise<string>}
 */
const askMentor = async (card, question) => {
  try {
    const model = getGenModel();
    if (!model) {
      throw new Error('Gemini model is not initialized. Please verify GEMINI_API_KEY.');
    }

    const codeSection = card.codeSnippet
      ? `Code Snippet (${card.language || 'text'}):\n\`\`\`${card.language || 'text'}\n${card.codeSnippet}\n\`\`\``
      : 'No code snippet provided.';

    const prompt = `You are an expert software engineer helping another developer understand a technical note.
Context Card:
Title: ${card.title}
Description: ${card.description}
Category: ${card.category}
${codeSection}

User Question: ${question}

Instructions:
1. Answer the user's question concisely in the context of this card.
2. If the user's question is completely unrelated to the card, politely inform them that you can only answer questions related to the technical note context.
3. Answer in clear, concise markdown. Avoid long conversational fluff.`;

    const result = await model.generateContent(prompt);
    return await result.response.text();
  } catch (error) {
    console.error('AI mentor service error:', error);
    throw error;
  }
};

module.exports = {
  suggestCategoryAndTags,
  explainCardContent,
  askMentor
};
