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

  const getEstimatedTime = () => {
    const remaining = Math.ceil((100 - uploadProgress) * 0.2);
    return remaining > 0 ? `${remaining} seconds remaining` : 'Completing...';
  };

  const getUploadSpeed = () => {
    return '2.5 MB/s';
  };

  return (
    <div className="min-h-screen bg-secondary/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-background rounded-xl shadow-sm border border-border overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-semibold text-foreground">Resume Analyzer</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Upload your resume and let our AI analyze it for insights, suggestions, and improvements.
            </p>
          </div>

          {/* Upload Section */}
          <div className="p-6">
            <div className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center",
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
                <Upload className="w-10 h-10 text-primary mb-3" />
                <span className="text-base font-medium text-foreground mb-1">
                  {selectedFile ? selectedFile.name : 'Choose a file'}
                </span>
                <span className="text-xs text-muted-foreground">
                  Supported formats: PDF, DOC, DOCX (Max 10MB)
                </span>
              </label>
            </div>

            {/* Progress Bar */}
            {showProgress && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>{uploadProgress}% uploaded</span>
                  <span>{getUploadSpeed()}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
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