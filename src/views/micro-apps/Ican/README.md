# ICAN Micro-App

A comprehensive micro-application for the Institute of Chartered Accountants of Nigeria (ICAN) integrated into SmartDesignPro.

## 📁 Project Structure

```
src/views/micro-apps/ican/
├── components/           # Vue.js Components
│   ├── ICANDashboard.vue    # Main dashboard with statistics
│   ├── ICANHome.vue         # Landing page and navigation
│   ├── ICANInvoice.vue      # Invoice management system
│   ├── ICANMemberLogin.vue  # Member authentication portal
│   ├── ICANReceipt.vue      # Receipt management system
│   ├── ICANSettings.vue     # User settings and preferences
│   └── index.ts             # Component exports
├── services/            # Service Layer
│   ├── ican-firebase.service.ts  # Firebase integration
│   ├── ican-sso.service.ts       # Single Sign-On service
│   └── index.ts                  # Service exports
├── stores/              # State Management (Pinia)
│   └── index.ts              # Main store with user, settings, data
├── types/               # TypeScript Definitions
│   ├── component.types.ts    # Component type definitions
│   ├── service.types.ts      # Service interfaces
│   └── index.ts              # Main type exports
├── utils/               # Utility Functions
│   └── index.ts              # Common utilities and helpers
└── index.ts             # Main micro-app export
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ionic-vue-tailwind-app.git
   ```

2. Navigate to the project directory:
   ```
   cd ionic-vue-tailwind-app
   ```

3. Install the dependencies:
   ```
   npm install
   ```

## Development

To start the development server, run:
```
npm run dev
```

This will launch the application in your default web browser.

## Building for Production

To build the application for production, run:
```
npm run build
```

The built files will be generated in the `dist` directory.

## 🚀 Features

### Core Components
- **Dashboard**: Real-time analytics and branch statistics
- **Home**: Welcome page with quick navigation
- **Invoice**: Comprehensive invoice management
- **Receipt**: Receipt creation and tracking
- **Member Login**: Authentication and member portal
- **Settings**: User preferences and configuration

### Technical Features
- ✅ Vue 3 + Composition API
- ✅ Ionic Vue for mobile UI
- ✅ TypeScript support
- ✅ Pinia state management
- ✅ Firebase integration
- ✅ Responsive design
- ✅ Professional folder structure

## 🛠️ Architecture

### State Management
The ICAN micro-app uses Pinia for centralized state management:

```typescript
// Access the store
import { useICANStore } from '@/views/micro-apps/ican/stores'

const icanStore = useICANStore()

// User authentication
await icanStore.login(email, password)
await icanStore.logout()

// Data management
await icanStore.loadDashboardData()
await icanStore.createInvoice(invoiceData)
await icanStore.createReceipt(receiptData)
```

### Service Layer
Services are organized by functionality:

```typescript
// Firebase integration
import { ICANFirebaseService } from '@/views/micro-apps/ican/services'

// SSO authentication
import { ICANSSOService } from '@/views/micro-apps/ican/services'
```

### Type Safety
Comprehensive TypeScript definitions:

```typescript
import type { 
  ICANUser, 
  ICANInvoice, 
  ICANReceipt,
  ICANDashboardStats 
} from '@/views/micro-apps/ican/types'
```

### Utilities
Common helper functions:

```typescript
import { 
  formatCurrency, 
  formatDate, 
  isValidEmail 
} from '@/views/micro-apps/ican/utils'
```

## 🔗 Routing

The micro-app integrates seamlessly with Vue Router:

```
/ican                    # Home page (redirects to /ican/home)
/ican/home              # Landing page
/ican/dashboard         # Analytics dashboard
/ican/invoice           # Invoice management
/ican/receipt           # Receipt management
/ican/member-login      # Member authentication
/ican/settings          # User settings
```

## 🔧 Usage

### Basic Integration
```typescript
// Import components
import { 
  ICANHome, 
  ICANDashboard, 
  ICANInvoice 
} from '@/views/micro-apps/ican/components'

// Import store
import { useICANStore } from '@/views/micro-apps/ican/stores'

// Import types
import type { ICANUser } from '@/views/micro-apps/ican/types'
```

### Navigation
The micro-app is accessible through the main SmartDesignPro navigation:
- From the More Menu → ICAN Portal
- Direct navigation to `/ican`

## 🔒 Authentication

The ICAN micro-app supports multiple authentication methods:

1. **Local Authentication**: Username/password with Firebase
2. **SSO Integration**: Single Sign-On with ICAN systems
3. **Guest Access**: Limited functionality for non-members

## 📊 Data Management

### Dashboard Analytics
- Member statistics and growth
- Financial summaries
- Recent activity feeds
- Branch-specific metrics

### Invoice System
- Invoice creation and templates
- Status tracking (draft, sent, paid, overdue)
- Client management
- Payment tracking

### Receipt Management
- Multiple payment methods
- Receipt generation
- Transaction history
- Payment verification

## 🎨 UI/UX Features

- **Mobile First**: Designed for mobile with responsive desktop support
- **Ionic Components**: Native-like mobile experience
- **Professional Styling**: Business-appropriate design language
- **Dark/Light Themes**: Adaptive theme support
- **Accessibility**: WCAG compliant interface

## 🔄 Build Integration

The ICAN micro-app is fully integrated with SmartDesignPro's build process:

```bash
# Development
npm run dev

# Production build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📱 Mobile Support

The micro-app is optimized for mobile devices:
- Touch-friendly interfaces
- Responsive layouts
- Native iOS/Android styling
- Capacitor integration ready

## 🚀 Future Enhancements

Planned features for future releases:
- [ ] Offline functionality
- [ ] Push notifications
- [ ] Advanced reporting
- [ ] Export functionality
- [ ] Multi-language support
- [ ] Advanced member management
- [ ] Payment gateway integration

## 🤝 Contributing

This micro-app follows SmartDesignPro's development standards:
- Vue 3 + Composition API
- TypeScript strict mode
- Ionic Vue components
- Professional folder organization
- Comprehensive type definitions

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Status**: ✅ Production Ready