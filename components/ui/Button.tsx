// components/ui/Button.tsx
"use client";

import { forwardRef, ReactElement } from "react";
import clsx from "clsx";

export type ButtonProps = {
  /** Fargeskjema */
  variant?: "primary" | "secondary" | "neutral" | "danger";
  /** Rektangel (default) eller sirkel */
  shape?: "rect" | "round";
  /** Preset-høyder & paddings */
  size?: "sm" | "md" | "lg";
  /** Valgfritt ikon som vises før teksten */
  icon?: ReactElement;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      shape = "rect",
      size = "md",
      icon,
      className,
      children,
      ...props
    },
    ref
  ) => {
    /*  Tailwind-utility-maps  */
    const base =
      "inline-flex items-center justify-center font-semibold gap-2 transition active:scale-[.98] focus:outline-none disabled:opacity-50";

    const shapes = {
      rect: "rounded-xl",
      round: "rounded-full aspect-square",
    };

    const sizes = {
      sm: "h-10 px-4 text-sm",
      md: "h-12 px-5 text-base",
      lg: "h-14 px-6 text-lg",
    };

    const variants = {
      primary: "bg-primary text-white hover:bg-primary-dark",
      secondary: "bg-white text-primary ring-1 ring-primary hover:bg-primary/10",
      neutral: "bg-neutral-700 text-white hover:bg-neutral-600",
      danger: "bg-red-600 text-white hover:bg-red-700",
    };

    return (
      <button
        ref={ref}
        className={clsx(base, shapes[shape], sizes[size], variants[variant], className)}
        {...props}
      >
        {icon}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;