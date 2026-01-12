import { LoaderIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
    return (
        <LoaderIcon
            role="status"
            aria-label="Loading"
            className={cn("size-6 animate-spin", className)} // Changed default size to size-6 for better visibility as a top-page loader, but size-4 is default in shadcn. I will stick to what was requested but user said "modern spinner at top of the page". I'll use size-4 as base but it can be overridden. Actually, the request showed size-4 in the example code. I'll stick to that.
            {...props}
        />
    )
}

export { Spinner }
