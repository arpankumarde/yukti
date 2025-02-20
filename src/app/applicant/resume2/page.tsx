"use client";

import { useState, useEffect } from "react";
import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";
import toast, { Toaster } from "react-hot-toast";
import ReactMarkdown from "react-markdown";

export default function SimpleResumeAnalyzer() {
  const [fileResponse, setFileResponse] = useState<any>(null);
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const notify = (status: "success" | "error", message: string) => {
    toast.dismiss();
    if (status === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const analyzeResume = async (text: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          jobProfile: "General ATS Analysis",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.choices?.[0]?.message?.content) {
        throw new Error("Invalid response format from analysis service");
      }

      setAnalysis(data.choices[0].message.content);
      notify("success", "Resume analysis complete!");
    } catch (error) {
      console.error("Resume analysis error:", error instanceof Error ? error.message : error);
      notify("error", error instanceof Error ? error.message : "Failed to analyze resume.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (response: any) => {
    try {
      const parsedResponse = JSON.parse(response);
      setFileResponse(parsedResponse);
      setAnalysis("");
    } catch (error) {
      console.error("File upload error:", error instanceof Error ? error.message : error);
      notify("error", "Failed to process the uploaded file. Please try again.");
    }
  };

  // Automatically trigger analysis once a file is uploaded and parsed
  useEffect(() => {
    if (fileResponse?.parsedText) {
      analyzeResume(fileResponse.parsedText);
    }
  }, [fileResponse]);

  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col items-center justify-center p-4">
      <Toaster />
      <div className="w-full max-w-md bg-background rounded-lg shadow-lg overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-foreground mb-4">Resume Analyzer</h1>
        {!fileResponse ? (
          <div className="flex items-center gap-3 p-4 bg-muted border border-border rounded-lg">
            <FilePond
              server={{
                process: {
                  url: "/api/upload",
                  method: "POST",
                  withCredentials: false,
                  onload: handleFileUpload,
                  onerror: () => {
                    notify("error", "Failed to upload file. Please try again.");
                  },
                },
                fetch: null,
                revert: null,
              }}
              acceptedFileTypes={["application/pdf"]}
              labelFileTypeNotAllowed="Please upload a PDF file"
              maxFiles={1}
            />
          </div>
        ) : isAnalyzing ? (
          <p className="text-muted-foreground">Analyzing your resume...</p>
        ) : analysis ? (
          <div className="prose dark:prose-invert">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        ) : null}
      </div>
    </div>
  );
}