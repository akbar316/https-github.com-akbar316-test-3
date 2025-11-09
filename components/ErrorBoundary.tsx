import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ToolPageLayout } from './ToolPageLayout';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }
  
  handleReset = () => {
    this.setState({ hasError: false });
    // This is a simple reset. For routing errors, a navigation might be better.
    // window.location.hash = "/";
  }

  public render() {
    if (this.state.hasError) {
      return (
        <ToolPageLayout
          title="Error Loading Tool"
          description="Something went wrong."
        >
            <div className="text-center bg-brand-bg p-8 rounded-lg">
                <h2 className="text-2xl font-bold text-red-500 mb-4">Oops! This tool failed to load.</h2>
                <p className="text-brand-text-secondary mb-4">
                    There was an issue loading the component for this tool. This might be a temporary issue, or the tool may be under development. Please check your browser's console for more details.
                </p>
                <a href="/#" className="bg-brand-primary text-white px-6 py-2 rounded-md hover:bg-brand-primary-hover transition-colors">
                    Go to Homepage
                </a>
            </div>
        </ToolPageLayout>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
