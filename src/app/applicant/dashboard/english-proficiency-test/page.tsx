import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

function App() {
  return (
    <div className="min-h-screen bg-secondary/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-background rounded-lg shadow-lg overflow-hidden">
          {/* Heading */}
          <h1 className="text-2xl font-bold text-foreground p-6 border-b border-border">
            English Proficiency Test
          </h1>
          
          {/* Notification Content */}
          <div className="p-6">
            <div className={cn(
              "flex items-center gap-3 rounded-lg p-4",
              "bg-muted border border-border"
            )}>
              <AlertCircle className="text-muted-foreground" size={20} />
              <p className="text-muted-foreground">
                There are no English Proficiency Tests assigned for you. Please check again later.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;