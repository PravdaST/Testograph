"use client";

interface SectionTransitionProps {
  variant?: "wave" | "curve" | "divider" | "gradient";
  position?: "top" | "bottom";
  color?: "primary" | "muted" | "accent";
  flip?: boolean;
}

export function SectionTransition({
  variant = "wave",
  position = "bottom",
  color = "muted",
  flip = false,
}: SectionTransitionProps) {
  const colorClasses = {
    primary: "fill-primary/10",
    muted: "fill-muted/30",
    accent: "fill-accent/10",
  };

  const renderWave = () => (
    <svg
      className={`w-full ${position === "top" ? "-mt-px" : "-mb-px"}`}
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      style={{
        transform: flip
          ? position === "top"
            ? "scaleX(-1) scaleY(-1)"
            : "scaleX(-1)"
          : position === "top"
          ? "scaleY(-1)"
          : "none",
      }}
    >
      <path
        d="M0,0 C300,80 600,80 900,40 C1050,20 1150,0 1200,0 L1200,120 L0,120 Z"
        className={colorClasses[color]}
        opacity="0.3"
      />
      <path
        d="M0,20 C300,100 600,60 900,80 C1050,90 1150,70 1200,60 L1200,120 L0,120 Z"
        className={colorClasses[color]}
        opacity="0.2"
      />
    </svg>
  );

  const renderCurve = () => (
    <svg
      className={`w-full ${position === "top" ? "-mt-px" : "-mb-px"}`}
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      style={{
        transform: position === "top" ? "scaleY(-1)" : "none",
      }}
    >
      <path
        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
        className={colorClasses[color]}
      />
    </svg>
  );

  const renderDivider = () => (
    <div className="relative py-12 md:py-16">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t-2 border-border/50" />
      </div>
      <div className="relative flex justify-center">
        <div className="bg-background px-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center backdrop-blur-sm border-2 border-border/50">
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGradient = () => (
    <div
      className={`h-24 md:h-32 w-full bg-gradient-to-b ${
        color === "primary"
          ? "from-primary/5 to-transparent"
          : color === "accent"
          ? "from-accent/5 to-transparent"
          : "from-muted/30 to-transparent"
      } ${position === "top" ? "rotate-180" : ""}`}
    />
  );

  switch (variant) {
    case "wave":
      return renderWave();
    case "curve":
      return renderCurve();
    case "divider":
      return renderDivider();
    case "gradient":
      return renderGradient();
    default:
      return renderWave();
  }
}

// Preset transition components for common use cases
export function WaveTransition({
  color = "muted",
  flip = false,
}: Pick<SectionTransitionProps, "color" | "flip">) {
  return <SectionTransition variant="wave" color={color} flip={flip} />;
}

export function CurveTransition({
  color = "muted",
}: Pick<SectionTransitionProps, "color">) {
  return <SectionTransition variant="curve" color={color} />;
}

export function DividerTransition() {
  return <SectionTransition variant="divider" />;
}

export function GradientTransition({
  color = "muted",
  position = "bottom",
}: Pick<SectionTransitionProps, "color" | "position">) {
  return <SectionTransition variant="gradient" color={color} position={position} />;
}
