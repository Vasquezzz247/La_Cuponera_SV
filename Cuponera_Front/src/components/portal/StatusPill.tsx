type Variant = "green" | "orange" | "red" | "blue" | "purple";

const MAP: Record<Variant, string> = {
    green: "bg-green-100 text-green-800",
    orange: "bg-orange-100 text-orange-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800",
};

type StatusPillProps = {
    children: React.ReactNode;
    variant?: Variant;
    className?: string;
};

export default function StatusPill({ children, variant = "green", className = "" }: StatusPillProps) {
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${MAP[variant]} ${className}`}>
            {children}
        </span>
    );
}