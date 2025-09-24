import { Navigation } from './navigation.js';
import { DragDrop } from './dragDrop.js';
import { BlogList } from './BlogList.js';

document.addEventListener('DOMContentLoaded', () => {
    new Navigation();
    // Initialize Drag & Drop
    const dragDropContainer = document.querySelector('.drag-drop-container');
    if (dragDropContainer) {
        const dragDrop = new DragDrop();
        dragDrop.init();
    }

    // Initialize Blog List (partial)
    const blogListContainer = document.querySelector('.blog-list-container');
    if (blogListContainer) {
        const blogList = new BlogList(blogListContainer);
        blogList.init();
    }
});
