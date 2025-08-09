import React, { Component, ErrorInfo, ReactNode } from 'react';
import { autoAuthCleanup } from '@/lib/auto-auth-cleanup';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * ERROR BOUNDARY COMPONENT
 * Tự động handle và recover từ React errors
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state để hiển thị fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 React Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Auto-cleanup nếu error liên quan đến auth
    if (this.isAuthError(error)) {
      console.log('🔧 Auth error detected, triggering cleanup...');
      autoAuthCleanup.clearAllAuthData();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }

    // Auto-recovery cho các errors khác
    if (this.isRecoverableError(error)) {
      console.log('🔄 Recoverable error detected, attempting auto-recovery...');
      setTimeout(() => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
      }, 2000);
    }
  }

  private isAuthError(error: Error): boolean {
    return error.message.includes('auth') ||
           error.message.includes('token') ||
           error.message.includes('login') ||
           error.message.includes('Authentication');
  }

  private isRecoverableError(error: Error): boolean {
    return error.message.includes('Network') ||
           error.message.includes('fetch') ||
           error.message.includes('loading');
  }

  private handleRetry = () => {
    console.log('🔄 User triggered error recovery...');
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    console.log('🔄 Full page reload triggered...');
    window.location.reload();
  };

  private handleClearStorage = () => {
    console.log('🧹 Clear storage triggered...');
    autoAuthCleanup.clearAllAuthData();
    window.location.reload();
  };

  public render() {
    // DISABLED: Error boundary card removed to prevent unwanted dialogs in production
    // This fixes the production issue where error card appears during calls
    if (this.state.hasError) {
      console.log('🔧 Error boundary triggered but card display disabled:', this.state.error);
      // Silently recover - just render children normally without error card
      return this.props.children;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;