
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { cvAPI, authAPI } from "../services/api";
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

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userCVs, setUserCVs] = useState<CV[]>([]);
  const [selectedCVs, setSelectedCVs] = useState<string[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [rankingResults, setRankingResults] = useState<CV[]>([]);
  const [isRanking, setIsRanking] = useState(false);
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
        const cvs = await cvAPI.getUserCVs(user.id);
        setUserCVs(cvs);
      } catch (error) {
        console.error("Error fetching CVs:", error);
        toast.error("Failed to load your CVs");
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
        // Read file content (for demonstration purposes)
        const content = await readFileContent(file);
        
        // Upload CV
        const newCV = await cvAPI.uploadCV({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          content: content.substring(0, 500) + "...", // Truncate for demo
        }, user.id);
        
        // Update UI
        setUserCVs(prevCVs => [...prevCVs, newCV]);
        toast.success(`Uploaded ${file.name}`);
      } catch (error) {
        console.error("Error uploading CV:", error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    
    setIsLoading(false);
    // Reset file input
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
  
  // Handle ranking of selected CVs
  const handleRankCVs = async () => {
    if (selectedCVs.length < 2) {
      toast.error("Please select at least 2 CVs to rank");
      return;
    }
    
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description for better ranking");
      return;
    }
    
    setIsRanking(true);
    
    try {
      // Rank the selected CVs
      const results = await cvAPI.rankCVs(selectedCVs);
      setRankingResults(results);
      toast.success("CVs ranked successfully");
    } catch (error) {
      console.error("Error ranking CVs:", error);
      toast.error("Failed to rank CVs");
    } finally {
      setIsRanking(false);
    }
  };
  
  // Handle CV deletion
  const handleDeleteCV = async (cvId: string) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await cvAPI.deleteCV(cvId, user.id);
      
      // Update UI
      setUserCVs(prevCVs => prevCVs.filter(cv => cv.id !== cvId));
      setSelectedCVs(prev => prev.filter(id => id !== cvId));
      
      // Remove from ranking results if present
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
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Enter Job Description
                    </label>
                    <textarea 
                      className="w-full min-h-[120px] p-3 border rounded-md"
                      placeholder="Enter the job description to compare CVs against..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Select CVs to Rank</h3>
                    
                    {userCVs.length === 0 ? (
                      <p className="text-center py-4 text-gray-500">Please upload CVs to rank them.</p>
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
                        disabled={selectedCVs.length < 2 || !jobDescription.trim() || isRanking}
                        onClick={handleRankCVs}
                      >
                        {isRanking ? "Ranking..." : "Rank Selected CVs"}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Ranking Results */}
                  {rankingResults.length > 0 && (
                    <div className="mt-8">
                      <h3 className="font-bold text-lg mb-4">Ranking Results</h3>
                      <div className="space-y-4">
                        {rankingResults.map((cv, index) => (
                          <div 
                            key={cv.id} 
                            className="bg-white p-4 rounded-lg border shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <span className="bg-indigo-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3">
                                  {index + 1}
                                </span>
                                <h4 className="font-medium">{cv.fileName}</h4>
                              </div>
                              <span className="text-lg font-bold text-indigo-600">
                                {cv.score}/100
                              </span>
                            </div>
                            <div className="mt-2 text-gray-700">
                              <p className="text-sm">{cv.feedback}</p>
                            </div>
                          </div>
                        ))}
                      </div>
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
