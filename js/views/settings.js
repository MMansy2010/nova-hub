/**
 * NOVA HUB - Settings View
 * Data export/import, theme toggle, system diagnostics, and storage reset.
 */

window.NovaSettingsView = {
  render() {
    const container = document.getElementById('view-settings');
    if (!container) return;

    const currentTheme = window.storage.getTheme();
    const rawData = localStorage.getItem('nova_hub_store_v1') || '';
    const byteSize = new Blob([rawData]).size;
    const sizeKb = (byteSize / 1024).toFixed(2);

    const oppsCount = window.storage.getOpportunities().length;
    const tasksCount = window.storage.getTasks().length;

    container.innerHTML = `
      <div class="view-header-bar">
        <div class="view-title-group">
          <h1>Settings & Data Control</h1>
          <p>Local state management, data porting, backups, and display preferences.</p>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 24px; max-width: 800px;">
        <!-- Appearance Settings -->
        <div class="panel-card">
          <div class="panel-card-header">
            <div class="panel-card-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              <span>Interface & Theme</span>
            </div>
          </div>
          <div class="panel-card-body" style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">Visual Appearance</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                Switch between high-contrast dark charcoal and clean daylight themes.
              </div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button
                class="btn ${currentTheme === 'dark' ? 'btn-primary' : 'btn-secondary'} btn-sm"
                onclick="window.NovaApp.setTheme('dark')"
              >
                Dark Charcoal
              </button>
              <button
                class="btn ${currentTheme === 'light' ? 'btn-primary' : 'btn-secondary'} btn-sm"
                onclick="window.NovaApp.setTheme('light')"
              >
                Light Editorial
              </button>
            </div>
          </div>
        </div>

        <!-- Local Storage Diagnostics -->
        <div class="panel-card">
          <div class="panel-card-header">
            <div class="panel-card-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
              <span>LocalStorage Telemetry</span>
            </div>
          </div>
          <div class="panel-card-body">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 12px;">
              <div style="background: var(--bg-surface-elevated); padding: 10px 14px; border-radius: 6px; border: 1px solid var(--border-subtle);">
                <div style="font-size: 11px; color: var(--text-tertiary);">Tracked Opportunities</div>
                <div style="font-size: 18px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">${oppsCount}</div>
              </div>
              <div style="background: var(--bg-surface-elevated); padding: 10px 14px; border-radius: 6px; border: 1px solid var(--border-subtle);">
                <div style="font-size: 11px; color: var(--text-tertiary);">Active Subtasks</div>
                <div style="font-size: 18px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">${tasksCount}</div>
              </div>
              <div style="background: var(--bg-surface-elevated); padding: 10px 14px; border-radius: 6px; border: 1px solid var(--border-subtle);">
                <div style="font-size: 11px; color: var(--text-tertiary);">Storage Utilization</div>
                <div style="font-size: 18px; font-weight: 700; color: var(--accent); margin-top: 2px;">${sizeKb} KB</div>
              </div>
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
              All records exist exclusively within your browser's private <code class="mono">localStorage</code> container. No data leaves your machine or transits external servers.
            </div>
          </div>
        </div>

        <!-- Export & Backup -->
        <div class="panel-card">
          <div class="panel-card-header">
            <div class="panel-card-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Backup & Data Portability</span>
            </div>
          </div>
          <div class="panel-card-body" style="display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: gap; gap: 12px;">
              <div>
                <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">Export Complete Database</div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                  Download a structured, human-readable JSON snapshot containing all opportunities, tasks, and notes.
                </div>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="window.NovaSettingsView.triggerExport()">
                📥 Export JSON
              </button>
            </div>

            <div style="padding-top: 14px; border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; flex-wrap: gap; gap: 12px;">
              <div>
                <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">Import Database Snapshot</div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                  Restore from an existing JSON backup. Safely validates schemas before applying.
                </div>
              </div>
              <div>
                <input type="file" id="import-file-input" accept=".json,application/json" style="display: none;" onchange="window.NovaSettingsView.handleFileImport(event)" />
                <button class="btn btn-secondary btn-sm" onclick="document.getElementById('import-file-input').click()">
                  📤 Select File
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Danger Zone: Reset -->
        <div class="panel-card" style="border-color: rgba(239, 68, 68, 0.3);">
          <div class="panel-card-header" style="background: rgba(239, 68, 68, 0.05);">
            <div class="panel-card-title" style="color: var(--alert-danger);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>Danger Zone</span>
            </div>
          </div>
          <div class="panel-card-body" style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
            <div>
              <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">Reset to Initial Workspace</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                Restores the 6 baseline opportunities (NASA Space Apps, Coding Olympiad, Technovation Girls, SYS Volunteering, NTA, GV Hackathon).
              </div>
            </div>
            <button class="btn btn-danger btn-sm" onclick="window.NovaSettingsView.confirmReset()">
              Reset Data
            </button>
          </div>
        </div>

        <!-- Keyboard Shortcuts Reference -->
        <div class="panel-card">
          <div class="panel-card-header">
            <div class="panel-card-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><line x1="6" y1="8" x2="6.01" y2="8"/><line x1="10" y1="8" x2="10.01" y2="8"/><line x1="14" y1="8" x2="14.01" y2="8"/><line x1="18" y1="8" x2="18.01" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/><line x1="14" y1="16" x2="14.01" y2="16"/><line x1="18" y1="16" x2="18.01" y2="16"/></svg>
              <span>Keyboard Shortcuts</span>
            </div>
          </div>
          <div class="panel-card-body" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: var(--bg-surface-elevated); border-radius: 4px;">
              <span style="color: var(--text-secondary);">Command Palette</span>
              <div><kbd>Ctrl</kbd> + <kbd>K</kbd> / <kbd>⌘K</kbd></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: var(--bg-surface-elevated); border-radius: 4px;">
              <span style="color: var(--text-secondary);">Quick New Opportunity</span>
              <div><kbd>N</kbd></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: var(--bg-surface-elevated); border-radius: 4px;">
              <span style="color: var(--text-secondary);">Quick New Task</span>
              <div><kbd>T</kbd></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: var(--bg-surface-elevated); border-radius: 4px;">
              <span style="color: var(--text-secondary);">Switch Views</span>
              <div><kbd>1</kbd> to <kbd>6</kbd></div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  triggerExport() {
    const jsonStr = window.storage.exportJSON();
    const dateStr = new Date().toISOString().split('T')[0];
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nova-hub-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    window.NovaApp.showToast('Database exported successfully.');
  },

  handleFileImport(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target.result;
      const res = window.storage.importJSON(content);
      if (res.success) {
        window.NovaApp.showToast(`Imported ${res.oppsCount} opportunities & ${res.tasksCount} tasks.`);
        this.render();
      } else {
        alert('Failed to import file: ' + res.error);
      }
    };
    reader.readAsText(file);
    // Clear input so same file can be selected again if desired
    event.target.value = '';
  },

  confirmReset() {
    if (confirm('Are you sure you want to reset your database? All custom modifications will be replaced with the 6 baseline initial opportunities.')) {
      window.storage.resetToDefaults();
      window.NovaApp.showToast('Workspace reset to baseline state.');
      this.render();
    }
  }
};
