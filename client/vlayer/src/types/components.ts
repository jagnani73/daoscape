// Component-specific types for better type safety and organization

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface TabComponentProps extends BaseComponentProps {
  isActive?: boolean;
  onActivate?: () => void;
}

export interface CardComponentProps extends BaseComponentProps {
  variant?: "default" | "outlined" | "elevated";
  size?: "sm" | "md" | "lg";
}

export interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  badge?: string | number;
}

export interface AnalyticsMetric {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: "up" | "down" | "neutral";
  icon?: string;
}

export interface VerificationStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "active" | "completed" | "error";
  icon?: string;
  estimatedTime?: string;
}

export interface ProofVerificationState {
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  error?: string;
  progress: number; // 0-100
}
