# Stase Client - Modern Fintech Mobile App

A comprehensive React Native mobile application for the Stase fintech platform, featuring secure authentication, real-time transactions, and a modern user experience. This is the client-side application that connects to the Stase backend API.

## 🚀 Features

### Core Banking Features

- **Account Management** - Create, manage, and monitor multiple accounts
- **Real-time Transactions** - Instant transfers, deposits, and withdrawals
- **Currency Conversion** - Multi-currency support with live exchange rates
- **Transaction History** - Detailed transaction logs and analytics
- **Security PIN** - Secure transaction PIN for enhanced security

### Technical Features

- **Cross-Platform** - iOS, Android, and Web support
- **Offline Support** - Core functionality available offline
- **Real-time Updates** - Live data synchronization
- **Secure Storage** - Encrypted local storage for sensitive data
- **Modern UI/UX** - Beautiful, responsive interface with NativeWind

## 📱 Tech Stack

This React Native client application is built with modern technologies for optimal performance and developer experience:

- **React Native** - Cross-platform mobile development framework
- **Expo** - Development platform and tooling
- **Expo Router** - File-based routing system with typed routes
- **TypeScript** - Type-safe development and better code quality
- **Tailwind CSS (NativeWind)** - Utility-first styling for React Native
- **Clerk** - Authentication and user management service
- **React Query (TanStack)** - Data fetching, caching, and state synchronization
- **Zustand** - Lightweight state management
- **Zod** - Runtime type validation and schema definitions
- **Axios** - HTTP client for API communication
- **Lucide React Native** - Beautiful, consistent icon library
- **React Native Reanimated** - Smooth animations and gestures
- **Expo Secure Store** - Secure local storage for sensitive data

## 🏗️ Project Structure

```
client/
├── app/
│   ├── (app)/                 # Main app screens and features
│   │   ├── (tabs)/            # Tab navigation screens
│   │   │   ├── _layout.tsx    # Tab layout
│   │   │   ├── index.tsx      # Home/Dashboard tab
│   │   │   ├── card.tsx       # Card management tab
│   │   │   ├── convert.tsx    # Currency conversion tab
│   │   │   └── history.tsx    # Transaction history tab
│   │   ├── _layout.tsx        # Main app layout
│   │   ├── deposit.tsx        # Deposit funds screen
│   │   ├── withdraw.tsx       # Withdraw funds screen
│   │   ├── transfer.tsx       # Money transfer screen
│   │   ├── profile.tsx        # User profile screen
│   │   ├── referral.tsx       # Referral program screen
│   │   ├── offline.tsx        # Offline mode screen
│   │   ├── bankDetails/       # Bank details management
│   │   └── transactionDetails/ # Transaction details view
│   ├── (auth)/                # Authentication flow screens
│   │   ├── _layout.tsx        # Auth layout
│   │   ├── index.tsx          # Auth index
│   │   ├── welcome.tsx        # Welcome/onboarding screen
│   │   ├── sign-in.tsx        # Sign in screen
│   │   └── sign-up.tsx        # Sign up screen
│   ├── _layout.tsx            # Root layout with navigation
│   └── global.css              # Global styles and Tailwind config
├── assets/
│   ├── images/                # App icons, splash screen, images
│   └── fonts/                 # Custom fonts
├── components/                # Reusable UI components
├── constants/                 # App constants and configurations
├── contexts/                  # React contexts for state management
├── hooks/                     # Custom React hooks
├── store/                     # Zustand state management
├── utils/                     # Utility functions and configurations
├── app.json                   # Expo configuration
├── package.json               # Dependencies and scripts
├── babel.config.js            # Babel configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- Expo CLI (`npm install -g @expo/cli`)
- Physical iOS/Android device or emulator/simulator
- Stase backend API (running separately)

### Installation

1. **Clone the repository**

   ```bash
   git clone <client-repository-url>
   cd stase
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env` file in the root directory:

   ```env
   # API Configuration
   EXPO_PUBLIC_SERVER_URL=your-stase-server-endpoint

   # Clerk Authentication
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key

   # Environment
   NODE_ENV=development
   ```

   **Note:** Ensure the Stase backend API is running and accessible at the specified URL.

4. **Start the development server**

   ```bash
   npm start
   ```

5. **Run the app**
   - **On Physical Device:** Install Expo Go app, scan QR code from terminal
   - **On Simulator:**
     ```bash
     npm run ios        # iOS Simulator
     npm run android    # Android Emulator
     ```
   - **On Web:**
     ```bash
     npm run web
     ```

## 📱 Screens

### Authentication Flow

- Welcome screen with sign-up/sign-in options
- Multi-factor authentication support

### Main App

- Dashboard with account overview
- Transaction history and details
- Money transfer interface
- Currency conversion tools
- Profile and settings management

## 🎨 UI/UX Design

### Design System

The app uses a modern design system with:

- **NativeWind** for Tailwind-like styling
- **Lucide React Native** for consistent icons
- **Custom components** for reusable UI elements
- **Responsive design** for various screen sizes
- **Dark/light theme** support

### Figma Design Showcase

**Proudly designed by Confilearn** - Explore the complete UI/UX design system and user flow:

[![View Stase Design on Figma](https://img.shields.io/badge/Figma-View%20Design-purple?style=for-the-badge&logo=figma&logoColor=white)](https://www.figma.com/design/mCcluvbC0jao1YL8rsmi0h/stase?node-id=0-1&p=f)

#### Design Highlights:

- **Modern Banking Interface** - Clean, intuitive financial app design
- **User-Centric Flow** - Seamless authentication and transaction experiences
- **Consistent Design Language** - Unified color palette, typography, and spacing
- **Accessibility Focus** - High contrast ratios and clear visual hierarchy
- **Mobile-First Approach** - Optimized for touch interactions and various screen sizes

The design demonstrates expertise in:

- Financial app UX patterns
- Modern UI design principles
- Component-based design systems
- User journey mapping

## 🔐 Security Features

- **End-to-end encryption** for sensitive data
- **Secure authentication** with JWT tokens
- **Transaction PIN** for financial operations
- **Input validation** with Zod schemas
- **Rate limiting** on API endpoints
- **CORS protection** for web security

## 🧪 Testing

### Code Quality

```bash
# Run ESLint
npm run lint

# Type checking
npx tsc --noEmit

# Format code with Prettier
npx prettier --write .
```

### Manual Testing

- Test authentication flow (sign up, sign in, verification)
- Test transaction operations (deposit, withdraw, transfer)
- Test offline functionality
- Test on different screen sizes and orientations

## � API Integration

This client application connects to the Stase backend API. The main API endpoints used are:

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/verify` - Email verification
- `POST /auth/refresh` - Token refresh

### Account Management

- `GET /account/details` - Fetch user account details
- `PUT /account/update` - Update account information
- `POST /account/pin` - Set/verify transaction PIN

### Transactions

- `POST /transactions/deposit` - Deposit funds
- `POST /transactions/withdraw` - Withdraw funds
- `POST /transactions/transfer` - Transfer money
- `GET /transactions/history` - Get transaction history
- `POST /transactions/convert` - Currency conversion

**Note:** The full API documentation is available in the [Stase Server Repository](https://github.com/Confilearn/stase-server).

## 🔧 Configuration

### Expo Configuration (`app.json`)

- App name, version, and identifiers
- Platform-specific settings (iOS, Android, Web)
- Plugin configurations (splash screen, secure store, etc.)
- Build settings and optimizations

### Tailwind Configuration (`tailwind.config.js`)

- Custom color palette matching Stase brand
- Responsive breakpoints
- Custom utility classes
- Font family configurations

### TypeScript Configuration (`tsconfig.json`)

- Strict type checking enabled
- Path aliases for cleaner imports
- React Native type definitions

### Environment Variables

- `EXPO_PUBLIC_API_URL` - Backend API endpoint
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk authentication key
- `NODE_ENV` - Environment (development/production)

### Development Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator/device
npm run ios        # Run on iOS simulator/device
npm run web        # Run in web browser
npm run lint       # Run ESLint code quality check
npm run reset-project # Reset project to clean state
```

## 🚀 Deployment

### Building for Production

**Prebuild Configuration**

```bash
npm run prebuild    # Generate native files with plugins
```

**Build with Expo EAS**

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
npx eas login

# Build for all platforms
npx eas build --platform all

# Build for specific platform
npx eas build --platform ios
npx eas build --platform android
```

**Submit to App Stores**

```bash
# Submit to Apple App Store and Google Play Store
npx eas submit --platform all
```

### Environment Variables for Production

Create `app.config.js` for production environment variables:

```javascript
export default {
  expo: {
    // ... other config
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      clerkKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    },
  },
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use conventional commit messages
- Write tests for new features
- Maintain code coverage above 80%
- Follow the established code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the [FAQ](docs/FAQ.md) for common questions

## 🗺️ Roadmap

### Version 1.1 (Upcoming)

- [ ] Biometric authentication
- [ ] QR code scanner
- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Apple Pay/Google Pay integration

### Version 1.2 (Future)

- [ ] Investment portfolio management
- [ ] Cryptocurrency support
- [ ] Advanced budgeting tools

---

**Built with ❤️ by Confilearn**
