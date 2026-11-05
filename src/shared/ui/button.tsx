import type { ComponentProps } from "react";
import { cn } from "cn";

const VARIANTS = {
  primary:
    "bg-primary text-primary-foreground font-semibold hover:brightness-110 active:brightness-95",
  destructive:
    "bg-destructive text-primary-foreground font-semibold hover:brightness-110 active:brightness-95",
  outline: "border border-input text-foreground hover:bg-accent",
  link: "text-muted-foreground underline underline-offset-4 hover:text-foreground",
} as const;

interface ButtonProps extends ComponentProps<"button"> {
  variant?: keyof typeof VARIANTS;
}

export function Button({ variant = "primary", type = "button", className, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-12 min-w-12 cursor-pointer items-center justify-center gap-2 rounded-md px-4 text-base transition-[filter,background-color,color] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
