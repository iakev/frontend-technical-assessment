export class DragDrop {
  constructor() {
    this.dragState = {
      isDragging: false,
      currentItem: null,
      dragOffset: { x: 0, y: 0 },
    };

    this.items = [];
    this.dropZones = [];
    this.boundHandlers = {
      dragStart: this.handleDragStart.bind(this),
      dragEnd: this.handleDragEnd.bind(this),
      dragOver: this.handleDragOver.bind(this),
      drop: this.handleDrop.bind(this),
      dragEnter: this.handleDragEnter.bind(this),
      dragLeave: this.handleDragLeave.bind(this),
      keyDown: this.handleKeyDown.bind(this),
      touchStart: this.handleTouchStart.bind(this),
      touchMove: this.handleTouchMove.bind(this),
      touchEnd: this.handleTouchEnd.bind(this),
    };
  }

  init() {
    try {
      this.cacheElements();
      this.bindEvents();
    } catch (error) {
      console.error("Error initializing DragDrop:", error);
    }
  }

  cacheElements() {
    this.items = Array.from(document.querySelectorAll(".draggable-item"));
    this.dropZones = Array.from(document.querySelectorAll(".drop-zone"));

    if (this.items.length === 0 || this.dropZones.length === 0) {
      throw new Error("Required drag and drop elements not found");
    }
  }

  bindEvents() {
    // Bind drag events to items
    this.items.forEach((item) => {
      item.addEventListener("dragstart", this.boundHandlers.dragStart);
      item.addEventListener("dragend", this.boundHandlers.dragEnd);
      item.addEventListener("keydown", this.boundHandlers.keyDown);

      // Touch events for mobile support
      item.addEventListener("touchstart", this.boundHandlers.touchStart, {
        passive: false,
      });
      item.addEventListener("touchmove", this.boundHandlers.touchMove, {
        passive: false,
      });
      item.addEventListener("touchend", this.boundHandlers.touchEnd);
    });

    // Bind drop events to zones
    this.dropZones.forEach((zone) => {
      zone.addEventListener("dragover", this.boundHandlers.dragOver);
      zone.addEventListener("drop", this.boundHandlers.drop);
      zone.addEventListener("dragenter", this.boundHandlers.dragEnter);
      zone.addEventListener("dragleave", this.boundHandlers.dragLeave);
      zone.addEventListener("keydown", this.boundHandlers.keyDown);
    });
  }

  handleDragStart(e) {
    this.dragState.isDragging = true;
    this.dragState.currentItem = e.target;

    // Add dragging class with smooth animation
    requestAnimationFrame(() => {
      e.target.classList.add("dragging");
    });

    // Set drag data
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.outerHTML);

    // Create custom drag image
    const dragImage = e.target.cloneNode(true);
    dragImage.style.transform = "rotate(5deg)";
    dragImage.style.opacity = "0.8";
    e.dataTransfer.setDragImage(dragImage, 50, 25);
  }

  handleDragEnd(e) {
    this.dragState.isDragging = false;

    // Remove dragging class with animation
    requestAnimationFrame(() => {
      e.target.classList.remove("dragging");
    });

    // Clean up drag over states
    this.dropZones.forEach((zone) => {
      zone.classList.remove("drag-over");
    });

    this.dragState.currentItem = null;
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  handleDragEnter(e) {
    e.preventDefault();
    if (this.dragState.isDragging) {
      e.currentTarget.classList.add("drag-over");
    }
  }

  handleDragLeave(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    // Only remove drag-over if we're actually leaving the element
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      e.currentTarget.classList.remove("drag-over");
    }
  }

  handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");

    if (!this.dragState.currentItem) return;

    const dropZone = e.currentTarget;
    const draggedItem = this.dragState.currentItem;

    try {
      // Clone the item for the drop zone
      const clonedItem = this.createDroppedItem(draggedItem);

      // Clear drop zone if it has content
      const existingContent = dropZone.querySelector(".dropped-item");
      if (existingContent) {
        existingContent.remove();
      }

      // Add the item to the drop zone with animation
      dropZone.appendChild(clonedItem);

      // Animate the drop
      requestAnimationFrame(() => {
        clonedItem.classList.add("dropped-item");
      });

      // Remove original item with fade out
      this.removeOriginalItem(draggedItem);

      // Update accessibility
      this.updateAriaLabels();
    } catch (error) {
      console.error("Error during drop:", error);
    }
  }

  createDroppedItem(originalItem) {
    const clonedItem = originalItem.cloneNode(true);
    clonedItem.classList.remove("dragging");
    clonedItem.classList.add("dropped-item");
    clonedItem.removeAttribute("draggable");

    // Add return functionality
    clonedItem.addEventListener("click", () => {
      this.returnItemToList(clonedItem, originalItem);
    });

    // Update accessibility
    clonedItem.setAttribute("role", "button");
    clonedItem.setAttribute("aria-label", "Click to return to list");
    clonedItem.tabIndex = 0;

    return clonedItem;
  }

  removeOriginalItem(item) {
    // Fade out animation
    item.style.transition = "all 0.3s ease-out";
    item.style.opacity = "0";
    item.style.transform = "scale(0.8)";

    setTimeout(() => {
      if (item.parentNode) {
        item.remove();
      }
    }, 300);
  }

  returnItemToList(droppedItem, originalItem) {
    const draggableList = document.querySelector(".draggable-list");
    if (!draggableList) return;

    // Create new draggable item
    const newItem = originalItem.cloneNode(true);
    newItem.classList.remove("dragging");
    newItem.setAttribute("draggable", "true");

    // Bind events to new item
    newItem.addEventListener("dragstart", this.boundHandlers.dragStart);
    newItem.addEventListener("dragend", this.boundHandlers.dragEnd);
    newItem.addEventListener("keydown", this.boundHandlers.keyDown);
    newItem.addEventListener("touchstart", this.boundHandlers.touchStart, {
      passive: false,
    });
    newItem.addEventListener("touchmove", this.boundHandlers.touchMove, {
      passive: false,
    });
    newItem.addEventListener("touchend", this.boundHandlers.touchEnd);

    // Add to list with animation
    draggableList.appendChild(newItem);

    // Remove from drop zone with animation
    droppedItem.style.transition = "all 0.3s ease-out";
    droppedItem.style.opacity = "0";
    droppedItem.style.transform = "scale(0.8)";

    setTimeout(() => {
      droppedItem.remove();
    }, 300);

    // Update items array
    this.items = Array.from(document.querySelectorAll(".draggable-item"));

    // Update accessibility
    this.updateAriaLabels();
  }

  // Keyboard accessibility
  handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();

      if (e.target.classList.contains("draggable-item")) {
        this.handleKeyboardDrag(e.target);
      } else if (e.target.classList.contains("dropped-item")) {
        e.target.click(); // Return to list
      }
    }

    // Arrow key navigation
    if (e.key.startsWith("Arrow")) {
      this.handleArrowNavigation(e);
    }
  }

  handleKeyboardDrag(item) {
    // Simple keyboard drag: move to first available drop zone
    const availableZone = this.dropZones.find(
      (zone) => !zone.querySelector(".dropped-item")
    );
    if (availableZone) {
      // Simulate drop
      this.dragState.currentItem = item;
      const dropEvent = new Event("drop");
      Object.defineProperty(dropEvent, "currentTarget", {
        value: availableZone,
      });
      Object.defineProperty(dropEvent, "preventDefault", { value: () => {} });
      this.handleDrop(dropEvent);
    }
  }

  handleArrowNavigation(e) {
    const focusableElements = [
      ...document.querySelectorAll(".draggable-item"),
      ...document.querySelectorAll(".drop-zone"),
      ...document.querySelectorAll(".dropped-item"),
    ].filter((el) => el.tabIndex >= 0);

    const currentIndex = focusableElements.indexOf(e.target);
    let nextIndex;

    switch (e.key) {
      case "ArrowUp":
      case "ArrowLeft":
        nextIndex =
          currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
        break;
      case "ArrowDown":
      case "ArrowRight":
        nextIndex =
          currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
        break;
      default:
        return;
    }

    e.preventDefault();
    focusableElements[nextIndex].focus();
  }

  // Touch support for mobile devices
  handleTouchStart(e) {
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    const item = e.currentTarget;

    this.dragState.currentItem = item;
    this.dragState.dragOffset = {
      x: touch.clientX - item.getBoundingClientRect().left,
      y: touch.clientY - item.getBoundingClientRect().top,
    };

    item.classList.add("dragging");
    e.preventDefault();
  }

  handleTouchMove(e) {
    if (!this.dragState.currentItem || e.touches.length !== 1) return;

    e.preventDefault();
    const touch = e.touches[0];

    // Find element under touch point
    const elementBelow = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    );
    const dropZone = elementBelow?.closest(".drop-zone");

    // Update drop zone states
    this.dropZones.forEach((zone) => {
      zone.classList.toggle("drag-over", zone === dropZone);
    });
  }

  handleTouchEnd(e) {
    if (!this.dragState.currentItem) return;

    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    );
    const dropZone = elementBelow?.closest(".drop-zone");

    if (dropZone) {
      // Simulate drop event
      const dropEvent = {
        preventDefault: () => {},
        currentTarget: dropZone,
      };
      this.handleDrop(dropEvent);
    }

    // Clean up
    this.dragState.currentItem.classList.remove("dragging");
    this.dropZones.forEach((zone) => zone.classList.remove("drag-over"));
    this.dragState.currentItem = null;
  }

  updateAriaLabels() {
    this.dropZones.forEach((zone, index) => {
      const hasItem = zone.querySelector(".dropped-item");
      const label = hasItem
        ? `Drop zone ${index + 1} - contains item`
        : `Drop zone ${index + 1} - empty`;
      zone.setAttribute("aria-label", label);
    });
  }

  // Cleanup method
  destroy() {
    this.items.forEach((item) => {
      item.removeEventListener("dragstart", this.boundHandlers.dragStart);
      item.removeEventListener("dragend", this.boundHandlers.dragEnd);
      item.removeEventListener("keydown", this.boundHandlers.keyDown);
      item.removeEventListener("touchstart", this.boundHandlers.touchStart);
      item.removeEventListener("touchmove", this.boundHandlers.touchMove);
      item.removeEventListener("touchend", this.boundHandlers.touchEnd);
    });

    this.dropZones.forEach((zone) => {
      zone.removeEventListener("dragover", this.boundHandlers.dragOver);
      zone.removeEventListener("drop", this.boundHandlers.drop);
      zone.removeEventListener("dragenter", this.boundHandlers.dragEnter);
      zone.removeEventListener("dragleave", this.boundHandlers.dragLeave);
      zone.removeEventListener("keydown", this.boundHandlers.keyDown);
    });
  }
}
