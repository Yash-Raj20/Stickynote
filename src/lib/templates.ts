export interface TemplateNote {
  title: string;
  content: string;
  color: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isFrame?: boolean;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  emoji: string;
  notes: TemplateNote[];
}

export const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'kanban', label: 'Kanban', emoji: '📋' },
  { id: 'retro', label: 'Retro', emoji: '🔄' },
  { id: 'brainstorm', label: 'Brainstorm', emoji: '🧠' },
  { id: 'planning', label: 'Planning', emoji: '📅' },
  { id: 'design', label: 'Design', emoji: '🎨' },
  { id: 'meeting', label: 'Meeting', emoji: '🤝' },
];

export const TEMPLATES: Template[] = [
  // ── KANBAN ────────────────────────────────────────────────
  {
    id: 'kanban-basic',
    name: 'Basic Kanban',
    description: 'To Do → In Progress → Done workflow',
    category: 'kanban',
    emoji: '📋',
    notes: [
      { title: '📋 To Do', content: '<p>Tasks waiting to be picked up</p>', color: 'transparent', isFrame: true, position: { x: 40, y: 40 }, size: { width: 280, height: 500 } },
      { title: '⚡ In Progress', content: '<p>Currently being worked on</p>', color: 'transparent', isFrame: true, position: { x: 360, y: 40 }, size: { width: 280, height: 500 } },
      { title: '✅ Done', content: '<p>Completed tasks</p>', color: 'transparent', isFrame: true, position: { x: 680, y: 40 }, size: { width: 280, height: 500 } },
      { title: 'Design homepage', content: '<p>Create wireframes first</p>', color: 'sunset', position: { x: 60, y: 120 }, size: { width: 240, height: 120 } },
      { title: 'Write API docs', content: '<p>Cover all endpoints</p>', color: 'golden', position: { x: 60, y: 260 }, size: { width: 240, height: 120 } },
      { title: 'Fix login bug', content: '<p>Check token expiry logic</p>', color: 'pink', position: { x: 380, y: 120 }, size: { width: 240, height: 120 } },
      { title: 'Setup CI/CD', content: '<p>GitHub Actions pipeline</p>', color: 'aurora', position: { x: 700, y: 120 }, size: { width: 240, height: 120 } },
    ],
  },
  {
    id: 'kanban-sprint',
    name: 'Sprint Board',
    description: 'Backlog → Sprint → Review → Done',
    category: 'kanban',
    emoji: '🏃',
    notes: [
      { title: '🗂 Backlog', content: '', color: 'transparent', isFrame: true, position: { x: 40, y: 40 }, size: { width: 260, height: 520 } },
      { title: '🏃 Sprint', content: '', color: 'transparent', isFrame: true, position: { x: 340, y: 40 }, size: { width: 260, height: 520 } },
      { title: '👀 Review', content: '', color: 'transparent', isFrame: true, position: { x: 640, y: 40 }, size: { width: 260, height: 520 } },
      { title: '🏁 Done', content: '', color: 'transparent', isFrame: true, position: { x: 940, y: 40 }, size: { width: 260, height: 520 } },
      { title: 'User auth flow', content: '<p>Login, register, forgot password</p>', color: 'golden', position: { x: 60, y: 120 }, size: { width: 220, height: 110 } },
      { title: 'Dashboard UI', content: '<p>Main metrics cards</p>', color: 'ocean', position: { x: 60, y: 250 }, size: { width: 220, height: 110 } },
      { title: 'Search feature', content: '<p>Full text search</p>', color: 'blue', position: { x: 360, y: 120 }, size: { width: 220, height: 110 } },
      { title: 'API rate limit', content: '<p>Implement throttling</p>', color: 'xanthous', position: { x: 660, y: 120 }, size: { width: 220, height: 110 } },
      { title: 'Deploy to Vercel', content: '<p>Production deploy done ✅</p>', color: 'aurora', position: { x: 960, y: 120 }, size: { width: 220, height: 110 } },
    ],
  },
  {
    id: 'kanban-bug-tracker',
    name: 'Bug Tracker',
    description: 'Track bugs from reported to resolved',
    category: 'kanban',
    emoji: '🐛',
    notes: [
      { title: '🐛 Reported', content: '', color: 'transparent', isFrame: true, position: { x: 40, y: 40 }, size: { width: 260, height: 480 } },
      { title: '🔍 Investigating', content: '', color: 'transparent', isFrame: true, position: { x: 340, y: 40 }, size: { width: 260, height: 480 } },
      { title: '🛠 Fixing', content: '', color: 'transparent', isFrame: true, position: { x: 640, y: 40 }, size: { width: 260, height: 480 } },
      { title: '✅ Resolved', content: '', color: 'transparent', isFrame: true, position: { x: 940, y: 40 }, size: { width: 260, height: 480 } },
      { title: 'Login crashes on iOS', content: '<p>Priority: HIGH</p>', color: 'sunset', position: { x: 60, y: 120 }, size: { width: 220, height: 100 } },
      { title: 'Dark mode flicker', content: '<p>Priority: MED</p>', color: 'xanthous', position: { x: 60, y: 240 }, size: { width: 220, height: 100 } },
      { title: 'API 500 on upload', content: '<p>Need server logs</p>', color: 'pink', position: { x: 360, y: 120 }, size: { width: 220, height: 100 } },
    ],
  },

  // ── RETRO ─────────────────────────────────────────────────
  {
    id: 'retro-classic',
    name: 'Classic Retro',
    description: '😊 Went Well · 😟 Improve · 💡 Try Next',
    category: 'retro',
    emoji: '🔄',
    notes: [
      { title: '😊 Went Well', content: '<p>Things the team is proud of</p>', color: 'transparent', isFrame: true, position: { x: 40, y: 40 }, size: { width: 280, height: 480 } },
      { title: '😟 To Improve', content: '<p>Pain points this sprint</p>', color: 'transparent', isFrame: true, position: { x: 360, y: 40 }, size: { width: 280, height: 480 } },
      { title: '💡 Try Next', content: '<p>New ideas for next sprint</p>', color: 'transparent', isFrame: true, position: { x: 680, y: 40 }, size: { width: 280, height: 480 } },
      { title: 'Great team sync!', content: '<p>Daily standups were productive</p>', color: 'aurora', position: { x: 60, y: 130 }, size: { width: 240, height: 100 } },
      { title: 'Shipping was smooth', content: '<p>Zero downtime deploy</p>', color: 'power', position: { x: 60, y: 250 }, size: { width: 240, height: 100 } },
      { title: 'PR reviews slow', content: '<p>Avg 3 days to merge</p>', color: 'sunset', position: { x: 380, y: 130 }, size: { width: 240, height: 100 } },
      { title: 'Pair programming', content: '<p>Try it for complex tasks</p>', color: 'ocean', position: { x: 700, y: 130 }, size: { width: 240, height: 100 } },
    ],
  },
  {
    id: 'retro-4ls',
    name: '4Ls Retro',
    description: 'Liked · Learned · Lacked · Longed For',
    category: 'retro',
    emoji: '4️⃣',
    notes: [
      { title: '❤️ Liked', content: '', color: 'transparent', isFrame: true, position: { x: 40, y: 40 }, size: { width: 260, height: 450 } },
      { title: '📚 Learned', content: '', color: 'transparent', isFrame: true, position: { x: 340, y: 40 }, size: { width: 260, height: 450 } },
      { title: '😕 Lacked', content: '', color: 'transparent', isFrame: true, position: { x: 640, y: 40 }, size: { width: 260, height: 450 } },
      { title: '🌟 Longed For', content: '', color: 'transparent', isFrame: true, position: { x: 940, y: 40 }, size: { width: 260, height: 450 } },
      { title: 'Fast feedback loops', content: '', color: 'green', position: { x: 60, y: 130 }, size: { width: 220, height: 90 } },
      { title: 'New testing strategy', content: '', color: 'blue', position: { x: 360, y: 130 }, size: { width: 220, height: 90 } },
      { title: 'Documentation', content: '<p>Not enough written docs</p>', color: 'pink', position: { x: 660, y: 130 }, size: { width: 220, height: 90 } },
      { title: 'More design time', content: '', color: 'yellow', position: { x: 960, y: 130 }, size: { width: 220, height: 90 } },
    ],
  },
  {
    id: 'retro-mad-sad-glad',
    name: 'Mad · Sad · Glad',
    description: 'Emotional retrospective format',
    category: 'retro',
    emoji: '😤',
    notes: [
      { title: '😤 Mad', content: '<p>What frustrated the team?</p>', color: 'transparent', isFrame: true, position: { x: 40, y: 40 }, size: { width: 280, height: 450 } },
      { title: '😢 Sad', content: '<p>What disappointed us?</p>', color: 'transparent', isFrame: true, position: { x: 360, y: 40 }, size: { width: 280, height: 450 } },
      { title: '😊 Glad', content: '<p>What made us happy?</p>', color: 'transparent', isFrame: true, position: { x: 680, y: 40 }, size: { width: 280, height: 450 } },
      { title: 'Scope creep again', content: '', color: 'pink', position: { x: 60, y: 130 }, size: { width: 240, height: 90 } },
      { title: 'Feature got cut', content: '', color: 'blue', position: { x: 380, y: 130 }, size: { width: 240, height: 90 } },
      { title: 'Users loved the update!', content: '', color: 'green', position: { x: 700, y: 130 }, size: { width: 240, height: 90 } },
    ],
  },

  // ── BRAINSTORM ────────────────────────────────────────────
  {
    id: 'brainstorm-mindmap',
    name: 'Mind Map',
    description: 'Central idea with radiating branches',
    category: 'brainstorm',
    emoji: '🧠',
    notes: [
      { title: '💡 Central Idea', content: '<p>Your main topic here</p>', color: 'yellow', position: { x: 400, y: 250 }, size: { width: 200, height: 100 } },
      { title: 'Branch A', content: '<p>First major concept</p>', color: 'green', position: { x: 100, y: 120 }, size: { width: 180, height: 90 } },
      { title: 'Branch B', content: '<p>Second major concept</p>', color: 'blue', position: { x: 720, y: 120 }, size: { width: 180, height: 90 } },
      { title: 'Branch C', content: '<p>Third major concept</p>', color: 'pink', position: { x: 100, y: 380 }, size: { width: 180, height: 90 } },
      { title: 'Branch D', content: '<p>Fourth major concept</p>', color: 'purple', position: { x: 720, y: 380 }, size: { width: 180, height: 90 } },
      { title: 'Sub-idea A1', content: '', color: 'green', position: { x: 60, y: 240 }, size: { width: 140, height: 70 } },
      { title: 'Sub-idea B1', content: '', color: 'blue', position: { x: 770, y: 240 }, size: { width: 140, height: 70 } },
    ],
  },
  {
    id: 'brainstorm-how-might-we',
    name: 'How Might We',
    description: 'Problem reframing into opportunities',
    category: 'brainstorm',
    emoji: '🤔',
    notes: [
      { title: '🎯 Problem Statement', content: '<p>Write the core problem here</p>', color: 'pink', position: { x: 300, y: 40 }, size: { width: 400, height: 100 } },
      { title: '💬 HMW Area 1', content: '<p>How might we improve onboarding?</p>', color: 'transparent', isFrame: true, position: { x: 40, y: 200 }, size: { width: 280, height: 350 } },
      { title: '💬 HMW Area 2', content: '<p>How might we reduce churn?</p>', color: 'transparent', isFrame: true, position: { x: 360, y: 200 }, size: { width: 280, height: 350 } },
      { title: '💬 HMW Area 3', content: '<p>How might we delight users?</p>', color: 'transparent', isFrame: true, position: { x: 680, y: 200 }, size: { width: 280, height: 350 } },
      { title: 'Simplify signup', content: '', color: 'yellow', position: { x: 60, y: 290 }, size: { width: 240, height: 80 } },
      { title: 'Add tooltips', content: '', color: 'yellow', position: { x: 60, y: 390 }, size: { width: 240, height: 80 } },
    ],
  },
  {
    id: 'brainstorm-crazy8',
    name: 'Crazy 8s',
    description: '8 ideas in 8 minutes — rapid ideation',
    category: 'brainstorm',
    emoji: '⚡',
    notes: [
      { title: '⚡ Idea 1', content: '<p>Sketch it out!</p>', color: 'yellow', position: { x: 40, y: 40 }, size: { width: 200, height: 180 } },
      { title: '⚡ Idea 2', content: '<p>Sketch it out!</p>', color: 'green', position: { x: 260, y: 40 }, size: { width: 200, height: 180 } },
      { title: '⚡ Idea 3', content: '<p>Sketch it out!</p>', color: 'blue', position: { x: 480, y: 40 }, size: { width: 200, height: 180 } },
      { title: '⚡ Idea 4', content: '<p>Sketch it out!</p>', color: 'pink', position: { x: 700, y: 40 }, size: { width: 200, height: 180 } },
      { title: '⚡ Idea 5', content: '<p>Sketch it out!</p>', color: 'yellow', position: { x: 40, y: 250 }, size: { width: 200, height: 180 } },
      { title: '⚡ Idea 6', content: '<p>Sketch it out!</p>', color: 'green', position: { x: 260, y: 250 }, size: { width: 200, height: 180 } },
      { title: '⚡ Idea 7', content: '<p>Sketch it out!</p>', color: 'blue', position: { x: 480, y: 250 }, size: { width: 200, height: 180 } },
      { title: '⚡ Idea 8', content: '<p>Sketch it out!</p>', color: 'pink', position: { x: 700, y: 250 }, size: { width: 200, height: 180 } },
    ],
  },

  // ── PLANNING ──────────────────────────────────────────────
  {
    id: 'planning-weekly',
    name: 'Weekly Planner',
    description: 'Plan your week day by day',
    category: 'planning',
    emoji: '📅',
    notes: [
      { title: '🟡 Monday', content: '', color: 'transparent', isFrame: true, position: { x: 40, y: 40 }, size: { width: 180, height: 440 } },
      { title: '🟠 Tuesday', content: '', color: 'transparent', isFrame: true, position: { x: 240, y: 40 }, size: { width: 180, height: 440 } },
      { title: '🟢 Wednesday', content: '', color: 'transparent', isFrame: true, position: { x: 440, y: 40 }, size: { width: 180, height: 440 } },
      { title: '🔵 Thursday', content: '', color: 'transparent', isFrame: true, position: { x: 640, y: 40 }, size: { width: 180, height: 440 } },
      { title: '🟣 Friday', content: '', color: 'transparent', isFrame: true, position: { x: 840, y: 40 }, size: { width: 180, height: 440 } },
      { title: 'Team standup 9am', content: '', color: 'yellow', position: { x: 60, y: 130 }, size: { width: 140, height: 80 } },
      { title: 'Code review', content: '', color: 'blue', position: { x: 260, y: 130 }, size: { width: 140, height: 80 } },
      { title: 'Design meeting', content: '', color: 'green', position: { x: 460, y: 130 }, size: { width: 140, height: 80 } },
    ],
  },
  {
    id: 'planning-okr',
    name: 'OKR Planner',
    description: 'Objectives & Key Results framework',
    category: 'planning',
    emoji: '🎯',
    notes: [
      { title: '🎯 Objective 1', content: '<p>Grow product adoption</p>', color: 'yellow', position: { x: 40, y: 40 }, size: { width: 300, height: 90 } },
      { title: 'KR 1.1', content: '<p>100k MAU by Q4</p>', color: 'green', position: { x: 60, y: 160 }, size: { width: 260, height: 80 } },
      { title: 'KR 1.2', content: '<p>NPS score &gt; 50</p>', color: 'green', position: { x: 60, y: 260 }, size: { width: 260, height: 80 } },
      { title: '🎯 Objective 2', content: '<p>Improve reliability</p>', color: 'yellow', position: { x: 420, y: 40 }, size: { width: 300, height: 90 } },
      { title: 'KR 2.1', content: '<p>99.9% uptime</p>', color: 'blue', position: { x: 440, y: 160 }, size: { width: 260, height: 80 } },
      { title: 'KR 2.2', content: '<p>P95 latency &lt; 200ms</p>', color: 'blue', position: { x: 440, y: 260 }, size: { width: 260, height: 80 } },
      { title: '🎯 Objective 3', content: '<p>Build great team</p>', color: 'yellow', position: { x: 800, y: 40 }, size: { width: 300, height: 90 } },
      { title: 'KR 3.1', content: '<p>Hire 3 engineers</p>', color: 'pink', position: { x: 820, y: 160 }, size: { width: 260, height: 80 } },
    ],
  },

  // ── DESIGN ────────────────────────────────────────────────
  {
    id: 'design-ux-research',
    name: 'UX Research Board',
    description: 'Insights, patterns, and action items',
    category: 'design',
    emoji: '🔬',
    notes: [
      { title: '👥 User Insights', content: '', color: 'transparent', isFrame: true, position: { x: 40, y: 40 }, size: { width: 320, height: 450 } },
      { title: '🔁 Patterns', content: '', color: 'transparent', isFrame: true, position: { x: 400, y: 40 }, size: { width: 320, height: 450 } },
      { title: '✅ Action Items', content: '', color: 'transparent', isFrame: true, position: { x: 760, y: 40 }, size: { width: 320, height: 450 } },
      { title: 'Users want offline mode', content: '<p>Mentioned in 6/10 interviews</p>', color: 'blue', position: { x: 60, y: 130 }, size: { width: 280, height: 90 } },
      { title: 'Search is confusing', content: '<p>Drop-off at search step</p>', color: 'pink', position: { x: 60, y: 240 }, size: { width: 280, height: 90 } },
      { title: 'Navigation pattern', content: '<p>Bottom nav preferred on mobile</p>', color: 'yellow', position: { x: 420, y: 130 }, size: { width: 280, height: 90 } },
      { title: 'Redesign search UX', content: '<p>Owner: Design team</p>', color: 'green', position: { x: 780, y: 130 }, size: { width: 280, height: 90 } },
    ],
  },
  {
    id: 'design-component-map',
    name: 'Component Map',
    description: 'Map out your design system components',
    category: 'design',
    emoji: '🧩',
    notes: [
      { title: '🎨 Foundations', content: '', color: 'transparent', isFrame: true, position: { x: 40, y: 40 }, size: { width: 280, height: 420 } },
      { title: '🧩 Components', content: '', color: 'transparent', isFrame: true, position: { x: 360, y: 40 }, size: { width: 280, height: 420 } },
      { title: '📄 Pages', content: '', color: 'transparent', isFrame: true, position: { x: 680, y: 40 }, size: { width: 280, height: 420 } },
      { title: 'Color tokens', content: '<p>Primary, secondary, semantic</p>', color: 'yellow', position: { x: 60, y: 130 }, size: { width: 240, height: 80 } },
      { title: 'Typography scale', content: '<p>H1–H6, body, caption</p>', color: 'yellow', position: { x: 60, y: 230 }, size: { width: 240, height: 80 } },
      { title: 'Button', content: '<p>Primary, secondary, ghost</p>', color: 'blue', position: { x: 380, y: 130 }, size: { width: 240, height: 80 } },
      { title: 'Input / Form', content: '<p>Text, select, checkbox</p>', color: 'blue', position: { x: 380, y: 230 }, size: { width: 240, height: 80 } },
      { title: 'Dashboard', content: '<p>Main app view</p>', color: 'green', position: { x: 700, y: 130 }, size: { width: 240, height: 80 } },
    ],
  },

  // ── MEETING ───────────────────────────────────────────────
  {
    id: 'meeting-agenda',
    name: 'Meeting Agenda',
    description: 'Structured agenda with action items',
    category: 'meeting',
    emoji: '🤝',
    notes: [
      { title: '📌 Meeting Goal', content: '<p>Define the purpose of this meeting</p>', color: 'yellow', position: { x: 40, y: 40 }, size: { width: 400, height: 90 } },
      { title: '📋 Agenda', content: '<p>1. Review last week<br>2. Current blockers<br>3. Next steps</p>', color: 'blue', position: { x: 40, y: 160 }, size: { width: 380, height: 150 } },
      { title: '🙋 Attendees', content: '<p>List participants here</p>', color: 'green', position: { x: 460, y: 40 }, size: { width: 280, height: 120 } },
      { title: '✅ Action Items', content: '', color: 'transparent', isFrame: true, position: { x: 460, y: 200 }, size: { width: 420, height: 300 } },
      { title: '⏰ Time: 30 min', content: '<p>Stay on track!</p>', color: 'pink', position: { x: 40, y: 340 }, size: { width: 200, height: 80 } },
      { title: 'Action: Update roadmap', content: '<p>Owner: PM | Due: Friday</p>', color: 'yellow', position: { x: 480, y: 290 }, size: { width: 240, height: 90 } },
    ],
  },
  {
    id: 'meeting-1on1',
    name: '1-on-1 Meeting',
    description: 'Manager & IC structured check-in',
    category: 'meeting',
    emoji: '👥',
    notes: [
      { title: '😊 How are you doing?', content: '<p>Personal check-in — how is morale?</p>', color: 'green', position: { x: 40, y: 40 }, size: { width: 340, height: 100 } },
      { title: '🔥 Top of Mind', content: '<p>What\'s the most important thing right now?</p>', color: 'yellow', position: { x: 40, y: 170 }, size: { width: 340, height: 120 } },
      { title: '🚧 Blockers', content: '<p>What\'s in your way?</p>', color: 'pink', position: { x: 40, y: 320 }, size: { width: 340, height: 120 } },
      { title: '📈 Career & Growth', content: '<p>What are you learning? What do you want to grow in?</p>', color: 'blue', position: { x: 420, y: 40 }, size: { width: 340, height: 140 } },
      { title: '✅ Action Items', content: '', color: 'transparent', isFrame: true, position: { x: 420, y: 210 }, size: { width: 340, height: 230 } },
      { title: 'Schedule next 1:1', content: '<p>Owner: Manager</p>', color: 'green', position: { x: 440, y: 300 }, size: { width: 300, height: 80 } },
    ],
  },
];
