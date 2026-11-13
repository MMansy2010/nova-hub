/**
 * NOVA HUB - Main Application Controller
 * Handles routing, modals, global search, command palette, and reactive updates.
 */

window.NovaApp = {
  currentView: 'overview',
  activeOpportunityModalId: null,
  activeTaskModalId: null,

  init() {
    // 1. Initialize Theme
    const savedTheme = window.storage.getTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);

    // 2. Set Current Date in Header
    this.updateHeaderDate();

    // 3. Listen for Storage Changes
    window.addEventListener('nova:data-changed', () => {
      this.refreshCurrentView();
      this.updateSidebarBadges();
    });

    // 4. Setup Routing
    window.addEventListener('hashchange', () => this.handleHashChange());
    this.handleHashChange();

    // 5. Setup Keyboard Shortcuts
    this.setupShortcuts();

    // 6. Update Badges
    this.updateSidebarBadges();

    console.log('[NOVA HUB] Ready and operational.');
  },

  updateHeaderDate() {
    const el = document.getElementById('header-date-text');
    if (!el) return;
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    el.textContent = now.toLocaleDateString('en-US', options);
  },

  handleHashChange() {
    const hash = window.location.hash.replace('#', '') || 'overview';
    const validViews = ['overview', 'opportunities', 'tasks', 'calendar', 'notes', 'settings'];
    const targetView = validViews.includes(hash) ? hash : 'overview';
    this.navigateTo(targetView, false);
  },

  navigateTo(viewName, updateHash = true) {
    this.currentView = viewName;
    if (updateHash) {
      window.location.hash = viewName;
    }

    // Update Nav links
    document.querySelectorAll('.nav-item').forEach(el => {
      if (el.getAttribute('data-view') === viewName) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Update Views visibility
    document.querySelectorAll('.view-pane').forEach(el => {
      el.classList.remove('active');
    });

    const targetEl = document.getElementById(`view-${viewName}`);
    if (targetEl) {
      targetEl.classList.add('active');
    }

    // Close mobile sidebar if open
    this.closeMobileSidebar();

    // Render corresponding view
    this.refreshCurrentView();
  },

  refreshCurrentView() {
    switch (this.currentView) {
      case 'overview':
        if (window.NovaOverviewView) window.NovaOverviewView.render();
        break;
      case 'opportunities':
        if (window.NovaOpportunitiesView) window.NovaOpportunitiesView.render();
        break;
      case 'tasks':
        if (window.NovaTasksView) window.NovaTasksView.render();
        break;
      case 'calendar':
        if (window.NovaCalendarView) window.NovaCalendarView.render();
        break;
      case 'notes':
        if (window.NovaNotesView) window.NovaNotesView.render();
        break;
      case 'settings':
        if (window.NovaSettingsView) window.NovaSettingsView.render();
        break;
    }
  },

  updateSidebarBadges() {
    const stats = window.storage.getCalculations();
    const oppsBadge = document.getElementById('nav-opps-badge');
    const tasksBadge = document.getElementById('nav-tasks-badge');

    if (oppsBadge) oppsBadge.textContent = stats.totalOpportunities;
    if (tasksBadge) {
      tasksBadge.textContent = stats.pendingTasks;
      if (stats.overdueTasksCount > 0) {
        tasksBadge.classList.add('alert');
        tasksBadge.title = `${stats.overdueTasksCount} overdue tasks`;
      } else {
        tasksBadge.classList.remove('alert');
        tasksBadge.title = '';
      }
    }
  },

  setTheme(theme) {
    window.storage.setTheme(theme);
    this.refreshCurrentView();
    this.showToast(`Theme changed to ${theme}`);
  },

  toggleTheme() {
    const current = window.storage.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  },

  // --- Mobile Sidebar ---
  toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
  },

  closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  },

  // --- Keyboard Shortcuts ---
  setupShortcuts() {
    document.addEventListener('keydown', e => {
      // Ignore if focus is in an input or textarea
      const tag = (e.target.tagName || '').toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select';

      // Cmd+K or Ctrl+K -> Command Palette
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        this.openCommandPalette();
        return;
      }

      // Esc closes modals & command palette
      if (e.key === 'Escape') {
        this.closeAllModals();
        this.closeCommandPalette();
        return;
      }

      if (isInput) return;

      // Quick Nav numbers
      if (e.key === '1') this.navigateTo('overview');
      if (e.key === '2') this.navigateTo('opportunities');
      if (e.key === '3') this.navigateTo('tasks');
      if (e.key === '4') this.navigateTo('calendar');
      if (e.key === '5') this.navigateTo('notes');
      if (e.key === '6') this.navigateTo('settings');

      // Quick add
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        this.openNewOpportunityModal();
      }
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        this.openNewTaskModal();
      }
    });
  },

  // --- Opportunity Modal Controller ---
  openNewOpportunityModal() {
    this.activeOpportunityModalId = null;
    document.getElementById('modal-opportunity-title').textContent = 'Create Opportunity';
    document.getElementById('opp-form-id').value = '';
    document.getElementById('opp-form-name').value = '';
    document.getElementById('opp-form-category').value = 'Hackathon';
    document.getElementById('opp-form-status').value = 'In Progress';
    document.getElementById('opp-form-priority').value = 'High';
    document.getElementById('opp-form-deadline').value = '';
    document.getElementById('opp-form-website').value = '';
    document.getElementById('opp-form-project').value = '';
    document.getElementById('opp-form-notes').value = '';

    this.openModal('modal-opportunity');
  },

  openEditOpportunityModal(id) {
    const opp = window.storage.getOpportunity(id);
    if (!opp) return;

    this.activeOpportunityModalId = id;
    document.getElementById('modal-opportunity-title').textContent = 'Edit Opportunity';
    document.getElementById('opp-form-id').value = opp.id;
    document.getElementById('opp-form-name').value = opp.name;
    document.getElementById('opp-form-category').value = opp.category;
    document.getElementById('opp-form-status').value = opp.status;
    document.getElementById('opp-form-priority').value = opp.priority;
    document.getElementById('opp-form-deadline').value = opp.deadline || '';
    document.getElementById('opp-form-website').value = opp.website || '';
    document.getElementById('opp-form-project').value = opp.project || '';
    document.getElementById('opp-form-notes').value = opp.notes || '';

    this.openModal('modal-opportunity');
  },

  saveOpportunityForm(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('opp-form-id').value;
    const name = document.getElementById('opp-form-name').value.trim();
    if (!name) {
      alert('Please enter an opportunity name.');
      return;
    }

    const category = document.getElementById('opp-form-category').value.trim();
    const status = document.getElementById('opp-form-status').value;
    const priority = document.getElementById('opp-form-priority').value;
    const deadline = document.getElementById('opp-form-deadline').value;
    const website = document.getElementById('opp-form-website').value.trim();
    const project = document.getElementById('opp-form-project').value.trim();
    const notes = document.getElementById('opp-form-notes').value.trim();

    window.storage.saveOpportunity({
      id: id || undefined,
      name,
      category,
      status,
      priority,
      deadline,
      website,
      project,
      notes
    });

    this.closeModal('modal-opportunity');
    this.showToast(`Saved "${name}"`);
  },

  confirmDeleteOpportunity(id) {
    const opp = window.storage.getOpportunity(id);
    if (!opp) return;

    if (confirm(`Are you sure you want to delete "${opp.name}" and all associated tasks?`)) {
      window.storage.deleteOpportunity(id);
      this.closeModal('modal-inspect-opportunity');
      this.showToast(`Deleted "${opp.name}"`);
    }
  },

  // --- Opportunity Detail Drawer / Inspect Modal ---
  openOpportunityDetails(id) {
    const opp = window.storage.getOpportunity(id);
    if (!opp) return;

    const tasks = window.storage.getTasks(t => t.opportunityId === id);
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : null;
    const statusClass = opp.status.toLowerCase().replace(/\s+/g, '-');

    const bodyEl = document.getElementById('inspect-modal-body');
    bodyEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
        <div>
          <h2 style="font-size: 18px; font-weight: 700; color: var(--text-primary);">${this.escape(opp.name)}</h2>
          ${opp.project ? `<div style="font-size: 13px; color: var(--accent); margin-top: 2px;">Project: ${this.escape(opp.project)}</div>` : ''}
          <div style="display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;">
            <span class="badge badge-category">${this.escape(opp.category)}</span>
            <span class="badge badge-status-${statusClass}"><span class="badge-dot"></span>${opp.status}</span>
            <span class="badge badge-priority-${opp.priority.toLowerCase()}">${opp.priority}</span>
            ${opp.deadline ? `<span class="badge badge-category mono">📅 ${opp.deadline}</span>` : '<span style="font-size: 11px; color: var(--text-tertiary);">No deadline set</span>'}
          </div>
        </div>
        ${opp.website ? `
          <a href="${this.escape(opp.website)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
            Visit Portal ↗
          </a>
        ` : ''}
      </div>

      <!-- Task Progress -->
      <div style="background: var(--bg-surface-elevated); padding: 12px 14px; border-radius: 6px; border: 1px solid var(--border-subtle); margin-top: 8px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
          <span style="color: var(--text-secondary); font-weight: 500;">Deliverables Progress</span>
          <span class="mono">${totalTasks > 0 ? `${completedTasks}/${totalTasks} completed (${percent}%)` : 'No tasks assigned yet'}</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-track">
            <div class="progress-fill" style="width: ${totalTasks > 0 ? percent : 0}%;"></div>
          </div>
        </div>
      </div>

      <!-- Associated Tasks Section -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h3 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary);">Associated Action Items</h3>
          <button class="btn btn-ghost btn-sm" onclick="window.NovaApp.openNewTaskModal('${opp.id}')">+ Add Task</button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${tasks.length === 0 ? `
            <div style="padding: 16px; text-align: center; color: var(--text-tertiary); font-size: 12px; background: var(--bg-app); border-radius: 6px;">
              No action items for this opportunity yet.
            </div>
          ` : tasks.map(t => `
            <div class="item-row" style="background: var(--bg-app); padding: 8px 12px;">
              <div class="item-row-left">
                <input type="checkbox" class="custom-checkbox" ${t.completed ? 'checked' : ''} onchange="window.NovaApp.toggleTask('${t.id}')">
                <div style="min-width: 0;">
                  <span style="font-size: 13px; ${t.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${this.escape(t.title)}</span>
                  ${t.dueDate ? `<span style="font-size: 10px; color: var(--text-tertiary); margin-left: 8px;" class="mono">${t.dueDate}</span>` : ''}
                </div>
              </div>
              <div class="item-row-right">
                <button class="btn btn-ghost btn-sm" onclick="window.NovaApp.openEditTaskModal('${t.id}')">Edit</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Notes Dossier -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <h3 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary);">Opportunity Notes</h3>
          <button class="btn btn-ghost btn-sm" onclick="window.NovaApp.jumpToNotes('${opp.id}')">Open in Notes Workspace ↗</button>
        </div>
        <div style="background: var(--bg-app); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 12px; font-size: 13px; line-height: 1.6; color: var(--text-primary); white-space: pre-wrap;">
          ${opp.notes ? this.escape(opp.notes) : '<span style="color: var(--text-tertiary);">No personal notes recorded yet.</span>'}
        </div>
      </div>
    `;

    const footerEl = document.getElementById('inspect-modal-footer');
    footerEl.innerHTML = `
      <button class="btn btn-ghost btn-sm" style="color: var(--alert-danger);" onclick="window.NovaApp.confirmDeleteOpportunity('${opp.id}')">Delete Opportunity</button>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-secondary btn-sm" onclick="window.NovaApp.closeModal('modal-inspect-opportunity')">Close</button>
        <button class="btn btn-primary btn-sm" onclick="window.NovaApp.openEditOpportunityModal('${opp.id}')">Edit Opportunity</button>
      </div>
    `;

    this.openModal('modal-inspect-opportunity');
  },

  jumpToNotes(oppId) {
    this.closeModal('modal-inspect-opportunity');
    this.navigateTo('notes');
    if (window.NovaNotesView) {
      window.NovaNotesView.selectOpportunity(oppId);
    }
  },

  // --- Task Modal Controller ---
  openNewTaskModal(preselectedOpportunityId = null) {
    this.activeTaskModalId = null;
    const opportunities = window.storage.getOpportunities();

    document.getElementById('modal-task-title').textContent = 'Create Task';
    document.getElementById('task-form-id').value = '';
    document.getElementById('task-form-title').value = '';
    document.getElementById('task-form-description').value = '';
    document.getElementById('task-form-duedate').value = '';
    document.getElementById('task-form-priority').value = 'Medium';
    document.getElementById('task-form-completed').checked = false;

    const selectEl = document.getElementById('task-form-opportunity');
    selectEl.innerHTML = `
      <option value="">No Opportunity (Standalone Task)</option>
      ${opportunities.map(o => `
        <option value="${o.id}" ${preselectedOpportunityId === o.id ? 'selected' : ''}>${this.escape(o.name)}</option>
      `).join('')}
    `;

    this.openModal('modal-task');
  },

  openEditTaskModal(id) {
    const task = window.storage.getTask(id);
    if (!task) return;

    this.activeTaskModalId = id;
    const opportunities = window.storage.getOpportunities();

    document.getElementById('modal-task-title').textContent = 'Edit Task';
    document.getElementById('task-form-id').value = task.id;
    document.getElementById('task-form-title').value = task.title;
    document.getElementById('task-form-description').value = task.description || '';
    document.getElementById('task-form-duedate').value = task.dueDate || '';
    document.getElementById('task-form-priority').value = task.priority || 'Medium';
    document.getElementById('task-form-completed').checked = Boolean(task.completed);

    const selectEl = document.getElementById('task-form-opportunity');
    selectEl.innerHTML = `
      <option value="">No Opportunity (Standalone Task)</option>
      ${opportunities.map(o => `
        <option value="${o.id}" ${task.opportunityId === o.id ? 'selected' : ''}>${this.escape(o.name)}</option>
      `).join('')}
    `;

    this.openModal('modal-task');
  },

  saveTaskForm(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('task-form-id').value;
    const title = document.getElementById('task-form-title').value.trim();
    if (!title) {
      alert('Please enter a task title.');
      return;
    }

    const description = document.getElementById('task-form-description').value.trim();
    const opportunityId = document.getElementById('task-form-opportunity').value;
    const dueDate = document.getElementById('task-form-duedate').value;
    const priority = document.getElementById('task-form-priority').value;
    const completed = document.getElementById('task-form-completed').checked;

    window.storage.saveTask({
      id: id || undefined,
      title,
      description,
      opportunityId,
      dueDate,
      priority,
      completed
    });

    this.closeModal('modal-task');
    this.showToast(`Saved task "${title}"`);
  },

  toggleTask(id) {
    window.storage.toggleTask(id);
    const task = window.storage.getTask(id);
    if (task) {
      this.showToast(task.completed ? `Completed "${task.title}"` : `Marked incomplete: "${task.title}"`);
    }
  },

  confirmDeleteTask(id) {
    const task = window.storage.getTask(id);
    if (!task) return;

    if (confirm(`Delete task "${task.title}"?`)) {
      window.storage.deleteTask(id);
      this.showToast(`Deleted task "${task.title}"`);
    }
  },

  // --- Generic Modal Controls ---
  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('active');
  },

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
  },

  closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
  },

  // --- Command Palette ---
  openCommandPalette() {
    const cp = document.getElementById('command-palette');
    const input = document.getElementById('command-palette-input');
    if (cp) {
      cp.classList.add('active');
      if (input) {
        input.value = '';
        input.focus();
        this.filterCommandPalette('');
      }
    }
  },

  closeCommandPalette() {
    const cp = document.getElementById('command-palette');
    if (cp) cp.classList.remove('active');
  },

  filterCommandPalette(query) {
    const resultsContainer = document.getElementById('command-palette-results');
    if (!resultsContainer) return;

    const q = query.toLowerCase().trim();
    const opportunities = window.storage.getOpportunities();
    const tasks = window.storage.getTasks();

    const staticCommands = [
      { type: 'action', title: 'Create New Opportunity', icon: '✦', action: () => { this.closeCommandPalette(); this.openNewOpportunityModal(); } },
      { type: 'action', title: 'Add New Task', icon: '✓', action: () => { this.closeCommandPalette(); this.openNewTaskModal(); } },
      { type: 'nav', title: 'Go to Overview', icon: '📊', action: () => { this.closeCommandPalette(); this.navigateTo('overview'); } },
      { type: 'nav', title: 'Go to Opportunities Directory', icon: '📁', action: () => { this.closeCommandPalette(); this.navigateTo('opportunities'); } },
      { type: 'nav', title: 'Go to Task Operations', icon: '⚡', action: () => { this.closeCommandPalette(); this.navigateTo('tasks'); } },
      { type: 'nav', title: 'Go to Calendar & Milestones', icon: '📅', action: () => { this.closeCommandPalette(); this.navigateTo('calendar'); } },
      { type: 'nav', title: 'Go to Field Notes', icon: '📝', action: () => { this.closeCommandPalette(); this.navigateTo('notes'); } },
      { type: 'nav', title: 'Go to Settings', icon: '⚙', action: () => { this.closeCommandPalette(); this.navigateTo('settings'); } },
      { type: 'theme', title: 'Toggle Light / Dark Theme', icon: '◐', action: () => { this.closeCommandPalette(); this.toggleTheme(); } }
    ];

    let matches = [];

    if (!q) {
      matches = staticCommands;
    } else {
      // Filter commands
      staticCommands.forEach(cmd => {
        if (cmd.title.toLowerCase().includes(q)) matches.push(cmd);
      });

      // Filter opportunities
      opportunities.forEach(opp => {
        if (opp.name.toLowerCase().includes(q) || opp.category.toLowerCase().includes(q)) {
          matches.push({
            type: 'opportunity',
            title: `Opportunity: ${opp.name}`,
            meta: `${opp.category} · ${opp.status}`,
            icon: '📁',
            action: () => {
              this.closeCommandPalette();
              this.openOpportunityDetails(opp.id);
            }
          });
        }
      });

      // Filter tasks
      tasks.forEach(t => {
        if (t.title.toLowerCase().includes(q)) {
          matches.push({
            type: 'task',
            title: `Task: ${t.title}`,
            meta: t.dueDate ? `Due ${t.dueDate}` : 'No date',
            icon: '✓',
            action: () => {
              this.closeCommandPalette();
              this.navigateTo('tasks');
            }
          });
        }
      });
    }

    if (matches.length === 0) {
      resultsContainer.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-tertiary); font-size: 13px;">
          No matching commands or records found.
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = matches.map((m, idx) => `
      <div
        class="command-item ${idx === 0 ? 'selected' : ''}"
        onclick="window.NovaApp.executeCommandItem(${idx})"
      >
        <div style="display: flex; align-items: center; gap: 10px;">
          <span>${m.icon}</span>
          <span style="font-weight: 500;">${this.escape(m.title)}</span>
        </div>
        ${m.meta ? `<span style="font-size: 11px; color: var(--text-tertiary);">${this.escape(m.meta)}</span>` : '<kbd>↵</kbd>'}
      </div>
    `).join('');

    this.activePaletteMatches = matches;
  },

  executeCommandItem(index) {
    if (this.activePaletteMatches && this.activePaletteMatches[index]) {
      this.activePaletteMatches[index].action();
    }
  },

  // --- Toast Notifications ---
  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => {
        if (container.contains(toast)) container.removeChild(toast);
      }, 200);
    }, 2800);
  },

  escape(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.NovaApp.init();
});
