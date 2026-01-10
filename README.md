# Web Application Suite

A collection of creative web applications built with vanilla HTML, CSS, and JavaScript.

## Applications

### 1. To-Do List App (`index.html`)
- Add new tasks
- Mark tasks as completed
- Delete tasks
- Filter tasks (All, Active, Completed)
- Clear all completed tasks
- Achievement badges and milestone celebrations
- Persistent storage using localStorage
- Responsive design with smooth animations

### 2. Comic Creator (`comic-creator.html`)
- **Create comic panels**: Add multiple panels in a responsive grid layout
- **Speech bubbles**: Add draggable speech bubbles and thought bubbles to your panels
- **Image upload**: Upload and position character images or backgrounds
- **Drawing tools**: Draw directly on panels with multiple color options
- **Script editor**: Write and view comic scripts alongside your visual panels
- **Save/Load**: Export your comics as JSON files and reload them later
- **Auto-save**: Automatic saving every 30 seconds to prevent data loss
- **BLACKPINK-inspired theme**: Beautiful pink and black gradient design

## Getting Started

### Prerequisites

- Node.js installed on your system

### Installation & Running

1. Navigate to the project directory
2. Start the server:
   ```bash
   npm start
   ```
   Or directly:
   ```bash
   node server.js
   ```

3. Open your browser and go to: `http://localhost:3000`

## Usage

### To-Do List App
- Type a task in the input field and click "Add Task" or press Enter
- Click the checkbox to mark a task as completed
- Click "Delete" to remove a task
- Use the filter buttons to view All, Active, or Completed tasks
- Click "Clear Completed" to remove all completed tasks at once
- Click "✨ Create Comics ✨" button to open the Comic Creator

### Comic Creator
1. **Adding Panels**: Click "➕ Add Panel" to create new comic panels
2. **Speech Bubbles**:
   - Click "💬 Speech Bubble" or "💭 Thought Bubble" to activate the tool
   - Click anywhere on a panel to place a bubble
   - Enter text in the popup dialog
   - Drag bubbles to reposition them
3. **Images**: Click "🖼️ Upload Image" to add character images or backgrounds
4. **Drawing**:
   - Click "✏️ Draw" to enable drawing mode
   - Select a color from the color picker
   - Draw directly on any panel
5. **Script Writing**: Use the script editor on the right to write your comic's dialogue and notes
6. **Saving**: Click "💾 Save" to download your comic as a JSON file
7. **Loading**: Click "📂 Load" to open a previously saved comic

## Files

- `index.html` - To-Do List main page
- `comic-creator.html` - Comic Creator application (standalone)
- `styles.css` - Styling and animations for To-Do List
- `app.js` - JavaScript functionality for To-Do List
- `server.js` - Simple Node.js HTTP server
- `package.json` - Project configuration
- `todo-app-standalone.html` - Standalone To-Do List with inline CSS/JS

## Technologies

- HTML5
- CSS3 (with animations and gradients)
- Vanilla JavaScript (ES6+)
- Node.js HTTP server
- localStorage API for data persistence
