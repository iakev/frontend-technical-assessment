<<<<<<< HEAD
import { DragDrop } from "./dragDrop.js";
import { BlogList } from "./BlogList.js";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Navigation
  const navigation = new Navigation();
  navigation.init();

  // Initialize Drag & Drop
  const dragDropContainer = document.querySelector(".drag-drop-container");
  if (dragDropContainer) {
    const dragDrop = new DragDrop();
    dragDrop.init();
  }

  // Initialize Blog List
  const blogListContainer = document.querySelector(".blog-list-container");
  if (blogListContainer) {
    const blogList = new BlogList(blogListContainer);
    blogList.init();
  }
=======
import { Navigation } from "./navigation.js";

document.addEventListener("DOMContentLoaded", () => {
  const navigation = new Navigation();
  navigation.init(); // <-- Call init to activate all features
>>>>>>> feature/navigation
});
