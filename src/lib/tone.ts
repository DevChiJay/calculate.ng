export type Tone = "info" | "success" | "warning" | "highlight" | "destructive";

/** Tailwind classes per semantic tone. Colour is always paired with a text label in the UI. */
export const toneText: Record<Tone, string> = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  highlight: "text-highlight",
  destructive: "text-destructive",
};

export const toneBg: Record<Tone, string> = {
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  highlight: "bg-highlight",
  destructive: "bg-destructive",
};
