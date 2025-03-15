"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Webcam from "react-webcam"
import { Lightbulb, WebcamIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/utils/db"
import { MockInterview } from "@/utils/schema"
import { eq } from "drizzle-orm"

function Interview() {
  const params = useParams()
  const [interviewData, setInterviewData] = useState(null)
  const [webCamEnabled, setWebCamEnabled] = useState(false)

  useEffect(() => {
    getInterviewDetails()
  }, [])

  const getInterviewDetails = async () => {
    if (!params.interviewId) return
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, params.interviewId))
    setInterviewData(result[0] || null)
  }

  return (
    <div className="container mx-auto my-10 max-w-4xl">
      <h1 className="font-bold text-3xl mb-6">Let's Get Started</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                <strong>Job Role:</strong> {interviewData?.jobPosition}
              </p>
              <p>
                <strong>Tech Stack:</strong> {interviewData?.jobDesc}
              </p>
              <p>
                <strong>Experience Required:</strong> {interviewData?.jobExperience} years
              </p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-700">
                <Lightbulb className="mr-2" />
                Information
              </CardTitle>
            </CardHeader>
            <CardContent className="text-yellow-700">
              <p className="mb-3">Please sit in a quiet place and record your answers.</p>
              <p>{process.env.NEXT_PUBLIC_INFORMATION}</p>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col items-center justify-center">
          {webCamEnabled ? (
            <Webcam
              onUserMedia={() => setWebCamEnabled(true)}
              onUserMediaError={() => setWebCamEnabled(false)}
              mirrored={true}
              className="rounded-lg shadow-lg"
              style={{
                height: 300,
                width: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <Card className="w-full">
              <CardContent className="flex flex-col items-center p-6">
                <WebcamIcon className="h-40 w-40 text-gray-400 mb-4" />
                <Button variant="primary" className="w-full" onClick={() => setWebCamEnabled(true)}>
                  Enable Web Cam and Microphone
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <div className="flex justify-end mt-8">
  <Link href={`/dashboard/interview/${params.interviewId}/start`}>
    <Button 
      className="py-2 px-4 rounded-lg transition-colors duration-200 font-medium text-sm bg-primary/10 hover:bg-primary/20 text-primary"
    >
      Start Interview
    </Button>
  </Link>
</div>
    </div>
  )
}

export default Interview