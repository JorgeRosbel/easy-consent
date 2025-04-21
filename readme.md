# Easy Consent

## Disclaimer

This npm package is provided “as is” and is in beta.
No warranties, express or implied (including merchantability or fitness for a particular purpose).
The author is not liable for any direct, indirect, incidental or consequential damages (data loss, lost profits, business interruption, etc.) arising from its use.

## What it does
Implements Consent Mode for services like Google Analytics and Google Ads, allowing easy, configurable management of cookie permissions (analytics, advertising, functionality, personalization and more)

## Installation

```bash
npm install @primarix/easy-consent
```

## Quick Start

### Basic Usage

```typescript
import { EasyConsent } from '@primarix/easy-consent';

// Initialize with your Google Analytics ID
const consentManager = new EasyConsent('YOUR-GA-ID');

// Update single consent preference
consentManager.update('analytics_storage', 'granted');

// Update multiple consent preferences at once
consentManager.updateMultiple({
    analytics_storage: 'granted',
    ad_storage: 'denied',
    functionality_storage: 'granted'
});

// Accept all consent options
consentManager.acceptAll();

// Reject all consent options
consentManager.rejectAll();

// Check consent states
const allGranted = consentManager.isAllConsented();  // true if all options are granted
const allDenied = consentManager.isAllDenied();      // true if all options are denied

// Access current consent state
console.log(consentManager.state);  // Get complete consent configuration

// Check if user is new
console.log(consentManager.isNewUser);  // true for new users, false for returning users

// Listen for consent updates
window.addEventListener('consent-updated', (event) => {
    const { key, mode, state, timestamp } = event.detail;
    console.log('Consent updated:', { key, mode, state, timestamp });
});
```

### React Integration

```tsx
import { type Options, EasyConsent } from "@primarix/easy-consent";
import { useConsent } from "@primarix/easy-consent/reactHooks";

export interface ConsentProps {
    consent: EasyConsent
}

export const ConsentComp: React.FC<ConsentProps> = ({ consent }) => {
    const {
        choices,
        changeChoice,
        toggleMode,
        grantAll, 
        denyAll
    } = useConsent(consent);
    
    return (
        <ul className='w-[320px] bg-gray-800 rounded p-2'>
            {Object.keys(consent.state).map((item, index) => (
                <li key={index} className='flex items-center justify-between p-2 bg-blac gap-0.5'>
                    <p className='font-semibold text-white'>{item}</p>
                    <button 
                        onClick={changeChoice(item as Options, toggleMode(choices[item as Options]))}
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
            <div className="flex flex-col gap-3 p-3">
                <button onClick={grantAll} className="text-white cursor-pointer bg-amber-700 py-1">
                    Accept all
                </button>
                <button onClick={denyAll} className="text-white cursor-pointer bg-amber-700 py-1">
                    Reject all
                </button>
            </div>
        </ul>
    );
}
```

## Hook Functions Explained

The `useConsent` hook provides several functions to manage consent state:

### `choices`
```typescript
choices: Config
```
- **Purpose**: Provides the current consent state
- **Usage**: Access the current state of all consent options
- **Example**: Display current consent status in UI
```tsx
<p>Analytics: {choices.analytics_storage}</p>
```

### `changeChoice`
```typescript
changeChoice: (key: Options, value: Mode) => () => void
```
- **Purpose**: Updates a single consent option
- **Usage**: Change the state of a specific consent option
- **Example**: Toggle a specific consent option
```tsx
<button onClick={changeChoice('analytics_storage', 'granted')}>
    Allow Analytics
</button>
```

### `toggleMode`
```typescript
toggleMode: (mode: Mode) => Mode
```
- **Purpose**: Toggles between 'granted' and 'denied' states
- **Usage**: Switch the state of a consent option
- **Example**: Toggle button state
```tsx
<button onClick={() => {
    const newMode = toggleMode(choices.analytics_storage);
    changeChoice('analytics_storage', newMode)();
}}>
    Toggle Analytics
</button>
```

### `grantAll`
```typescript
grantAll: () => void
```
- **Purpose**: Grants consent for all options
- **Usage**: Accept all consent options at once
- **Example**: "Accept All" button
```tsx
<button onClick={grantAll}>Accept All</button>
```

### `denyAll`
```typescript
denyAll: () => void
```
- **Purpose**: Denies consent for all options
- **Usage**: Reject all consent options at once
- **Example**: "Reject All" button
```tsx
<button onClick={denyAll}>Reject All</button>
```

### `updateChoices`
```typescript
updateChoices: (new_values: Partial<Config>) => () => void
```
- **Purpose**: Updates multiple consent options at once
- **Usage**: Bulk update of consent preferences
- **Example**: Update multiple options
```tsx
<button onClick={updateChoices({
    analytics_storage: 'granted',
    ad_storage: 'denied'
})}>
    Update Preferences
</button>
```

## API Reference

### EasyConsent Class

```typescript
class EasyConsent {
    constructor(id: string);
    update(key: Options, mode: Mode): void;
    updateMultiple(config: PartialConfig): void;
    acceptAll(): void;
    rejectAll(): void;
    isAllConsented(): boolean;
    isAllDenied(): boolean;
    readonly state: Config;
    readonly isNewUser: boolean;
}
```

### React Hook

```typescript
function useConsent(consent: EasyConsent): {
    choices: Config;
    changeChoice: (key: Options, value: Mode) => () => void;
    toggleMode: (mode: Mode) => Mode;
    grantAll: () => void;
    denyAll: () => void;
    updateChoices: (new_values: Partial<Config>) => () => void;
}
```

## Types

```typescript
type Mode = "denied" | "granted";

interface Config {
    ad_storage: Mode;
    analytics_storage: Mode;
    functionality_storage: Mode;
    personalization_storage: Mode;
    ad_user_data: Mode;
    ad_personalization: Mode;
    security_storage: Mode;
}

type Options = keyof Config;
type PartialConfig = Partial<Config>;
```

## Features

- 🎯 Google Analytics integration
- 🔒 Secure cookie storage (SameSite=Lax, Secure)
- ⚛️ React hooks support
- 📊 Automatic page view tracking
- 🔄 Real-time consent updates
- 🎨 Customizable consent options
- 📝 Full TypeScript support
- 🚀 Event-based system
- 👤 New user detection

## Events

The package dispatches `consent-updated` events:

```typescript
interface ConsentUpdateEventDetail {
    key: ConsentEventKey;
    mode: ConsentEventMode;
    state: Config;
    timestamp: string;
}

window.addEventListener('consent-updated', (event) => {
    const { key, mode, state, timestamp } = event.detail;
    console.log('Consent updated:', { key, mode, state, timestamp });
});
```

## Error Handling

The package includes error handling for:
- Cookie parsing
- Google Analytics initialization
- Consent updates
- Bulk operations

## Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

## License

[MIT License](LICENSE)

## Beta Status

This package is currently in beta testing. Users are advised to:
1. Test thoroughly in production
2. Ensure GDPR compliance
3. Use Google's consent mode testing tools
4. Monitor for updates