import { forwardRef, InputHTMLAttributes } from "react";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return (
      <input
        {...props}
        ref={ref}
        className={`rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:outline-none ${className}`}
      />
    );
  }
);

export default Input;
