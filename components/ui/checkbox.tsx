import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    return (
      <div className={cn("relative flex items-center justify-center w-4 h-4 shrink-0 rounded-sm border border-slate-900 shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50", className)}>
         <input
          type="checkbox"
          className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          ref={ref}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
        <div className="pointer-events-none text-slate-50 opacity-0 peer-checked:bg-slate-900 peer-checked:opacity-100 absolute inset-0 rounded-sm flex items-center justify-center">
          <Check className="h-3 w-3" />
        </div>
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
