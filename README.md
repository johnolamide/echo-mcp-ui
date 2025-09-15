# Echo MCP UI

[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5+-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3+-blue.svg)](https://tailwindcss.com/)
[![WebSocket](https://img.shields.io/badge/WebSocket-Real--Time-purple.svg)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![AWS Amplify](https://img.shields.io/badge/AWS-Amplify-orange.svg)](https://aws.amazon.com/amplify/)

A modern, responsive web interface for the Echo MCP (Model Context Protocol) system that provides users with an intuitive dashboard to manage their personal AI agents, browse and select services, and interact with agents through real-time chat. Built with React and Vite for fast development and optimal performance.

## 🚀 Features

- **Agent Dashboard**: Complete overview of user's AI agents and their capabilities
- **Service Marketplace**: Browse, discover, and select services to add to your agent
- **Real-time Chat**: Interactive messaging interface with AI agents
- **Admin Panel**: Administrative interface for managing platform services and users
- **Responsive Design**: Mobile-first design that works seamlessly across all devices
- **Role-based Access**: Different interfaces for regular users and administrators
- **Real-time Updates**: Live connection status and service integration indicators
- **Modern UI**: Clean, intuitive interface built with Tailwind CSS

## 🏗️ Architecture

The UI is structured as a single-page application with the following key components:

- **Dashboard**: Main landing page with agent overview and quick actions
- **Service Marketplace**: Browse and select services for your agent
- **Agent Chat**: Real-time chat interface for interacting with your AI agent
- **Admin Panel**: Administrative tools for service and user management
- **Authentication**: Login/register forms with secure token management

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with modern hooks and context
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS for utility-first, responsive design
- **State Management**: React Context for global state and user sessions
- **Real-time Communication**: WebSocket integration for live chat
- **HTTP Client**: Axios for API communication with the backend
- **Icons**: Lucide React for consistent, scalable iconography
- **Deployment**: AWS Amplify for hosting and CI/CD

## 📋 Prerequisites

- Node.js 18+ and npm or pnpm
- Access to the Echo MCP Server API
- Modern web browser with WebSocket support

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Using npm
npm install

# Or using pnpm
pnpm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000
```

### 3. Start Development Server

```bash
# Using npm
npm run dev

# Or using pnpm
pnpm dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production

```bash
# Using npm
npm run build

# Or using pnpm
pnpm build
```

## 🏗️ Project Structure

```
echo-mcp-ui/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── AdminServicePanel.jsx    # Admin service management
│   │   ├── AgentChat.jsx           # Real-time chat interface
│   │   ├── ServiceMarketplace.jsx  # Service browsing and selection
│   │   ├── Dashboard.jsx           # Main dashboard
│   │   └── ...                     # Other UI components
│   ├── contexts/
│   │   ├── AuthContext.jsx         # Authentication state
│   │   └── UserChatContext.jsx     # Chat state management
│   ├── hooks/
│   │   └── useApiHealth.js         # API health monitoring
│   ├── lib/
│   │   └── utils.js                # Utility functions
│   ├── pages/
│   │   ├── Dashboard.jsx           # Dashboard page
│   │   ├── LoginPage.jsx           # Login page
│   │   └── RegisterPage.jsx        # Registration page
│   ├── services/
│   │   ├── apiClient.js            # HTTP API client
│   │   ├── chatService.js          # Chat functionality
│   │   └── agentWebSocketService.js # WebSocket service
│   └── styles/
│       ├── fonts.css               # Custom font loading
│       └── ...                     # Additional styles
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🎨 UI Components

### Core Components

- **AgentChat**: Real-time messaging interface with connection status
- **ServiceMarketplace**: Grid layout for browsing available services
- **AdminServicePanel**: Form-based interface for service administration
- **Dashboard**: Tabbed interface with navigation between main features

### Reusable Components

- **Button**: Consistent button styling with variants
- **Input/Textarea**: Form inputs with validation states
- **Card**: Content containers with shadows and borders
- **Dialog**: Modal dialogs for confirmations and forms
- **Tabs**: Navigation between different sections

## 🔌 API Integration

The UI communicates with the Echo MCP Server through:

- **REST API**: User authentication, service management, user data
- **WebSocket**: Real-time chat messaging and agent interactions
- **Health Checks**: API availability monitoring

## 🔐 Authentication Flow

1. User registers or logs in through the authentication forms
2. JWT tokens are stored securely in local storage
3. API requests include the authorization header
4. Automatic token refresh maintains user sessions
5. Role-based rendering shows appropriate interfaces

## 📱 Responsive Design

The application is fully responsive with:

- **Mobile-first approach**: Optimized for mobile devices
- **Tablet support**: Adaptive layouts for medium screens
- **Desktop enhancement**: Full feature set on larger screens
- **Touch-friendly**: Appropriate touch targets and gestures

## 🚀 Deployment

### AWS Amplify

The application is configured for AWS Amplify deployment:

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/
```

### Manual Deployment

```bash
# Build the application
npm run build

# Serve the dist directory with any static server
npx serve dist
```

## 🧪 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Format code
npm run format
```

### Code Style

- **ESLint**: JavaScript/React linting rules
- **Prettier**: Code formatting
- **Consistent naming**: PascalCase for components, camelCase for functions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper component structure
4. Test on multiple screen sizes
5. Ensure accessibility compliance
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the component documentation
- Review the API integration examples

## 🔄 Recent Updates

- ✅ **Complete Dashboard**: Full-featured dashboard with agent management
- ✅ **Service Marketplace**: Interactive service browsing and selection
- ✅ **Real-time Chat**: WebSocket-powered agent communication
- ✅ **Admin Interface**: Comprehensive administrative tools
- ✅ **Responsive Design**: Mobile-first, cross-device compatibility
- ✅ **Modern UI**: Clean, intuitive interface with Tailwind CSS
