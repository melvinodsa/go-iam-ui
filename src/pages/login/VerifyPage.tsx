import { Progress } from "@/components/ui/progress"
import { useAuthState } from "@/hooks/auth"
import { use, useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom";


export default function VerifyPage() {
    const state = useAuthState();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [progress, setProgress] = useState(0)
    useEffect(() => {
        const timer = setTimeout(() => setProgress(66), 500)
        return () => clearTimeout(timer)
    }, [])
    useEffect(() => {
        if (!state.verifing) {
            setProgress(100)
        }
    }, [state.verifing])
    useEffect(() => {
        if (state.verified) {
            navigate('/', { replace: true });
        }
    }, [state.verified])
    useEffect(() => {
        state.verify(params.get("code") || "")
    }, [])
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <Progress value={progress} className="w-[60%]" />
            <span className="text-muted-foreground">Verifying your account...</span>
        </div>
    )
}
