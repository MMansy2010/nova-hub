/**
 * NOVA HUB - Overview View
 * Dynamic metrics, urgent priorities, upcoming deadlines, and next actions.
 */

window.NovaOverviewView = {
  render() {
    const container = document.getElementById('view-overview');
    if (!container) return;

    const stats = window.storage.getCalculations();
    const opportunities = window.storage.getOpportunities();
    const tasks = window.storage.getTasks();

    // Find urgent tasks (incomplete, sorted by due date or priority)
    const urgentTasks = tasks
      .filter(t => !t.completed)
      .sort((a, b) => {
        // Priority order: Critical > High > Medium > Low
        const pOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        const pDiff = (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
        if (pDiff !== 0) return pDiff;
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return 0;
      })
      .slice(0, 5);

    // Find upcoming deadlines (opportunities or tasks with actual dates >= today)
    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingDeadlines = [];

    opportunities.forEach(opp => {
      if (opp.deadline && opp.deadline >= todayStr) {
        upcomingDeadlines.push({
          type: 'opportunity',
          id: opp.id,
          title: opp.name,
          date: opp.deadline,
          category: opp.category,
          priority: opp.priority,
          status: opp.status
        });
      }
    });

    tasks.forEach(task => {
      if (!task.completed && task.dueDate && task.dueDate >= todayStr) {
        const relatedOpp = opportunities.find(o => o.id === task.opportunityId);
        upcomingDeadlines.push({
          type: 'task',
          id: task.id,
          title: task.title,
          date: task.dueDate,
          category: relatedOpp ? relatedOpp.name : 'Task',
          priority: task.priority,
          status: 'Task'
        });
      }
    });

    upcomingDeadlines.sort((a, b) => a.date.localeCompare(b.date));
    const nextDeadlines = upcomingDeadlines.slice(0, 5);

    // Determine Next Important Action
    let nextActionTitle = 'Review Opportunity Pipeline';
    let nextActionDesc = 'All current tasks are completed. Consider adding actionable milestones or setting deadlines for your active opportunities.';
    let nextActionType = 'General';

    if (stats.overdueTasksCount > 0) {
      const topOverdue = stats.overdueTasks[0];
      const relOpp = opportunities.find(o => o.id === topOverdue.opportunityId);
      nextActionTitle = `Resolve overdue task: ${topOverdue.title}`;
      nextActionDesc = `Due date (${topOverdue.dueDate}) has passed${relOpp ? ` for "${relOpp.name}"` : ''}. Review and update status.`;
      nextActionType = 'Overdue Alert';
    } else if (urgentTasks.length > 0) {
      const topUrgent = urgentTasks[0];
      const relOpp = opportunities.find(o => o.id === topUrgent.opportunityId);
      nextActionTitle = `Complete: ${topUrgent.title}`;
      nextActionDesc = `${topUrgent.priority} priority${topUrgent.dueDate ? ` · Due ${topUrgent.dueDate}` : ''}${relOpp ? ` · Project: ${relOpp.name}` : ''}.`;
      nextActionType = 'High Priority';
    } else if (stats.currentlyActive > 0) {
      const activeOpp = opportunities.find(o => ['In Progress', 'Preparation'].includes(o.status));
      if (activeOpp) {
        nextActionTitle = `Advance ${activeOpp.name}`;
        nextActionDesc = `Status is "${activeOpp.status}". Add specific preparation tasks or check external submission portal.`;
        nextActionType = 'Active Focus';
      }
    }

    container.innerHTML = `
      <div class="view-header-bar">
        <div class="view-title-group">
          <h1>Command Overview</h1>
          <p>Real-time telemetry of active competitions, applications, and mission milestones.</p>
        </div>
        <div class="view-actions-group">
          <button class="btn btn-secondary btn-sm" onclick="window.NovaApp.openNewTaskModal()">
            <span>+</span> Add Task
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.NovaApp.openNewOpportunityModal()">
            <span>+</span> New Opportunity
          </button>
        </div>
      </div>

      <!-- Live Calculated Metrics -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Total Opportunities</span>
            <div class="metric-icon-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
          </div>
          <div class="metric-value">${stats.totalOpportunities}</div>
          <div class="metric-footer">${opportunities.length} tracked records</div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Currently Active</span>
            <div class="metric-icon-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
          <div class="metric-value">${stats.currentlyActive}</div>
          <div class="metric-footer">In Progress & Preparation</div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Pending Applications</span>
            <div class="metric-icon-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
          </div>
          <div class="metric-value">${stats.pendingApplications}</div>
          <div class="metric-footer">Awaiting decision or approval</div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Completed</span>
            <div class="metric-icon-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
          <div class="metric-value">${stats.completedOpportunities}</div>
          <div class="metric-footer">Finished opportunities</div>
        </div>

        <div class="metric-card ${stats.overdueTasksCount > 0 ? 'alert-card' : ''}">
          <div class="metric-header">
            <span class="metric-title">Overdue Tasks</span>
            <div class="metric-icon-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
          </div>
          <div class="metric-value">${stats.overdueTasksCount}</div>
          <div class="metric-footer">${stats.overdueTasksCount > 0 ? 'Requires immediate action' : 'All deadlines on track'}</div>
        </div>
      </div>

      <!-- Priority & Action Section -->
      <div class="priority-center-grid">
        <!-- Most Urgent Tasks -->
        <div class="panel-card">
          <div class="panel-card-header">
            <div class="panel-card-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <span>Most Urgent Tasks</span>
            </div>
            <a href="#tasks" class="btn btn-ghost btn-sm">View all tasks (${tasks.length})</a>
          </div>
          <div class="panel-card-body" style="padding: 6px 12px;">
            ${urgentTasks.length === 0 ? `
              <div style="padding: 24px; text-align: center; color: var(--text-tertiary); font-size: 13px;">
                No urgent tasks pending. Create a task to track specific deliverables.
              </div>
            ` : urgentTasks.map(t => {
              const relOpp = opportunities.find(o => o.id === t.opportunityId);
              const isOverdue = t.dueDate && t.dueDate < todayStr;
              const isToday = t.dueDate === todayStr;
              return `
                <div class="item-row">
                  <div class="item-row-left">
                    <input type="checkbox" class="custom-checkbox" onchange="window.NovaApp.toggleTask('${t.id}')">
                    <div style="min-width: 0;">
                      <div class="item-row-title">${this.escape(t.title)}</div>
                      <div class="item-row-subtitle">${relOpp ? this.escape(relOpp.name) : 'No project assigned'}</div>
                    </div>
                  </div>
                  <div class="item-row-right">
                    ${isOverdue ? '<span class="badge badge-overdue">Overdue</span>' : ''}
                    ${isToday ? '<span class="badge badge-due-today">Due Today</span>' : ''}
                    ${t.dueDate && !isOverdue && !isToday ? `<span class="badge badge-category mono">${t.dueDate}</span>` : ''}
                    <span class="badge badge-priority-${t.priority.toLowerCase()}">${t.priority}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Next Important Action Card -->
        <div class="panel-card" style="display: flex; flex-direction: column;">
          <div class="panel-card-header">
            <div class="panel-card-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 16 16 12 12 8"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              <span>Next Strategic Action</span>
            </div>
          </div>
          <div class="panel-card-body" style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
            <div class="action-box">
              <div class="action-box-tag">${nextActionType}</div>
              <div class="action-box-title">${this.escape(nextActionTitle)}</div>
              <div class="action-box-desc">${this.escape(nextActionDesc)}</div>
            </div>
            
            <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 11px; color: var(--text-tertiary);">Automated task recommendation</span>
              <a href="#opportunities" class="btn btn-secondary btn-sm">Explore Pipeline</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Deadlines & Active Trackers -->
      <div class="priority-center-grid">
        <!-- Upcoming Deadlines -->
        <div class="panel-card">
          <div class="panel-card-header">
            <div class="panel-card-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>Upcoming Recorded Deadlines</span>
            </div>
            <a href="#calendar" class="btn btn-ghost btn-sm">Open Calendar</a>
          </div>
          <div class="panel-card-body" style="padding: 6px 12px;">
            ${nextDeadlines.length === 0 ? `
              <div style="padding: 20px; text-align: center; color: var(--text-tertiary); font-size: 13px;">
                No upcoming deadlines entered yet. Edit an opportunity or task to set milestone dates.
              </div>
            ` : nextDeadlines.map(item => `
              <div class="item-row">
                <div class="item-row-left">
                  <div style="min-width: 0;">
                    <div class="item-row-title">${this.escape(item.title)}</div>
                    <div class="item-row-subtitle">${this.escape(item.category)} · ${item.type === 'opportunity' ? 'Opportunity Deadline' : 'Task Due Date'}</div>
                  </div>
                </div>
                <div class="item-row-right">
                  <span class="badge badge-category mono">${item.date}</span>
                  <span class="badge badge-priority-${item.priority.toLowerCase()}">${item.priority}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Active Focus Pipeline -->
        <div class="panel-card">
          <div class="panel-card-header">
            <div class="panel-card-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <span>Active Programs</span>
            </div>
            <a href="#opportunities" class="btn btn-ghost btn-sm">All (${opportunities.length})</a>
          </div>
          <div class="panel-card-body" style="padding: 6px 12px;">
            ${opportunities.filter(o => ['In Progress', 'Preparation', 'Pending Approval'].includes(o.status)).map(opp => {
              const statusClass = opp.status.toLowerCase().replace(/\s+/g, '-');
              const prog = stats.opportunityProgress[opp.id];
              return `
                <div class="item-row" style="cursor: pointer;" onclick="window.NovaApp.openOpportunityDetails('${opp.id}')">
                  <div class="item-row-left">
                    <div>
                      <div class="item-row-title">${this.escape(opp.name)}</div>
                      <div class="item-row-subtitle">${this.escape(opp.category)}</div>
                    </div>
                  </div>
                  <div class="item-row-right">
                    <span class="badge badge-status-${statusClass}">
                      <span class="badge-dot"></span>
                      ${opp.status}
                    </span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
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
