const { GoogleGenerativeAI } = require('@google/generative-ai');

const initGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('WARNING: GEMINI_API_KEY is not defined in the environment variables. AI features will fail.');
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

const getGenModel = (modelName = 'gemini-2.5-flash') => {
  const genAI = initGemini();
  if (!genAI) return null;
  return genAI.getGenerativeModel({ model: modelName });
};

module.exports = {
  getGenModel
};
