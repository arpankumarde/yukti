"use client"
import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Textarea } from '@/components/ui/textarea'
import { chatSession } from '@/utils/OpenAiModel'
import { db } from '@/utils/db'
import { MockInterview } from '@/utils/schema' 
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment/moment'
import { useRouter } from 'next/navigation'

const AddNewInterview = () => {
    const [openDialog, setOpenDialog] = useState(false)
    const [jobPosition, setJobPosition] = useState('');
    const [jobDecs, setJobDesc] = useState('');
    const [jobExperience, setJobExperience] = useState('');
    const [loading, setLoading] = useState(false)
    const [jsonResponse, setJsonResponse] = useState()
    const router = useRouter()

    const onSubmit = async (e) => {
        try {
            setLoading(true)
            e.preventDefault()
    
            const inputPrompt = "Job Position: " + jobPosition + " Job Description: " + jobDecs + " Job Experience: " + jobExperience + " Years , based on  this information give me " + process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT + " interview questions alongside with its answers in JSON Format as Fields , you are STRICTLY instructed to respond with only a JSON without any additional TEXT or INFO , JUST A JSON WITH FIELD OF QUESTIONS AND ANSWERS"
            
            const result = await chatSession.sendMessage(inputPrompt)
            // Parse the response correctly for OpenAI format
            let MockJsonResp
            try {
                MockJsonResp = JSON.parse(result)
            } catch {
                // If direct parsing fails, try cleaning the response
                MockJsonResp = JSON.parse(result.replace(/```json|```/g, '').trim())
            }
            
            console.log("Parsed Response:", MockJsonResp)
            setJsonResponse(JSON.stringify(MockJsonResp))
    
            if (MockJsonResp) {
                const resp = await db.insert(MockInterview)
                    .values({
                        mockId: uuidv4(),
                        jsonMockResp: JSON.stringify(MockJsonResp),
                        jobPosition: jobPosition || '',
                        jobDesc: jobDecs || '',
                        jobExperience: jobExperience || '',
                        createdBy: 'anonymous',
                        createdAt: moment().format('DD-MM-YYYY')
                    }).returning({mockId: MockInterview.mockId})
                
                console.log("Inserted ID:", resp)
                if(resp && resp[0]?.mockId) {
                    setOpenDialog(false)
                    router.push(`/dashboard/interview/${resp[0].mockId}`)
                }
            } else {
                throw new Error("No valid response generated")
            }
        } catch (error) {
            console.error("Error:", error)
            alert("Error generating interview questions. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className='p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all border-dashed'
                onClick={() => setOpenDialog(true)}>
                <h2 className='font-bold text-lg text-center'> + Add New</h2>
            </div>
            <Dialog open={openDialog} >
                <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                        <DialogTitle className='text-2xl'>Tell Us More About Your Job Interviewing</DialogTitle>
                        <DialogDescription>
                            Add Details About Your Interviewing Process
                        </DialogDescription>
                        <form onSubmit={onSubmit}>
                            <div className='mt-7 my-3'>
                                <label>Job Role/Job Position</label>
                                <Input placeholder="Ex. Backend Developer" required
                                    onChange={(event) => setJobPosition(event.target.value)} />
                            </div>

                            <div className='my-3'>
                                <label>Job Description / Tech Stack</label>
                                <Textarea placeholder="Ex. React , Next Js , Springboot " required
                                    onChange={(event) => setJobDesc(event.target.value)} />
                            </div>

                            <div className='my-3'>
                                <label>Years Of Experience</label>
                                <Input placeholder="Ex. 3" type="number" required
                                    onChange={(event) => setJobExperience(event.target.value)} />
                            </div>

                            <div className='flex gap-5 justify-end'>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    onClick={() => setOpenDialog(false)}
                                    className="py-2 px-4 rounded-lg transition-colors duration-200 font-medium text-sm bg-primary/10 hover:bg-primary/20 text-primary"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="py-2 px-4 rounded-lg transition-colors duration-200 font-medium text-sm bg-primary/10 hover:bg-primary/20 text-primary"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Generating from AI...
                                        </span>
                                    ) : (
                                        'Start Interview'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddNewInterview