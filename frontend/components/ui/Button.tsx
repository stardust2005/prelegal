import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
};

export default function Button({ variant = "secondary", className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`rounded-md px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
    />
  );
}
