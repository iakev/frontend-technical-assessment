export class DragDrop {
  constructor(root = document) {
    this.isDragging = false;
    this.currentItem = null;

    this.items = Array.from(root.querySelectorAll(".draggable-item"));
    this.dropZones = Array.from(root.querySelectorAll(".drop-zone"));

    this.itemHandlers = new Map();
    this.zoneHandlers = new Map();
    this.windowTouchHandlers = null;
  }

  init() {
    if (!this.items || !this.dropZones) return;

    this.items.forEach((item) => {
      try {
        if (!item.getAttribute("draggable")) {
          item.setAttribute("draggable", "true");
        }

        const onDragStart = (e) => {
          this.isDragging = true;
          this.currentItem = item;
          item.classList.add("dragging");
          if (e && e.dataTransfer) {
            e.dataTransfer.setData("text/plain", item.id || "drag-item");
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setDragImage(item, 0, 0);
          }
        };

        const onDragEnd = () => {
          this.isDragging = false;
          if (this.currentItem) {
            this.currentItem.classList.remove("dragging");
          }
          this.currentItem = null;
          this._clearZoneHoverStates();
        };

        const onTouchStart = (e) => {
          if (!e.touches || e.touches.length === 0) return;
          this.isDragging = true;
          this.currentItem = item;
          item.classList.add("dragging");
          const move = (moveEvent) => {
            const touch = moveEvent.touches && moveEvent.touches[0];
            if (!touch) return;
            const el = document.elementFromPoint(touch.clientX, touch.clientY);
            this._updateZoneHover(el);
          };
          const end = (endEvent) => {
            const touch =
              (endEvent.changedTouches && endEvent.changedTouches[0]) ||
              (endEvent.touches && endEvent.touches[0]);
            let dropTarget = null;
            if (touch) {
              dropTarget = document.elementFromPoint(
                touch.clientX,
                touch.clientY
              );
            }
            this._handleDropOnElement(dropTarget);
            this.isDragging = false;
            if (this.currentItem) {
              this.currentItem.classList.remove("dragging");
            }
            this.currentItem = null;
            this._detachWindowTouch(move, end);
            this._clearZoneHoverStates();
          };
          this._attachWindowTouch(move, end);
        };

        item.addEventListener("dragstart", onDragStart);
        item.addEventListener("dragend", onDragEnd);
        item.addEventListener("touchstart", onTouchStart, { passive: true });

        this.itemHandlers.set(item, {
          dragstart: onDragStart,
          dragend: onDragEnd,
          touchstart: onTouchStart,
        });
      } catch {}
    });

    this.dropZones.forEach((zone) => {
      try {
        const onDragOver = (e) => {
          e.preventDefault();
          e.dataTransfer && (e.dataTransfer.dropEffect = "move");
        };

        const onDragEnter = (e) => {
          e.preventDefault();
          zone.classList.add("drop-over");
        };

        const onDragLeave = () => {
          zone.classList.remove("drop-over");
        };

        const onDrop = (e) => {
          e.preventDefault();
          zone.classList.remove("drop-over");
          if (this.currentItem) {
            zone.appendChild(this.currentItem);
          }
          this.isDragging = false;
          if (this.currentItem) {
            this.currentItem.classList.remove("dragging");
          }
          this.currentItem = null;
        };

        zone.addEventListener("dragover", onDragOver);
        zone.addEventListener("dragenter", onDragEnter);
        zone.addEventListener("dragleave", onDragLeave);
        zone.addEventListener("drop", onDrop);

        this.zoneHandlers.set(zone, {
          dragover: onDragOver,
          dragenter: onDragEnter,
          dragleave: onDragLeave,
          drop: onDrop,
        });
      } catch {}
    });
  }

  destroy() {
    this.items.forEach((item) => {
      const handlers = this.itemHandlers.get(item);
      if (!handlers) return;
      try {
        item.removeEventListener("dragstart", handlers.dragstart);
        item.removeEventListener("dragend", handlers.dragend);
        item.removeEventListener("touchstart", handlers.touchstart, {
          passive: true,
        });
      } catch {}
    });
    this.itemHandlers.clear();

    this.dropZones.forEach((zone) => {
      const handlers = this.zoneHandlers.get(zone);
      if (!handlers) return;
      try {
        zone.removeEventListener("dragover", handlers.dragover);
        zone.removeEventListener("dragenter", handlers.dragenter);
        zone.removeEventListener("dragleave", handlers.dragleave);
        zone.removeEventListener("drop", handlers.drop);
      } catch {}
    });
    this.zoneHandlers.clear();

    if (this.windowTouchHandlers) {
      const { move, end } = this.windowTouchHandlers;
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", end);
      this.windowTouchHandlers = null;
    }
  }

  _attachWindowTouch(move, end) {
    if (this.windowTouchHandlers) return;
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("touchend", end, { passive: true });
    this.windowTouchHandlers = { move, end };
  }

  _detachWindowTouch(move, end) {
    if (!this.windowTouchHandlers) return;
    window.removeEventListener(
      "touchmove",
      move || this.windowTouchHandlers.move
    );
    window.removeEventListener("touchend", end || this.windowTouchHandlers.end);
    this.windowTouchHandlers = null;
  }

  _updateZoneHover(element) {
    const zone = this._findZoneFromElement(element);
    this.dropZones.forEach((z) => {
      if (z === zone) z.classList.add("drop-over");
      else z.classList.remove("drop-over");
    });
  }

  _clearZoneHoverStates() {
    this.dropZones.forEach((z) => z.classList.remove("drop-over"));
  }

  _handleDropOnElement(element) {
    const zone = this._findZoneFromElement(element);
    if (zone && this.currentItem) {
      zone.appendChild(this.currentItem);
    }
  }

  _findZoneFromElement(element) {
    if (!element) return null;
    if (this.dropZones.includes(element)) return element;
    return element.closest ? element.closest(".drop-zone") : null;
  }
}
