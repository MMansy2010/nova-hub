/**
 * NOVA HUB - Calendar & Timeline View
 * Clean month grid & chronological agenda view. Only displays entered dates.
 */

window.NovaCalendarView = {
  currentDate: new Date(),
  selectedDay: null,

  render() {
    const container = document.getElementById('view-calendar');
    if (!container) return;

    const opportunities = window.storage.getOpportunities();
    const tasks = window.storage.getTasks();

    // Collect all entered dates into a date map
    // Key: YYYY-MM-DD -> Array of items
    const eventsMap = {};

    opportunities.forEach(opp => {
      if (opp.deadline) {
        if (!eventsMap[opp.deadline]) eventsMap[opp.deadline] = [];
        eventsMap[opp.deadline].push({
          type: 'opportunity',
          id: opp.id,
          title: opp.name,
          category: opp.category,
          status: opp.status,
          priority: opp.priority
        });
      }
    });

    tasks.forEach(task => {
      if (task.dueDate) {
        if (!eventsMap[task.dueDate]) eventsMap[task.dueDate] = [];
        const relOpp = opportunities.find(o => o.id === task.opportunityId);
        eventsMap[task.dueDate].push({
          type: 'task',
          id: task.id,
          title: task.title,
          category: relOpp ? relOpp.name : 'Task',
          status: task.completed ? 'Completed' : 'Pending',
          priority: task.priority,
          completed: task.completed
        });
      }
    });

    // Month details
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthTitle = `${monthNames[month]} ${year}`;

    // First day of month & total days
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const todayStr = new Date().toISOString().split('T')[0];

    // Build chronological timeline of all recorded dates
    const allDates = Object.keys(eventsMap).sort();
    const upcomingDates = allDates.filter(d => d >= todayStr);

    container.innerHTML = `
      <div class="view-header-bar">
        <div class="view-title-group">
          <h1>Calendar & Milestones</h1>
          <p>Chronological agenda of active deadlines, submission windows, and competition dates.</p>
        </div>
        <div class="view-actions-group">
          <button class="btn btn-secondary btn-sm" onclick="window.NovaCalendarView.goToToday()">Today</button>
          <div style="display: inline-flex; border: 1px solid var(--border-medium); border-radius: 6px; overflow: hidden; background: var(--bg-surface);">
            <button class="btn btn-ghost btn-sm" onclick="window.NovaCalendarView.prevMonth()" title="Previous Month">‹</button>
            <button class="btn btn-ghost btn-sm" onclick="window.NovaCalendarView.nextMonth()" title="Next Month">›</button>
          </div>
        </div>
      </div>

      <div class="calendar-view-wrapper">
        <!-- Month Navigation Bar -->
        <div class="calendar-nav-bar">
          <div class="calendar-month-title">${monthTitle}</div>
          <div style="display: flex; gap: 8px; align-items: center; font-size: 11px; color: var(--text-tertiary);">
            <span style="display: inline-flex; align-items: center; gap: 4px;">
              <span style="width: 8px; height: 8px; border-radius: 2px; background: var(--priority-high);"></span> Opp Deadline
            </span>
            <span style="display: inline-flex; align-items: center; gap: 4px; margin-left: 8px;">
              <span style="width: 8px; height: 8px; border-radius: 2px; background: var(--accent);"></span> Task Due Date
            </span>
          </div>
        </div>

        <!-- Month Grid -->
        <div class="calendar-grid">
          <div class="calendar-day-header">Sun</div>
          <div class="calendar-day-header">Mon</div>
          <div class="calendar-day-header">Tue</div>
          <div class="calendar-day-header">Wed</div>
          <div class="calendar-day-header">Thu</div>
          <div class="calendar-day-header">Fri</div>
          <div class="calendar-day-header">Sat</div>

          <!-- Prev Month Padding Days -->
          ${Array.from({ length: firstDayIndex }).map((_, i) => {
            const dayNum = daysInPrevMonth - firstDayIndex + i + 1;
            return `<div class="calendar-day-cell other-month"><span class="day-number">${dayNum}</span></div>`;
          }).join('')}

          <!-- Current Month Days -->
          ${Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const dayEvents = eventsMap[dateStr] || [];

            return `
              <div class="calendar-day-cell ${isToday ? 'today' : ''}" onclick="window.NovaCalendarView.selectDay('${dateStr}')">
                <span class="day-number">${dayNum}</span>
                <div style="display: flex; flex-direction: column; gap: 2px; overflow-y: auto;">
                  ${dayEvents.slice(0, 3).map(ev => `
                    <div class="calendar-event-pill ${ev.type === 'opportunity' ? 'deadline' : ''}" title="${this.escape(ev.title)}">
                      ${this.escape(ev.title)}
                    </div>
                  `).join('')}
                  ${dayEvents.length > 3 ? `
                    <div style="font-size: 9px; color: var(--text-tertiary); font-weight: 600;">+${dayEvents.length - 3} more</div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}

          <!-- Next Month Trailing Days -->
          ${(() => {
            const totalCells = firstDayIndex + daysInMonth;
            const trailing = (7 - (totalCells % 7)) % 7;
            return Array.from({ length: trailing }).map((_, i) => `
              <div class="calendar-day-cell other-month"><span class="day-number">${i + 1}</span></div>
            `).join('');
          })()}
        </div>

        <!-- Agenda & Timeline List of All Recorded Dates -->
        <div class="panel-card" style="margin-top: 12px;">
          <div class="panel-card-header">
            <div class="panel-card-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              <span>Recorded Milestones & Scheduled Deadlines</span>
            </div>
            <span style="font-size: 11px; color: var(--text-tertiary);">${allDates.length} scheduled dates recorded</span>
          </div>

          <div class="panel-card-body" style="padding: 6px 12px;">
            ${allDates.length === 0 ? `
              <div style="padding: 32px 16px; text-align: center; color: var(--text-tertiary); font-size: 13px;">
                No dates have been recorded yet. Set a deadline on an opportunity or assign a due date to a task to populate this calendar.
              </div>
            ` : allDates.map(dateKey => {
              const items = eventsMap[dateKey];
              const isPast = dateKey < todayStr;
              const isToday = dateKey === todayStr;

              return `
                <div style="padding: 10px 8px; border-bottom: 1px solid var(--border-subtle);">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                    <span class="badge ${isToday ? 'badge-due-today' : isPast ? 'badge-category' : 'badge-status-in-progress'} mono">
                      📅 ${dateKey} ${isToday ? '— Today' : isPast ? '— Past' : ''}
                    </span>
                    <span style="font-size: 11px; color: var(--text-tertiary);">${items.length} item(s)</span>
                  </div>

                  <div style="display: flex; flex-direction: column; gap: 4px; padding-left: 8px;">
                    ${items.map(item => `
                      <div class="item-row" style="background: var(--bg-surface-elevated); padding: 6px 10px;">
                        <div class="item-row-left">
                          <div style="min-width: 0;">
                            <div class="item-row-title">${this.escape(item.title)}</div>
                            <div class="item-row-subtitle">${this.escape(item.category)} · ${item.type === 'opportunity' ? 'Opportunity Deadline' : 'Task Due Date'}</div>
                          </div>
                        </div>
                        <div class="item-row-right">
                          <span class="badge badge-priority-${item.priority.toLowerCase()}">${item.priority}</span>
                          ${item.type === 'opportunity' ? `
                            <button class="btn btn-ghost btn-sm" onclick="window.NovaApp.openOpportunityDetails('${item.id}')">Inspect</button>
                          ` : ''}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  },

  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.render();
  },

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.render();
  },

  goToToday() {
    this.currentDate = new Date();
    this.render();
  },

  selectDay(dateStr) {
    this.selectedDay = dateStr;
    const items = (window.storage.getOpportunities().filter(o => o.deadline === dateStr))
      .concat(window.storage.getTasks().filter(t => t.dueDate === dateStr));

    if (items.length > 0) {
      window.NovaApp.showToast(`Selected date: ${dateStr} (${items.length} scheduled item(s))`);
    } else {
      window.NovaApp.showToast(`No items scheduled for ${dateStr}`);
    }
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
