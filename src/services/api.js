
// API service for the CV ranking application
// Using browser-compatible approach

// Mock database for the first version (will be replaced with MongoDB connection)
const mockUsers = [];
const mockCVs = [];

// Helper function to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Authentication API functions
 */
export const authAPI = {
  register: async (userData) => {
    // Simulate API call
    await delay(500);
    
    // Check if user already exists
    const existingUser = mockUsers.find(user => user.email === userData.email);
    if (existingUser) {
      return {
        success: false,
        message: 'User already exists'
      };
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      password: btoa(userData.password), // Simple encoding (not secure, just for demo)
    };
    
    mockUsers.push(newUser);
    
    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    return {
      success: true,
      message: 'Registration successful',
      user: userWithoutPassword
    };
  },
  
  login: async (credentials) => {
    // Simulate API call
    await delay(500);
    
    // Find user
    const user = mockUsers.find(user => user.email === credentials.email);
    
    // Validate user and password
    if (!user || btoa(credentials.password) !== user.password) {
      return {
        success: false,
        message: 'Invalid credentials'
      };
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return {
      success: true,
      message: 'Login successful',
      user: userWithoutPassword
    };
  },
  
  logout: async () => {
    // Simulate API call
    await delay(300);
    return { 
      success: true,
      message: 'Logout successful' 
    };
  }
};

/**
 * CV API functions
 */
export const cvAPI = {
  uploadCV: async (cvData, userId) => {
    // Simulate API call
    await delay(700);
    
    // Create new CV record
    const newCV = {
      id: Date.now().toString(),
      userId,
      uploadDate: new Date().toISOString(),
      ...cvData
    };
    
    mockCVs.push(newCV);
    return {
      success: true,
      message: 'CV uploaded successfully',
      cv: newCV
    };
  },
  
  getUserCVs: async (userId) => {
    // Simulate API call
    await delay(500);
    
    // Get all CVs for the user
    const userCVs = mockCVs.filter(cv => cv.userId === userId);
    return {
      success: true,
      message: `Found ${userCVs.length} CVs`,
      cvs: userCVs
    };
  },
  
  parseCV: async (file) => {
    // This would use a PDF parsing library in a real implementation
    // For now we'll just read the file as text
    await delay(300);
    
    // Mock parsing function that would be replaced with actual PDF parsing
    const mockParsePDF = async (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          // In a real app, we'd use a PDF parser here
          const text = reader.result;
          resolve(text);
        };
        reader.readAsText(file);
      });
    };
    
    try {
      const content = await mockParsePDF(file);
      return {
        success: true,
        message: 'CV parsed successfully',
        content: content,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      };
    } catch (error) {
      console.error('Error parsing CV:', error);
      return {
        success: false,
        message: 'Failed to parse CV',
        error: error.message
      };
    }
  },
  
  rankCVs: async (cvIds, keywords) => {
    // Simulate API call with longer delay to mimic AI processing
    await delay(1500);
    
    // Get the CVs to rank
    const cvsToRank = mockCVs.filter(cv => cvIds.includes(cv.id));
    
    // Enhanced mock ranking algorithm
    const rankedCVs = cvsToRank.map((cv, index) => {
      const randomScore = Math.floor(Math.random() * 100);
      const keywordMatches = keywords.filter(() => Math.random() > 0.5);
      
      return {
        ...cv,
        score: randomScore,
        rank: index + 1,
        matches: keywordMatches,
        feedback: `Mock feedback for CV #${index + 1}`
      };
    });
    
    // Sort by score (highest first)
    return {
      success: true,
      message: 'CV ranking completed',
      timestamp: new Date().toISOString(),
      results: rankedCVs.sort((a, b) => b.score - a.score)
    };
  },
  
  deleteCV: async (cvId, userId) => {
    // Simulate API call
    await delay(400);
    
    // Find CV index
    const cvIndex = mockCVs.findIndex(cv => cv.id === cvId && cv.userId === userId);
    
    if (cvIndex === -1) {
      return {
        success: false,
        message: 'CV not found or access denied'
      };
    }
    
    // Remove CV
    mockCVs.splice(cvIndex, 1);
    return { 
      success: true,
      message: 'CV deleted successfully' 
    };
  }
};

/**
 * Gemini API integration
 */
export const geminiAPI = {
  rankCVs: async (cvs, jobDescription, requiredKeywords = [], optionalKeywords = []) => {
    // Simulate API call
    await delay(2000);
    
    // Mock ranking algorithm with keyword analysis
    return {
      success: true,
      message: 'Analysis completed successfully',
      timestamp: new Date().toISOString(),
      results: cvs.map((cv, index) => {
        const requiredMatches = requiredKeywords.filter(() => Math.random() > 0.3);
        const optionalMatches = optionalKeywords.filter(() => Math.random() > 0.5);
        const score = Math.floor(Math.random() * 100);
        
        return {
          ...cv,
          aiScore: score,
          aiRank: index + 1,
          relevanceScore: score,
          keywordAnalysis: {
            required: {
              matched: requiredMatches,
              missing: requiredKeywords.filter(kw => !requiredMatches.includes(kw)),
              matchPercentage: requiredKeywords.length ? 
                Math.round((requiredMatches.length / requiredKeywords.length) * 100) : 0
            },
            optional: {
              matched: optionalMatches,
              missing: optionalKeywords.filter(kw => !optionalMatches.includes(kw)),
              matchPercentage: optionalKeywords.length ? 
                Math.round((optionalMatches.length / optionalKeywords.length) * 100) : 0
            }
          },
          strengths: [
            `Matches ${requiredMatches.length} required keywords`,
            `Matches ${optionalMatches.length} optional keywords`,
            'Good overall profile structure'
          ],
          weaknesses: [
            'Missing some key skills',
            'Could elaborate more on project achievements',
            'Experience description could be more detailed'
          ],
          recommendations: [
            'Add missing keywords to your resume',
            'Quantify your achievements with numbers and metrics',
            'Tailor your experience descriptions to match job requirements'
          ]
        };
      })
    };
  }
};
