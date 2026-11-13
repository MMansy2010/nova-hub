/**
 * NOVA HUB - Notes View
 * Dedicated workspace for notes, templates, and debounced auto-saving.
 */

window.NovaNotesView = {
  selectedOpportunityId: null,
  saveTimeout: null,

  render() {
    const container = document.getElementById('view-notes');
    if (!container) return;

    const opportunities = window.storage.getOpportunities();
    if (opportunities.length === 0) {
      container.innerHTML = `
        <div style="padding: 48px; text-align: center; color: var(--text-tertiary);">
          No opportunities available to take notes on. Create an opportunity first.
        </div>
      `;
      return;
    }

    // Default to first opportunity if not selected or invalid
    if (!this.selectedOpportunityId || !opportunities.some(o => o.id === this.selectedOpportunityId)) {
      this.selectedOpportunityId = opportunities[0].id;
    }

    const currentOpp = window.storage.getOpportunity(this.selectedOpportunityId) || opportunities[0];
    const notesContent = currentOpp.notes || '';
    const wordCount = notesContent.trim() ? notesContent.trim().split(/\s+/).length : 0;
    const charCount = notesContent.length;

    container.innerHTML = `
      <div class="view-header-bar">
        <div class="view-title-group">
          <h1>Field Notes & Dossiers</h1>
          <p>Structured notes, contacts, ideas, and strategic insights for each opportunity.</p>
        </div>
        <div class="view-actions-group">
          ${currentOpp.website ? `
            <a href="${this.escape(currentOpp.website)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
              <span>🔗 Open Website</span>
            </a>
          ` : ''}
          <button class="btn btn-secondary btn-sm" onclick="window.NovaApp.openOpportunityDetails('${currentOpp.id}')">
            Inspect Opportunity
          </button>
        </div>
      </div>

      <div class="notes-layout">
        <!-- Sidebar: Opportunities List -->
        <div class="notes-sidebar-card">
          <div style="padding: 12px 16px; border-bottom: 1px solid var(--border-subtle); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-tertiary);">
            Select Opportunity (${opportunities.length})
          </div>
          <div class="notes-list">
            ${opportunities.map(opp => {
              const isSelected = opp.id === currentOpp.id;
              const hasNotes = Boolean(opp.notes && opp.notes.trim());
              return `
                <div class="notes-list-item ${isSelected ? 'active' : ''}" onclick="window.NovaNotesView.selectOpportunity('${opp.id}')">
                  <div class="notes-list-title">${this.escape(opp.name)}</div>
                  <div class="notes-list-snippet">
                    ${hasNotes ? this.escape(opp.notes.replace(/\n/g, ' ').substring(0, 50)) : '<span style="color: var(--text-tertiary); font-style: italic;">Empty notes</span>'}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Editor Pane -->
        <div class="notes-editor-card">
          <div class="notes-editor-header">
            <div>
              <div style="font-size: 15px; font-weight: 700; color: var(--text-primary);">${this.escape(currentOpp.name)}</div>
              <div style="font-size: 11px; color: var(--text-tertiary); margin-top: 2px;">
                Category: ${this.escape(currentOpp.category)} · Status: ${this.escape(currentOpp.status)}
              </div>
            </div>

            <!-- Quick Template Insert Buttons -->
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button class="btn btn-ghost btn-sm" onclick="window.NovaNotesView.insertTemplate('Last Update')" title="Insert Last Update header">+ Update</button>
              <button class="btn btn-ghost btn-sm" onclick="window.NovaNotesView.insertTemplate('People to Contact')" title="Insert Contacts section">+ Contact</button>
              <button class="btn btn-ghost btn-sm" onclick="window.NovaNotesView.insertTemplate('Next Steps')" title="Insert Next Steps section">+ Next Steps</button>
              <button class="btn btn-ghost btn-sm" onclick="window.NovaNotesView.insertTemplate('Ideas')" title="Insert Ideas section">+ Ideas</button>
            </div>
          </div>

          <textarea
            id="notes-textarea"
            class="notes-editor-textarea"
            placeholder="Record important information, mentor feedback, required assets, or next steps..."
            oninput="window.NovaNotesView.onContentChange(this.value)"
          >${this.escape(notesContent)}</textarea>

          <div class="notes-editor-footer">
            <div style="display: flex; gap: 14px;">
              <span id="notes-word-count">${wordCount} words</span>
              <span id="notes-char-count">${charCount} characters</span>
            </div>
            <div id="notes-save-status" style="color: var(--text-tertiary); font-feature-settings: 'tnum';">
              ✓ All changes saved locally
            </div>
          </div>
        </div>
      </div>
    `;
  },

  selectOpportunity(id) {
    this.selectedOpportunityId = id;
    this.render();
  },

  onContentChange(value) {
    const oppId = this.selectedOpportunityId;
    if (!oppId) return;

    // Update word & character count live
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    const chars = value.length;

    const wordEl = document.getElementById('notes-word-count');
    const charEl = document.getElementById('notes-char-count');
    const statusEl = document.getElementById('notes-save-status');

    if (wordEl) wordEl.textContent = `${words} words`;
    if (charEl) charEl.textContent = `${chars} characters`;
    if (statusEl) statusEl.textContent = 'Saving...';

    // Debounce save to storage
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      window.storage.updateNotes(oppId, value);
      if (statusEl) statusEl.textContent = '✓ Saved automatically';
    }, 300);
  },

  insertTemplate(sectionTitle) {
    const textarea = document.getElementById('notes-textarea');
    if (!textarea) return;

    const templateText = `\n\n### [${sectionTitle}]\n- `;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;

    textarea.value = currentVal.substring(0, start) + templateText + currentVal.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + templateText.length;
    textarea.focus();

    this.onContentChange(textarea.value);
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

