
// API service for the CV ranking application
// Using browser-compatible setTimeout instead of Node.js timers

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
      throw new Error('User already exists');
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
    return userWithoutPassword;
  },
  
  login: async (credentials) => {
    // Simulate API call
    await delay(500);
    
    // Find user
    const user = mockUsers.find(user => user.email === credentials.email);
    
    // Validate user and password
    if (!user || btoa(credentials.password) !== user.password) {
      throw new Error('Invalid credentials');
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
  
  logout: async () => {
    // Simulate API call
    await delay(300);
    return { success: true };
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
    return newCV;
  },
  
  getUserCVs: async (userId) => {
    // Simulate API call
    await delay(500);
    
    // Get all CVs for the user
    return mockCVs.filter(cv => cv.userId === userId);
  },
  
  rankCVs: async (cvIds) => {
    // Simulate API call with longer delay to mimic AI processing
    await delay(1500);
    
    // Get the CVs to rank
    const cvsToRank = mockCVs.filter(cv => cvIds.includes(cv.id));
    
    // Simple mock ranking algorithm (will be replaced with Gemini API)
    const rankedCVs = cvsToRank.map((cv, index) => ({
      ...cv,
      score: Math.floor(Math.random() * 100),
      rank: index + 1,
      feedback: `Mock feedback for CV #${index + 1}`
    }));
    
    // Sort by score (highest first)
    return rankedCVs.sort((a, b) => b.score - a.score);
  },
  
  deleteCV: async (cvId, userId) => {
    // Simulate API call
    await delay(400);
    
    // Find CV index
    const cvIndex = mockCVs.findIndex(cv => cv.id === cvId && cv.userId === userId);
    
    if (cvIndex === -1) {
      throw new Error('CV not found or access denied');
    }
    
    // Remove CV
    mockCVs.splice(cvIndex, 1);
    return { success: true };
  }
};

/**
 * Gemini API integration (mock for now)
 */
export const geminiAPI = {
  rankCVs: async (cvs, jobDescription) => {
    // Simulate API call
    await delay(2000);
    
    // Mock ranking from Gemini API
    return cvs.map((cv, index) => ({
      ...cv,
      aiScore: Math.floor(Math.random() * 100),
      aiRank: index + 1,
      aiFeedback: `Mock AI feedback for CV #${index + 1} based on job description: "${jobDescription}"`
    }));
  }
};
