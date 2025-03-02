
import React from "react";
import { Button } from "@/components/ui/button";

interface ResponsiveFormProps {
  onSubmit: (data: any) => void;
}

export function ResponsiveForm({ onSubmit }: ResponsiveFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic
    onSubmit({});
  };

  return (
    <div className="container-responsive vh-spacing">
      <h2 className="text-2xl font-bold mb-[3vh]">Responsive Form</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-[3vh]">
          <label htmlFor="name" className="block mb-[1vh]">Name</label>
          <input 
            type="text" 
            id="name" 
            className="input-responsive border rounded" 
            placeholder="Enter your name"
          />
        </div>
        
        <div className="mb-[3vh]">
          <label htmlFor="email" className="block mb-[1vh]">Email</label>
          <input 
            type="email" 
            id="email" 
            className="input-responsive border rounded" 
            placeholder="Enter your email"
          />
        </div>
        
        <div className="flex-center">
          <Button 
            type="submit"
            className="button-responsive bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
}
