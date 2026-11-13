/**
 * NOVA HUB - Opportunities View
 * Full CRUD, filtering, sorting, card/table views, and detail drawer.
 */

window.NovaOpportunitiesView = {
  viewMode: 'grid', // 'grid' or 'table'
  categoryFilter: 'all',
  statusFilter: 'all',
  priorityFilter: 'all',
  searchQuery: '',
  sortBy: 'name', // 'name', 'priority', 'deadline', 'status'

  render() {
    const container = document.getElementById('view-opportunities');
    if (!container) return;

    const allOpps = window.storage.getOpportunities();
    const allTasks = window.storage.getTasks();
    const stats = window.storage.getCalculations();

    // Distinct categories for filter dropdown
    const categories = Array.from(new Set(allOpps.map(o => o.category))).filter(Boolean).sort();

    // Filtering
    let filtered = allOpps.filter(opp => {
      if (this.categoryFilter !== 'all' && opp.category !== this.categoryFilter) return false;
      if (this.statusFilter !== 'all' && opp.status !== this.statusFilter) return false;
      if (this.priorityFilter !== 'all' && opp.priority !== this.priorityFilter) return false;
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const matchesName = opp.name.toLowerCase().includes(q);
        const matchesCat = opp.category.toLowerCase().includes(q);
        const matchesNotes = opp.notes && opp.notes.toLowerCase().includes(q);
        const matchesProj = opp.project && opp.project.toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesNotes && !matchesProj) return false;
      }
      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (this.sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (this.sortBy === 'priority') {
        const pOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      if (this.sortBy === 'deadline') {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.localeCompare(b.deadline);
      }
      if (this.sortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

    container.innerHTML = `
      <div class="view-header-bar">
        <div class="view-title-group">
          <h1>Opportunities Directory</h1>
          <p>Central tracker for hackathons, academic competitions, and active initiatives.</p>
        </div>
        <div class="view-actions-group">
          <div style="display: inline-flex; border: 1px solid var(--border-medium); border-radius: 6px; overflow: hidden; background: var(--bg-surface);">
            <button class="btn btn-sm ${this.viewMode === 'grid' ? 'btn-secondary' : 'btn-ghost'}" onclick="window.NovaOpportunitiesView.setViewMode('grid')" title="Grid Card View">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </button>
            <button class="btn btn-sm ${this.viewMode === 'table' ? 'btn-secondary' : 'btn-ghost'}" onclick="window.NovaOpportunitiesView.setViewMode('table')" title="Dense Table View">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.NovaApp.openNewOpportunityModal()">
            <span>+</span> New Opportunity
          </button>
        </div>
      </div>

      <!-- Filter Controls Bar -->
      <div class="filter-bar">
        <div class="filter-group">
          <input
            type="text"
            class="search-input-control"
            placeholder="Filter opportunities..."
            value="${this.escape(this.searchQuery)}"
            oninput="window.NovaOpportunitiesView.onSearch(this.value)"
          />

          <select class="select-control" onchange="window.NovaOpportunitiesView.onCategoryFilter(this.value)">
            <option value="all" ${this.categoryFilter === 'all' ? 'selected' : ''}>All Categories (${allOpps.length})</option>
            ${categories.map(c => `
              <option value="${this.escape(c)}" ${this.categoryFilter === c ? 'selected' : ''}>${this.escape(c)}</option>
            `).join('')}
          </select>

          <select class="select-control" onchange="window.NovaOpportunitiesView.onStatusFilter(this.value)">
            <option value="all" ${this.statusFilter === 'all' ? 'selected' : ''}>All Statuses</option>
            <option value="Not Started" ${this.statusFilter === 'Not Started' ? 'selected' : ''}>Not Started</option>
            <option value="Applied" ${this.statusFilter === 'Applied' ? 'selected' : ''}>Applied</option>
            <option value="Pending" ${this.statusFilter === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Pending Approval" ${this.statusFilter === 'Pending Approval' ? 'selected' : ''}>Pending Approval</option>
            <option value="In Progress" ${this.statusFilter === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Preparation" ${this.statusFilter === 'Preparation' ? 'selected' : ''}>Preparation</option>
            <option value="Completed" ${this.statusFilter === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="Rejected" ${this.statusFilter === 'Rejected' ? 'selected' : ''}>Rejected</option>
            <option value="On Hold" ${this.statusFilter === 'On Hold' ? 'selected' : ''}>On Hold</option>
          </select>

          <select class="select-control" onchange="window.NovaOpportunitiesView.onPriorityFilter(this.value)">
            <option value="all" ${this.priorityFilter === 'all' ? 'selected' : ''}>All Priorities</option>
            <option value="Critical" ${this.priorityFilter === 'Critical' ? 'selected' : ''}>Critical</option>
            <option value="High" ${this.priorityFilter === 'High' ? 'selected' : ''}>High</option>
            <option value="Medium" ${this.priorityFilter === 'Medium' ? 'selected' : ''}>Medium</option>
            <option value="Low" ${this.priorityFilter === 'Low' ? 'selected' : ''}>Low</option>
          </select>
        </div>

        <div class="filter-group">
          <span style="font-size: 11px; color: var(--text-tertiary);">Sort by:</span>
          <select class="select-control" onchange="window.NovaOpportunitiesView.onSortChange(this.value)">
            <option value="name" ${this.sortBy === 'name' ? 'selected' : ''}>Name</option>
            <option value="priority" ${this.sortBy === 'priority' ? 'selected' : ''}>Priority</option>
            <option value="deadline" ${this.sortBy === 'deadline' ? 'selected' : ''}>Deadline</option>
            <option value="status" ${this.sortBy === 'status' ? 'selected' : ''}>Status</option>
          </select>
        </div>
      </div>

      <!-- Opportunities Content -->
      ${filtered.length === 0 ? `
        <div style="background: var(--bg-surface); border: 1px dashed var(--border-medium); border-radius: 8px; padding: 48px 24px; text-align: center;">
          <div style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">No matching opportunities</div>
          <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">Try adjusting your search criteria or add a new opportunity record.</div>
          <button class="btn btn-secondary btn-sm" onclick="window.NovaOpportunitiesView.resetFilters()">Reset Filters</button>
        </div>
      ` : this.viewMode === 'grid' ? this.renderGrid(filtered, stats, allTasks) : this.renderTable(filtered, stats, allTasks)}
    `;
  },

  renderGrid(opps, stats, allTasks) {
    return `
      <div class="opps-grid">
        ${opps.map(opp => {
          const statusClass = opp.status.toLowerCase().replace(/\s+/g, '-');
          const oppTasks = allTasks.filter(t => t.opportunityId === opp.id);
          const completedTasks = oppTasks.filter(t => t.completed).length;
          const totalTasks = oppTasks.length;
          const prog = stats.opportunityProgress[opp.id];
          const hasTasks = totalTasks > 0;
          const percent = prog && prog.percent !== null ? prog.percent : null;

          return `
            <div class="opp-card">
              <div class="opp-card-header">
                <div>
                  <div class="opp-card-name">${this.escape(opp.name)}</div>
                  ${opp.project ? `<div style="font-size: 12px; color: var(--accent); margin-top: 2px;">Project: ${this.escape(opp.project)}</div>` : ''}
                </div>
                <span class="badge badge-priority-${opp.priority.toLowerCase()}">${opp.priority}</span>
              </div>

              <div class="opp-card-meta">
                <span class="badge badge-category">${this.escape(opp.category)}</span>
                <span class="badge badge-status-${statusClass}">
                  <span class="badge-dot"></span>
                  ${opp.status}
                </span>
                ${opp.deadline ? `<span class="badge badge-category mono">📅 ${opp.deadline}</span>` : '<span style="font-size: 11px; color: var(--text-tertiary);">No deadline set</span>'}
              </div>

              <!-- Progress Bar -->
              <div style="margin-top: 2px;">
                <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-tertiary); margin-bottom: 4px;">
                  <span>Tasks: ${completedTasks}/${totalTasks}</span>
                  <span>${hasTasks ? `${percent}%` : 'No tasks assigned'}</span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-track">
                    <div class="progress-fill" style="width: ${hasTasks ? percent : 0}%;"></div>
                  </div>
                </div>
              </div>

              ${opp.notes ? `
                <div class="opp-card-notes">${this.escape(opp.notes)}</div>
              ` : ''}

              <div class="opp-card-footer">
                <div>
                  ${opp.website ? `
                    <a href="${this.escape(opp.website)}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-sm" style="padding: 2px 6px; font-size: 11px; color: var(--accent);" title="${this.escape(opp.website)}">
                      <span>🔗 Portal</span>
                    </a>
                  ` : ''}
                </div>

                <div class="opp-actions-row">
                  <button class="btn btn-secondary btn-sm" onclick="window.NovaApp.openOpportunityDetails('${opp.id}')">
                    Inspect
                  </button>
                  <button class="btn btn-ghost btn-sm" onclick="window.NovaApp.openEditOpportunityModal('${opp.id}')" title="Edit Opportunity">
                    Edit
                  </button>
                  <button class="btn btn-ghost btn-sm" style="color: var(--alert-danger);" onclick="window.NovaApp.confirmDeleteOpportunity('${opp.id}')" title="Delete Opportunity">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderTable(opps, stats, allTasks) {
    return `
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Opportunity Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Deadline</th>
              <th>Task Progress</th>
              <th>Website</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${opps.map(opp => {
              const statusClass = opp.status.toLowerCase().replace(/\s+/g, '-');
              const oppTasks = allTasks.filter(t => t.opportunityId === opp.id);
              const completedTasks = oppTasks.filter(t => t.completed).length;
              const totalTasks = oppTasks.length;
              const prog = stats.opportunityProgress[opp.id];
              const hasTasks = totalTasks > 0;
              const percent = prog && prog.percent !== null ? prog.percent : null;

              return `
                <tr>
                  <td>
                    <div style="font-weight: 600; color: var(--text-primary); cursor: pointer;" onclick="window.NovaApp.openOpportunityDetails('${opp.id}')">
                      ${this.escape(opp.name)}
                    </div>
                    ${opp.project ? `<div style="font-size: 11px; color: var(--accent);">Project: ${this.escape(opp.project)}</div>` : ''}
                  </td>
                  <td>
                    <span class="badge badge-category">${this.escape(opp.category)}</span>
                  </td>
                  <td>
                    <span class="badge badge-status-${statusClass}">
                      <span class="badge-dot"></span>
                      ${opp.status}
                    </span>
                  </td>
                  <td>
                    <span class="badge badge-priority-${opp.priority.toLowerCase()}">${opp.priority}</span>
                  </td>
                  <td class="mono" style="font-size: 12px; color: var(--text-secondary);">
                    ${opp.deadline || '<span style="color: var(--text-tertiary); font-size: 11px;">—</span>'}
                  </td>
                  <td style="min-width: 140px;">
                    <div class="progress-bar-container">
                      <div class="progress-track">
                        <div class="progress-fill" style="width: ${hasTasks ? percent : 0}%;"></div>
                      </div>
                      <span class="progress-text">${hasTasks ? `${percent}%` : '—'}</span>
                    </div>
                  </td>
                  <td>
                    ${opp.website ? `
                      <a href="${this.escape(opp.website)}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-sm" style="color: var(--accent); font-size: 11px;">
                        Visit Link ↗
                      </a>
                    ` : '<span style="color: var(--text-tertiary); font-size: 11px;">—</span>'}
                  </td>
                  <td style="text-align: right; white-space: nowrap;">
                    <button class="btn btn-ghost btn-sm" onclick="window.NovaApp.openOpportunityDetails('${opp.id}')">View</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.NovaApp.openEditOpportunityModal('${opp.id}')">Edit</button>
                    <button class="btn btn-ghost btn-sm" style="color: var(--alert-danger);" onclick="window.NovaApp.confirmDeleteOpportunity('${opp.id}')">Delete</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  setViewMode(mode) {
    this.viewMode = mode;
    this.render();
  },

  onCategoryFilter(cat) {
    this.categoryFilter = cat;
    this.render();
  },

  onStatusFilter(status) {
    this.statusFilter = status;
    this.render();
  },

  onPriorityFilter(prio) {
    this.priorityFilter = prio;
    this.render();
  },

  onSearch(query) {
    this.searchQuery = query;
    this.render();
  },

  onSortChange(by) {
    this.sortBy = by;
    this.render();
  },

  resetFilters() {
    this.categoryFilter = 'all';
    this.statusFilter = 'all';
    this.priorityFilter = 'all';
    this.searchQuery = '';
    this.sortBy = 'name';
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
