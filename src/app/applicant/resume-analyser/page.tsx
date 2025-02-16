"use client"
import React, { useState } from 'react';
import { Upload, FileText, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      setShowProgress(true);
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setShowProgress(false), 1000);
            return 100;
          }
          return prev + 5;
        });
      }, 200);
    }
  };

  // Calculate estimated time remaining
  const getEstimatedTime = () => {
    const remaining = Math.ceil((100 - uploadProgress) * 0.2);
    return remaining > 0 ? `${remaining} seconds remaining` : 'Completing...';
  };

  // Calculate upload speed (simulated)
  const getUploadSpeed = () => {
    return '2.5 MB/s';
  };

  return (
    <div className="min-h-screen bg-secondary/20 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-background rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-border">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Resume Analyzer</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Upload your resume and let our AI analyze it for insights, suggestions, and improvements.
              Get detailed feedback on formatting, content, and alignment with job market demands.
            </p>
          </div>

          {/* Upload Section */}
          <div className="p-8">
            <div className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center",
              "border-input hover:border-border transition-colors duration-200"
            )}>
              <input
                type="file"
                id="resume"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="resume"
                className="cursor-pointer inline-flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-primary mb-4" />
                <span className="text-lg font-medium text-foreground mb-2">
                  {selectedFile ? selectedFile.name : 'Choose a file'}
                </span>
                <span className="text-sm text-muted-foreground">
                  Supported formats: PDF, DOC, DOCX (Max 10MB)
                </span>
              </label>
            </div>

            {/* Progress Bar */}
            {showProgress && (
              <div className="mt-6">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>{uploadProgress}% uploaded</span>
                  <span>{getUploadSpeed()}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{getEstimatedTime()}</span>
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