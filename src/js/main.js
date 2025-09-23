import { DragDrop } from './DragDrop.js';
import { BlogList } from './BlogList.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the Drag and Drop functionality
    const dragDrop = new DragDrop();
    dragDrop.init();

    // Initialize the Blog List component
    const blogListContainer = document.querySelector('.blog-list-container');
    if (blogListContainer) {
        const blogList = new BlogList(blogListContainer);
        blogList.init();
    }
});