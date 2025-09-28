import React from "react";

/**
 * GradientText renders a left→right progress fill *inside* the text.
 * Uses two layered backgrounds:
 * 1) Rainbow gradient sized to `progress%` width
 * 2) Neutral backdrop at 100% width
 *
 * This avoids tricky color-stop math and keeps the edge crisp across glyphs.
 */
export default function GradientText({
  children,
  progress = 0, // 0..100
  gradientColors = "red, orange, yellow, green, blue, indigo, violet",
  neutralColor = "#9ca3af",
  className = "",
  style = {},
  animate = true,
  ...props
}) {
    const clamped = Math.min(100, Math.max(0, progress));

    // Use vivid rainbow stops and solid white background for crispness
    const vividGradient = "#FF3B30, #FF9500, #FFCC00, #34C759, #5AC8FA, #007AFF, #AF52DE";
  const neutralBg = "#9ca3af"; // Tailwind gray-400
    const textStyle = {
      backgroundImage: `linear-gradient(90deg, ${vividGradient}), linear-gradient(90deg, ${neutralBg}, ${neutralBg})`,
      backgroundSize: `${clamped}% 100%, 100% 100%`,
      backgroundRepeat: 'no-repeat, no-repeat',
      backgroundPosition: '0 0, 0 0',
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      WebkitTextFillColor: "transparent",
      color: "transparent",
      display: "inline-block",
      lineHeight: 1.15,
      position: "relative",
      zIndex: 1,
      filter: 'saturate(1.25) contrast(1.15)', // boost saturation and contrast
      backgroundColor: '#fff', // solid background for crisp gradient
      transition: animate ? "background-size 320ms cubic-bezier(.2,.9,.2,1)" : undefined,
      ...style,
    };

    return (
      <span className={className} style={textStyle} {...props}>
        {children}
      </span>
    );
}