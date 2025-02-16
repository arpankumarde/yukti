"use client";
import React, { useState } from 'react';
import { Upload, FileText, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import ReactMarkdown from 'react-markdown';
import toast, { Toaster } from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jobProfile, setJobProfile] = useState("");
  const [analysisType, setAnalysisType] = useState<"normal" | "jobMatch">("normal");
  const [showAnalysisOptions, setShowAnalysisOptions] = useState(false);
  const [scores, setScores] = useState<{ atsScore: number; jobMatchScore?: number }>({ atsScore: 0 });

  const extractScores = (text: string) => {
    const atsMatch = text.match(/ATS Compatibility Score.*?(\d+)/);
    const jobMatch = text.match(/Job Match Score.*?(\d+)/);
    
    return {
      atsScore: atsMatch ? parseInt(atsMatch[1]) : 0,
      ...(jobMatch && { jobMatchScore: parseInt(jobMatch[1]) })
    };
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowProgress(true);
      setUploadProgress(0);

      // Create FormData
      const formData = new FormData();
      formData.append("filepond", file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        setShowAnalysisOptions(true);
        setShowProgress(false);
        setUploadProgress(100);
      } catch (error) {
        toast.error('Failed to upload file');
        setShowProgress(false);
      }
    }
  };

  const analyzeResume = async (text: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          jobProfile: analysisType === "jobMatch" ? jobProfile : "General ATS Analysis"
        }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      const analysisText = data.choices[0].message.content;
      setAnalysis(analysisText);
      setScores(extractScores(analysisText));
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generatePieChartData = (scores: { atsScore: number; jobMatchScore?: number }) => {
    if (analysisType === "jobMatch" && scores.jobMatchScore !== undefined) {
      return {
        labels: ['ATS Compatibility', 'Job Match', 'Room for Improvement'],
        datasets: [{
          data: [scores.atsScore, scores.jobMatchScore, Math.max(0, 100 - scores.atsScore - scores.jobMatchScore)],
          backgroundColor: ['#4CAF50', '#2196F3', '#FFA726'],
        }]
      };
    }
    
    return {
      labels: ['ATS Compatibility', 'Room for Improvement'],
      datasets: [{
        data: [scores.atsScore, Math.max(0, 100 - scores.atsScore)],
        backgroundColor: ['#4CAF50', '#FFA726'],
      }]
    };
  };

  return (
    <div className="min-h-screen bg-secondary/20 flex items-center justify-center p-4">
      <Toaster />
      <div className="max-w-md w-full">
        <div className="bg-background rounded-xl shadow-lg border border-border overflow-hidden">
          {/* Your existing header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-semibold text-foreground">Resume Analyzer</h1>
            </div>
            <p className="text-muted-foreground text-sm font-normal">
              Upload your resume and let our AI analyze it for insights.
            </p>
          </div>

          {/* Upload Section */}
          <div className="p-6">
            {!showAnalysisOptions ? (
              <div>
                {/* Your existing upload UI */}
                <div className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center",
                  "border-input hover:border-border transition-colors duration-200"
                )}>
                  <input
                    type="file"
                    id="resume"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="resume" className="cursor-pointer inline-flex flex-col items-center">
                    <Upload className="w-10 h-10 text-primary mb-3" />
                    <span className="text-base font-semibold text-foreground mb-1">
                      {selectedFile ? selectedFile.name : 'Choose a file'}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      Supported format: PDF (Max 10MB)
                    </span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setAnalysisType("normal")}
                    className={cn(
                      "px-4 py-2 rounded-md transition-colors",
                      analysisType === "normal" ? "bg-primary text-white" : "bg-secondary"
                    )}
                  >
                    Normal ATS Check
                  </button>
                  <button
                    onClick={() => setAnalysisType("jobMatch")}
                    className={cn(
                      "px-4 py-2 rounded-md transition-colors",
                      analysisType === "jobMatch" ? "bg-primary text-white" : "bg-secondary"
                    )}
                  >
                    Job Profile Match
                  </button>
                </div>

                {analysisType === "jobMatch" && (
                  <textarea
                    placeholder="Paste job description here..."
                    className="w-full p-2 border rounded"
                    value={jobProfile}
                    onChange={(e) => setJobProfile(e.target.value)}
                  />
                )}

                <button
                  onClick={() => selectedFile && analyzeResume(selectedFile.name)}
                  className="w-full px-4 py-2 bg-primary text-white rounded-md"
                >
                  Start Analysis
                </button>
              </div>
            )}

            {/* Analysis Results */}
            {analysis && !isAnalyzing && (
              <div className="mt-6">
                <div className="w-full max-w-md mx-auto mb-6">
                  <Pie data={generatePieChartData(scores)} />
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Loading States */}
            {(showProgress || isAnalyzing) && (
              <div className="mt-4">
                <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
                  <span>{isAnalyzing ? "Analyzing..." : `${uploadProgress}% uploaded`}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: isAnalyzing ? "100%" : `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;