"use client"

import { uploadFile } from "@/lib/uploadFile"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { getCookie } from "cookies-next"
import { Input } from "@/components/ui/input"
import { Upload, FileText, Eye } from "lucide-react"
import { Turnstile } from "@/components/ui/turnstile" // Import Turnstile component

interface AnalysisResult {
  score: string
  strength: string | string[]
  weakness: string | string[]
  keywords: string[]
}

const ApplyJobPage = ({ params }: { params: Promise<{ jid: string }> }) => {
  const jobId = React.use(params).jid
  const [resume, setResume] = useState<string>("")
  const [coverLetter, setCoverLetter] = useState<string>("")
  const [fileName, setFileName] = useState<string>("")
  const [coverLetterFileName, setCoverLetterFileName] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null)
  const router = useRouter()
  const [turnstileToken, setTurnstileToken] = useState<string>("") // Add state for turnstile token

  const analyzeResume = async (text: string) => {
    try {
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          jobProfile: "General ATS Analysis",
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Raw API Response:", data)
      
      if (!data?.choices?.[0]?.message?.content) {
        throw new Error("Invalid response format from analysis API")
      }
      
      let analysisResult = data.choices[0].message.content
      console.log("Message Content:", analysisResult)

      // Clean up the JSON string
      analysisResult = analysisResult
        .replace(/^[\s\S]*?```json\s*/, "")  // Remove everything before JSON
        .replace(/\s*```[\s\S]*$/, "")       // Remove everything after JSON
        .trim()

      console.log("Cleaned Analysis Result:", analysisResult)

      try {
        const parsedAnalysis = JSON.parse(analysisResult)
        
        // Format and normalize the data structure
        const formattedAnalysis: AnalysisResult = {
          score: parsedAnalysis.score?.toString() || "0",
          strength: parsedAnalysis.strength || "",
          weakness: parsedAnalysis.weakness || "",
          keywords: Array.isArray(parsedAnalysis.keywords) ? 
            parsedAnalysis.keywords : 
            (parsedAnalysis.keywords ? [parsedAnalysis.keywords] : [])
        }
        
        console.log("Successfully Formatted Analysis:", formattedAnalysis)
        return formattedAnalysis
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError)
        console.error("Failed JSON string:", analysisResult)
        throw new Error("Failed to parse analysis results")
      }
    } catch (error) {
      console.error("Resume analysis error:", error)
      throw error
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes("pdf")) {
      toast.error("Please upload a PDF file")
      return
    }

    setIsUploading(true)
    setIsAnalyzing(true)
    setFileName(file.name)

    try {
      console.log("Starting parallel file processing...")

      const [fileUploadPromise, fileAnalysisPromise] = await Promise.all([
        uploadFile({
          file,
          fileExt: "pdf",
          folderPath: "yuktiRes",
        }),

        (async () => {
          const formData = new FormData()
          formData.append("filepond", "")
          formData.append("filepond", file)

          console.log("Uploading file for analysis...")
          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          if (!uploadResponse.ok) {
            console.error("Upload Response:", await uploadResponse.json())
            throw new Error("Failed to upload file for analysis")
          }

          const uploadData = await uploadResponse.json()
          console.log("Upload Response:", uploadData)

          if (!uploadData.parsedText) {
            throw new Error("No parsed text received from upload")
          }

          return await analyzeResume(uploadData.parsedText)
        })()
      ])

      if (fileUploadPromise) {
        setResume(fileUploadPromise)
        console.log("AWS Upload Success - URL:", fileUploadPromise)
      }

      if (fileAnalysisPromise) {
        setAnalysisResults(fileAnalysisPromise)
        console.log("Analysis Results:", fileAnalysisPromise)
      }

      toast.success("Resume processed successfully")
    } catch (error) {
      console.error("Error processing resume:", error)
      toast.error("Failed to process resume")
    } finally {
      setIsUploading(false)
      setIsAnalyzing(false)
    }
  }

  const handleCoverLetterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes("pdf")) {
      toast.error("Please upload a PDF file for cover letter")
      return
    }

    try {
      setCoverLetterFileName(file.name)
      const awsUrl = await uploadFile({
        file,
        fileExt: "pdf",
        folderPath: "coverLetters",
      })
      setCoverLetter(awsUrl)
      toast.success("Cover letter uploaded successfully")
    } catch (error) {
      console.error("Cover letter upload error:", error)
      toast.error("Failed to upload cover letter")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resume) {
      toast.error("Please upload your resume first");
      return;
    }

    // Check if turnstile token exists
    if (!turnstileToken) {
      toast.error("Please complete the CAPTCHA verification");
      return;
    }

    const applicantCookie = getCookie("ykapptoken");
    const applicant = applicantCookie ? JSON.parse(applicantCookie as string) : null;

    if (!applicant) {
      toast.error("You must be logged in to apply for jobs");
      return;
    }

    try {
      // Format and clean up the data
      let cleanScore = null;
      if (analysisResults?.score) {
        // Remove % if present and convert to number
        const scoreStr = analysisResults.score.toString().replace(/%/g, '');
        cleanScore = !isNaN(Number(scoreStr)) ? Number(scoreStr) : null;
      }

      // Format strength (handle both string and array cases)
      const strength = analysisResults?.strength ? 
        (typeof analysisResults.strength === 'string' ? analysisResults.strength : 
         Array.isArray(analysisResults.strength) ? analysisResults.strength.join(", ") : null) : 
        null;
      
      // Format weakness (handle both string and array cases)
      const weakness = analysisResults?.weakness ? 
        (typeof analysisResults.weakness === 'string' ? analysisResults.weakness : 
         Array.isArray(analysisResults.weakness) ? analysisResults.weakness.join(", ") : null) : 
        null;
      
      // Ensure keywords is always a valid array
      const keywords = analysisResults?.keywords && Array.isArray(analysisResults.keywords) 
        ? analysisResults.keywords.filter(k => typeof k === 'string' && k.trim() !== '')
        : [];
      
      // Log the data we're about to send
      console.log("Submitting application with data:", {
        jobId, applicantId: applicant.applicantId, 
        score: cleanScore, strength, weakness, keywords
      });

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: jobId,
          applicantId: applicant.applicantId,
          status: "PENDING",
          resume: resume,
          coverLetter: coverLetter || null,
          score: cleanScore,
          strength: strength,
          weakness: weakness,
          keywords: keywords,
          turnstileToken: turnstileToken, // Include turnstile token in the request
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Application submission error:", errorData);
        throw new Error("Failed to submit application");
      }

      toast.success("Application submitted successfully");
      router.push("/applicant/dashboard/applied-jobs");
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application");
    }
  };

  const handlePreview = () => {
    if (resume) {
      window.open(resume, "_blank")
    }
  }

  const handleCoverLetterPreview = () => {
    if (coverLetter) {
      window.open(coverLetter, "_blank")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-xl">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Submit Job Application</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  {isAnalyzing
                    ? "Analyzing resume..."
                    : "Upload your resume, cover letter (optional), and submit your application"}
                </p>
              </div>

              <div className="space-y-4">
                {/* Resume Upload */}
                <div className="grid gap-2">
                  <Label htmlFor="resume">Resume Upload</Label>
                  <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-lg">
                    {resume ? (
                      <FileText className="w-8 h-8 text-primary" />
                    ) : (
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    )}
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploading || isAnalyzing}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUploading || isAnalyzing}
                      onClick={() => {
                        document.getElementById("resume")?.click()
                      }}
                    >
                      {isUploading || isAnalyzing
                        ? "Processing..."
                        : resume
                        ? "Change Resume"
                        : "Select Resume"}
                    </Button>
                    {resume && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{fileName}</p>
                        <Button type="button" variant="ghost" size="sm" onClick={handlePreview}>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {isAnalyzing
                        ? "Analyzing resume..."
                        : resume
                        ? "Resume uploaded successfully"
                        : "Upload your resume (PDF only)"}
                    </p>
                  </div>
                </div>

                {/* Cover Letter Upload */}
                <div className="grid gap-2">
                  <Label htmlFor="coverLetter">Cover Letter Upload (Optional)</Label>
                  <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-lg">
                    {coverLetter ? (
                      <FileText className="w-8 h-8 text-primary" />
                    ) : (
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    )}
                    <Input
                      id="coverLetter"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleCoverLetterUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        document.getElementById("coverLetter")?.click()
                      }}
                    >
                      {coverLetter ? "Change Cover Letter" : "Select Cover Letter"}
                    </Button>
                    {coverLetter && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{coverLetterFileName}</p>
                        <Button type="button" variant="ghost" size="sm" onClick={handleCoverLetterPreview}>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {coverLetter
                        ? "Cover letter uploaded successfully"
                        : "Upload your cover letter (PDF only)"}
                    </p>
                  </div>
                </div>

                {/* Add Turnstile CAPTCHA component */}
                <div className="grid gap-2">
                  <Label>CAPTCHA Verification</Label>
                  <div className="flex justify-center">
                    <Turnstile
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                      onVerify={(token) => setTurnstileToken(token)}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!resume || isUploading || isAnalyzing || !turnstileToken}
              >
                Submit Application
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ApplyJobPage