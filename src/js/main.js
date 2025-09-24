<<<<<<< HEAD
// Your implementation code will go here
=======
import { Navigation } from './navigation.js';

document.addEventListener('DOMContentLoaded', () => {
    //  initializes Navigation by passing the required header element
    const header = document.querySelector('header');
    if (header) {
        new Navigation(header);
    }
});
>>>>>>> feature/navigation
