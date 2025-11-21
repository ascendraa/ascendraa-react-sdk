# @ascendraa/react

Official React SDK for Ascendraa - usage-based billing with real-time updates. Built for React, Next.js, Remix, and Vite applications.

## Installation

```bash
npm install @ascendraa/react
# or
yarn add @ascendraa/react
# or
pnpm add @ascendraa/react
```

## Quick Start

### 1. Setup Provider

Wrap your app with `AscendraaProvider` to enable the SDK:

```tsx
import { AscendraaProvider } from '@ascendraa/react';

function App() {
  return (
    <AscendraaProvider
      apiUrl="https://api.ascendraa.com"
      publicKey="pk_test_1234567890abcdef"
      customerToken="cat_24h_abcd1234efgh5678ijkl90mnop1234qrst5678"
      enableRealtime={true}
      reverbConfig={{
        key: process.env.REACT_APP_REVERB_APP_KEY,
        wsHost: process.env.REACT_APP_REVERB_HOST || 'localhost',
        wsPort: parseInt(process.env.REACT_APP_REVERB_PORT || '8080', 10),
        wssPort: parseInt(process.env.REACT_APP_REVERB_PORT || '8080', 10),
        forceTLS: process.env.REACT_APP_REVERB_SCHEME === 'https',
      }}
    >
      <YourApp />
    </AscendraaProvider>
  );
}
```

### 2. Authentication

**Required Credentials:**

- **`publicKey`** (`pk_...`) - Your business public key (required for API routing and identification)
- **`customerToken`** (`cat_...`) - Customer token generated server-side (required for authentication)

**⚠️ Security Note:**

- **Never** expose your secret key (`sk_...`) in the browser
- Tokens are short-lived (hours) and should be refreshed server-side
- Generate customer tokens on your backend using your secret key

**Token Generation (Server-Side):**

```typescript
// On your backend
POST /api/v1/customers/generate_token
Headers: {
  Authorization: 'Bearer sk_your_secret_key',
  X-Public-Key: 'pk_your_public_key'
}

// Returns: { token: "cat_24h_..." }
```

### 3. Basic Usage

#### Check Feature Access

```tsx
import { useCheck } from '@ascendraa/react';

function FeatureCheck() {
  const { data, isLoading, error } = useCheck('api-calls');
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <p>Allowed: {data?.allowed ? 'Yes' : 'No'}</p>
      <p>Balance: {data?.balance}</p>
      <p>Usage: {data?.usage} / {data?.included_usage + data?.balance}</p>
    </div>
  );
}
```

#### Track Usage

```tsx
import { useTrack } from '@ascendraa/react';

function TrackUsage() {
  const { mutate, isPending } = useTrack();
  
  const handleApiCall = () => {
    mutate({
      featureId: 'api-calls',
      value: 1,
      metadata: { requestId: '123' }
    });
  };
  
  return (
    <button onClick={handleApiCall} disabled={isPending}>
      {isPending ? 'Tracking...' : 'Make API Call'}
    </button>
  );
}
```

#### Set Usage Directly

```tsx
import { useSetUsage } from '@ascendraa/react';

function SetUsage() {
  const { mutate, isPending } = useSetUsage();
  
  const handleSetUsage = () => {
    mutate({
      featureId: 'api-calls',
      value: 100
    });
  };
  
  return (
    <button onClick={handleSetUsage} disabled={isPending}>
      Set Usage to 100
    </button>
  );
}
```

#### Checkout Flow

```tsx
import { CheckoutButton } from '@ascendraa/react';

function Checkout() {
  return (
    <CheckoutButton
      planId="01ARZ3NDEKTSV4RRFFQ69G5FAV"
      amount={1000}
      email="customer@example.com"
      name="John Doe"
      currency="USD"
      callbackUrl="https://yourapp.com/success"
      onSuccess={(data) => {
        console.log('Checkout initiated:', data);
      }}
      onError={(error) => {
        console.error('Checkout failed:', error);
      }}
    >
      Subscribe Now
    </CheckoutButton>
  );
}
```

#### Real-time Updates

```tsx
import { useRealtime } from '@ascendraa/react';
import { useQueryClient } from '@tanstack/react-query';

function RealtimeUsage() {
  const queryClient = useQueryClient();
  const customerId = 'customer-123';
  
  const { isConnected, listen } = useRealtime(customerId, {
    enableRealtime: true,
    reverbConfig: {
      key: process.env.REACT_APP_REVERB_APP_KEY,
      wsHost: process.env.REACT_APP_REVERB_HOST,
      wsPort: 8080,
    },
    events: ['usage.updated', 'balance.updated'],
    onEvent: (event) => {
      console.log('Real-time event:', event.type, event.data);
    },
  });
  
  useEffect(() => {
    listen('usage.updated', (data) => {
      // Invalidate queries to refetch latest data
      queryClient.invalidateQueries(['ascendraa', 'check']);
    });
  }, [listen, queryClient]);
  
  return (
    <div>
      Status: {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
}
```

## API Reference

### Hooks

#### `useCheck(featureIdOrEventName, options?)`

Check feature access or event balance.

```tsx
const { data, isLoading, error } = useCheck('api-calls', {
  staleTime: 5000, // Cache for 5 seconds
  enabled: true,   // Enable/disable query
});
```

**Returns:**
- `data`: `{ allowed, balance, usage, included_usage, unlimited, interval, next_reset_at, code }`
- `isLoading`: Loading state
- `error`: Error object

#### `useTrack()`

Track usage events (mutation).

```tsx
const { mutate, isPending, error } = useTrack();

mutate({
  featureId: 'api-calls', // or eventName: 'api-calls'
  value: 1,
  metadata: { requestId: '123' }
});
```

#### `useSetUsage()`

Set usage directly (mutation).

```tsx
const { mutate, isPending } = useSetUsage();

mutate({
  featureId: 'api-calls',
  value: 100,
  metadata: { source: 'manual' }
});
```

#### `useGetUsage(featureIdOrEventName, options?)`

Get current usage (query).

```tsx
const { data, isLoading } = useGetUsage('api-calls');

// data: { usage, balance, included_usage }
```

#### `useCheckout()`

Create checkout session (mutation).

```tsx
const { mutate, isPending } = useCheckout();

mutate({
  planId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  amount: 1000,
  email: 'customer@example.com',
  currency: 'USD',
  callbackUrl: 'https://yourapp.com/success'
});
```

#### `useRevokeSubscription()`

Revoke/cancel subscription (mutation).

```tsx
const { mutate, isPending } = useRevokeSubscription();

mutate({
  subscriptionId: 'sub_123' // Optional - omitting revokes all
});
```

#### `useRealtime(customerId, options?)`

Subscribe to real-time updates.

```tsx
const { isConnected, listen, leaveChannel } = useRealtime(customerId, {
  enableRealtime: true,
  reverbConfig: { key, wsHost, wsPort, ... },
  events: ['usage.updated', 'balance.updated'],
  onEvent: (event) => { /* handle event */ }
});
```

### Components

#### `<AscendraaProvider>`

Main provider component. Required at the root of your app.

**Props:**
- `apiUrl` (string, required) - API base URL
- `publicKey` (string, required) - Business public key (`pk_...`)
- `customerToken` (string, required) - Customer token (`cat_...`)
- `enableRealtime` (boolean, optional) - Enable real-time updates
- `reverbConfig` (object, optional) - Reverb WebSocket configuration
- `cacheConfig` (object, optional) - TanStack Query cache configuration

#### `<UsageMeter>`

Display usage information with flexible rendering.

```tsx
<UsageMeter
  featureIdOrEventName="api-calls"
  showBalance={true}
  showUsage={true}
  showNextReset={true}
  loadingComponent={<Spinner />}
  errorComponent={(error) => <ErrorMsg error={error} />}
>
  {({ allowed, balance, usage, isLoading }) => (
    <div>
      {/* Custom rendering */}
    </div>
  )}
</UsageMeter>
```

#### `<CheckoutButton>`

Button component for checkout flow.

```tsx
<CheckoutButton
  planId="01ARZ3NDEKTSV4RRFFQ69G5FAV"
  amount={1000}
  email="customer@example.com"
  className="btn-primary"
  onSuccess={(data) => { /* handle success */ }}
  onError={(error) => { /* handle error */ }}
>
  Subscribe Now
</CheckoutButton>
```

## Real-time Events

When real-time is enabled, you can listen to these events:

- `usage.updated` - Usage changed
- `balance.updated` - Balance changed
- `subscription.updated` - Subscription status changed
- `transaction.completed` - Payment completed

## TypeScript Support

Full TypeScript support with exported types:

```tsx
import type {
  CheckResponse,
  TrackResponse,
  UsageResponse,
  CheckoutResponse,
  RealtimeEvent,
} from '@ascendraa/react';
```

## Error Handling

All hooks and components provide error states:

```tsx
const { data, error, isLoading } = useCheck('api-calls');

if (error) {
  // Handle error
  console.error('Error:', error.message);
}
```

## Caching

The SDK uses TanStack Query for intelligent caching:

- Automatic request deduplication
- Configurable cache times
- Automatic cache invalidation on mutations
- Optimistic updates support

## Examples

### Complete Example

```tsx
import { 
  AscendraaProvider, 
  useCheck, 
  useTrack, 
  UsageMeter,
  CheckoutButton 
} from '@ascendraa/react';

function App() {
  return (
    <AscendraaProvider
      apiUrl="https://api.ascendraa.com"
      publicKey={process.env.REACT_APP_ASCENDRAA_PUBLIC_KEY}
      customerToken={process.env.REACT_APP_ASCENDRAA_CUSTOMER_TOKEN}
    >
      <Dashboard />
    </AscendraaProvider>
  );
}

function Dashboard() {
  const { data: checkData } = useCheck('api-calls');
  const { mutate: track } = useTrack();
  
  return (
    <div>
      <UsageMeter featureIdOrEventName="api-calls" />
      
      <button onClick={() => track({ 
        featureId: 'api-calls', 
        value: 1 
      })}>
        Track Usage
      </button>
      
      <CheckoutButton
        planId="01ARZ3NDEKTSV4RRFFQ69G5FAV"
        amount={1000}
      >
        Upgrade Plan
      </CheckoutButton>
    </div>
  );
}
```

## Requirements

- React >= 18
- Node.js >= 18

## License

MIT

## Documentation

For complete documentation, API reference, and advanced usage examples, visit:

**[https://docs.ascendraa.com/react-sdk](https://docs.ascendraa.com/react-sdk)**

## Support

- GitHub: [https://github.com/ascendraa/ascendraa-react-sdk](https://github.com/ascendraa/ascendraa-react-sdk)
- Website: [https://ascendraa.com](https://ascendraa.com)

