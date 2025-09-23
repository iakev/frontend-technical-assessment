document.addEventListener('DOMContentLoaded', () => {
    // Initialize Navigation (imported as module)
    import('./navigation.js').then(({ Navigation }) => {
        new Navigation();
    });
    // Initialize Drag & Drop
    initDragDrop();
    // Fetch blogs
    fetchBlogs();
});


/* ------------------------------
   Drag & Drop Implementation
--------------------------------*/
function initDragDrop() {
    const items = document.querySelectorAll('.draggable');
    const dropZones = document.querySelectorAll('.drop-zone');

    items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.id);
            item.classList.add('dragging');
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
        });
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain');
            const draggedEl = document.getElementById(id);
            zone.appendChild(draggedEl);
            zone.classList.remove('drag-over');
        });
    });
}

/* ------------------------------
   Blog Fetch & Render
--------------------------------*/
async function fetchBlogs() {
    try {
        const response = await fetch('https://frontend-blog-lyart.vercel.app/blogsData.json');
        const data = await response.json();

        const blogList = document.getElementById('blog-list');
        blogList.innerHTML = '';

        data.forEach(blog => {
            const blogCard = document.createElement('div');
            blogCard.className = 'blog-card blog-flex';
            blogCard.innerHTML = `
                <img src="${blog.image}" alt="${blog.title}" class="blog-image">
                <div class="blog-text">
                    <h3>${blog.title}</h3>
                    <p><strong>Category:</strong> ${blog.category} | <strong>Author:</strong> ${blog.author} | <strong>Published:</strong> ${blog.published_date} | <strong>Reading Time:</strong> ${blog.reading_time}</p>
                    <p>${blog.content}</p>
                    <div class="tags">
                        ${blog.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
            blogList.appendChild(blogCard);
        });

    } catch (error) {
        console.error('Error fetching blogs:', error);
    }
}
