# This file is only for editing file nodes, do not break the structure

/src
├── assets/          # Static resources directory, storing static files like images and fonts
│
├── components/      # Components directory
│   ├── ui/         # Pre-installed shadcn/ui components, avoid modifying or rewriting unless necessary
│   ├── auth/       # Authentication related components
│   │   ├── LoginForm.jsx   # Login form component with validation and navigation
│   │   └── RegisterForm.jsx # Registration form component with validation
│   ├── profile/    # User profile related components
│   │   └── UserProfile.jsx # Component to display user information with avatar and upload functionality
│   ├── chat/       # Chat related components
│   │   ├── ChatLayout.jsx   # Main chat layout component that organizes the entire chat interface
│   │   ├── ChannelList.jsx  # Component for displaying channel list in the sidebar
│   │   ├── ChatContent.jsx  # Component for displaying chat messages
│   │   └── ChatInput.jsx    # Component for chat input field and send button
│   └── layout/     # Layout components
│       └── Header.jsx # Header component with navigation and user profile dropdown
│
├── hooks/          # Custom Hooks directory
│   ├── use-mobile.jsx # Pre-installed mobile detection Hook from shadcn (import { useIsMobile } from '@/hooks/use-mobile')
│   └── use-toast.js  # Toast notification system hook for displaying toast messages (import { useToast } from '@/hooks/use-toast')
│
├── lib/            # Utility library directory
│   └── utils.js    # Utility functions, including the cn function for merging Tailwind class names
│
├── pages/          # Page components directory, based on React Router structure
│   ├── HomePage.jsx # Home page component with authentication forms (login/register)
│   ├── DashboardPage.jsx # Dashboard page shown after successful authentication with avatar upload
│   ├── ChatPage.jsx # Chat interface page with channels and real-time messaging
│   └── NotFoundPage.jsx # 404 error page component, displays when users access non-existent routes
│
├── App.jsx         # Root component, with React Router routing system configured
│                   # Add new route configurations in this file
│                   # Includes catch-all route (*) for 404 page handling
│
├── main.jsx        # Entry file, rendering the root component and mounting to the DOM
│
├── index.css       # Global styles file, containing Tailwind configuration and custom styles
│                   # Modify theme colors and design system variables in this file 
│
└── tailwind.config.js  # Tailwind CSS v3 configuration file
                      # Contains theme customization, plugins, and content paths
                      # Includes shadcn/ui theme configuration 