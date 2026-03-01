import type { SeverityLevel } from '../../types/api'

interface RiskRadialMeterProps {
    score: number // 0 to 10
    severity: SeverityLevel | string
}

export const RiskRadialMeter = ({ score, severity }: RiskRadialMeterProps) => {
    const percentage = Math.min(Math.max(score * 10, 0), 100)

    // Choose color based on severity
    let colorClass = "text-emerald-500"
    if (severity === "MODERATE") colorClass = "text-amber-500"
    else if (severity === "SEVERE") colorClass = "text-rose-500"
    else if (severity === "CONTRAINDICATED") colorClass = "text-slate-900"

    const radius = 40
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center relative">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-4 self-start w-full text-center">Peak Risk Severity</h3>
            <div className="relative flex items-center justify-center w-32 h-32">
                {/* Background Circle */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-slate-100"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className={`${colorClass} transition-all duration-1000 ease-out`}
                    />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                    <span className={`text-3xl font-black tracking-tighter ${colorClass}`}>
                        {score.toFixed(1)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">SCORE</span>
                </div>
            </div>
            <div className="mt-4 text-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-slate-50 border ${colorClass} shadow-sm`}>
                    {severity}
                </span>
            </div>
        </div>
    )
}
