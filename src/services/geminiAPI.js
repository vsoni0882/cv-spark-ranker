
// geminiAPI.js - Integration with Gemini API for CV ranking

/**
 * Helper function to simulate API delay that uses browser's setTimeout
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Implementation of Gemini API for CV analysis
 * This version provides more structured analysis of CVs against keywords
 */
export const analyzeWithGemini = async (cvContent, jobDescription, requiredKeywords = [], optionalKeywords = []) => {
  // In a production app, this would make a real API call to Gemini
  // For now we'll implement a smarter mock that considers keywords
  await delay(1500);
  
  // Mock analysis logic that simulates what Gemini would do
  // In reality, Gemini would analyze the text for semantic matches
  const mockAnalyzeContent = (content, keywords) => {
    if (!content || !keywords.length) return { 
      matches: [], 
      matchPercentage: 0 
    };
    
    // Simple keyword matching (a real implementation would use AI for semantic matching)
    const contentLower = content.toLowerCase();
    const matches = keywords.filter(keyword => 
      contentLower.includes(keyword.toLowerCase())
    );
    
    const matchPercentage = keywords.length > 0 
      ? Math.round((matches.length / keywords.length) * 100)
      : 0;
      
    return { matches, matchPercentage };
  };
  
  // Analyze required and optional keywords separately
  const requiredAnalysis = mockAnalyzeContent(cvContent, requiredKeywords);
  const optionalAnalysis = mockAnalyzeContent(cvContent, optionalKeywords);
  
  // Calculate overall score with heavier weight on required keywords
  const overallScore = requiredKeywords.length > 0 || optionalKeywords.length > 0
    ? Math.round((requiredAnalysis.matchPercentage * 0.7) + (optionalAnalysis.matchPercentage * 0.3))
    : Math.floor(Math.random() * 100); // Fallback to random if no keywords provided
    
  // Generate relevant feedback based on matches
  const strengths = [];
  const weaknesses = [];
  
  if (requiredAnalysis.matches.length > 0) {
    strengths.push(`Matches ${requiredAnalysis.matches.length} required keywords: ${requiredAnalysis.matches.join(", ")}`);
  }
  
  if (optionalAnalysis.matches.length > 0) {
    strengths.push(`Matches ${optionalAnalysis.matches.length} optional keywords: ${optionalAnalysis.matches.join(", ")}`);
  }
  
  const missingRequired = requiredKeywords.filter(keyword => 
    !requiredAnalysis.matches.includes(keyword)
  );
  
  if (missingRequired.length > 0) {
    weaknesses.push(`Missing required keywords: ${missingRequired.join(", ")}`);
  }
  
  const missingOptional = optionalKeywords.filter(keyword => 
    !optionalAnalysis.matches.includes(keyword)
  );
  
  if (missingOptional.length > 0 && optionalKeywords.length > 0) {
    weaknesses.push(`Missing optional keywords: ${missingOptional.join(", ")}`);
  }
  
  // Return the analysis results
  return {
    relevanceScore: overallScore,
    keywordAnalysis: {
      required: {
        matched: requiredAnalysis.matches,
        missing: missingRequired,
        matchPercentage: requiredAnalysis.matchPercentage
      },
      optional: {
        matched: optionalAnalysis.matches,
        missing: missingOptional,
        matchPercentage: optionalAnalysis.matchPercentage
      }
    },
    strengths,
    weaknesses,
    recommendations: [
      "Focus on adding missing keywords in your CV",
      "Elaborate on experience related to required skills",
      "Use more specific language matching the job requirements"
    ],
    overallRanking: overallScore,
  };
};

/**
 * Compare multiple CVs against job requirements and keywords
 */
export const compareMultipleCVs = async (cvContents, jobDescription, requiredKeywords = [], optionalKeywords = []) => {
  // Simulate API call delay
  await delay(2000);
  
  // Analyze each CV against the requirements
  const results = await Promise.all(cvContents.map(async cv => {
    const analysis = await analyzeWithGemini(cv.content, jobDescription, requiredKeywords, optionalKeywords);
    
    return {
      id: cv.id,
      fileName: cv.fileName,
      score: analysis.overallRanking,
      relevanceScore: analysis.relevanceScore,
      keywordAnalysis: analysis.keywordAnalysis,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      recommendations: analysis.recommendations
    };
  }));
  
  // Sort by score in descending order and assign ranks
  return results
    .sort((a, b) => b.score - a.score)
    .map((result, index) => ({
      ...result,
      rank: index + 1
    }));
};
