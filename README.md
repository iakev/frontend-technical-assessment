# Frontend Technical Assessment

## Getting Started instructions
1. Fork this repository and make a copy of it to your GitHub account.
2. Ensure your forked repository is made public using your settings.
3. Review starter code and understand existing structure across the three branches `main`, `feature/drag-drop`, `feature/navigation`.
4. Complete the tasks below.

---

## Task Brief
This is a 48-hour technical assessment focusing on three main components. Basic scaffolding has been provided i.e. HTML structure with proper classes, basic CSS and JavaScript.

### Task 1
1. Checkout to the `feature/drag-drop` branch locally.
2. Under the main `html` tag do the following:
- Main Objective here is to ensure that the **Drag and Drop** under the `main` section of the html code works as expected. To achieve this, do the following;
    - Improve CSS styling to reflect what is seen on the screen shot [Drag and Drop](https://drive.google.com/file/d/16l6xC55Bsopi_C9q7Rau28yvyTsyVLn6/view?usp=drive_link).
    - Ensure drag and drop functionality works (when someone clicks _item1_, _item2_ or _item3_ they can drag it and place it in the designated section as highlighted in the video) [Drag & Drop Functionality](https://drive.google.com/file/d/13UeM2nJfwKjcMUR8d6lsQsiPTSN38ykw/view?usp=drive_link)
    - Ensure animation is efficient (animations don't freeze)
    - NB: No external third party animation libraries are required.

- Main objective here is to ensure that the **Blog List** under the `main` section of the html code works as expected by;
    - Ensuring the component looks like the video [Blog List Operations](https://drive.google.com/file/d/1PU_ezhq1s3onaMSJcOwRsoz8pdz4zC5f/view?usp=drive_link).
    - At every given render ensure 10 blogs from the external link are included: `https://frontend-blog-lyart.vercel.app/blogsData.json`.
    - Complete the functionality of the dropdown feature that filters blogs by Date, Reading Time and Category as seen in the video. [First Filter](https://drive.google.com/file/d/1PU_ezhq1s3onaMSJcOwRsoz8pdz4zC5f/view?usp=drive_link)
    - Complete the functionality of the second dropdown (in the middle of first dropdown and search box) that filters blogs by Writing, Gadgets, Startups as shown in the video.[Second Filter](https://drive.google.com/file/d/1PU_ezhq1s3onaMSJcOwRsoz8pdz4zC5f/view?usp=drive_link)
    - Complete the functionality of the keyword search functionality of the blogs via the title as also shown in the demo video. [Search](https://drive.google.com/file/d/1PU_ezhq1s3onaMSJcOwRsoz8pdz4zC5f/view?usp=drive_link)

- Ensure the entire section looks stylistically like the solution [General Overview](https://drive.google.com/file/d/1KwMSwv47rR01mc3tRzGUtmBCWo9Byvfp/view?usp=drive_link).
- Squash your commits to one, resolve any merge conflicts to your main branch, and commit your changes remotely to `feature/drag-drop`.

3. Checkout locally to `feature/navigation` branch.
4. Under the header `html` tag do the following;
- Create a sticky navigation header that stays at the top while scrolling [Sticky Navigation](https://drive.google.com/file/d/1UHYS6FvD8NKVFf8JPK5RagTvJc0Tdx73/view?usp=drive_link)
- When clicking navigation tabs, implement smooth scrolling for the components as highlighted in the video [Smooth Scroll](https://drive.google.com/file/d/1UHYS6FvD8NKVFf8JPK5RagTvJc0Tdx73/view?usp=drive_link)
- Ensure when a particular html section is in view e.g. `Drag and Drop Section` the corresponding navigation tab linked to said section is highlited blue. Ref: [Dynamic Button Highlighting](https://drive.google.com/file/d/14aCqRu_OKDWSq1yeLPAOO5UTYUE4LusF/view?usp=drive_link).
- Make the navigation header mobile responsive
- Improve the header code to add accessibility via keyboard to ensure Keyboard navigation, ARIA attributes, Screen reader support, Focus management.

- Ensure the entire section looks stylistically like the solution [General Overview](https://drive.google.com/file/d/1KwMSwv47rR01mc3tRzGUtmBCWo9Byvfp/view?usp=drive_link).
- Squash your commits to one, resolve any merge conflicts to your main branch, and commit your changes remotely to `feature/navigation`.

### Task 2
1. Merge both `feature/navigation` and `feature/drag-drop` into `main`.

---

## Implementation Summary

### Completed Features
- **Sticky Navigation Header:** Implemented a fixed header using performant CSS positioning.
- **Dynamic Button Highlighting:** Achieved dynamic tab highlighting using the efficient **`IntersectionObserver` API**.
- **Smooth Scrolling:** Implemented smooth scrolling with correct offset calculation to clear the sticky header.
- **Accessible Navigation:** Full keyboard navigation, `role="navigation"`, and ARIA attributes were applied.
- **Mobile Responsive Header:** Implemented a collapsing hamburger menu for small screens.
- **Drag & Drop Functionality:** Implemented core drag, drop, and reordering logic.
- **Blog List Component:** Fetched, rendered, and displayed the required 10 blogs per screen.
- **Blog List Filtering & Search:** Implemented full functionality for filtering by multiple criteria (Date, Reading Time, Category) and keyword search by blog title.

### Pending Items
- None (All core components for Navigation, Drag & Drop, Filtering, and Search were implemented and merged).

### Technical Challenges
- **Implementing a High-Performance and Accessible Navigation System:** The initial navigation scaffolding exhibited several performance anti-patterns. The solution required a full architectural overhaul, introducing a dedicated **`Navigation` class**, utilizing the **`IntersectionObserver`** for performant dynamic highlighting, and carefully calculating **scroll offsets** for the sticky header, all while integrating necessary **ARIA attributes** for accessibility.
- **Integrating Disparate Feature Branches:** The final step of merging the two primary feature branches (`feature/drag-drop` and `feature/navigation`) into `main` presented significant integration challenges. This included resolving complex, nested conflicts across critical files (`index.html`, `styles.css`, `main.js`), requiring meticulous manual merging to ensure the final single codebase was fully functional without regression.

### AI Usage
- **Gemini:** Used for guidance on refactoring the problematic starter code (migration to IntersectionObserver), debugging complex CSS alignment and styling issues, and confirming the correct Git workflow steps for squashing, merging, and conflict resolution.

---

### Submission Instructions
1. Ensure your project repository is made public.
2. Amend the **README** file in the `main` branch to follow this format (completed above).
3. Follow this submission link [Click here](https://forms.gle/1WPuqpcuaWnhaASAA) and provide your email address and the URL link to your completed project repository.
4. **It is okay not to have the entire task brief finished by deadline.**

## Code Guidelines
- Use ES2015+ features appropriately
- Add JSDoc comments for methods
- Handle errors gracefully

## Evaluation Criteria
- Code quality and organization
- Feature completeness
- Responsive design implementation
- Documentation quality