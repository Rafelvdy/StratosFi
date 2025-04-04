import { Component, ErrorInfo, ReactNode } from 'react';
import { WalletError } from '@solana/wallet-adapter-base';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WalletErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Wallet error caught:', error);
    console.error('Error info:', errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      const isWalletError = this.state.error instanceof WalletError;
      
      return (
        <div className="p-4 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A]">
          <div className="text-red-400 mb-4">
            {isWalletError ? (
              <>
                <h3 className="text-lg font-semibold mb-2">Wallet Connection Error</h3>
                <p>{this.state.error?.message || 'Failed to connect to wallet'}</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
                <p>Please try again later</p>
              </>
            )}
          </div>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 bg-[#6C3CE9] hover:bg-[#8150FF] text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
} 