/**
 * NOVA HUB - Tasks View
 * Complete task tracking, filters, smart deadline badges, and completion states.
 */

window.NovaTasksView = {
  opportunityFilter: 'all',
  priorityFilter: 'all',
  statusFilter: 'all', // 'all', 'incomplete', 'completed', 'overdue'
  sortBy: 'deadline', // 'deadline', 'priority', 'title'
  searchQuery: '',

  render() {
    const container = document.getElementById('view-tasks');
    if (!container) return;

    const tasks = window.storage.getTasks();
    const opportunities = window.storage.getOpportunities();
    const todayStr = new Date().toISOString().split('T')[0];

    // Filter tasks
    let filtered = tasks.filter(task => {
      if (this.opportunityFilter !== 'all' && task.opportunityId !== this.opportunityFilter) return false;
      if (this.priorityFilter !== 'all' && task.priority !== this.priorityFilter) return false;
      
      if (this.statusFilter === 'incomplete' && task.completed) return false;
      if (this.statusFilter === 'completed' && !task.completed) return false;
      if (this.statusFilter === 'overdue') {
        if (task.completed || !task.dueDate || task.dueDate >= todayStr) return false;
      }

      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description && task.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      if (this.sortBy === 'deadline') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (this.sortBy === 'priority') {
        const pOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      if (this.sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    // Calculate quick counts
    const totalCount = tasks.length;
    const completedCount = tasks.filter(t => t.completed).length;
    const incompleteCount = totalCount - completedCount;
    const overdueCount = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;
    const dueTodayCount = tasks.filter(t => !t.completed && t.dueDate === todayStr).length;

    container.innerHTML = `
      <div class="view-header-bar">
        <div class="view-title-group">
          <h1>Task Operations</h1>
          <p>Action items, subtasks, and submission checkpoints linked to opportunities.</p>
        </div>
        <div class="view-actions-group">
          <button class="btn btn-primary btn-sm" onclick="window.NovaApp.openNewTaskModal()">
            <span>+</span> Add Task
          </button>
        </div>
      </div>

      <!-- Quick Metrics Strip -->
      <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 8px 14px; border-radius: 6px; font-size: 12px;">
          <span style="color: var(--text-tertiary);">Total:</span>
          <strong style="color: var(--text-primary); margin-left: 4px;">${totalCount}</strong>
        </div>
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 8px 14px; border-radius: 6px; font-size: 12px;">
          <span style="color: var(--text-tertiary);">Incomplete:</span>
          <strong style="color: var(--status-in-progress); margin-left: 4px;">${incompleteCount}</strong>
        </div>
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 8px 14px; border-radius: 6px; font-size: 12px;">
          <span style="color: var(--text-tertiary);">Completed:</span>
          <strong style="color: var(--status-completed); margin-left: 4px;">${completedCount}</strong>
        </div>
        <div style="background: var(--bg-surface); border: 1px solid ${overdueCount > 0 ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)'}; padding: 8px 14px; border-radius: 6px; font-size: 12px;">
          <span style="color: var(--text-tertiary);">Overdue:</span>
          <strong style="color: ${overdueCount > 0 ? 'var(--alert-danger)' : 'var(--text-primary)'}; margin-left: 4px;">${overdueCount}</strong>
        </div>
        <div style="background: var(--bg-surface); border: 1px solid ${dueTodayCount > 0 ? 'var(--accent-border)' : 'var(--border-subtle)'}; padding: 8px 14px; border-radius: 6px; font-size: 12px;">
          <span style="color: var(--text-tertiary);">Due Today:</span>
          <strong style="color: ${dueTodayCount > 0 ? 'var(--accent)' : 'var(--text-primary)'}; margin-left: 4px;">${dueTodayCount}</strong>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="filter-bar">
        <div class="filter-group">
          <input
            type="text"
            class="search-input-control"
            placeholder="Search tasks..."
            value="${this.escape(this.searchQuery)}"
            oninput="window.NovaTasksView.onSearch(this.value)"
          />

          <select class="select-control" onchange="window.NovaTasksView.onOpportunityFilter(this.value)">
            <option value="all" ${this.opportunityFilter === 'all' ? 'selected' : ''}>All Opportunities (${opportunities.length})</option>
            ${opportunities.map(opp => `
              <option value="${opp.id}" ${this.opportunityFilter === opp.id ? 'selected' : ''}>${this.escape(opp.name)}</option>
            `).join('')}
          </select>

          <select class="select-control" onchange="window.NovaTasksView.onStatusFilter(this.value)">
            <option value="all" ${this.statusFilter === 'all' ? 'selected' : ''}>All Statuses</option>
            <option value="incomplete" ${this.statusFilter === 'incomplete' ? 'selected' : ''}>Pending Only</option>
            <option value="completed" ${this.statusFilter === 'completed' ? 'selected' : ''}>Completed Only</option>
            <option value="overdue" ${this.statusFilter === 'overdue' ? 'selected' : ''}>Overdue Only (${overdueCount})</option>
          </select>

          <select class="select-control" onchange="window.NovaTasksView.onPriorityFilter(this.value)">
            <option value="all" ${this.priorityFilter === 'all' ? 'selected' : ''}>All Priorities</option>
            <option value="Critical" ${this.priorityFilter === 'Critical' ? 'selected' : ''}>Critical</option>
            <option value="High" ${this.priorityFilter === 'High' ? 'selected' : ''}>High</option>
            <option value="Medium" ${this.priorityFilter === 'Medium' ? 'selected' : ''}>Medium</option>
            <option value="Low" ${this.priorityFilter === 'Low' ? 'selected' : ''}>Low</option>
          </select>
        </div>

        <div class="filter-group">
          <span style="font-size: 11px; color: var(--text-tertiary);">Sort by:</span>
          <select class="select-control" onchange="window.NovaTasksView.onSortChange(this.value)">
            <option value="deadline" ${this.sortBy === 'deadline' ? 'selected' : ''}>Due Date</option>
            <option value="priority" ${this.sortBy === 'priority' ? 'selected' : ''}>Priority</option>
            <option value="title" ${this.sortBy === 'title' ? 'selected' : ''}>Title</option>
          </select>
        </div>
      </div>

      <!-- Task Items List -->
      ${filtered.length === 0 ? `
        <div style="background: var(--bg-surface); border: 1px dashed var(--border-medium); border-radius: 8px; padding: 48px 24px; text-align: center;">
          <div style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">No tasks found</div>
          <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">Create a new action item to start tracking progress.</div>
          <button class="btn btn-primary btn-sm" onclick="window.NovaApp.openNewTaskModal()">+ Add New Task</button>
        </div>
      ` : `
        <div class="tasks-container">
          ${filtered.map(task => {
            const relOpp = opportunities.find(o => o.id === task.opportunityId);
            const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;
            const isToday = !task.completed && task.dueDate === todayStr;

            return `
              <div class="task-item ${task.completed ? 'completed' : ''}">
                <div class="task-left">
                  <input
                    type="checkbox"
                    class="custom-checkbox"
                    ${task.completed ? 'checked' : ''}
                    onchange="window.NovaApp.toggleTask('${task.id}')"
                    title="${task.completed ? 'Mark incomplete' : 'Mark completed'}"
                  />
                  <div class="task-content">
                    <div class="task-title">${this.escape(task.title)}</div>
                    ${task.description ? `<div class="task-desc">${this.escape(task.description)}</div>` : ''}
                    <div class="task-meta-row">
                      ${relOpp ? `
                        <span class="badge badge-category" style="cursor: pointer;" onclick="window.NovaApp.openOpportunityDetails('${relOpp.id}')">
                          📁 ${this.escape(relOpp.name)}
                        </span>
                      ` : '<span style="font-size: 11px; color: var(--text-tertiary);">No assigned opportunity</span>'}

                      <span class="badge badge-priority-${task.priority.toLowerCase()}">${task.priority}</span>

                      ${isOverdue ? '<span class="badge badge-overdue">⚠ Overdue: ' + task.dueDate + '</span>' : ''}
                      ${isToday ? '<span class="badge badge-due-today">⚡ Due Today</span>' : ''}
                      ${task.dueDate && !isOverdue && !isToday ? `<span class="badge badge-category mono">📅 ${task.dueDate}</span>` : ''}
                      ${!task.dueDate ? '<span style="font-size: 11px; color: var(--text-tertiary);">No date set</span>' : ''}
                    </div>
                  </div>
                </div>

                <div class="opp-actions-row">
                  <button class="btn btn-ghost btn-sm" onclick="window.NovaApp.openEditTaskModal('${task.id}')" title="Edit Task">
                    Edit
                  </button>
                  <button class="btn btn-ghost btn-sm" style="color: var(--alert-danger);" onclick="window.NovaApp.confirmDeleteTask('${task.id}')" title="Delete Task">
                    Delete
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;
  },

  onOpportunityFilter(id) {
    this.opportunityFilter = id;
    this.render();
  },

  onPriorityFilter(prio) {
    this.priorityFilter = prio;
    this.render();
  },

  onStatusFilter(st) {
    this.statusFilter = st;
    this.render();
  },

  onSortChange(by) {
    this.sortBy = by;
    this.render();
  },

  onSearch(query) {
    this.searchQuery = query;
    this.render();
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

