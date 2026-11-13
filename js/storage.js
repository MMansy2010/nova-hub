/**
 * NOVA HUB - Storage Service
 * Robust, resilient LocalStorage data layer with zero external dependencies.
 */

const STORAGE_KEY = 'nova_hub_store_v1';
const THEME_KEY = 'nova_hub_theme';

const INITIAL_DATA = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  opportunities: [
    {
      id: 'opp-nasa-space-apps',
      name: 'NASA Space Apps Challenge',
      category: 'Hackathon',
      status: 'In Progress',
      priority: 'High',
      deadline: '',
      website: 'https://www.spaceappschallenge.org/',
      project: '',
      notes: "Global hackathon tackling challenges using NASA's open data. Working on mission concept and solution architecture.",
      createdAt: '2026-11-14T00:00:00.000Z',
      updatedAt: '2026-11-14T00:00:00.000Z'
    },
    {
      id: 'opp-coding-olympiad',
      name: 'Coding Olympiad',
      category: 'Competition / Computer Science',
      status: 'Preparation',
      priority: 'High',
      deadline: '',
      website: 'https://my.codingolympiad.org/stadia/6ac0d24d80ff02ec30fb6d96/my-exams',
      project: '',
      notes: 'Competitive programming and algorithmic problem solving exams. Review dynamic programming and graph theory.',
      createdAt: '2026-11-14T00:00:00.000Z',
      updatedAt: '2026-11-14T00:00:00.000Z'
    },
    {
      id: 'opp-technovation-girls',
      name: 'Technovation Challenge',
      category: 'Technology Competition',
      status: 'In Progress',
      priority: 'High',
      deadline: '',
      website: 'https://my.technovation.org/submission/start',
      project: 'FoodLoop',
      notes: 'Project: FoodLoop. Tech entrepreneurship competition focusing on community food reduction and distribution.',
      createdAt: '2026-11-14T00:00:00.000Z',
      updatedAt: '2026-11-14T00:00:00.000Z'
    },
    {
      id: 'opp-sys-volunteering',
      name: 'SYS Volunteering',
      category: 'Volunteering',
      status: 'Pending',
      priority: 'Medium',
      deadline: '',
      website: '',
      project: '',
      notes: 'Youth volunteering program application submitted. Waiting for orientation details and confirmation.',
      createdAt: '2026-11-14T00:00:00.000Z',
      updatedAt: '2026-11-14T00:00:00.000Z'
    },
    {
      id: 'opp-nta',
      name: 'NTA',
      category: 'Program / Application',
      status: 'Pending',
      priority: 'Medium',
      deadline: '',
      website: '',
      project: '',
      notes: 'National Training Academy candidate profile and documentation submitted. Status under review.',
      createdAt: '2026-11-14T00:00:00.000Z',
      updatedAt: '2026-11-14T00:00:00.000Z'
    },
    {
      id: 'opp-gv-hackathon',
      name: 'GV Hackathon',
      category: 'Hackathon',
      status: 'Pending Approval',
      priority: 'Medium',
      deadline: '',
      website: 'https://gvhackathon.com/app',
      project: '',
      notes: "I registered with a friend. We are currently waiting for our teacher's approval. We are participating in the Mixed category.",
      createdAt: '2026-11-14T00:00:00.000Z',
      updatedAt: '2026-11-14T00:00:00.000Z'
    },
    {
      id: 'opp-junior-academy-launchpad',
      name: 'Junior Academy – Launchpad',
      organization: 'New York Academy of Sciences (NYAS)',
      category: 'STEM / Research Program',
      type: 'Academic Program',
      status: 'In Progress',
      priority: 'High',
      platform: 'Junior Academy Launchpad',
      deadline: '',
      website: 'https://www.nyas.org/',
      project: '',
      notes: 'The student has been accepted into the Junior Academy. Launchpad is associated with the program and should be tracked as a separate milestone.',
      createdAt: '2026-11-14T00:00:00.000Z',
      updatedAt: '2026-11-14T00:00:00.000Z'
    }
  ],
  tasks: []
};

class NovaStorage {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // First run - populate initial opportunities
        this.saveToStorage(INITIAL_DATA);
        return JSON.parse(JSON.stringify(INITIAL_DATA));
      }
      const parsed = JSON.parse(raw);
      // Validate schema
      if (!parsed || !Array.isArray(parsed.opportunities) || !Array.isArray(parsed.tasks)) {
        console.warn('[NovaStorage] Corrupted data structure detected. Restoring baseline data safely.');
        this.saveToStorage(INITIAL_DATA);
        return JSON.parse(JSON.stringify(INITIAL_DATA));
      }
      // Automatic migration: update Technovation Girls to Technovation Challenge if present
      let modified = false;
      parsed.opportunities.forEach(o => {
        if (o.name === 'Technovation Girls') {
          o.name = 'Technovation Challenge';
          modified = true;
        }
      });

      // Automatic migration: add Junior Academy – Launchpad if not already present
      const hasJA = parsed.opportunities.some(o => o.name === 'Junior Academy – Launchpad' || o.id === 'opp-junior-academy-launchpad');
      if (!hasJA) {
        parsed.opportunities.push({
          id: 'opp-junior-academy-launchpad',
          name: 'Junior Academy – Launchpad',
          organization: 'New York Academy of Sciences (NYAS)',
          category: 'STEM / Research Program',
          type: 'Academic Program',
          status: 'In Progress',
          priority: 'High',
          platform: 'Junior Academy Launchpad',
          deadline: '',
          website: 'https://www.nyas.org/',
          project: '',
          notes: 'The student has been accepted into the Junior Academy. Launchpad is associated with the program and should be tracked as a separate milestone.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        modified = true;
      }

      if (modified) {
        this.saveToStorage(parsed);
      }
      return parsed;
    } catch (err) {
      console.error('[NovaStorage] Error reading localStorage:', err);
      return JSON.parse(JSON.stringify(INITIAL_DATA));
    }
  }

  saveToStorage(data) {
    try {
      data.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.dispatchChange();
      return true;
    } catch (err) {
      console.error('[NovaStorage] Error writing to localStorage:', err);
      return false;
    }
  }

  dispatchChange() {
    window.dispatchEvent(new CustomEvent('nova:data-changed', {
      detail: { timestamp: Date.now() }
    }));
  }

  // --- Theme ---
  getTheme() {
    return localStorage.getItem(THEME_KEY) || 'dark';
  }

  setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  // --- Opportunities ---
  getOpportunities() {
    return [...this.data.opportunities];
  }

  getOpportunity(id) {
    return this.data.opportunities.find(o => o.id === id) || null;
  }

  saveOpportunity(opp) {
    const now = new Date().toISOString();
    const existingIndex = this.data.opportunities.findIndex(o => o.id === opp.id);

    if (existingIndex >= 0) {
      this.data.opportunities[existingIndex] = {
        ...this.data.opportunities[existingIndex],
        ...opp,
        updatedAt: now
      };
    } else {
      const newOpp = {
        id: opp.id || 'opp-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5),
        name: opp.name.trim(),
        category: opp.category || 'General',
        type: opp.type ? opp.type.trim() : '',
        organization: opp.organization ? opp.organization.trim() : '',
        platform: opp.platform ? opp.platform.trim() : '',
        status: opp.status || 'Not Started',
        priority: opp.priority || 'Medium',
        deadline: opp.deadline || '',
        website: opp.website ? opp.website.trim() : '',
        project: opp.project ? opp.project.trim() : '',
        notes: opp.notes || '',
        createdAt: now,
        updatedAt: now
      };
      this.data.opportunities.unshift(newOpp);
    }

    this.saveToStorage(this.data);
    return true;
  }

  deleteOpportunity(id) {
    this.data.opportunities = this.data.opportunities.filter(o => o.id !== id);
    // Also remove associated tasks or unassign them
    this.data.tasks = this.data.tasks.filter(t => t.opportunityId !== id);
    this.saveToStorage(this.data);
    return true;
  }

  // --- Tasks ---
  getTasks(filterFn = null) {
    const tasks = [...this.data.tasks];
    return filterFn ? tasks.filter(filterFn) : tasks;
  }

  getTask(id) {
    return this.data.tasks.find(t => t.id === id) || null;
  }

  saveTask(task) {
    const now = new Date().toISOString();
    const existingIndex = this.data.tasks.findIndex(t => t.id === task.id);

    if (existingIndex >= 0) {
      this.data.tasks[existingIndex] = {
        ...this.data.tasks[existingIndex],
        ...task,
        updatedAt: now
      };
    } else {
      const newTask = {
        id: task.id || 'task-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5),
        title: task.title.trim(),
        description: task.description ? task.description.trim() : '',
        opportunityId: task.opportunityId || '',
        dueDate: task.dueDate || '',
        priority: task.priority || 'Medium',
        completed: Boolean(task.completed),
        completedAt: task.completed ? now : null,
        createdAt: now,
        updatedAt: now
      };
      this.data.tasks.unshift(newTask);
    }

    this.saveToStorage(this.data);
    return true;
  }

  toggleTask(id) {
    const task = this.getTask(id);
    if (!task) return false;
    const willBeCompleted = !task.completed;
    return this.saveTask({
      ...task,
      completed: willBeCompleted,
      completedAt: willBeCompleted ? new Date().toISOString() : null
    });
  }

  deleteTask(id) {
    this.data.tasks = this.data.tasks.filter(t => t.id !== id);
    this.saveToStorage(this.data);
    return true;
  }

  // --- Notes ---
  updateNotes(opportunityId, notesContent) {
    const opp = this.getOpportunity(opportunityId);
    if (!opp) return false;
    opp.notes = notesContent;
    opp.updatedAt = new Date().toISOString();
    return this.saveOpportunity(opp);
  }

  // --- Statistics Calculation ---
  getCalculations() {
    const opps = this.data.opportunities;
    const tasks = this.data.tasks;
    const todayStr = new Date().toISOString().split('T')[0];

    const activeStatuses = ['In Progress', 'Preparation'];
    const pendingStatuses = ['Pending', 'Applied', 'Pending Approval'];

    const totalOpportunities = opps.length;
    const currentlyActive = opps.filter(o => activeStatuses.includes(o.status)).length;
    const pendingApplications = opps.filter(o => pendingStatuses.includes(o.status)).length;
    const completedOpportunities = opps.filter(o => o.status === 'Completed').length;

    // Overdue tasks: dueDate < today and not completed
    const overdueTasks = tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      return t.dueDate < todayStr;
    });

    const tasksDueToday = tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      return t.dueDate === todayStr;
    });

    // Per opportunity task progress
    const opportunityProgress = {};
    opps.forEach(opp => {
      const oppTasks = tasks.filter(t => t.opportunityId === opp.id);
      const total = oppTasks.length;
      const completed = oppTasks.filter(t => t.completed).length;
      opportunityProgress[opp.id] = {
        total,
        completed,
        percent: total > 0 ? Math.round((completed / total) * 100) : null
      };
    });

    return {
      totalOpportunities,
      currentlyActive,
      pendingApplications,
      completedOpportunities,
      overdueTasksCount: overdueTasks.length,
      overdueTasks,
      tasksDueTodayCount: tasksDueToday.length,
      tasksDueToday,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.completed).length,
      pendingTasks: tasks.filter(t => !t.completed).length,
      opportunityProgress
    };
  }

  // --- Export / Import / Reset ---
  exportJSON() {
    const exportPayload = {
      app: 'NOVA HUB',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: this.data
    };
    return JSON.stringify(exportPayload, null, 2);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      let payload = null;

      if (parsed.app === 'NOVA HUB' && parsed.data) {
        payload = parsed.data;
      } else if (Array.isArray(parsed.opportunities)) {
        payload = parsed;
      } else {
        throw new Error('Invalid JSON format. Expected NOVA HUB data structure.');
      }

      if (!Array.isArray(payload.opportunities)) {
        throw new Error('Opportunities must be an array.');
      }

      // Sanitize opportunities
      const sanitizedOpps = payload.opportunities.map((o, idx) => ({
        id: o.id || 'opp-imp-' + idx + '-' + Date.now().toString(36),
        name: (o.name || 'Untitled Opportunity').trim(),
        category: o.category || 'General',
        type: o.type || '',
        organization: o.organization || '',
        platform: o.platform || '',
        status: o.status || 'Not Started',
        priority: o.priority || 'Medium',
        deadline: o.deadline || '',
        website: o.website || '',
        project: o.project || '',
        notes: o.notes || '',
        createdAt: o.createdAt || new Date().toISOString(),
        updatedAt: o.updatedAt || new Date().toISOString()
      }));

      // Sanitize tasks
      const sanitizedTasks = Array.isArray(payload.tasks)
        ? payload.tasks.map((t, idx) => ({
            id: t.id || 'task-imp-' + idx + '-' + Date.now().toString(36),
            title: (t.title || 'Untitled Task').trim(),
            description: t.description || '',
            opportunityId: t.opportunityId || '',
            dueDate: t.dueDate || '',
            priority: t.priority || 'Medium',
            completed: Boolean(t.completed),
            completedAt: t.completedAt || null,
            createdAt: t.createdAt || new Date().toISOString(),
            updatedAt: t.updatedAt || new Date().toISOString()
          }))
        : [];

      this.data = {
        version: 1,
        lastUpdated: new Date().toISOString(),
        opportunities: sanitizedOpps,
        tasks: sanitizedTasks
      };

      this.saveToStorage(this.data);
      return { success: true, oppsCount: sanitizedOpps.length, tasksCount: sanitizedTasks.length };
    } catch (err) {
      console.error('[NovaStorage] Import error:', err);
      return { success: false, error: err.message };
    }
  }

  resetToDefaults() {
    this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.saveToStorage(this.data);
    return true;
  }
}

// Global singleton instance
window.storage = new NovaStorage();
