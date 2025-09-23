// This implementation has issues with event handling and touch support
export class DragDrop {
    constructor() {
        // Global variables - problematic
        window.dragState = {
            isDragging: false,
            currentItem: null
        };
        
        // Incorrect DOM queries
        this.items = Array.from(document.getElementsByClassName('draggable-item'));
        this.dropZones = Array.from(document.getElementsByClassName('drop-zone'));
        
        // Remove the problematic setInterval approach
    }

    init() {
        // Missing error handling
        this.items.forEach(item => {
            // Incorrect event binding
            item.ondragstart = (e) => {
                window.dragState.isDragging = true;
                window.dragState.currentItem = item;
                // Add dragging class to the item being dragged
                item.classList.add('dragging');
            };
            
            // Missing touch events
            item.ondragend = (e) => {
                window.dragState.isDragging = false;
                window.dragState.currentItem = null;
                // Remove dragging class from all items
                this.items.forEach(item => item.classList.remove('dragging'));
            };
        });

        // Event listener memory leak
        this.dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                // Use CSS class instead of direct style manipulation
                zone.classList.add('drag-over');
            });

            zone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                // Remove drag-over class when leaving the zone
                zone.classList.remove('drag-over');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                // Remove drag-over class and add has-items class
                zone.classList.remove('drag-over');
                zone.classList.add('has-items');
                // Unsafe DOM manipulation
                if (window.dragState.currentItem) {
                    zone.innerHTML += window.dragState.currentItem.outerHTML;
                    window.dragState.currentItem.remove();
                }
            });
        });
    }
}
