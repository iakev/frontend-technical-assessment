

// src/js/dragDrop.js
export class DragDrop {
    constructor(container) {
      this.container = container;
      this.draggedItem = null;
      // targets include the original list so items can be returned
      this.dropTargets = Array.from(container.querySelectorAll('.drop-zone, .draggable-list'));
      // we do not store items statically because items move between containers
    }
  
    init() {
      // use delegated attach: re-query items each time to support moved items
      this._attachItemListeners();
  
      // attach drop listeners to all targets
      this.dropTargets.forEach(zone => {
        zone.addEventListener('dragover', this._onDragOver.bind(this));
        zone.addEventListener('dragleave', this._onDragLeave.bind(this));
        zone.addEventListener('drop', this._onDrop.bind(this));
      });
  
      // If DOM may change, expose a small refresh utility
      // (call dragDrop.refresh() from outside if you add items later)
    }
  
    // Attach drag listeners to all current draggable items
    _attachItemListeners() {
      const items = Array.from(this.container.querySelectorAll('.draggable-item'));
      items.forEach(item => {
        // ensure draggable attribute present
        item.setAttribute('draggable', 'true');
  
        // remove existing handlers to avoid duplicates (idemp.)
        item.removeEventListener('dragstart', item._dragStartHandler);
        item.removeEventListener('dragend', item._dragEndHandler);
        item.removeEventListener('click', item._clickHandler);
  
        item._dragStartHandler = (e) => this._onDragStart(e, item);
        item._dragEndHandler = (e) => this._onDragEnd(e, item);
        item._clickHandler = () => { this.draggedItem = null; };
  
        item.addEventListener('dragstart', item._dragStartHandler);
        item.addEventListener('dragend', item._dragEndHandler);
        item.addEventListener('click', item._clickHandler);
      });
    }
  
    // Public helper if you dynamically add items later
    refresh() {
      this.dropTargets = Array.from(this.container.querySelectorAll('.drop-zone, .draggable-list'));
      this._attachItemListeners();
      // rebind listeners to new drop targets (simple approach)
      this.dropTargets.forEach(zone => {
        zone.removeEventListener('dragover', this._onDragOver.bind(this));
        zone.removeEventListener('dragleave', this._onDragLeave.bind(this));
        zone.removeEventListener('drop', this._onDrop.bind(this));
        zone.addEventListener('dragover', this._onDragOver.bind(this));
        zone.addEventListener('dragleave', this._onDragLeave.bind(this));
        zone.addEventListener('drop', this._onDrop.bind(this));
      });
    }
  
    _onDragStart(e, item) {
      this.draggedItem = item;
      item.classList.add('dragging');
  
      // cross-browser: set data so Firefox allows dragging
      try { e.dataTransfer.setData('text/plain', item.dataset.id || ''); } catch (_) {}
  
      e.dataTransfer.effectAllowed = 'move';
  
      // Hide the original element visually but keep layout stable: use visibility hidden
      // use requestAnimationFrame to ensure browser has started the drag
      requestAnimationFrame(() => {
        item.style.visibility = 'hidden';
      });
  
      // Optionally set a custom drag image (improves visual consistency)
      // create a small transparent image to avoid default ghost image jitter on some browsers
      try {
        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
        e.dataTransfer.setDragImage(img, 0, 0);
      } catch (_) {}
    }
  
    _onDragEnd(e, item) {
      // restore visibility and cleanup
      item.style.visibility = 'visible';
      item.classList.remove('dragging');
      this.draggedItem = null;
  
      // remove any .over classes left behind
      this.dropTargets.forEach(z => z.classList.remove('over'));
  
      // try to clear dataTransfer if available
      if (e && e.dataTransfer) {
        try { e.dataTransfer.clearData(); } catch (_) {}
      }
    }
  
    _onDragOver(e) {
      e.preventDefault(); // allow drop
      e.dataTransfer.dropEffect = 'move';
      const zone = e.currentTarget;
      zone.classList.add('over');
    }
  
    _onDragLeave(e) {
      const zone = e.currentTarget;
      // only remove class if leaving the zone entirely
      zone.classList.remove('over');
    }
  
    _onDrop(e) {
      e.preventDefault();
      const zone = e.currentTarget;
      zone.classList.remove('over');
  
      if (!this.draggedItem) {
        // nothing to do
        try { e.dataTransfer.clearData(); } catch (_) {}
        return;
      }
  
      // append real element (move it) — this prevents duplicates
      zone.appendChild(this.draggedItem);
  
      // restore visibility and class immediately so the element is not hidden after append
      this.draggedItem.style.visibility = 'visible';
      this.draggedItem.classList.remove('dragging');
  
      // clear reference
      this.draggedItem = null;
  
      try { e.dataTransfer.clearData(); } catch (_) {}
    }
  }
  