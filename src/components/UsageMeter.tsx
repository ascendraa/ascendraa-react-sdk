import { ReactNode } from 'react';
import { useCheck } from '../hooks/useCheck';

export interface UsageMeterProps {
  featureIdOrEventName: string;
  className?: string;
  showBalance?: boolean;
  showUsage?: boolean;
  showIncludedUsage?: boolean;
  showUnlimited?: boolean;
  showNextReset?: boolean;
  loadingComponent?: ReactNode;
  errorComponent?: (error: Error) => ReactNode;
  children?: (data: {
    allowed: boolean;
    balance: number;
    usage: number;
    includedUsage: number;
    unlimited: boolean;
    nextResetAt: string | null;
    isLoading: boolean;
    error: Error | null;
  }) => ReactNode;
}

/**
 * Component to display usage information
 * Provides a flexible API for custom rendering
 */
export function UsageMeter({
  featureIdOrEventName,
  className = '',
  showBalance = true,
  showUsage = true,
  showIncludedUsage = false,
  showUnlimited = false,
  showNextReset = false,
  loadingComponent,
  errorComponent,
  children,
}: UsageMeterProps): React.JSX.Element {
  const { data, isLoading, error } = useCheck(featureIdOrEventName);

  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    return <div className={className}>Loading...</div>;
  }

  if (error) {
    if (errorComponent) {
      return <>{errorComponent(error)}</>;
    }
    return <div className={className}>Error: {error.message}</div>;
  }

  if (!data) {
    return <div className={className}>No data available</div>;
  }

  // Custom render function
  if (children) {
    return (
      <>
        {children({
          allowed: data.allowed,
          balance: data.balance,
          usage: data.usage,
          includedUsage: data.included_usage,
          unlimited: data.unlimited,
          nextResetAt: data.next_reset_at,
          isLoading: false,
          error: null,
        })}
      </>
    );
  }

  // Default rendering
  return (
    <div className={className}>
      {showUnlimited && data.unlimited && <div>Unlimited</div>}
      {!data.unlimited && (
        <>
          {showUsage && (
            <div>
              Usage: {data.usage} / {data.included_usage + data.balance}
            </div>
          )}
          {showBalance && <div>Balance: {data.balance}</div>}
          {showIncludedUsage && <div>Included: {data.included_usage}</div>}
          {showNextReset && data.next_reset_at && (
            <div>Next reset: {new Date(data.next_reset_at).toLocaleString()}</div>
          )}
          <div>Status: {data.allowed ? 'Allowed' : 'Not Allowed'}</div>
        </>
      )}
    </div>
  );
}

