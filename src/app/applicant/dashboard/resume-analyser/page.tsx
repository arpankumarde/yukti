"use client";

import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";
import { useState, useRef } from "react";
import { Toaster } from "sonner";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import {
  FileText, 
  AlertCircle, 
  Upload,
  Download,
  Loader2, 
  CheckCircle,
  FileWarning
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function ResumeAnalyzer() {
  const [fileResponse, setFileResponse] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [jobProfile, setJobProfile] = useState("");
  const [analysisType, setAnalysisType] = useState("normal");
  const [showAnalysisOptions, setShowAnalysisOptions] = useState(false);
  const [scores, setScores] = useState<{ atsScore: number; jobMatchScore?: number }>({ atsScore: 0 });
  const reportRef = useRef<HTMLDivElement>(null);

  const extractScores = (text: string) => {
    const atsMatch = text.match(/ATS Compatibility Score(?:\s*:\s*|\s+)(\d+)/);
    const jobMatch = text.match(/Job Match Score(?:\s*:\s*|\s+)(\d+)/);
    
    return {
      atsScore: atsMatch ? parseInt(atsMatch[1], 10) : 0,
      ...(jobMatch && { jobMatchScore: parseInt(jobMatch[1], 10) })
    };
  };

  const analyzeResume = async (text: string) => {
    if (analysisType === "jobMatch" && !jobProfile.trim()) {
      toast.error('Please enter a job profile first');
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
      toast.success('Resume analysis complete!');
    } catch (error) {
      console.error('Resume analysis error:', error instanceof Error ? error.message : 'Unknown error occurred');
      toast.error(error instanceof Error ? error.message : 'Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadReport = async () => {
    if (!analysis || !reportRef.current) return;

    try {
      const pdf = new jsPDF();
      pdf.setFontSize(20);
      pdf.text("ATS Analysis Report", 20, 20);
      
      // Add score as a highlight
      const score = scores.atsScore || 0;
      pdf.setFillColor(240, 240, 240);
      pdf.roundedRect(20, 30, 40, 20, 3, 3, 'F');
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Score: ${score}%`, 25, 43);
      
      // Add analysis text
      pdf.setFontSize(12);
      pdf.setTextColor(50, 50, 50);
      const lines = pdf.splitTextToSize(analysis.replace(/[#*]/g, ''), 170);
      pdf.text(lines, 20, 60);
      
      pdf.save('ats-analysis-report.pdf');
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error instanceof Error ? error.message : 'Unknown error occurred');
      toast.error('Failed to generate PDF report. Please try again.');
    }
  };

  const handleFileUpload = (response: any) => {
    setIsUploading(true);
    try {
      const fileResponse = JSON.parse(response);
      setFileResponse(fileResponse);
      setShowAnalysisOptions(true);
      setAnalysis("");
      setScores({ atsScore: 0 });
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('File upload error:', error instanceof Error ? error.message : 'Unknown error occurred');
      toast.error('Failed to process the uploaded file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const startAnalysis = () => {
    if (!fileResponse?.parsedText) {
      toast.error('No resume text found. Please upload a PDF file first.');
      return;
    }
    analyzeResume(fileResponse.parsedText);
  };

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <Card className="border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">Resume Analyzer</CardTitle>
              <CardDescription>Upload your resume to get ATS compatibility analysis</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!fileResponse ? (
            <Card className="border border-dashed bg-muted/20">
              <CardContent className="p-6 flex flex-col items-center justify-center">
                {isUploading ? (
                  <div className="py-12 flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Uploading and processing your file...</p>
                  </div>
                ) : (
                  <>
                    <div className="p-4 rounded-full bg-primary/10 mb-4">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Upload your resume</h3>
                    <p className="text-sm text-muted-foreground mb-6 text-center">
                      Upload your resume in PDF format to analyze its compatibility with ATS systems
                    </p>
                    <div className="w-full">
                      <FilePond
                        server={{
                          process: {
                            url: "/api/upload",
                            method: "POST",
                            withCredentials: false,
                            onload: handleFileUpload,
                            onerror: (response) => {
                              toast.error('Failed to upload file. Please try again.');
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
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-md flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    Extracted Text
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/30 rounded-md p-4 max-h-[200px] overflow-y-auto text-sm text-muted-foreground">
                    {/* @ts-expect-error - parsedText type issue */}
                    <pre className="whitespace-pre-wrap font-sans">{fileResponse.parsedText}</pre>
                  </div>
                </CardContent>
              </Card>

              {showAnalysisOptions && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-md">Analysis Options</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs
                      defaultValue="normal"
                      value={analysisType}
                      onValueChange={setAnalysisType}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="normal">Standard ATS Check</TabsTrigger>
                        <TabsTrigger value="jobMatch">Job Profile Match</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="normal" className="mt-0 space-y-4">
                        <div className="flex items-center gap-2 px-4 py-3 bg-primary/10 rounded-md">
                          <AlertCircle className="h-5 w-5 text-primary" />
                          <p className="text-sm">Standard ATS compatibility check will analyze how well your resume performs with typical ATS systems.</p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="jobMatch" className="mt-0 space-y-4">
                        <div className="flex items-center gap-2 px-4 py-3 bg-primary/10 rounded-md">
                          <AlertCircle className="h-5 w-5 text-primary" />
                          <p className="text-sm">Job match will analyze how well your resume matches the specific job description.</p>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="jobProfile" className="text-sm font-medium">
                            Job Description
                          </label>
                          <Textarea
                            id="jobProfile"
                            placeholder="Paste the job description here..."
                            value={jobProfile}
                            onChange={(e) => setJobProfile(e.target.value)}
                            className="resize-none min-h-[120px]"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    <Button 
                      className="w-full mt-4" 
                      onClick={startAnalysis} 
                      disabled={isAnalyzing || (analysisType === "jobMatch" && !jobProfile.trim())}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        'Analyze Resume'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {isAnalyzing ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center gap-4 py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-muted-foreground">Analyzing your resume...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : analysis ? (
                <Card ref={reportRef}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Analysis Results</CardTitle>
                      <Badge variant={scores.atsScore > 70 ? "success" : scores.atsScore > 50 ? "warning" : "destructive"} className="text-md px-3 py-1">
                        Score: {scores.atsScore}%
                      </Badge>
                    </div>
                    <CardDescription>
                      {scores.atsScore > 70 
                        ? "Great job! Your resume is well-optimized for ATS systems." 
                        : scores.atsScore > 50 
                          ? "Your resume needs some improvements to better pass ATS systems."
                          : "Your resume needs significant improvements to pass ATS systems."}
                    </CardDescription>
                  </CardHeader>

                  <Separator />
                  
                  <CardContent className="pt-6">
                    <div className="prose max-w-none dark:prose-invert">
                      <ReactMarkdown>{analysis}</ReactMarkdown>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-end pt-2">
                    <Button variant="outline" onClick={downloadReport} className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download Report
                    </Button>
                  </CardFooter>
                </Card>
              ) : null}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t px-6 py-4 bg-muted/20">
          <p className="text-xs text-muted-foreground">
            Powered by Yukti AI
          </p>
          <div className="flex items-center gap-2">
            {fileResponse && (
              <Badge variant="outline" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                PDF Uploaded
              </Badge>
            )}
            {analysis && (
              <Badge variant="outline" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                Analysis Complete
              </Badge>
            )}
          </div>
        </CardFooter>
      </Card>
      <Toaster position="top-center" richColors />
    </div>
  );
}