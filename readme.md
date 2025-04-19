# Easy Consent (Beta)

A lightweight consent management solution for Google Analytics and related services. This is a beta version and should be used with caution.

## ⚠️ Important Notice

This software is provided "as is" and is currently in beta testing. The author makes no warranties, express or implied, and hereby disclaims all implied warranties, including any warranty of merchantability and warranty of fitness for a particular purpose. The author shall not be liable for any direct, indirect, incidental, special, exemplary, or consequential damages (including, but not limited to, procurement of substitute goods or services; loss of use, data, or profits; or business interruption) however caused and on any theory of liability, whether in contract, strict liability, or tort (including negligence or otherwise) arising in any way out of the use of this software.

## Features

- Simple integration with Google Analytics
- Cookie-based consent storage
- Secure cookie handling with SameSite=Lax and Secure flags
- Event-based consent updates
- Default consent state management
- Automatic Google Analytics initialization
- Full TypeScript support with type definitions
- Bulk consent management
- Enhanced event system with timestamps
- New user detection
- Automatic page view tracking

## TypeScript Support

This package includes full TypeScript support with the following type definitions:

```typescript
// Consent mode can be either 'granted' or 'denied'
type Mode = "denied" | "granted"

// Complete consent configuration interface
interface Config {
    ad_storage: Mode,
    analytics_storage: Mode,
    functionality_storage: Mode,
    personalization_storage: Mode,
    ad_user_data: Mode,
    ad_personalization: Mode,
    security_storage: Mode
}

// Partial configuration for selective updates
type PartialConfig = Partial<Config>

// Type for consent options (keys of Config interface)
type Options = keyof Config

// Event types for consent updates
type ConsentEventKey = Options | 'all'
type ConsentEventMode = Mode | 'accept-all' | 'reject-all'

// Event detail interface
interface ConsentUpdateEventDetail {
    key: ConsentEventKey
    mode: ConsentEventMode
    state: Config
    timestamp: string
}

// Custom event interface
interface ConsentUpdateEvent extends CustomEvent {
    detail: ConsentUpdateEventDetail
}
```

These types ensure type safety when:
- Initializing the consent manager
- Updating consent preferences
- Handling consent events
- Working with the consent state
- Managing bulk consent updates
- Handling custom events

## Usage

### Basic Usage

```typescript
import { EasyConsent } from '@primarix/easy-consent';

// Initialize with your Google Analytics ID
const consentManager = new EasyConsent('YOUR-GA-ID');

// Update single consent preference
consentManager.update('analytics_storage', 'granted');

// Update multiple consent preferences
consentManager.updateMultiple({
    analytics_storage: 'granted',
    ad_storage: 'denied',
    functionality_storage: 'granted'
});

// Bulk consent management
consentManager.acceptAll();  // Grant all consent options
consentManager.rejectAll();  // Deny all consent options

// Check consent state
const allGranted = consentManager.isAllConsented();
const allDenied = consentManager.isAllDenied();

// Check if user is new
console.log(consentManager.isNewUser); // true for new users, false for returning users
```

### Event Handling

```typescript
window.addEventListener('consent-updated', (event) => {
    const { key, mode, state, timestamp } = event.detail;
    console.log('Consent updated:', { key, mode, state, timestamp });
});
```

The event detail includes:
- `key`: The consent option that was updated or 'all' for bulk updates
- `mode`: The new consent mode ('granted', 'denied', 'accept-all', or 'reject-all')
- `state`: The complete current consent state
- `timestamp`: Unix timestamp of when the update occurred

## Default Configuration

By default, all consent options are set to 'denied' for new users. The initial state is:

```json
{
    "ad_storage": "denied",
    "analytics_storage": "denied",
    "functionality_storage": "denied",
    "personalization_storage": "denied",
    "ad_user_data": "denied",
    "ad_personalization": "denied",
    "security_storage": "denied"
}
```

## Cookie Storage

The consent configuration is stored in a cookie named `consentConfig` with the following characteristics:

- **Name**: `consentConfig`
- **Expiration**: 180 days for initial setup, 3 days for updates
- **Security**: 
  - `SameSite=Lax`
  - `Secure` flag enabled
- **Path**: Root path (`/`)
- **Format**: JSON-encoded object containing all consent preferences

## Error Handling

The package includes comprehensive error handling for:
- Cookie parsing errors
- Google Analytics initialization errors
- Consent update errors
- Bulk operation errors

## Security Features

- Secure cookie handling with SameSite=Lax and Secure flags
- Automatic data redaction for ads
- URL passthrough enabled by default
- JSON parsing error handling for cookie values

## Beta Status

This package is currently in beta testing. Features and implementation details may change without notice. Users are advised to:

1. Test thoroughly in production environments
2. Ensure compliance with GDPR regulations
3. Utilize Google-provided tools for consent mode testing
4. Monitor for updates and breaking changes

## Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

## License

[MIT License](LICENSE)

## React Implementation

Here's an example of how to implement the consent manager in a React application:

```tsx
import { useState } from "react";
import { type Options, EasyConsent, Config, Mode } from "@primarix/easy-consent";

// Props interface for the consent component
export interface ConsentProps {
    consent: EasyConsent
}

// Custom hook for managing consent choices
const useUpdateChoices = (consent: EasyConsent) => {
    const [choices, setChoices] = useState<Config>(consent.state);

    const handleChoices = (key: Options, value: Mode) => {
        return () => {
            consent.update(key, value);
            setChoices({...choices, [key]: value});
        }
    }

    const changeMode = (mode: Mode) => mode === "granted" ? "denied" : "granted";

    return { choices, handleChoices, changeMode };
}

// Consent component
export const ConsentComponent: React.FC<ConsentProps> = ({ consent }) => {
    const { choices, handleChoices, changeMode } = useUpdateChoices(consent);
    
    return (
        <ul className='w-[320px] bg-gray-800 rounded p-2'>
            {Object.keys(consent.state).map((item, index) => (
                <li key={index} className='flex items-center justify-between p-2 bg-blac gap-0.5'>
                    <p className='font-semibold text-white'>{item}</p>
                    <button 
                        onClick={handleChoices(item as Options, changeMode(choices[item as Options]))}
                        className={`
                            cursor-pointer transition-all duration-400 text-white w-[90px] 
                            font-semibold p-1 rounded uppercase 
                            ${choices[item as Options] === "denied" ? "bg-red-600" : "bg-green-600"}
                        `}
                    >
                        {choices[item as Options]}
                    </button>
                </li>
            ))}
        </ul>
    );
}
```

### Usage in your React application:

```tsx
import { EasyConsent } from '@primarix/easy-consent';
import { ConsentComponent } from './ConsentComponent';

// Initialize the consent manager
const consentManager = new EasyConsent('YOUR-GA-ID');

function App() {
    

    return (
        <div>
            <h1>Your App</h1>
            <ConsentComponent consent={consentManager} />
        </div>
    );
}
```

This implementation provides:
- A reusable consent component
- Type-safe consent management
- Real-time UI updates when consent changes
- Visual feedback for consent states
- Proper state management using React hooks

The component includes:
- A custom hook (`useUpdateChoices`) for managing consent state
- A toggle button for each consent option
- Visual indicators for granted/denied states
- Automatic state synchronization with the consent manager

## Additional Features

### Bulk Consent Management

The package now includes methods for managing consent in bulk:

```typescript
// Accept all consent options
consentManager.acceptAll();

// Reject all consent options
consentManager.rejectAll();

// Check if all options are granted
const allGranted = consentManager.isAllConsented();

// Check if all options are denied
const allDenied = consentManager.isAllDenied();

// Update multiple consent options at once
consentManager.updateMultiple({
    analytics_storage: 'granted',
    ad_storage: 'denied',
    functionality_storage: 'granted'
});
```

The `updateMultiple` method allows you to update several consent options simultaneously with a single call. It:
- Updates the internal state
- Updates Google Analytics consent
- Updates the cookie
- Dispatches individual events for each updated option
- Triggers a page view if analytics consent is granted
- Handles errors gracefully

### Enhanced Event System

The consent system now includes a more detailed event system with timestamp information:

```typescript
window.addEventListener('consent-updated', (event) => {
    const { key, mode, state, timestamp } = event.detail;
    console.log('Consent updated:', { key, mode, state, timestamp });
});
```

The event detail includes:
- `key`: The consent option that was updated
- `mode`: The new consent mode ('granted' or 'denied')
- `state`: The complete current consent state
- `timestamp`: Unix timestamp of when the update occurred

### New User Detection

The package now tracks whether a user is new or returning:

```typescript
const consentManager = new EasyConsent('YOUR-GA-ID');
console.log(consentManager.isNewUser); // true for new users, false for returning users
```

### Automatic Page View Tracking

When analytics consent is granted, the package automatically tracks page views with:
- Current page path
- Page title
- Timestamp

### Error Handling

The package includes improved error handling for:
- Cookie parsing errors
- Google Analytics initialization errors
- Consent update errors