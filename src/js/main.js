import { Navigation } from './navigation.js';
import { DragDrop } from './dragDrop.js';
import { BlogList } from './BlogList.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Navigation component (from feature/navigation)
    const header = document.querySelector('header');
    if (header) {
        // NOTE: Ensure your Navigation class is defined to accept the header element
        new Navigation(header);
    }

    // 2. Initialize Drag and Drop functionality (from feature/drag-drop)
    // NOTE: This assumes DragDrop's constructor doesn't require a container argument.
    const dragDrop = new DragDrop();
    dragDrop.init();

    // 3. Initialize the Blog List component (from feature/drag-drop)
    const blogListContainer = document.querySelector('.blog-list-container');
    if (blogListContainer) {
        const blogList = new BlogList(blogListContainer);
        blogList.init();
    }
});