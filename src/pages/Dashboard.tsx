
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { cvAPI, authAPI } from "../services/api";
import { compareMultipleCVs } from "../services/geminiAPI";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// CV type definition
interface CV {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  content?: string;
  score?: number;
  rank?: number;
  feedback?: string;
}

// Analysis result interface
interface RankingResult extends CV {
  score: number;
  rank: number;
  relevanceScore: number;
  keywordAnalysis: {
    required: {
      matched: string[];
      missing: string[];
      matchPercentage: number;
    };
    optional: {
      matched: string[];
      missing: string[];
      matchPercentage: number;
    };
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userCVs, setUserCVs] = useState<CV[]>([]);
  const [selectedCVs, setSelectedCVs] = useState<string[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [rankingResults, setRankingResults] = useState<RankingResult[]>([]);
  const [isRanking, setIsRanking] = useState(false);
  const [requiredKeywords, setRequiredKeywords] = useState("");
  const [optionalKeywords, setOptionalKeywords] = useState("");
  const navigate = useNavigate();
  
  // Check if user is logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
    }
  }, [navigate]);

  // Get user CV's on component mount
  useEffect(() => {
    const fetchUserCVs = async () => {
      setIsLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const response = await cvAPI.getUserCVs(user.id);
        // Fix: Extract the cvs array from the response
        if (response && response.cvs) {
          setUserCVs(response.cvs);
        } else {
          setUserCVs([]);
          console.error("Invalid response format from getUserCVs:", response);
        }
      } catch (error) {
        console.error("Error fetching CVs:", error);
        toast.error("Failed to load your CVs");
        setUserCVs([]); // Ensure userCVs is always an array
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserCVs();
  }, []);

  // Handle CV file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsLoading(true);
    const files = Array.from(e.target.files);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    for (const file of files) {
      try {
        const content = await readFileContent(file);
        
        const response = await cvAPI.uploadCV({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          content: content.substring(0, 500) + "...",
        }, user.id);
        
        // Fix: Extract the cv object from the response
        if (response && response.cv) {
          setUserCVs(prevCVs => [...prevCVs, response.cv]);
          toast.success(`Uploaded ${file.name}`);
        }
      } catch (error) {
        console.error("Error uploading CV:", error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    
    setIsLoading(false);
    e.target.value = "";
  };
  
  // Read file content as text
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsText(file);
    });
  };
  
  // Handle CV selection for ranking
  const toggleCVSelection = (cvId: string) => {
    setSelectedCVs(prev => 
      prev.includes(cvId) 
        ? prev.filter(id => id !== cvId) 
        : [...prev, cvId]
    );
  };
  
  // Parse keywords from comma-separated string
  const parseKeywords = (keywordsString: string): string[] => {
    if (!keywordsString.trim()) return [];
    
    return keywordsString
      .split(',')
      .map(keyword => keyword.trim())
      .filter(keyword => keyword !== '');
  };
  
  // Handle ranking of selected CVs with keyword analysis
  const handleRankCVs = async () => {
    if (selectedCVs.length < 1) {
      toast.error("Please select at least 1 CV to analyze");
      return;
    }
    
    setIsRanking(true);
    
    try {
      const selectedCVsContent = userCVs.filter(cv => selectedCVs.includes(cv.id));
      
      const requiredKeywordsList = parseKeywords(requiredKeywords);
      const optionalKeywordsList = parseKeywords(optionalKeywords);
      
      if (requiredKeywordsList.length === 0 && optionalKeywordsList.length === 0 && !jobDescription.trim()) {
        toast.warning("No keywords or job description provided. Results may not be accurate.");
      }
      
      const results = await compareMultipleCVs(
        selectedCVsContent, 
        jobDescription,
        requiredKeywordsList,
        optionalKeywordsList
      );
      
      // Fix: Extract the results array from the response
      if (results && results.results) {
        setRankingResults(results.results);
        toast.success("CVs analyzed and ranked successfully");
      }
    } catch (error) {
      console.error("Error ranking CVs:", error);
      toast.error("Failed to analyze CVs");
    } finally {
      setIsRanking(false);
    }
  };
  
  // Handle CV deletion
  const handleDeleteCV = async (cvId: string) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await cvAPI.deleteCV(cvId, user.id);
      
      setUserCVs(prevCVs => prevCVs.filter(cv => cv.id !== cvId));
      setSelectedCVs(prev => prev.filter(id => id !== cvId));
      
      if (rankingResults.some(cv => cv.id === cvId)) {
        setRankingResults(prev => prev.filter(cv => cv.id !== cvId));
      }
      
      toast.success("CV deleted successfully");
    } catch (error) {
      console.error("Error deleting CV:", error);
      toast.error("Failed to delete CV");
    }
  };
  
  // Handle user logout
  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem("user");
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">CV Spark Ranker</Link>
          <Button variant="outline" className="text-white border-white hover:bg-indigo-700" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-6">Your Dashboard</h1>
        
        <Tabs defaultValue="manage" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="manage">Manage CVs</TabsTrigger>
            <TabsTrigger value="rank">Rank CVs</TabsTrigger>
          </TabsList>
          
          {/* Manage CVs Tab */}
          <TabsContent value="manage" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload & Manage CVs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      id="cv-upload"
                      className="hidden"
                      multiple
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="cv-upload"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-lg font-medium text-gray-800">Click to upload CVs</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Support for PDF, DOC, DOCX
                      </p>
                    </label>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Your Uploaded CVs ({userCVs.length})</h3>
                  
                  {isLoading ? (
                    <p className="text-center py-4">Loading your CVs...</p>
                  ) : userCVs.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">You haven't uploaded any CVs yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {userCVs.map(cv => (
                        <div 
                          key={cv.id} 
                          className="flex items-center justify-between bg-white p-3 rounded-lg border"
                        >
                          <div>
                            <p className="font-medium">{cv.fileName}</p>
                            <p className="text-sm text-gray-500">
                              {new Intl.DateTimeFormat('en-US').format(new Date(cv.uploadDate))} • {(cv.fileSize / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteCV(cv.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Rank CVs Tab */}
          <TabsContent value="rank" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Rank Your CVs</CardTitle>
                <CardDescription>
                  Analyze your CVs against job requirements and keywords
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Required Keywords
                      </label>
                      <Input 
                        placeholder="E.g., JavaScript, React, TypeScript (comma separated)"
                        value={requiredKeywords}
                        onChange={(e) => setRequiredKeywords(e.target.value)}
                        className="mb-4"
                      />
                      
                      <label className="block text-sm font-medium mb-2">
                        Optional Keywords
                      </label>
                      <Input 
                        placeholder="E.g., Node.js, GraphQL, AWS (comma separated)"
                        value={optionalKeywords}
                        onChange={(e) => setOptionalKeywords(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Job Description (optional)
                      </label>
                      <Textarea 
                        className="min-h-[140px] resize-none"
                        placeholder="Enter the job description for more accurate analysis..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Select CVs to Analyze</h3>
                    
                    {userCVs.length === 0 ? (
                      <p className="text-center py-4 text-gray-500">Please upload CVs to analyze them.</p>
                    ) : (
                      <div className="space-y-2">
                        {userCVs.map(cv => (
                          <div 
                            key={cv.id} 
                            className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                              selectedCVs.includes(cv.id) ? 'bg-indigo-50 border-indigo-300' : 'bg-white'
                            }`}
                            onClick={() => toggleCVSelection(cv.id)}
                          >
                            <input 
                              type="checkbox" 
                              className="mr-3"
                              checked={selectedCVs.includes(cv.id)}
                              onChange={() => {}} // Handled by div click
                            />
                            <div>
                              <p className="font-medium">{cv.fileName}</p>
                              <p className="text-sm text-gray-500">
                                {new Intl.DateTimeFormat('en-US').format(new Date(cv.uploadDate))}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-4 text-right">
                      <Button 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        disabled={selectedCVs.length === 0 || isRanking}
                        onClick={handleRankCVs}
                      >
                        {isRanking ? "Analyzing..." : "Analyze Selected CVs"}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Ranking Results */}
                  {rankingResults.length > 0 && (
                    <div className="mt-8">
                      <h3 className="font-bold text-lg mb-4">Analysis Results</h3>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Rank</TableHead>
                            <TableHead>CV Name</TableHead>
                            <TableHead>Match Score</TableHead>
                            <TableHead>Details</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rankingResults.map((result) => (
                            <TableRow key={result.id}>
                              <TableCell className="font-medium">
                                <span className="inline-flex items-center justify-center bg-indigo-600 text-white font-bold rounded-full w-8 h-8">
                                  {result.rank}
                                </span>
                              </TableCell>
                              <TableCell>{result.fileName}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <span className="font-bold text-lg mr-2">{result.score}%</span>
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div 
                                      className="bg-indigo-600 h-2.5 rounded-full" 
                                      style={{width: `${result.score}%`}}
                                    ></div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Collapsible>
                                  <CollapsibleTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      Show Details
                                    </Button>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="mt-2">
                                    <div className="rounded-md border p-4 bg-gray-50 space-y-4">
                                      <div>
                                        <h4 className="font-semibold mb-2">Keyword Analysis</h4>
                                        
                                        <div className="mb-2">
                                          <p className="text-sm font-medium">Required Keywords:</p>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {result.keywordAnalysis.required.matched.map(keyword => (
                                              <span 
                                                key={keyword}
                                                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                                              >
                                                {keyword}
                                              </span>
                                            ))}
                                            {result.keywordAnalysis.required.missing.map(keyword => (
                                              <span 
                                                key={keyword}
                                                className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded"
                                              >
                                                {keyword}
                                              </span>
                                            ))}
                                            {result.keywordAnalysis.required.matched.length === 0 && 
                                             result.keywordAnalysis.required.missing.length === 0 && (
                                              <span className="text-xs text-gray-500">No required keywords specified</span>
                                            )}
                                          </div>
                                        </div>
                                        
                                        <div>
                                          <p className="text-sm font-medium">Optional Keywords:</p>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {result.keywordAnalysis.optional.matched.map(keyword => (
                                              <span 
                                                key={keyword}
                                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                              >
                                                {keyword}
                                              </span>
                                            ))}
                                            {result.keywordAnalysis.optional.missing.map(keyword => (
                                              <span 
                                                key={keyword}
                                                className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded line-through"
                                              >
                                                {keyword}
                                              </span>
                                            ))}
                                            {result.keywordAnalysis.optional.matched.length === 0 && 
                                             result.keywordAnalysis.optional.missing.length === 0 && (
                                              <span className="text-xs text-gray-500">No optional keywords specified</span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <h4 className="font-semibold text-green-700 mb-1">Strengths</h4>
                                          <ul className="list-disc pl-5 text-sm space-y-1">
                                            {result.strengths.length > 0 ? (
                                              result.strengths.map((strength, i) => (
                                                <li key={i}>{strength}</li>
                                              ))
                                            ) : (
                                              <li className="text-gray-500">No specific strengths identified</li>
                                            )}
                                          </ul>
                                        </div>
                                        
                                        <div>
                                          <h4 className="font-semibold text-red-700 mb-1">Weaknesses</h4>
                                          <ul className="list-disc pl-5 text-sm space-y-1">
                                            {result.weaknesses.length > 0 ? (
                                              result.weaknesses.map((weakness, i) => (
                                                <li key={i}>{weakness}</li>
                                              ))
                                            ) : (
                                              <li className="text-gray-500">No specific weaknesses identified</li>
                                            )}
                                          </ul>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h4 className="font-semibold mb-1">Recommendations</h4>
                                        <ul className="list-disc pl-5 text-sm space-y-1">
                                          {result.recommendations.map((recommendation, i) => (
                                            <li key={i}>{recommendation}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
