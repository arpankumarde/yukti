"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Edit, Check } from "lucide-react";
import { toast } from "sonner";
import { updateApplicationComments } from "@/actions/updateApplicationComments";

interface ApplicationDetailsClientProps {
  application: any;
  jid: string;
}

export function ApplicationDetailsClient({
  application,
  jid,
}: ApplicationDetailsClientProps) {
  const [comments, setComments] = useState(application?.comments || "");
  const [isEditingComments, setIsEditingComments] = useState(false);

  const handleSaveComments = async () => {
    try {
      const result = await updateApplicationComments(
        application.applicationId,
        comments
      );
      if (result.success) {
        toast.success("Comments updated successfully");
        setIsEditingComments(false);
      } else {
        toast.error("Failed to update comments");
      }
    } catch (error) {
      console.error("Error updating comments:", error);
      toast.error("Failed to update comments");
    }
  };

  return (
    <div>
      <p className="text-sm text-gray-500 mb-2 flex items-center justify-between">
        <span className="flex items-center">
          <MessageSquare className="h-4 w-4 mr-1" /> Comments
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditingComments(!isEditingComments)}
          className="h-8"
        >
          {isEditingComments ? (
            <>Cancel</>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-1" />
              {application.comments ? "Edit Comments" : "Add Comments"}
            </>
          )}
        </Button>
      </p>

      {isEditingComments ? (
        <div className="space-y-4">
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="min-h-[120px]"
            placeholder="Add your comments about this applicant..."
          />
          <div className="flex justify-end">
            <Button onClick={handleSaveComments} size="sm" className="gap-1">
              <Check className="h-4 w-4" />
              Save Comments
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm">
            {application.comments || "No comments added yet."}
          </p>
        </div>
      )}
    </div>
  );
}
