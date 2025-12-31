import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg" | "xl";
    text?: string;
    fullScreen?: boolean;
    className?: string;
}

export default function LoadingSpinner({
    size = "md",
    text,
    fullScreen = false,
    className = "",
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16",
    };

    const textSizeClasses = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
        xl: "text-lg",
    };

    const spinner = (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <Loader2 className={`${sizeClasses[size]} text-blue-400 animate-spin`} />
            {text && (
                <p className={`${textSizeClasses[size]} text-slate-400 font-medium`}>
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                {spinner}
            </div>
        );
    }

    return spinner;
}
