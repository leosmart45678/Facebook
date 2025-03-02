import * as React from "react"
import { Input } from "@/components/ui/input"
import { FacebookLogo } from "@/components/ui/facebook-logo"

export function SearchBar({ 
  placeholder = "Search...",
  onChange,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative flex items-center">
      <div className="absolute left-2 flex items-center justify-center">
        <FacebookLogo />
      </div>
      <Input
        type="search"
        placeholder={placeholder}
        className={`pl-12 h-10 ${className}`} 
        onChange={onChange}
        {...props}
      />
    </div>
  )
}