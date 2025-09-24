export class DragDrop {
    constructor() {
        // Find all draggable items and drop zones
        this.items = document.querySelectorAll('.draggable-item');
        this.dropZones = document.querySelectorAll('.drop-zone');

        // State to track the currently dragged item
        this.currentItem = null;
    }

    init() {
        // Attach event listeners to all draggable items
        this.items.forEach(item => {
            // Desktop and laptop drag events
            item.addEventListener('dragstart', this.handleDragStart.bind(this));
            item.addEventListener('dragend', this.handleDragEnd.bind(this));

            // Mobile touch events
            item.addEventListener('touchstart', this.handleTouchStart.bind(this));
            item.addEventListener('touchmove', this.handleTouchMove.bind(this));
            item.addEventListener('touchend', this.handleTouchEnd.bind(this));
        });

        // Attach event listeners to all drop zones
        this.dropZones.forEach(zone => {
            zone.addEventListener('dragover', this.handleDragOver.bind(this));
            zone.addEventListener('dragleave', this.handleDragLeave.bind(this));
            zone.addEventListener('drop', this.handleDrop.bind(this));
        });
    }

    // --- Desktop Drag & Drop Handlers ---

    handleDragStart(e) {
        // Store a reference to the dragged element
        this.currentItem = e.target;
        // Use a small delay to ensure the class is added after the drag image is created
        setTimeout(() => this.currentItem.classList.add('dragging'), 0);

        // Transfer the ID for use in the drop event
        e.dataTransfer.setData('text/plain', this.currentItem.id || this.currentItem.querySelector('.item-content').textContent);
    }

    handleDragEnd(e) {
        // Remove the dragging class from the item
        this.currentItem?.classList.remove('dragging');
        this.currentItem = null;
    }

    handleDragOver(e) {
        // Prevent default behavior to allow a drop
        e.preventDefault();
        // Add visual feedback to the active drop zone
        e.currentTarget.classList.add('active');
    }

    handleDragLeave(e) {
        // Remove visual feedback when the item leaves the drop zone
        e.currentTarget.classList.remove('active');
    }

    handleDrop(e) {
        e.preventDefault();
        const dropZone = e.currentTarget;
        dropZone.classList.remove('active');

        // Get the ID from the dataTransfer object
        const data = e.dataTransfer.getData('text/plain');

        // Find the dragged element, either by ID or text content
        const draggedElement = document.getElementById(data) || Array.from(this.items).find(item => item.textContent.includes(data));

        if (draggedElement) {
            // Append the element to the drop zone
            dropZone.appendChild(draggedElement);
        }
    }

    // --- Basic Touch Event Handlers for Mobile Support ---

    handleTouchStart(e) {
        e.preventDefault(); // Prevents default browser actions like scrolling
        this.currentItem = e.target.closest('.draggable-item');
        if (this.currentItem) {
            this.currentItem.classList.add('dragging');
            // Store the initial touch position
            const touch = e.touches[0];
            this.initialX = touch.clientX;
            this.initialY = touch.clientY;
        }
    }

    handleTouchMove(e) {
        if (!this.currentItem) return;

        // Update the item's position
        const touch = e.touches[0];
        const deltaX = touch.clientX - this.initialX;
        const deltaY = touch.clientY - this.initialY;

        this.currentItem.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // Highlight a drop zone if the item is over it
        this.dropZones.forEach(zone => {
            const rect = zone.getBoundingClientRect();
            if (touch.clientX > rect.left && touch.clientX < rect.right &&
                touch.clientY > rect.top && touch.clientY < rect.bottom) {
                zone.classList.add('active');
            } else {
                zone.classList.remove('active');
            }
        });
    }

    handleTouchEnd(e) {
        if (!this.currentItem) return;

        // Find the drop zone at the final touch position
        const dropZone = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY)?.closest('.drop-zone');

        if (dropZone) {
            dropZone.classList.remove('active');
            dropZone.appendChild(this.currentItem);
        }

        // Clean up
        this.currentItem.classList.remove('dragging');
        this.currentItem.style.transform = '';
        this.currentItem = null;
    }
}