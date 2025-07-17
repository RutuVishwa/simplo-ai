# Simplo - AI Chatbot

A modern, responsive AI chatbot built with Next.js, featuring a beautiful dark/light mode interface and seamless conversation experience.

![Simplo Chatbot](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

- 🤖 **AI-Powered Conversations** - Seamless chat experience with AI assistant
- 🌓 **Dark/Light Mode** - Beautiful theme toggle with system preference detection
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🎨 **Modern UI** - Clean, gradient-based design with smooth animations
- 📝 **Markdown Cleaning** - Automatic formatting of AI responses for better readability
- ⚡ **Real-time Chat** - Instant message sending and receiving
- 🔄 **Auto-scroll** - Messages automatically scroll to keep conversation in view
- 🎯 **Loading States** - Elegant loading animations during AI processing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd chatbot
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your OpenRouter API key to `.env.local`:
   ```env
   OPENROUTER_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Theme**: next-themes
- **API**: OpenRouter

## 📁 Project Structure

```
chatbot/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # API endpoint for chat
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout with theme provider
│   └── page.tsx                  # Main chat interface
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── theme-provider.tsx        # Theme context provider
│   └── theme-toggle.tsx          # Dark/light mode toggle
├── lib/
│   └── utils.ts                  # Utility functions
└── public/                       # Static assets
```

## 🎨 Customization

### Theme Colors

The application uses CSS custom properties for theming. You can customize colors in `app/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  /* ... other light theme variables */
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... other dark theme variables */
}
```

### Styling Components

All UI components are built with Tailwind CSS and can be customized by modifying the className props in the respective component files.

## 🔧 Configuration

### API Configuration

The chatbot uses OpenRouter for AI responses. Configure your API settings in `app/api/chat/route.ts`:

```typescript
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "deepseek-ai/deepseek-chat"; // Change this to use different models
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | Yes |

## 📱 Responsive Design

The interface is fully responsive and optimized for:
- **Desktop**: Full-width layout with optimal spacing
- **Tablet**: Adjusted padding and component sizes
- **Mobile**: Touch-friendly interface with appropriate sizing

## 🌟 Features in Detail

### Dark/Light Mode
- Automatic system preference detection
- Manual toggle with dropdown options (Light/Dark/System)
- Smooth transitions between themes
- Persistent theme selection

### Message Handling
- Real-time message sending
- Automatic markdown cleaning for AI responses
- Timestamp display for all messages
- Loading states with animated dots
- Error handling with user-friendly messages

### UI/UX Enhancements
- Gradient backgrounds and buttons
- Smooth animations and transitions
- Custom scrollbar styling
- Backdrop blur effects
- Shadow and depth effects

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [OpenRouter](https://openrouter.ai/) for AI API access
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the maintainers.

---

Made with ❤️ using Next.js and modern web technologies. 