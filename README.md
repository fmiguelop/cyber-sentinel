# CyberSentinel - Real-Time Threat Intelligence Dashboard

A high-performance, dark-mode geospatial dashboard that visualizes simulated cybersecurity threats in real-time. CyberSentinel provides a Security Operations Center (SOC) interface with an interactive world map displaying attack vectors, live event logs, and comprehensive threat statistics.

## 🎯 Features

- **Live Threat Visualization**: Real-time geospatial visualization of cybersecurity attacks (DDoS, Phishing, Malware, Brute Force) with animated arcs connecting attacker and victim locations
- **Interactive World Map**: Powered by MapLibre GL with custom markers, tooltips, and dynamic attack lines
- **Real-Time Event Log**: Terminal-style scrolling log with framer-motion animations for new threat events
- **Comprehensive Statistics**: Global threat statistics including total attacks, top source regions, severity distribution, and regional breakdowns
- **Advanced Filtering**: Filter threats by severity (Low, Medium, Critical) and attack type with time range selectors
- **Performance Optimized**: Efficient state management with Zustand, debounced map updates, and optimized rendering for up to 30 simultaneous threats
- **Accessibility First**: Full keyboard navigation, ARIA labels, screen reader support, and reduced motion preferences

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Map Engine**: [mapcn](https://mapcn.dev) (MapLibre GL wrapper)
- **State Management**: Zustand
- **Animation**: framer-motion
- **Icons**: lucide-react
- **Data Generation**: @faker-js/faker
- **Date Utilities**: date-fns

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd threats-visualizer
```

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

1. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

1. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```text
threats-visualizer/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main dashboard page
│   └── layout.tsx         # Root layout
├── components/
│   ├── dashboard/         # Dashboard components
│   │   ├── ControlPanel.tsx
│   │   ├── EventLog.tsx
│   │   └── StatHUD.tsx
│   ├── map/               # Map components
│   │   └── CyberMap.tsx
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
│   ├── useThreatSimulation.ts
│   └── useCriticalAlertSound.ts
├── lib/                   # Utility libraries
│   ├── cities.ts         # City data and helpers
│   ├── threats/          # Threat-related utilities
│   └── types/            # TypeScript type definitions
├── stores/               # Zustand stores
│   └── useThreatStore.ts
└── __tests__/            # Test files
```

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

### Key Components

- **CyberMap**: Main map component rendering threats with markers and attack arcs
- **ControlPanel**: Filter controls, pause/play, and export functionality
- **EventLog**: Real-time scrolling log of threat events
- **StatHUD**: Statistics overlay showing global threat metrics

## 🎨 Design Philosophy

CyberSentinel embraces a "Hacker/SOC" aesthetic with:

- Dark backgrounds (#09090b - Zinc 950)
- Neon accent colors (Green/Yellow/Red for severity levels)
- Monospace fonts (Geist Mono) for technical feel
- High data density with clear visual hierarchy
- Smooth animations respecting user preferences

## ⚡ Performance Considerations

- Maximum 30 simultaneous active threats on map
- Debounced map feature updates to prevent excessive re-renders
- Automatic cleanup of expired attack arcs
- Optimized GeoJSON rendering with MapLibre GL
- Efficient Zustand state management for high-frequency updates

## 📚 Documentation

- [Requirements](./docs/requirements.md) - Detailed project requirements and specifications
- [TODO](./docs/TODO.md) - Development roadmap and pending tasks

## 🔒 Security

This project simulates cybersecurity threats for visualization purposes only. It does not connect to real threat intelligence feeds or expose any sensitive data.

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a personal project. For questions or suggestions, please open an issue.
