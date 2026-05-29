import React from "react";
import { cn } from "./utils";
import { Loader2, AlertCircle, FileText, AlertTriangle } from "lucide-react";
import { Button } from "./button";

// ===== Loading State =====

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "Carregando...", className }: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 space-y-4", className)}>
      <Loader2 className="w-10 h-10 animate-spin text-[#1877F2]" />
      <p className="text-sm font-medium text-gray-500">{message}</p>
    </div>
  );
}

// ===== Empty State =====

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: "default" | "accent" | "outline" | "ghost";
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4", className)}>
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        {icon || <FileText className="w-8 h-8 text-gray-400" />}
      </div>
      <h3 className="text-lg font-semibold text-[#111827] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 text-center max-w-sm mb-6">{description}</p>
      )}
      {action && (
        action.href ? (
          <a href={action.href}>
            <Button variant={action.variant || "default"} size="sm">{action.label}</Button>
          </a>
        ) : (
          <Button variant={action.variant || "default"} size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}

// ===== Error State =====

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Algo deu errado",
  message = "Ocorreu um erro inesperado. Tente novamente.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4", className)}>
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-[#111827] mb-1">{title}</h3>
      <p className="text-sm text-gray-500 text-center max-w-sm mb-6">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

// ===== Inline Error =====

interface InlineErrorProps {
  message: string;
  className?: string;
  onDismiss?: () => void;
}

export function InlineError({ message, className, onDismiss }: InlineErrorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm",
        className
      )}
    >
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 transition-colors shrink-0"
        >
          ×
        </button>
      )}
    </div>
  );
}
