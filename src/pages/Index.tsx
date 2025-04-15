
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100">
      <div className="container max-w-6xl px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-indigo-900 mb-4">CV Spark Ranker</h1>
          <p className="text-xl text-gray-600 mb-8">
            The intelligent way to rank and evaluate CVs for your job openings
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link to="/login">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg rounded-lg">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-6 text-lg rounded-lg">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-indigo-600 text-4xl font-bold mb-4">01</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Upload CVs</h3>
            <p className="text-gray-600">
              Upload multiple CVs in various formats including PDF, DOC, and DOCX.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-indigo-600 text-4xl font-bold mb-4">02</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">AI Analysis</h3>
            <p className="text-gray-600">
              Our AI powered by Gemini analyzes and compares CVs against your job description.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-indigo-600 text-4xl font-bold mb-4">03</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Get Results</h3>
            <p className="text-gray-600">
              Receive detailed rankings and insights to make informed hiring decisions.
            </p>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-lg my-12">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Why Choose CV Spark Ranker?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Time-Saving</h4>
                <p className="text-gray-600 text-sm">Reduce hiring time by up to 75% with automated CV ranking</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">AI-Powered Insights</h4>
                <p className="text-gray-600 text-sm">Advanced AI analyzes skills, experience, and cultural fit</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Bias Reduction</h4>
                <p className="text-gray-600 text-sm">Objective evaluation based on qualifications and experience</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Cost-Effective</h4>
                <p className="text-gray-600 text-sm">Reduce recruitment costs while improving quality of hire</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="w-full bg-indigo-900 text-white py-6 mt-auto">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} CV Spark Ranker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
