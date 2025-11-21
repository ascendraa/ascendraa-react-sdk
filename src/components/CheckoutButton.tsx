import { ReactNode, useState } from 'react';
import { useCheckout } from '../hooks/useCheckout';

export interface CheckoutButtonProps {
  planId: string;
  amount: number;
  email?: string;
  name?: string;
  phone?: string;
  currency?: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
  className?: string;
  disabled?: boolean;
  children?: ReactNode;
  onSuccess?: (data: { authorizationUrl: string; reference: string; customerId: string }) => void;
  onError?: (error: Error) => void;
}

/**
 * Button component to initiate checkout flow
 * Automatically redirects to authorization URL on success
 */
export function CheckoutButton({
  planId,
  amount,
  email,
  name,
  phone,
  currency,
  callbackUrl,
  metadata,
  className = '',
  disabled = false,
  children,
  onSuccess,
  onError,
}: CheckoutButtonProps): React.JSX.Element {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const checkout = useCheckout();

  const handleClick = async (): Promise<void> => {
    if (disabled || checkout.isPending || isRedirecting) {
      return;
    }

    try {
      setIsRedirecting(true);
      const result = await checkout.mutateAsync({
        planId,
        amount,
        email,
        name,
        phone,
        currency,
        callbackUrl,
        metadata,
      });

      if (onSuccess) {
        onSuccess({
          authorizationUrl: result.authorization_url,
          reference: result.reference,
          customerId: result.customer_id,
        });
      }

      // Automatically redirect to authorization URL
      if (result.authorization_url && typeof window !== 'undefined') {
        window.location.href = result.authorization_url;
      }
    } catch (error) {
      setIsRedirecting(false);
      if (onError) {
        onError(error instanceof Error ? error : new Error('Checkout failed'));
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || checkout.isPending || isRedirecting}
      className={className}
    >
      {checkout.isPending || isRedirecting ? 'Processing...' : children || 'Checkout'}
    </button>
  );
}

