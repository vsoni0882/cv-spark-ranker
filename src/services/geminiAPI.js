
// geminiAPI.js - Integration with Gemini API for CV ranking

/**
 * Helper function to simulate API delay using browser's setTimeout
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * String matching algorithms for keyword analysis
 */
const stringMatching = {
  // Exact match (case insensitive)
  exactMatch: (content, keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(content);
  },
  
  // Partial match (checks if keyword exists anywhere)
  partialMatch: (content, keyword) => {
    return content.toLowerCase().includes(keyword.toLowerCase());
  },
  
  // Context extraction (returns surrounding text for a keyword)
  extractContext: (content, keyword, charCount = 100) => {
    const lowerContent = content.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    const index = lowerContent.indexOf(lowerKeyword);
    
    if (index === -1) return null;
    
    const start = Math.max(0, index - charCount);
    const end = Math.min(lowerContent.length, index + lowerKeyword.length + charCount);
    
    return content.substring(start, end);
  }
};

/**
 * Implementation of Gemini API for CV analysis
 * This version provides more structured analysis of CVs against keywords
 */
export const analyzeWithGemini = async (cvContent, jobDescription, requiredKeywords = [], optionalKeywords = []) => {
  // In a production app, this would make a real API call to Gemini
  await delay(1500);
  
  // Enhanced keyword matching algorithm
  const analyzeContent = (content, keywords) => {
    if (!content || !keywords.length) return { 
      matches: [], 
      matchPercentage: 0,
      contextMatches: []
    };
    
    const contentLower = content.toLowerCase();
    const matches = [];
    const contextMatches = [];
    
    keywords.forEach(keyword => {
      // Try exact match first
      if (stringMatching.exactMatch(content, keyword)) {
        matches.push(keyword);
        
        // Get context for the match
        const context = stringMatching.extractContext(content, keyword);
        if (context) {
          contextMatches.push({ keyword, context });
        }
      }
      // Try partial match if exact match fails
      else if (stringMatching.partialMatch(content, keyword)) {
        matches.push(keyword + " (partial)");
        
        // Get context for the match
        const context = stringMatching.extractContext(content, keyword);
        if (context) {
          contextMatches.push({ keyword, context, partial: true });
        }
      }
    });
    
    const matchPercentage = keywords.length > 0 
      ? Math.round((matches.length / keywords.length) * 100)
      : 0;
      
    return { matches, matchPercentage, contextMatches };
  };
  
  // Analyze required and optional keywords separately
  const requiredAnalysis = analyzeContent(cvContent, requiredKeywords);
  const optionalAnalysis = analyzeContent(cvContent, optionalKeywords);
  
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
    !requiredAnalysis.matches.some(match => match.startsWith(keyword))
  );
  
  if (missingRequired.length > 0) {
    weaknesses.push(`Missing required keywords: ${missingRequired.join(", ")}`);
  }
  
  const missingOptional = optionalKeywords.filter(keyword => 
    !optionalAnalysis.matches.some(match => match.startsWith(keyword))
  );
  
  if (missingOptional.length > 0 && optionalKeywords.length > 0) {
    weaknesses.push(`Missing optional keywords: ${missingOptional.join(", ")}`);
  }
  
  // Return the analysis results
  return {
    success: true, // Explicitly indicate successful analysis
    timestamp: new Date().toISOString(),
    relevanceScore: overallScore,
    keywordAnalysis: {
      required: {
        matched: requiredAnalysis.matches,
        missing: missingRequired,
        matchPercentage: requiredAnalysis.matchPercentage,
        contextMatches: requiredAnalysis.contextMatches
      },
      optional: {
        matched: optionalAnalysis.matches,
        missing: missingOptional,
        matchPercentage: optionalAnalysis.matchPercentage,
        contextMatches: optionalAnalysis.contextMatches
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
      fileSize: cv.fileSize,
      uploadDate: cv.uploadDate,
      score: analysis.overallRanking,
      relevanceScore: analysis.relevanceScore,
      keywordAnalysis: analysis.keywordAnalysis,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      recommendations: analysis.recommendations,
      timestamp: analysis.timestamp
    };
  }));
  
  // Sort by score in descending order and assign ranks
  return {
    success: true,
    message: "Analysis completed successfully",
    timestamp: new Date().toISOString(),
    results: results
      .sort((a, b) => b.score - a.score)
      .map((result, index) => ({
        ...result,
        rank: index + 1
      }))
  };
};
