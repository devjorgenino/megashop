/**
 * Input reutilizable con label, error, y accesibilidad.
 * - aria-invalid cuando hay error
 * - aria-describedby vincula input con mensaje de error
 * - role="alert" en errores para screen readers
 * - focus-visible en lugar de focus para consistencia
 */
import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id: providedId, ...props }, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors",
            "placeholder:text-gray-400",
            "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50",
            error &&
              "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20",
            className
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          aria-label={!label ? props.placeholder || undefined : undefined}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, type InputProps };
