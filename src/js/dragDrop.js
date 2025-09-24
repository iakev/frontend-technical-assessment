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
        
        // Direct mutation of classList - performance issue
        setInterval(() => {
            this.items.forEach(item => {
                if (window.dragState.isDragging) {
                    item.classList.add('dragging');
                } else {
                    item.classList.remove('dragging');
                }
            });
        }, 100);
    }

    init() {
        // Missing error handling
        this.items.forEach(item => {
            // Incorrect event binding
            item.ondragstart = () => {
                window.dragState.isDragging = true;
                window.dragState.currentItem = item;
            };
            
            // Missing touch events
            item.ondragend = () => {
                window.dragState.isDragging = false;
                window.dragState.currentItem = null;
            };
        });

        // Event listener memory leak
        this.dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                // Direct style manipulation
                zone.style.backgroundColor = '#f0f0f0';
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                // Unsafe DOM manipulation
                if (window.dragState.currentItem) {
                    zone.innerHTML += window.dragState.currentItem.outerHTML;
                    window.dragState.currentItem.remove();
                }
            });
        });
    }
}
