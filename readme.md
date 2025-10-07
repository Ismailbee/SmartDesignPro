# Design Editor

A production-ready Vue 3 + TypeScript + Tailwind Canva-like design editor built with Vite and Konva.

## ✨ Features

- **🎨 Visual Design Canvas**: Interactive canvas powered by Konva with drag-and-drop support
- **📝 Text Editing**: Inline text editing with rich formatting options
- **🖼️ Image Support**: Upload and manipulate images with transform handles
- **🔷 Shape Tools**: Rectangle, circle, triangle, and star shapes with customizable properties
- **📚 Layer Management**: Visual layer list with reordering, visibility, and locking
- **⏪ Undo/Redo**: Full history management with keyboard shortcuts
- **🎯 Properties Panel**: Real-time property editing for selected objects
- **💾 Auto-save**: Automatic saving to localStorage
- **📤 Export**: Export designs as PNG, JPG, or PDF
- **⌨️ Keyboard Shortcuts**: Full keyboard support for productivity

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

**Windows (PowerShell):**
```powershell
.\setup.ps1
```

**macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Open your browser:**
Navigate to `http://localhost:5173`

## 🛠️ Tech Stack

- **Frontend Framework**: Vue 3 with Composition API
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Canvas**: Konva.js with vue-konva
- **State Management**: Pinia
- **Utilities**: VueUse
- **File Operations**: file-saver, jsPDF

## 📁 Project Structure

```
src/
├── components/
│   ├── DesignEditor.vue      # Main editor component
│   ├── Sidebar.vue           # Left sidebar with tools
│   ├── Toolbar.vue           # Top toolbar
│   ├── CanvasStage.vue       # Konva canvas component
│   ├── PropertiesPanel.vue   # Right properties panel
│   └── LayerList.vue         # Bottom layer management
├── stores/
│   └── editor.ts             # Pinia store for editor state
├── types/
│   └── index.ts              # TypeScript type definitions
├── App.vue                   # Root component
└── main.ts                   # Application entry point
```

## ⌨️ Keyboard Shortcuts

- **Ctrl/Cmd + Z**: Undo
- **Ctrl/Cmd + Y** or **Ctrl/Cmd + Shift + Z**: Redo
- **Ctrl/Cmd + D**: Duplicate selected objects
- **Ctrl/Cmd + S**: Save design
- **Delete** or **Backspace**: Delete selected objects

## 🎨 Usage Guide

### Adding Elements
1. **Images**: Click on sample images in the Templates tab or upload your own in the Uploads tab
2. **Text**: Use the Text tab to add text elements with various styles
3. **Shapes**: Select from rectangle, circle, triangle, or star in the Elements tab

### Editing Objects
1. **Select**: Click on any object to select it
2. **Transform**: Drag corners to resize, drag the object to move
3. **Properties**: Use the right panel to adjust colors, fonts, and other properties
4. **Text Editing**: Double-click text objects to edit content

### Layer Management
- View all layers in the bottom panel
- Drag to reorder layers
- Toggle visibility and lock states
- Right-click for context menu options

### Exporting
1. Click the Export button in the toolbar
2. Choose format (PNG, JPG, or PDF)
3. File will be automatically downloaded

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Adding New Features

The codebase is designed to be easily extensible:

1. **New Object Types**: Add to `src/types/index.ts` and implement in `CanvasStage.vue`
2. **New Tools**: Add to `Sidebar.vue` and handle in `DesignEditor.vue`
3. **Export Formats**: Extend the export functionality in `CanvasStage.vue`
4. **Collaboration**: Ready for Yjs integration for real-time collaboration

### Performance Tips

- **Layer Caching**: Konva automatically caches layers for better performance
- **Transform Throttling**: Transform events are throttled to prevent excessive history entries
- **Image Optimization**: Consider implementing image compression for large uploads
- **Web Workers**: For heavy operations like filters or large exports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Konva.js](https://konvajs.org/) for the powerful 2D canvas library
- [Vue.js](https://vuejs.org/) for the reactive framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vite](https://vitejs.dev/) for the fast build tool