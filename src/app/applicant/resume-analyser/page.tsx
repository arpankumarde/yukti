"use client";

import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";
import { useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import ReactMarkdown from 'react-markdown';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { Upload, FileText, PieChart, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function App() {
  const [fileResponse, setFileResponse] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jobProfile, setJobProfile] = useState("");
  const [analysisType, setAnalysisType] = useState("normal");
  const [showAnalysisOptions, setShowAnalysisOptions] = useState(false);
  const [scores, setScores] = useState<{ atsScore: number; jobMatchScore?: number }>({ atsScore: 0 });
  const chartRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const Notify = (status: string, message: string) => {
    toast.dismiss();
    if (status === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const extractScores = (text: string) => {
    const atsMatch = text.match(/ATS Compatibility Score.*?(\d+)/);
    const jobMatch = text.match(/Job Match Score.*?(\d+)/);
    
    return {
      atsScore: atsMatch ? parseInt(atsMatch[1]) : 0,
      ...(jobMatch && { jobMatchScore: parseInt(jobMatch[1]) })
    };
  };

  const analyzeResume = async (text: string) => {
    if (analysisType === "jobMatch" && !jobProfile.trim()) {
      Notify('error', 'Please enter a job profile first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text, 
          jobProfile: analysisType === "jobMatch" ? jobProfile : "General ATS Analysis"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from analysis service');
      }

      const analysisText = data.choices[0].message.content;
      setAnalysis(analysisText);
      setScores(extractScores(analysisText));
      Notify('success', 'Resume analysis complete!');
    } catch (error) {
      console.error('Resume analysis error:', error instanceof Error ? error.message : 'Unknown error occurred');
      Notify('error', error instanceof Error ? error.message : 'Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generatePieChartData = (scores: { atsScore: number; jobMatchScore?: number }) => {
    if (analysisType === "jobMatch" && scores.jobMatchScore !== undefined) {
      return {
        labels: ['ATS Compatibility', 'Job Match', 'Room for Improvement'],
        datasets: [{
          data: [
            scores.atsScore,
            scores.jobMatchScore,
            Math.max(0, 100 - scores.atsScore - scores.jobMatchScore)
          ],
          backgroundColor: ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'],
        }]
      };
    }
    
    return {
      labels: ['ATS Compatibility', 'Room for Improvement'],
      datasets: [{
        data: [scores.atsScore, Math.max(0, 100 - scores.atsScore)],
        backgroundColor: ['hsl(var(--chart-1))', 'hsl(var(--chart-2))'],
      }]
    };
  };

  const downloadReport = async () => {
    if (!analysis || !reportRef.current || !chartRef.current) return;

    try {
      const chartImage = await toPng(chartRef.current);
      const pdf = new jsPDF();
      pdf.setFontSize(20);
      pdf.text("ATS Analysis Report", 20, 20);
      pdf.addImage(chartImage, 'PNG', 15, 40, 180, 100);
      pdf.setFontSize(12);
      const lines = pdf.splitTextToSize(analysis.replace(/[#*]/g, ''), 180);
      pdf.text(lines, 15, 150);
      pdf.save('ats-analysis-report.pdf');
      Notify('success', 'Report downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error instanceof Error ? error.message : 'Unknown error occurred');
      Notify('error', 'Failed to generate PDF report. Please try again.');
    }
  };

  const handleFileUpload = (response: any) => {
    try {
      const fileResponse = JSON.parse(response);
      setFileResponse(fileResponse);
      setShowAnalysisOptions(true);
      setAnalysis("");
      setScores({ atsScore: 0 });
    } catch (error) {
      console.error('File upload error:', error instanceof Error ? error.message : 'Unknown error occurred');
      Notify('error', 'Failed to process the uploaded file. Please try again.');
    }
  };

  const startAnalysis = () => {
    if (!fileResponse?.parsedText) {
      Notify('error', 'No resume text found. Please upload a PDF file first.');
      return;
    }
    analyzeResume(fileResponse.parsedText);
  };

  return (
    <div className="min-h-screen bg-secondary/20 flex items-center justify-center p-4">
    <div className="w-full">
      <div className="bg-background rounded-lg shadow-lg overflow-hidden">
          <Toaster />
          <h1 className="text-2xl font-bold text-foreground p-6 border-b border-border">
            Resume Analyzer
          </h1>
          
          <div className="p-6 space-y-6">
            {!fileResponse ? (
              <div className={cn(
                "flex items-center gap-3 rounded-lg p-4",
                "bg-muted border border-border"
              )}>
                <AlertCircle className="text-muted-foreground" size={20} />
                <div className="filepond-wrapper w-full">
                  <FilePond
                    server={{
                      process: {
                        url: "/api/upload",
                        method: "POST",
                        withCredentials: false,
                        onload: handleFileUpload,
                        onerror: (response) => {
                          Notify('error', 'Failed to upload file. Please try again.');
                          return response;
                        },
                      },
                      fetch: null,
                      revert: null,
                    }}
                    acceptedFileTypes={['application/pdf']}
                    labelFileTypeNotAllowed="Please upload a PDF file"
                    maxFiles={1}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className={cn(
                  "flex items-start gap-3 rounded-lg p-4",
                  "bg-muted border border-border"
                )}>
                  <FileText className="text-muted-foreground mt-1" size={20} />
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-foreground mb-2">Extracted Text</h2>
                    {/* @ts-expect-error - parsedText type issue */}
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap">{fileResponse.parsedText}</pre>
                  </div>
                </div>

                {showAnalysisOptions && (
                  <div className={cn(
                    "rounded-lg p-4",
                    "bg-muted border border-border"
                  )}>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <button
                          onClick={() => setAnalysisType("normal")}
                          className={cn(
                            "px-4 py-2 rounded-md transition-colors",
                            analysisType === "normal"
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          )}
                        >
                          Normal ATS Check
                        </button>
                        <button
                          onClick={() => setAnalysisType("jobMatch")}
                          className={cn(
                            "px-4 py-2 rounded-md transition-colors",
                            analysisType === "jobMatch"
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          )}
                        >
                          Job Profile Match
                        </button>
                      </div>

                      {analysisType === "jobMatch" && (
                        <div className="mt-4">
                          <label htmlFor="jobProfile" className="block text-sm font-medium text-foreground mb-2">
                            Job Profile Description
                          </label>
                          <textarea
                            id="jobProfile"
                            rows={4}
                            className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Paste the job description here..."
                            value={jobProfile}
                            onChange={(e) => setJobProfile(e.target.value)}
                          />
                        </div>
                      )}

                      <button
                        onClick={startAnalysis}
                        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      >
                        Start Analysis
                      </button>
                    </div>
                  </div>
                )}
                
                {isAnalyzing ? (
                  <div className={cn(
                    "flex items-center gap-3 rounded-lg p-4",
                    "bg-muted border border-border"
                  )}>
                    <AlertCircle className="text-muted-foreground" size={20} />
                    <p className="text-muted-foreground">Analyzing your resume...</p>
                  </div>
                ) : analysis ? (
                  <div ref={reportRef} className={cn(
                    "rounded-lg p-4",
                    "bg-muted border border-border"
                  )}>
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <PieChart className="text-foreground" size={20} />
                        <h2 className="text-lg font-semibold text-foreground">Analysis Report</h2>
                      </div>
                      <button
                        onClick={downloadReport}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      >
                        Download PDF
                      </button>
                    </div>
                    
                    <div ref={chartRef} className="w-full max-w-md mx-auto mb-8">
                      <Pie 
                        data={generatePieChartData(scores)}
                        options={{
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                color: 'hsl(var(--foreground))'
                              }
                            }
                          }
                        }}
                      />
                    </div>

                    <div className="prose dark:prose-invert max-w-none">
                      <ReactMarkdown>{analysis}</ReactMarkdown>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}