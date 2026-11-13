# NOVA HUB — Personal Opportunities Dashboard

> A minimal, modern, editorial personal productivity command center for ambitious students and developers managing hackathons, competitions, volunteering programs, and academic opportunities.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-39e58c?style=for-the-badge)](https://mmansy2010.github.io/nova-hub/)
[![Platform](https://img.shields.io/badge/Platform-Web%20%2F%20PWA-14171e?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](#)

---

## ✦ Design Philosophy

NOVA HUB was deliberately crafted to reject generic AI website aesthetics — no purple/blue gradient soup, no glassmorphism clutter, no oversized empty padding, and no superficial cards.

Instead, NOVA HUB is inspired by tools like **Linear**, **Raycast**, and **Notion**:
- **Dark-first interface**: Deep charcoal tones (`#0c0d11`, `#14171e`) engineered for all-night hackathons and focused development sessions.
- **Restrained accents**: Precision electric lime (`#39e58c`) for active states and critical telemetry.
- **Editorial typography**: Crisp visual hierarchy, monospace data tags (`JetBrains Mono`), and high-density, uncluttered information architecture.
- **Keyboard-driven UX**: Raycast-style Command Palette (`Ctrl+K` / `⌘K`), direct numeric view jumping (`1`-`6`), and instant modal triggers (`N`, `T`).
- **Complete theme fidelity**: Seamless dark-to-light mode toggle designed with equal editorial care.

---

## ⚡ Core Capabilities

### 1. Command Overview
- Real-time telemetry: dynamically calculated counts for **Total Opportunities**, **Currently Active**, **Pending Applications**, **Completed**, and **Overdue Tasks**.
- **Most Urgent Tasks**: Prioritized queue sorted by urgency and priority.
- **Strategic Recommendation Engine**: Dynamically analyzes deadlines and pipeline statuses to suggest the next critical action.
- **Upcoming Recorded Deadlines**: Strict fidelity to actual user-entered dates — **no invented deadlines or fake progress numbers**.

### 2. Opportunity Pipeline Directory
- Comprehensive CRUD management for opportunities.
- Supported statuses: `Not Started`, `Applied`, `Pending`, `Pending Approval`, `In Progress`, `Preparation`, `Completed`, `Rejected`, `On Hold`.
- Priority tiers: `Critical`, `High`, `Medium`, `Low`.
- Flexible views: Switch between an information-dense **Table View** and structured **Card Grid**.
- Real progress calculation: Computed directly from attached task completion rates ($completedTasks / totalTasks$). If no tasks exist, displays honest empty state instead of fabricated percentages.
- Safe external portal launcher with verified URLs.

### 3. Task Operations Center
- Dedicated task management with status, priority, and opportunity filters.
- Immediate visual indicators for **Overdue** deadlines and tasks **Due Today**.
- Task-to-opportunity binding: Completing a task automatically recalculates parent opportunity progress and dashboard metrics.

### 4. Calendar & Milestones
- Interactive monthly grid with navigation (Previous, Next, Today).
- Chronological timeline agenda listing all active milestones and deadlines.
- Honest date mapping: Only renders dates explicitly entered by the user.

### 5. Field Notes & Dossiers
- Dedicated notes workspace for every opportunity.
- Structured section templates with one-click insertion:
  - `[Last Update]`
  - `[Important Information]`
  - `[People to Contact]`
  - `[Next Steps]`
  - `[Ideas]`
- Debounced auto-save with live word and character counters.

### 6. LocalStorage Engine & Data Portability
- **Zero backend required**: Runs 100% client-side with zero external trackers or databases.
- Automatic persistence on every interaction.
- **JSON Backup Export**: Download a full snapshot of your workspace (`nova-hub-backup-YYYY-MM-DD.json`).
- **JSON Backup Import**: Restore snapshots with schema sanitation and validation.
- **Safe Baseline Reset**: Two-step confirmation dialog to restore initial opportunities without accidental loss.

---

## 📁 Initial Preloaded Opportunities

NOVA HUB comes out of the box with the 6 baseline student opportunities:

1. **NASA Space Apps Challenge**
   - *Category*: Hackathon
   - *Website*: [https://www.spaceappschallenge.org/](https://www.spaceappschallenge.org/)
   - *Status*: In Progress | *Priority*: High
2. **Coding Olympiad**
   - *Category*: Competition / Computer Science
   - *Website*: [https://my.codingolympiad.org/stadia/6ac0d24d80ff02ec30fb6d96/my-exams](https://my.codingolympiad.org/stadia/6ac0d24d80ff02ec30fb6d96/my-exams)
   - *Status*: Preparation | *Priority*: High
3. **Technovation Challenge**
   - *Category*: Technology Competition
   - *Project*: FoodLoop
   - *Website*: [https://my.technovation.org/submission/start](https://my.technovation.org/submission/start)
   - *Status*: In Progress | *Priority*: High
4. **SYS Volunteering**
   - *Category*: Volunteering
   - *Status*: Pending | *Priority*: Medium
5. **NTA**
   - *Category*: Program / Application
   - *Status*: Pending | *Priority*: Medium
6. **GV Hackathon**
   - *Category*: Hackathon
   - *Website*: [https://gvhackathon.com/app](https://gvhackathon.com/app)
   - *Status*: Pending Approval | *Priority*: Medium
   - *Context*: Registered with a friend, waiting for teacher's approval, competing in the Mixed category.

---

## ⌨️ Keyboard Navigation

| Shortcut | Description |
|---|---|
| <kbd>Ctrl</kbd> + <kbd>K</kbd> / <kbd>⌘K</kbd> | Open Command Palette & Global Search |
| <kbd>1</kbd> | Navigate to Command Overview |
| <kbd>2</kbd> | Navigate to Opportunities Directory |
| <kbd>3</kbd> | Navigate to Task Operations |
| <kbd>4</kbd> | Navigate to Calendar & Milestones |
| <kbd>5</kbd> | Navigate to Field Notes |
| <kbd>6</kbd> | Navigate to Settings & Data Control |
| <kbd>N</kbd> | Create New Opportunity |
| <kbd>T</kbd> | Create New Task |
| <kbd>ESC</kbd> | Close active modal or command palette |

---

## 🛠️ Architecture & Technology

- **HTML5**: Semantic tags, accessible landmarks, and native date pickers.
- **CSS3**: Custom design tokens, CSS Grid & Flexbox, hardware-accelerated animations, zero external UI frameworks.
- **Vanilla JavaScript (ES6+)**: Modular architecture with separation of concerns:
  - `storage.js`: LocalStorage manager, calculations, and event dispatcher.
  - `views/`: Dedicated render modules for Overview, Opportunities, Tasks, Calendar, Notes, and Settings.
  - `app.js`: Global event bus, routing, command palette, and modal controllers.

```
nova-hub/
├── index.html              # Main single-page application shell
├── README.md               # Documentation and technical guide
├── css/
│   ├── themes.css          # Dark-first and light design tokens
│   └── main.css            # Component styles, typography, layout, animations
└── js/
    ├── storage.js          # LocalStorage persistence, export/import, calculations
    ├── app.js              # Routing, modal controllers, search, keyboard shortcuts
    └── views/
        ├── overview.js     # Dashboard metrics and priority recommendations
        ├── opportunities.js# Directory, card/table views, filters, CRUD
        ├── tasks.js        # Dedicated task checklist, overdue badges
        ├── calendar.js     # Month grid and milestone timeline
        ├── notes.js        # Editorial notes workspace with section templates
        └── settings.js     # Theme switcher, telemetry, backup & restore
```

---

## 🚀 Local Setup & GitHub Pages Deployment

### Running Locally
No build step or server required! You can open `index.html` directly in any modern browser:
```bash
# Clone the repository
git clone https://github.com/MMansy2010/nova-hub.git

# Open directly in browser
cd nova-hub
# On Windows:
start index.html
# On macOS:
open index.html
# On Linux:
xdg-open index.html
```

Or serve with any static web server:
```bash
npx serve .
# or
python3 -m http.server 8000
```

### GitHub Pages Deployment
1. Go to repository **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
3. Select branch: `main` and folder: `/ (root)`.
4. Click **Save**.
5. Your dashboard will be live at `https://<username>.github.io/nova-hub/`.

---

## 📄 License

MIT License. Designed and engineered for high-agency students building the future.
