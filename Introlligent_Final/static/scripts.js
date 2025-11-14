const app = document.getElementById('app');
const modalContainer = document.getElementById('modal-container');
let currentTheme = 'light-theme';
const loadingIcons = {
    upload: ['fa-file-alt', 'fa-database', 'fa-robot', 'fa-check-circle'],
    gmail: ['fa-envelope', 'fa-file-alt', 'fa-robot', 'fa-check-circle']
};

async function generateJobDescription() {
    const jobRole = document.getElementById('jobRole').value.trim();
    const jdStatus = document.getElementById('jdGenerationStatus');
    const generateBtn = document.getElementById('generateJDBtn');
    const jobDescriptionField = document.getElementById('jobDescription');

    if (!jobRole) {
        showToast('Please enter a job role first', 'error');
        return;
    }

    try {
        // Show generation status
        jdStatus.classList.remove('hidden');
        generateBtn.disabled = true;
        generateBtn.classList.add('opacity-50');

        // Make API call to generate JD
        const response = await fetch('/api/generate_jd', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ job_role: jobRole })
        });

        if (!response.ok) {
            throw new Error('Failed to generate job description');
        }

        const data = await response.json();
        jobDescriptionField.value = data.job_description;
        showToast('Job description generated successfully!', 'success');
    } catch (error) {
        console.error('Error generating job description:', error);
        showToast('Failed to generate job description. Please try again.', 'error');
    } finally {
        // Hide generation status
        jdStatus.classList.add('hidden');
        generateBtn.disabled = false;
        generateBtn.classList.remove('opacity-50');
    }
}

// +++++ ANIMATION FUNCTION FROM YOUR CODEPEN +++++
function startUploadPageAnimation() {
    // Check if an old timeline exists and kill it to prevent duplicates
    if (window.uploadPageTimeline) {
        window.uploadPageTimeline.kill();
    }
    
    // GSAP Timeline for sequencing animations
    // FIX APPLIED: Set repeat: 0 to stop the animation loop
    const tl = gsap.timeline({ repeat: -1 });
    
    // --- SCENE 1: UPLOAD (0s - 3.5s) ---
    tl.to("#scene1-text", { opacity: 1, duration: 0.5 })
    .to("#browser", { opacity: 1, scale: 1, duration: 0.5 }, "<")
    .to("#upload-box", { scale: 1.05, repeat: 1, yoyo: true, duration: 0.5, ease: "power1.inOut" })
    .to("#resume-icon", {
        opacity: 1,
        left: '45%',
        top: '50%',
        scale: 0.5,
        duration: 1,
        ease: "power2.inOut"
    }, "-=0.5")
    .to("#resume-icon", { scale: 0, opacity: 0, duration: 0.3 })
    .to("#upload-box", { borderColor: "var(--primary-orange)" }, "<")
    .to("#upload-box .upload-icon-wrapper", { scale: 0, opacity: 0, duration: 0.3, ease: "power2.in" }, "<")
    .to("#upload-box .fa-check", { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" }, "-=0.1")
    .to(["#browser", "#scene1-text"], { opacity: 0, duration: 0.5, delay: 0.7 });
    
    // --- SCENE 2: DATABASE (3.5s - 5.5s) ---
    tl.to("#scene2-text", { opacity: 1, duration: 0.5 })
    .to("#database-icon", { opacity: 1, duration: 0.5 }, "<")
    .fromTo("#database-icon .fa-lock",
    { scale: 1 },
    { scale: 1.5, repeat: 1, yoyo: true, duration: 0.4, ease: "bounce.out", delay: 0.5 })
    .to(["#database-icon", "#scene2-text"], { opacity: 0, duration: 0.5, delay: 0.8 });
    
    // --- SCENE 3: AI ANALYSIS (5.5s - 8.5s) ---
    tl.to("#scene3-text", { opacity: 1, duration: 0.5 })
    .to("#ai-icon", { opacity: 1, duration: 0.5 }, "<")
    .to("#ai-icon .gear1", { rotation: 360, duration: 1.5, ease: "none", repeat: 2 }, "<")
    .to("#ai-icon .gear2", { rotation: -360, duration: 1.5, ease: "none", repeat: 2 }, "<")
    .to("#ai-icon", { scale: 1.05, repeat: 3, yoyo: true, duration: 0.5, ease: "power1.inOut" }, "<")
    .to(["#ai-icon", "#scene3-text"], { opacity: 0, duration: 0.5, delay: 2 });
    
    // --- SCENE 4: RESULTS (8.5s - 11.5s) ---
    tl.to("#scene4-text", { opacity: 1, duration: 0.5 })
    .to("#results-card", { opacity: 1, duration: 0.5 }, "<");
    
    // Score counter animation
    const score = { value: 0 };
    tl.to(score, {
        value: 92,
        duration: 1,
        ease: "power2.out",
        onUpdate: () => {
            const scoreText = document.getElementById('score-text');
            if (scoreText) {
                scoreText.textContent = `${Math.round(score.value)}%`;
            }
        }
    }, "<");
    
    // Bar chart animation
    tl.to("#bar1", { scaleX: 1, duration: 0.7, ease: "power2.out" }, "<+0.2")
    .to("#bar2", { scaleX: 0.7, duration: 0.7, ease: "power2.out" }, "<")
    .to("#bar3", { scaleX: 0.9, duration: 0.7, ease: "power2.out" }, "<");
    
    // FIX APPLIED: Only fade out the text, keep the results card visible for stability
    tl.to(["#results-card", "#scene4-text"], { opacity: 0, duration: 0.5, delay: 1.5 });
    
    // --- OUTRO (11.5s - 13s) ---
    // Removed original logo fade out to let the final result stick on the screen
    
    // Store timeline in a global variable to manage it
    window.uploadPageTimeline = tl;
}


function navigateTo(pageId) {
    if (window.uploadPageTimeline && window.uploadPageTimeline.isActive()) {
        window.uploadPageTimeline.kill();
    }
    window.location.hash = pageId;
    renderPage(pageId);
}

function renderPage(pageId) {
    // remove any floating quick process bar when navigating
    const existingQuick = document.querySelector('.quick-process');
    if (existingQuick && existingQuick.parentElement) existingQuick.parentElement.removeChild(existingQuick);

    app.innerHTML = '';
    let content;
    switch (pageId) {
        case 'landing':
        content = renderLandingPage();
        if (document.getElementById('chat-widget')) document.getElementById('chat-widget').style.display = 'block';
        break;
        case 'upload':
        content = renderUploadPage();
        if (document.getElementById('chat-widget')) document.getElementById('chat-widget').style.display = 'none';
        break;
        case 'gmail':
        content = renderGmailPage();
        if (document.getElementById('chat-widget')) document.getElementById('chat-widget').style.display = 'none';
        break;
        case 'loading':
        content = renderLoadingPage();
        if (document.getElementById('chat-widget')) document.getElementById('chat-widget').style.display = 'none';
        break;
        case 'new_project':
        content = renderNewProjectPage();
        if (document.getElementById('chat-widget')) document.getElementById('chat-widget').style.display = 'none';
        break;
        case 'open_project':
        content = renderOpenProjectPage();
        if (document.getElementById('chat-widget')) document.getElementById('chat-widget').style.display = 'none';
        break;
        case 'project_view':
        content = renderProjectViewPage();
        if (document.getElementById('chat-widget')) document.getElementById('chat-widget').style.display = 'none';
        break;
        case 'results':
        content = renderResultsPage();
        if (document.getElementById('chat-widget')) document.getElementById('chat-widget').style.display = 'none';
        break;
        default:
        navigateTo('landing');
        return;
    }
    app.appendChild(content);
    
    // Start animation AFTER the page content is added to the DOM
    if (pageId === 'upload') {
        startUploadPageAnimation();
    }
}

function renderNewProjectPage() {
    const page = document.createElement('div');
    page.className = 'container mx-auto fade-in-up';
    page.appendChild(renderHeader(true));
    page.innerHTML += `
    <main class="py-16">
    <div class="flex items-center mb-6">
    <button class="text-muted hover:text-primary-orange transition-colors" onclick="navigateTo('landing')">
    <i class="fas fa-arrow-left mr-2"></i> Back
    </button>
    </div>
    <div class="bg-card p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold mb-4">Create New Recruitment Project</h2>
    <input id="newProjectTitle" class="input-field w-full p-3 rounded mb-4" placeholder="Project title">
    <textarea id="newProjectDesc" class="input-field w-full p-3 rounded mb-4" rows="4" placeholder="Project description / Job description (optional)"></textarea>
    <div class="flex justify-end space-x-4">
    <button id="cancelNewProject" class="btn-secondary">Cancel</button>
    <button id="createProjectBtn" class="btn-primary">Create Project</button>
    </div>
    </div>
    </main>
    `;
    page.appendChild(renderFooter());
    
    page.querySelector('#cancelNewProject').addEventListener('click', () => navigateTo('landing'));
    page.querySelector('#createProjectBtn').addEventListener('click', async () => {
        const title = page.querySelector('#newProjectTitle').value.trim() || 'New Recruitment';
        const desc = page.querySelector('#newProjectDesc').value.trim();
        try {
            const res = await fetch('/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description: desc })
            });
            const data = await res.json();
            if (res.ok) {
                // --- MODIFIED ---
                ModalManager.show({
                    title: 'Project Created',
                    message: `Project "${data.project.title}" created.`,
                    type: 'success'
                });
                // --- END MODIFIED ---
                navigateTo('open_project');
            } else {
                // --- MODIFIED ---
                ModalManager.show({
                    title: 'Error',
                    message: data.error || 'Could not create project',
                    type: 'error'
                });
                // --- END MODIFIED ---
            }
        } catch (e) {
            // --- MODIFIED ---
            ModalManager.show({
                title: 'Network Error',
                message: 'Failed to create project: ' + e.message,
                type: 'error'
            });
            // --- END MODIFIED ---
        }
    });
    
    return page;
}

function renderOpenProjectPage() {
    const page = document.createElement('div');
    page.className = 'container mx-auto fade-in-up';
    page.appendChild(renderHeader(true));
    page.innerHTML += `
    <main class="py-16">
    <div class="flex items-center mb-6">
    <button class="text-muted hover:text-primary-orange transition-colors" onclick="navigateTo('landing')">
    <i class="fas fa-arrow-left mr-2"></i> Back
    </button>
    </div>
    <div class="bg-card p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold mb-4">Open Recruitment Projects</h2>
    <div id="projectsList" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
    </div>
    </main>
    `;
    page.appendChild(renderFooter());
    
    async function loadProjects() {
        const list = page.querySelector('#projectsList');
        list.innerHTML = '<div class="text-muted p-4">Loading...</div>';
        try {
            const res = await fetch('/projects');
            const data = await res.json();
            const projects = data.projects || [];
            if (projects.length === 0) {
                list.innerHTML = '<div class="text-center p-8 text-muted">No projects found. Create one from the landing page.</div>';
                return;
            }
            list.innerHTML = '';
            projects.forEach(p => {
                const card = document.createElement('div');
                card.className = 'recruitment-project-card p-4 rounded-lg border';
                card.innerHTML = `
                <h3 class="font-bold">${p.title}</h3>
                
                <p class="text-sm mt-2">Resumes: ${p.resumes ? p.resumes.length : 0} | Top kept: ${p.top_resumes ? p.top_resumes.length : 0}</p>
                <div class="mt-4 flex justify-end space-x-2">
                <button class="btn-secondary openProjectBtn" data-id="${p.id}">Open</button>
                <button class="btn-primary viewProjectBtn" data-id="${p.id}">View</button>
                <button class="btn-danger deleteProjectBtn" data-id="${p.id}"><i class="fas fa-trash"></i></button>
                </div>
                `;
                list.appendChild(card);
            });
            page.querySelectorAll('.openProjectBtn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = btn.dataset.id;
                    try {
                        const r = await fetch(`/projects/${id}`);
                        const d = await r.json();
                        if (r.ok) {
                            localStorage.setItem('currentProject', JSON.stringify(d.project));
                            localStorage.setItem('candidates', JSON.stringify(d.project.resumes || d.project.top_resumes || []));
                            // --- MODIFIED ---
                            ModalManager.show({
                                title: 'Project Opened',
                                message: `Project "${d.project.title}" is now active.`,
                                type: 'success'
                            });
                            // --- END MODIFIED ---
                            navigateTo('upload');
                        } else {
                            // --- MODIFIED ---
                            ModalManager.show({
                                title: 'Error',
                                message: d.error || 'Could not open project',
                                type: 'error'
                            });
                            // --- END MODIFIED ---
                        }
                    } catch (err) {
                        // --- MODIFIED ---
                        ModalManager.show({
                            title: 'Network Error',
                            message: 'Failed to open project: ' + err.message,
                            type: 'error'
                        });
                        // --- END MODIFIED ---
                    }
                });
            });
            // Add delete button event listeners
            page.querySelectorAll('.deleteProjectBtn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = btn.dataset.id;
                    // --- MODIFIED ---
                    // Use new ModalManager for confirmation
                    ModalManager.show({
                        title: 'Confirm Deletion',
                        message: 'Are you sure you want to delete this project? This action cannot be undone.',
                        type: 'warning',
                        buttons: [
                            { text: 'Cancel', type: 'secondary', onClick: () => ModalManager.close() },
                            { text: 'Delete', type: 'primary', onClick: async () => {
                                ModalManager.close();
                                try {
                                    const r = await fetch(`/projects/${id}`, {
                                        method: 'DELETE'
                                    });
                                    const d = await r.json();
                                    if (r.ok) {
                                        ModalManager.show({ title: 'Project Deleted', message: 'Project has been successfully deleted.', type: 'success' });
                                        loadProjects(); // Refresh the projects list
                                    } else {
                                        ModalManager.show({ title: 'Error', message: d.error || 'Could not delete project', type: 'error' });
                                    }
                                } catch (err) {
                                    ModalManager.show({ title: 'Network Error', message: 'Failed to delete project: ' + err.message, type: 'error' });
                                }
                            }}
                        ]
                    });
                    // --- END MODIFIED ---
                });
            });

            page.querySelectorAll('.viewProjectBtn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = btn.dataset.id;
                    try {
                        const r = await fetch(`/projects/${id}`);
                        const d = await r.json();
                        if (r.ok) {
                            localStorage.setItem('currentProject', JSON.stringify(d.project));
                            localStorage.setItem('candidates', JSON.stringify(d.project.resumes || d.project.top_resumes || []));
                            navigateTo('project_view');
                        } else {
                            // --- MODIFIED ---
                            ModalManager.show({
                                title: 'Error',
                                message: d.error || 'Could not open project',
                                type: 'error'
                            });
                            // --- END MODIFIED ---
                        }
                    } catch (err) {
                        // --- MODIFIED ---
                        ModalManager.show({
                            title: 'Network Error',
                            message: 'Failed to open project: ' + err.message,
                            type: 'error'
                        });
                        // --- END MODIFIED ---
                    }
                });
            });
        } catch (e) {
            list.innerHTML = '<div class="text-center p-8 text-muted">Failed to load projects.</div>';
        }
    }
    
    loadProjects();
    return page;
}

function toggleTheme(toggleElement) {
    // 1. Determine the new theme from the toggle's "checked" state
    const newTheme = toggleElement.checked ? 'dark-theme' : 'light-theme';

    // 2. Set the global variable
    currentTheme = newTheme;

    // 3. Save the new theme to localStorage
    localStorage.setItem('theme', newTheme);

    // 4. Update the <html> tag (the master element)
    const root = document.documentElement;
    root.classList.remove('light-theme', 'dark-theme');
    root.classList.add(newTheme);

    // 5. Clean the <body> tag (this is a defensive measure)
    document.body.classList.remove('light-theme', 'dark-theme');
    
    // 6. Update the chat widget
    const chatPopup = document.getElementById('chat-popup');
    if (chatPopup) {
        if (newTheme === 'dark-theme') {
            chatPopup.classList.add('dark-theme');
        } else {
            chatPopup.classList.remove('dark-theme');
        }
    }
}

function applyInitialTheme() {
    // 1. Get the saved theme, defaulting to light
    const savedTheme = localStorage.getItem('theme') || 'light-theme';

    // 2. Force-clean and apply the theme to the <html> tag
    const root = document.documentElement;
    root.classList.remove('light-theme', 'dark-theme');
    root.classList.add(savedTheme);
    
    // 3. Force-clean the <body> tag as well
    document.body.classList.remove('light-theme', 'dark-theme');

    // 4. Set the global variable
    currentTheme = savedTheme;
    
    // 5. CRITICAL FIX: Find the toggle and set its "checked" state
    const toggle = document.querySelector('.theme-toggle input');
    if (toggle) {
        toggle.checked = (savedTheme === 'dark-theme');
    }
    
    // 6. Update the chat widget
    const chatPopup = document.getElementById('chat-popup');
    if (chatPopup) {
        if (savedTheme === 'dark-theme') {
            chatPopup.classList.add('dark-theme');
        } else {
            chatPopup.classList.remove('dark-theme');
        }
    }
}

// --- Page Rendering Functions ---

// function renderHeader(showBack = false) {
//     const header = document.createElement('header');
//     header.className = `flex justify-between items-center py-4 md:py-8 px-4`;
//     header.innerHTML = `
//     <a href="#" onclick="navigateTo('landing')"
//     class="flex items-center space-x-2 text-xl font-bold text-white bg-black p-3 rounded-lg hover:opacity-90 transition">
//     <img src="https://i.postimg.cc/Dwrs20rL/introlligent-logo.png" alt="Introlligent Logo" class="h-12">
//     </a>
    
//         <div class="flex items-center space-x-4">
//             <a href="/dashboard" class="btn-secondary flex items-center gap-2">
//                 <i class="fas fa-chart-line"></i> Dashboard
//             </a>
//             <a href="/logout" class="btn-secondary flex items-center gap-2">
//                 <i class="fas fa-sign-out-alt"></i> Logout
//             </a>
//             <div class="theme-toggle flex items-center">
//             <label class="relative inline-flex items-center cursor-pointer">
//             <input type="checkbox" value="" class="sr-only peer" onchange="toggleTheme()">
//             <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
//             <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
//             <i class="fas fa-moon"></i>
//             </span>
//             </label>
//             </div>
//         </div>
//     `;
//     return header;
// }
// REPLACE your old renderHeader function with this one

function renderHeader(showBack = false) {
    const header = document.createElement('header');
    header.className = `flex justify-between items-center py-4 px-4`;

    const appDiv = document.getElementById('app');
    const userRole = appDiv ? appDiv.dataset.userRole : '';
    
    let dashboardLink = '';
    if (userRole === 'admin') {
        dashboardLink = `
        <a href="/dashboard" class="btn-secondary flex items-center gap-2">
            <i class="fas fa-chart-line"></i> Dashboard
        </a>`;
    }

    // --- START ROBUST FIX ---

    // 1. Determine the correct "checked" state for the toggle
    //    We read the global 'currentTheme' variable, which is always in sync
    //    thanks to your other robust theme functions.
    const isChecked = (currentTheme === 'dark-theme') ? 'checked' : '';

    // 2. Build the HTML, inserting the 'isChecked' variable into the <input> tag
    header.innerHTML = `
    <a href="#" onclick="navigateTo('landing')"
    class="flex items-center space-x-2 text-xl font-bold text-white bg-black p-3 rounded-lg hover:opacity-90 transition">
    <img src="https://i.postimg.cc/Dwrs20rL/introlligent-logo.png" alt="Introlligent Logo" class="h-12">
    </a>
    
        <div class="flex items-center space-x-4">
            ${dashboardLink} <a href="/logout" class="btn-secondary flex items-center gap-2">
                <i class="fas fa-sign-out-alt"></i> Logout
            </a>
            <div class="theme-toggle flex items-center">
            <label class="relative inline-flex items-center cursor-pointer">

            <input type="checkbox" value="" class="sr-only peer" onchange="toggleTheme(this)" ${isChecked}>

            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
            <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
            <i class="fas fa-moon"></i>
            </span>
            </label>
            </div>
        </div>
    `;
    // --- END ROBUST FIX ---

    return header;
}

function renderFooter() {
    const footer = document.createElement('footer');
    footer.className = 'py-8 border-t border-gray-200 dark:border-gray-700 mt-16';
    footer.innerHTML = `
    <div class="container mx-auto px-4">
    <div class="flex flex-col md:flex-row justify-between items-center">
    <div class="text-center md:text-left mb-4 md:mb-0">
    <a href="https://www.introlligent.com" target="_blank" class="text-lg font-bold text-heading hover:text-primary-orange transition-colors">
    Introlligent
    </a>
    <p class="text-sm text-muted">AI-powered resume analysis for smarter hiring.</p>
    </div>
    <div class="flex space-x-4 text-muted">
    <a href="https://www.linkedin.com/company/introlligent-inc/" target="_blank" class="hover:text-primary-orange transition-colors"><i class="fab fa-linkedin"></i></a>
    <a href="https://www.facebook.com/IntrolligentInc/" target="_blank" class="hover:text-primary-orange transition-colors"><i class="fab fa-facebook"></i></a>
    <a href="https://www.instagram.com/introlligentinc/" target="_blank" class="hover:text-primary-orange transition-colors"><i class="fab fa-instagram"></i></a>
    </div>
    </div>
    <div class="text-center text-sm text-muted mt-4">
    &copy; 2025 Introlligent. All rights reserved.
    </div>
    </div>
    `;
    return footer;
}

function renderLandingPage() {
    const page = document.createElement('div');
    page.className = 'container mx-auto fade-in-up';
    page.appendChild(renderHeader());
    page.innerHTML += `
    <main class="py-8">
        <div class="hero-section">
            
            <div class="hero-content-wrapper">
                
                <div class="hero-top-content">
                    <h1 class="hero-title text-5xl md:text-6xl font-extrabold text-primary-orange mb-4">A.R.I.S.E</h1>
                    <p class="hero-description text-muted text-lg md:text-xl leading-relaxed">Automated Recruitment Inference and Smart Evaluator</p>
                </div>

                <div class="hero-bottom-content">
                    <h2 class="hero-subtitle text-heading text-2xl md:text-3xl font-bold mb-4">AI-Powered Resume Evaluation for Smarter Hiring</h2>
                    <p class="hero-description text-muted text-lg md:text-xl leading-relaxed">
                    Upload a resume or connect your Gmail to get an instant AI-powered analysis of your qualifications, skills, and job fit.
                    </p>
                    
                    <div class="mt-6"> 
                        <div class="process-tabs flex w-full">
                            <div class="process-tab active flex-grow text-center" data-tab="main-process">Main Process</div>
                            <div class="process-tab flex-grow text-center" data-tab="quick-process">Quick Process</div>
                        </div>

                        <div id="main-process" class="process-content active mt-4">
                            <div class="hero-buttons flex justify-center gap-4">
                                <button onclick="navigateTo('new_project')" class="btn-primary flex items-center gap-2">
                                    <i class="fas fa-plus"></i> New Recruitment
                                </button>
                                <button onclick="navigateTo('open_project')" class="btn-secondary flex items-center gap-2">
                                    <i class="fas fa-folder-open"></i> Open Recruitment
                                </button>
                            </div>
                        </div>

                        <div id="quick-process" class="process-content mt-4">
                            <div class="hero-buttons flex justify-center gap-4">
                                <button onclick="navigateTo('upload')" class="btn-primary flex items-center gap-2">
                                    <i class="fas fa-upload"></i> Upload Resume
                                </button>
                                <button onclick="navigateTo('gmail')" class="btn-secondary flex items-center gap-2">
                                    <i class="fas fa-envelope"></i> Fetch from Gmail
                                </button>
                            </div>
                        </div>
                    </div> 
                </div> </div> <div class="hero-image-container">
                <img src="https://i.postimg.cc/jq349Dcj/feature.png" 
                     alt="Recruiter and candidate" 
                     class="recruiter-image"
                     width="800" 
                     height="600">
            </div>
        </div> </main>
    `;
    
    page.appendChild(renderFooter());
    
    // Add tab switching functionality
    const tabs = page.querySelectorAll('.process-tab');
    tabs.forEach(tab => {
        tab.style.cursor = 'pointer';
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            page.querySelectorAll('.process-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and its content
            tab.classList.add('active');
            const contentId = tab.getAttribute('data-tab');
            page.querySelector(`#${contentId}`).classList.add('active');
        });
    });
    
    return page;
}

function renderUploadPage() {
    const page = document.createElement('div');
    page.className = 'container mx-auto fade-in-up';
    page.appendChild(renderHeader(true));
    
    // This HTML includes all layout fixes (py-4, p-6, rows=4)
    // AND the project selector is in the correct, visible location.
    page.innerHTML += `
    <main class="py-4">
    <div class="flex items-center mb-4">
    <button class="text-muted hover:text-primary-orange transition-colors" onclick="navigateTo('landing')">
    <i class="fas fa-arrow-left mr-2"></i> Back
    </button>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div class="bg-card p-6 rounded-xl shadow-lg">
    <h2 class="text-3xl font-bold text-heading mb-4">Upload Your Resume</h2>
    <div class="mb-4">
        <div class="flex items-center mb-4">
            <input type="text" id="jobRole" class="flex-1 p-4 rounded-lg input-field" placeholder="Enter Job Role (e.g., 'Data Engineer')">
            <button id="generateJDBtn" class="btn-primary ml-4 whitespace-nowrap" onclick="generateJobDescription()">
                <i class="fas fa-magic mr-2"></i> Generate JD
            </button>
        </div>
        <div class="relative">
            <textarea id="jobDescription" rows="4" class="w-full p-4 rounded-lg input-field resize-none" placeholder="Paste or generate the job description..."></textarea>
            <div id="jdGenerationStatus" class="absolute bottom-2 right-2 text-sm text-primary-orange hidden">
                <i class="fas fa-spinner fa-spin mr-1"></i> Generating...
            </div>
        </div>
    </div>

    <div class="w-full mb-4">
        <label class="block text-sm font-medium text-body mb-2">Select Recruitment Project (optional)</label>
        <div class="flex items-center space-x-4">
            <select id="projectSelect" class="input-field p-3 rounded w-full"></select>
            <button id="refreshProjectsBtn" class="btn-secondary">Refresh</button>
        </div>
    </div>

    <div id="drop-area" class="border-4 border-dashed border-primary-orange rounded-xl p-6 text-center flex flex-col items-center">
        <i class="fas fa-file-upload text-5xl icon-color mb-4"></i>
        <p class="text-lg text-muted">Drag & Drop your file(s) here</p>
        <p class="text-sm text-muted mt-2">Supported formats: PDF (Max 5MB per file)</p>
        <input type="file" id="fileInput" class="hidden" accept=".pdf" multiple>
        <button id="browseBtn" class="btn-primary mt-4">
            <i class="fas fa-folder-open mr-2"></i> Browse Files
        </button>
    </div>
    <div id="uploadStatus" class="mt-4 text-center text-body"></div>
    </div>
    <div class="bg-card rounded-xl shadow-lg flex items-center justify-center p-0"> <div id="animation-container">
    <div class="text-container">
    <div id="scene1-text" class="scene-text">
    <div class="text-header">1. Upload</div>
    <div class="text-subheader">Select and upload your resume file.</div>
    </div>
    <div id="scene2-text" class="scene-text">
    <div class="text-header">2. Database</div>
    <div class="text-subheader">The resume is securely stored for analysis.</div>
    </div>
    <div id="scene3-text" class="scene-text">
    <div class="text-header">3. AI Analysis</div>
    <div class="text-subheader">Our AI evaluates skills and experience.</div>
    </div>
    <div id="scene4-text" class="scene-text">
    <div class="text-header">4. Results</div>
    <div class="text-subheader">View detailed scores and recommendations.</div>
    </div>
    </div>
    <div class="icon-container">
    <div id="browser" class="anim-element">
    <div class="computer-screen">
    <div class="computer-header">AI Based Recruiter</div>
    <div id="upload-box">
    <div class="upload-icon-wrapper">
    <span class="fa-stack fa-2x">
    <i class="fa-solid fa-cloud fa-stack-2x"></i>
    <i class="fa-solid fa-arrow-up fa-stack-1x fa-inverse"></i>
    </span>
    </div>
    <i class="fa-solid fa-check"></i>
    </div>
    </div>
    <div class="computer-stand"></div>
    <div class="computer-base"></div>
    </div>
    <div id="resume-icon" class="anim-element icon">
    <i class="fa-solid fa-file-invoice"></i>
    </div>
    <div id="database-icon" class="anim-element icon">
    <i class="fa-solid fa-database"></i>
    <i class="fa-solid fa-lock"></i>
    </div>
    <div id="ai-icon" class="anim-element icon">
    <i class="fa-solid fa-robot"></i>
    <i class="fa-solid fa-gear gear1"></i>
    <i class="fa-solid fa-gear gear2"></i>
    </div>
    <div id="results-card" class="anim-element">
    <h3>Match Score</h3>
    <div class="score-display">
    <span id="score-text">0%</span>
    <div class="bar-chart">
    <div id="bar1" class="bar"></div>
    <div id="bar2" class="bar short"></div>
    <div id="bar3" class="bar"></div>
    </div>
    </div>
    </div>
    <div id="logo" class="anim-element">Introlligent</div>
    </div>
    </div>
    </div>
    </div>
    <div class="text-center mt-4">
    <button id="analyzeResumeBtn" class="btn-primary hidden">
    <div class="flex items-center space-x-2">
    <span>Analyze My Resume(s)</span>
    <i class="fas fa-arrow-right"></i>
    </div>
    </button>
    </div>
    </main>
    `;
    
    page.appendChild(renderFooter());
    
    const jobDescription = page.querySelector('#jobDescription');
    const browseBtn = page.querySelector('#browseBtn');
    const fileInput = page.querySelector('#fileInput');
    const analyzeBtn = page.querySelector('#analyzeResumeBtn');
    const uploadStatus = page.querySelector('#uploadStatus');
    let uploadedFiles = [];
    let selectedProjectId = null;
    
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (event) => {
        uploadedFiles = Array.from(event.target.files);

        if (uploadedFiles.length > 0) {
            uploadStatus.innerHTML = `Files selected: <strong>${uploadedFiles.length} PDF(s)</strong>`;
            analyzeBtn.classList.remove('hidden');
            analyzeBtn.querySelector('span').textContent = `Analyze ${uploadedFiles.length > 1 ? 'Resumes' : 'Resume'}`;
        } else {
            uploadStatus.innerHTML = '';
            analyzeBtn.classList.add('hidden');
        }
    });
    
    analyzeBtn.addEventListener('click', () => {
        const jdValue = jobDescription.value.trim();
        if (!jdValue) {
            ModalManager.show({
                title: 'Validation Error',
                message: 'Please enter a job description to continue.',
                type: 'error'
            });
            return;
        }
        if (uploadedFiles.length > 0) {
            localStorage.setItem('jobDescription', jdValue);
            const projectSelect = page.querySelector('#projectSelect');
            selectedProjectId = projectSelect ? projectSelect.value : null;

            const formData = new FormData();
            uploadedFiles.forEach(file => {
                formData.append('resume', file); 
            });
            formData.append('job_description', jdValue);

            
            if (selectedProjectId) {
                startLoading('upload', { formData, projectId: selectedProjectId });
            } else {
                startLoading('upload', { formData });
            }
        }
    });
    
    const projectSelect = page.querySelector('#projectSelect');
    const refreshBtn = page.querySelector('#refreshProjectsBtn');
    
    async function loadProjectsIntoSelect() {
        projectSelect.innerHTML = '<option value="">(None) - upload without project</option>';
        try {
            const res = await fetch('/projects');
            const data = await res.json();
            (data.projects || []).forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.text = `${p.title} (${p.resumes ? p.resumes.length : 0} resumes)`;
                projectSelect.appendChild(opt);
            });
            const currentProject = localStorage.getItem('currentProject');
            if (currentProject) {
                try {
                    const cp = JSON.parse(currentProject);
                    if (cp && cp.id) {
                        projectSelect.value = cp.id;
                    }
                } catch (e) {
                    console.warn('Invalid currentProject in localStorage', e);
                }
            }
        } catch (e) {
            console.warn('Could not load projects', e);
        }
    }
    loadProjectsIntoSelect();
    refreshBtn.addEventListener('click', loadProjectsIntoSelect);

    const currentProjectData = localStorage.getItem('currentProject');
    if (currentProjectData) {
        try {
            const currentProject = JSON.parse(currentProjectData);
            if (currentProject) {
                if (currentProject.description) {
                    jobDescription.value = currentProject.description;
                } 
                else if (currentProject.title) {
                    jobDescription.value = currentProject.title;
                }
            }
        } catch (e) {
            console.warn('Could not parse currentProject to auto-fill JD', e);
        }
    }
    
    return page;
}

function renderGmailPage() {
    const page = document.createElement('div');
    page.className = 'container mx-auto fade-in-up';
    page.appendChild(renderHeader(true));
    
    // This is the most compact version from our last conversation
    page.innerHTML += `
    <main class="py-4">
    <div class="flex items-center mb-4">
    <button class="text-muted hover:text-primary-orange transition-colors" onclick="navigateTo('landing')">
    <i class="fas fa-arrow-left mr-2"></i> Back
    </button>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div class="bg-card p-6 rounded-xl shadow-lg">
    <h2 class="text-3xl font-bold text-heading mb-4">Fetch Resumes from Gmail</h2>
    <div class="mb-4">
        
        <div class="flex items-center mb-4 gap-4">
            <input type="text" id="jobRole" class="input-field p-4 rounded-lg flex-grow" placeholder="Enter Job Role (e.g., 'Data Engineer')">
            <select id="timeRange" class="input-field p-4 rounded-lg">
                <option value="1">Last 24 hours</option>
                <option value="7" selected>Last week</option>
                <option value="14">Last 2 weeks</option>
                <option value="30">Last month</option>
            </select>
            <button id="generateJDBtn" class="btn-primary whitespace-nowrap" onclick="generateJobDescription()">
                <i class="fas fa-magic mr-2"></i> Generate JD
            </button>
        </div>

        <div class="relative">
            <textarea id="jobDescription" rows="4" class="w-full p-4 rounded-lg input-field focus:outline-none focus:ring-2 focus:ring-primary-orange transition-all duration-200 resize-none" placeholder="Paste or generate the job description..."></textarea>
            <div id="jdGenerationStatus" class="absolute bottom-2 right-2 text-sm text-primary-orange hidden">
                <i class="fas fa-spinner fa-spin mr-1"></i> Generating...
            </div>
        </div>
    </div>
    <div class="mt-2 flex flex-col space-y-2">
        <button id="fetchGmailBtn" class="btn-primary">
            <div class="flex items-center justify-center space-x-2">
            <i class="fab fa-google mr-2"></i> Fetch from Gmail
            </div>
        </button>
        <a href="/authenticate" target="_blank" id="authButton" class="btn-secondary text-center">
            <i class="fas fa-lock mr-2"></i> Re-authenticate
        </a>
    </div>

    <div class="w-full mt-2">
        <label class="block text-sm font-medium text-body mb-2">Select Recruitment Project (optional)</label>
        <div class="flex items-center space-x-4">
            <select id="gmailProjectSelect" class="input-field p-3 rounded w-full"></select>
            <button id="refreshGmailProjectsBtn" class="btn-secondary">Refresh</button>
        </div>
    </div>

    </div>
    <div class="bg-card p-6 rounded-xl shadow-lg">
    <h3 class="text-xl font-bold text-heading mb-4">How it works</h3>
    <div class="flex flex-col space-y-4">
    <div class="flex items-center space-x-4">
    <div class="icon-bg w-12 h-12 flex items-center justify-center rounded-full">
    <i class="fab fa-google text-xl icon-color"></i>
    </div>
    <div>
    <h4 class="font-semibold text-heading">Connect</h4>
    <p class="text-sm text-muted">Securely connect your Gmail account.</p>
    </div>
    </div>
    <div class="flex items-center space-x-4">
    <div class="icon-bg w-12 h-12 flex items-center justify-center rounded-full">
    <i class="fas fa-file-alt text-xl icon-color"></i>
    </div>
    <div>
    <h4 class="font-semibold text-heading">Extract</h4>
    <p class="text-sm text-muted">We find resumes in your email attachments.</p>
    </div>
    </div>
    <div class="flex items-center space-x-4">
    <div class="icon-bg w-12 h-12 flex items-center justify-center rounded-full">
    <i class="fas fa-robot text-xl icon-color"></i>
    </div>
    <div>
    <h4 class="font-semibold text-heading">AI Analysis</h4>
    <p class="text-sm text-muted">AI analyzes each resume against the job description.</p>
    </div>
    </div>
    <div class="flex items-center space-x-4">
    <div class="icon-bg w-12 h-12 flex items-center justify-center rounded-full">
    <i class="fas fa-chart-line text-xl icon-color"></i>
    </div>
    <div>
    <h4 class="font-semibold text-heading">Results</h4>
    <p class="text-sm text-muted">Get a list of evaluated candidates with scores.</p>
    </div>
    </div>
    </div>
    </div>
    </div>
    </main>
    `;
    
    page.appendChild(renderFooter());
    
    const fetchBtn = page.querySelector('#fetchGmailBtn');
    const jobRoleInput = page.querySelector('#jobRole');
    const jobDescription = page.querySelector('#jobDescription');

    const gmailProjectSelect = page.querySelector('#gmailProjectSelect');
    const refreshGmailBtn = page.querySelector('#refreshGmailProjectsBtn');
    async function loadGmailProjects() {
        gmailProjectSelect.innerHTML = '<option value="">(None) - do not save to project</option>';
        try {
            const res = await fetch('/projects');
            const data = await res.json();
            (data.projects || []).forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.text = `${p.title} (${p.resumes ? p.resumes.length : 0} resumes)`;
                gmailProjectSelect.appendChild(opt);
            });
        } catch (e) {
            console.warn('Could not load projects for Gmail', e);
        }
    }
    loadGmailProjects();
    refreshGmailBtn.addEventListener('click', loadGmailProjects);
    
    fetchBtn.onclick = () => {
        const jobRole = jobRoleInput.value.trim();
        if (!jobRole) {
            ModalManager.show({
                title: 'Validation Error',
                message: 'Please enter a Job Role to continue.',
                type: 'error'
            });
            return;
        }
        if (jobDescription.value.trim() === '') {
            ModalManager.show({
                title: 'Validation Error',
                message: 'Please enter a job description to continue.',
                type: 'error'
            });
            return;
        }
        const selectedProjectId = gmailProjectSelect ? gmailProjectSelect.value : null;
        const timeRangeSelect = page.querySelector('#timeRange');
        const daysFilter = timeRangeSelect ? timeRangeSelect.value : 30;
            
        startLoading('gmail', { projectId: selectedProjectId, jobRole: jobRole, daysFilter: daysFilter });
    };
    
    
    return page;
}

// REPLACE your old sendEmail function with this
async function sendEmail(emailType, candidate, event) {
    // --- START ROBUST FIX ---
    let jobDescription = null;

    // 1. Try to get the Job Description from the *current project* first.
    try {
        const projectData = localStorage.getItem('currentProject');
        if (projectData) {
            const currentProject = JSON.parse(projectData);
            if (currentProject && currentProject.description) {
                jobDescription = currentProject.description;
            }
        }
    } catch (e) {
        console.warn("Could not parse currentProject for JD, will try fallback.", e);
    }

    // 2. If that fails (e.g., it was a standalone upload), 
    //    fall back to the last-used JD from the other pages.
    if (!jobDescription) {
        jobDescription = localStorage.getItem('jobDescription');
    }
    // --- END ROBUST FIX ---

    // 3. Now, run the validation check
    if (!jobDescription || !candidate.email || !candidate.name) {
        ModalManager.show({
            title: 'Error: Missing Job Description',
            message: 'Could not find a job description. Please go to the "Upload" or "Gmail" page and ensure a JD is set before sending emails.',
            type: 'error'
        });
        return;
    }
    
    const button = event.target.closest('button');
    const originalButtonContent = button.innerHTML;
    
    ModalManager.show({
        title: 'Confirm Action',
        message: `Are you sure you want to send a ${emailType} email to ${candidate.name}?`,
        type: 'info',
        buttons: [
            { text: 'Cancel', type: 'secondary', onClick: () => ModalManager.close() },
            { 
              text: 'Confirm', 
              type: 'primary', 
              onClick: async () => {
                ModalManager.close();
                
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Sending...';
                
                const fetchUrl = '/send_email';
                const payload = {
                    email: candidate.email,
                    name: candidate.name,
                    job_description: jobDescription, // This will now be the *correct* JD
                    type: emailType
                };
                
                try {
                    const response = await fetch(fetchUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                    const data = await response.json();
                    if (data.success) {
                        ModalManager.show({ title: 'Success', message: data.message, type: 'success' });
                    } else {
                        ModalManager.show({ title: 'Failed', message: data.message, type: 'error' });
                    }
                } catch (error) {
                    console.error('Error sending email:', error);
                    ModalManager.show({ title: 'Error', message: 'Failed to send email. Please check your network connection and try again.', type: 'error' });
                } finally {
                    button.disabled = false;
                    button.innerHTML = originalButtonContent;
                }
            }}
        ]
    });
}

function renderResultsPage() {
    const page = document.createElement('div');
    page.className = 'container mx-auto fade-in-up';
    page.appendChild(renderHeader(true));
    
    page.innerHTML += `
    <main class="py-8">
    <h2 class="text-3xl font-bold text-heading mb-8">Candidate Evaluations</h2>
    <div id="resultsContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"></div>
    </main>
    `;
    
    const resultsContainer = page.querySelector('#resultsContainer');
    let candidates = JSON.parse(localStorage.getItem('candidates'));
    
    if (resultsContainer && candidates && candidates.length > 0) {
        candidates.sort((a, b) => {
            const scoreA = parseInt((a.sections && a.sections.ats_score) || 0, 10) || 0;
            const scoreB = parseInt((b.sections && b.sections.ats_score) || 0, 10) || 0;
            return scoreB - scoreA;
        });
        
        candidates.forEach((candidate, index) => {
            const getScoreColorClass = (score) => {
                const numericScore = parseInt(score, 10);
                if (isNaN(numericScore)) return 'match-low';
                if (numericScore >= 80) return 'match-high';
                if (numericScore >= 50) return 'match-medium';
                return 'match-low';
            };
            const scoreColorClass = getScoreColorClass(candidate.sections.ats_score);
            
            const createSkillTags = (keywords) => {
                // --- MODIFICATION HERE ---
                // Return an empty string to display no tags
                return '';
            };
            
            const cardWrapper = document.createElement('div');
            cardWrapper.className = `card-wrapper ${scoreColorClass}`;
            cardWrapper.dataset.candidateIndex = index;
            
            const card = document.createElement('div');
            card.className = "card bg-card card-hover p-6 md:p-8 animate-on-load";
            card.style.animation = `fadeInUp 0.5s ease-out forwards`;
            card.style.animationDelay = `${index * 100}ms`;
            
            card.innerHTML = `
            <div class="candidate-card-header">
            <div class="profile-picture">
            <i class="fas fa-user text-3xl text-gray-400"></i>
            </div>
            <div class="match-score">
            <div class="score-value">${candidate.sections.ats_score || 'N/A'}%</div>
            <div class="score-label">MATCH</div>
            </div>
            </div>
            <div class="text-center mt-4">
            <h3 class="text-2xl font-bold text-heading">${candidate.name || 'Unknown Candidate'}</h3>
            <p class="text-sm text-muted">${candidate.filename}</p>
            </div>
            <div class="candidate-details-list mt-6 space-y-3">
            <div class="detail-item">
            <i class="fas fa-envelope fa-fw icon-color"></i>
            <span>${candidate.email || 'No email provided'}</span>
            </div>
            <div class="detail-item">
            <i class="fas fa-phone fa-fw icon-color"></i>
            <span>${candidate.phone || 'No phone provided'}</span>
            </div>
            </div>
            <div class="skill-tags-container mt-6">
        ${createSkillTags(candidate.sections.matched_keywords)}
        </div>
        `;
        
        cardWrapper.appendChild(card);
        resultsContainer.appendChild(cardWrapper);
        
        const currentProject = JSON.parse(localStorage.getItem('currentProject') || 'null');
        if (currentProject && currentProject.id) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-resume-btn btn-secondary';
            deleteBtn.style.position = 'absolute';
            deleteBtn.style.top = '8px';
            deleteBtn.style.right = '8px';
            deleteBtn.style.padding = '6px 10px';
            deleteBtn.style.borderRadius = '8px';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', async (ev) => {
                ev.stopPropagation();
                
                // --- MODIFIED ---
                ModalManager.show({
                    title: 'Confirm Deletion',
                    message: 'Delete this resume from the project? This action cannot be undone.',
                    type: 'warning',
                    buttons: [
                        { text: 'Cancel', type: 'secondary', onClick: () => ModalManager.close() },
                        { text: 'Delete', type: 'primary', onClick: async () => {
                            ModalManager.close();
                            try {
                                const resp = await fetch(`/projects/${currentProject.id}/resumes/${candidate.id}`, { method: 'DELETE' });
                                const result = await resp.json();
                                if (resp.ok && result.success) {
                                    const r = await fetch(`/projects/${currentProject.id}`);
                                    const d = await r.json();
                                    if (r.ok) {
                                        localStorage.setItem('currentProject', JSON.stringify(d.project));
                                        localStorage.setItem('candidates', JSON.stringify(d.project.resumes || d.project.top_resumes || []));
                                        navigateTo('results');
                                    } else {
                                        ModalManager.show({ title: 'Error', message: d.error || 'Failed to refresh project', type: 'error' });
                                    }
                                } else {
                                    ModalManager.show({ title: 'Delete Failed', message: result.error || 'Could not delete resume', type: 'error' });
                                }
                            } catch (err) {
                                ModalManager.show({ title: 'Network Error', message: 'Delete request failed: ' + err.message, type: 'error' });
                            }
                        }}
                    ]
                });
                // --- END MODIFIED ---
            });
            const cardEl = card;
            cardEl.style.position = 'relative';
            cardEl.appendChild(deleteBtn);
        }
        
        cardWrapper.addEventListener('click', (e) => {
            if (e.target.closest('.delete-resume-btn')) return;
            showCandidateDetailModal(candidate);
        });
    });
} else {
    resultsContainer.innerHTML = `<div class="text-center text-muted p-16 col-span-full">No candidates to display.</div>`;
}

page.appendChild(renderFooter());
return page;
}

function renderProjectViewPage() {
    const page = document.createElement('div');
    page.className = 'container mx-auto fade-in-up';
    page.appendChild(renderHeader(true));

    const currentProject = JSON.parse(localStorage.getItem('currentProject') || 'null');
    const title = currentProject ? currentProject.title : 'Project';

    page.innerHTML += `
    <main class="py-8">
    <h2 class="text-3xl font-bold text-heading mb-4">Project: ${title}</h2>
    <div class="mb-4 text-sm text-muted">You are viewing stored evaluations for this project. Use Open Recruitment to add more resumes.</div>
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

    <div class="flex items-center space-x-3">
        <button id="topCompareBtn" class="btn-secondary">Top Comparison</button>
        <label class="text-sm text-muted">Select resumes to compare:</label>
        <select id="compareSelectA" class="input-field p-2 rounded"></select>
        <select id="compareSelectB" class="input-field p-2 rounded"></select>
    </div>
    <div class="flex items-center space-x-3">
        <input id="uploadCompareInput" type="file" accept=".pdf" class="hidden">
        <button id="uploadCompareBtn" class="btn-primary">Upload & Compare</button>
    </div>
    </div>

    <div id="projectResultsContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"></div>
    </main>
    `;

    const resultsContainer = page.querySelector('#projectResultsContainer');
    // --- FIX ---
    // We get the original, unsorted list of candidates here.
    const unsortedCandidates = JSON.parse(localStorage.getItem('candidates') || '[]');

    if (unsortedCandidates && unsortedCandidates.length > 0) {
        // We set the 'candidates' item for renderResultsPage to use
        localStorage.setItem('candidates', JSON.stringify(unsortedCandidates));
        
        const resultsPage = renderResultsPage();
        const generated = resultsPage.querySelector('#resultsContainer');
        
        if (generated) {
            const cloned = generated.cloneNode(true);
            resultsContainer.replaceWith(cloned);

            // --- FIX ---
            // We create a NEW 'sortedCandidates' list. This MUST match the
            // sorting logic inside renderResultsPage().
            const sortedCandidates = [...unsortedCandidates].sort((a, b) => {
                const scoreA = parseInt((a.sections && a.sections.ats_score) || 0, 10) || 0;
                const scoreB = parseInt((b.sections && b.sections.ats_score) || 0, 10) || 0;
                return scoreB - scoreA;
            });
            
            cloned.querySelectorAll('.card-wrapper').forEach(el => {
                const idx = el.dataset.candidateIndex; // This index is from the SORTED list

                // --- FIX ---
                // We check against the sortedCandidates array
                if (typeof idx !== 'undefined' && sortedCandidates[idx]) {
                    
                    // --- FIX ---
                    // Add the modal click listener using the correct candidate from sortedCandidates
                    el.addEventListener('click', (e) => {
                        if (e.target.closest('.delete-resume-btn')) return;
                        showCandidateDetailModal(sortedCandidates[idx]);
                    });
                    
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-resume-btn btn-secondary';
                    deleteBtn.style.position = 'absolute';
                    deleteBtn.style.top = '8px';
                    deleteBtn.style.right = '8px';
                    deleteBtn.style.padding = '6px 10px';
                    deleteBtn.style.borderRadius = '8px';
                    deleteBtn.textContent = 'Delete';
                    
                    deleteBtn.addEventListener('click', (ev) => {
                        ev.stopPropagation();
                        // --- MODIFIED ---
                        ModalManager.show({
                            title: 'Confirm Deletion',
                            message: 'Delete this resume from the project? This action cannot be undone.',
                            type: 'warning',
                            buttons: [
                                { text: 'Cancel', type: 'secondary', onClick: () => ModalManager.close() },
                                { text: 'Delete', type: 'primary', onClick: async () => {
                                    ModalManager.close();
                                    const project = JSON.parse(localStorage.getItem('currentProject') || '{}');
                                    if (!project || !project.id) { 
                                        ModalManager.show({ title: 'Error', message: 'No active project selected.', type: 'error' }); 
                                        return; 
                                    }
                                    
                                    try {
                                        // --- FIX ---
                                        // Get the correct candidate to delete from the sortedCandidates list
                                        const candidateToDelete = sortedCandidates[idx];
                                        const resp = await fetch(`/projects/${project.id}/resumes/${candidateToDelete.id}`, { method: 'DELETE' });
                                        const result = await resp.json();
                                        
                                        if (resp.ok && result.success) {
                                            const r = await fetch(`/projects/${project.id}`);
                                            const d = await r.json();
                                            if (r.ok) {
                                                localStorage.setItem('currentProject', JSON.stringify(d.project));
                                                localStorage.setItem('candidates', JSON.stringify(d.project.resumes || d.project.top_resumes || []));
                                                navigateTo('project_view');
                                            } else {
                                                ModalManager.show({ title: 'Error', message: d.error || 'Failed to refresh project', type: 'error' });
                                            }
                                        } else {
                                            ModalManager.show({ title: 'Delete Failed', message: result.error || 'Could not delete resume', type: 'error' });
                                        }
                                    } catch (err) {
                                        ModalManager.show({ title: 'Network Error', message: 'Delete request failed: ' + err.message, type: 'error' });
                                    }
                                }}
                            ]
                        });
                        // --- END MODIFIED ---
                    });
                    const card = el.querySelector('.card') || el;
                    card.style.position = 'relative';
                    card.appendChild(deleteBtn);
                }
            });
            
            // --- FIX ---
            // The rest of the logic (dropdowns, comparison) should use the UNSORTED list
            // so the indices from the <select> element match the array.
            const selectA = page.querySelector('#compareSelectA');
            const selectB = page.querySelector('#compareSelectB');
            const uploadInput = page.querySelector('#uploadCompareInput');
            const uploadBtn = page.querySelector('#uploadCompareBtn');
            const randomBtn = page.querySelector('#randomCompareBtn');
            const topBtn = page.querySelector('#topCompareBtn');
            
            function populateSelects(list) {
                [selectA, selectB].forEach(sel => {
                    if (!sel) return;
                    sel.innerHTML = '<option value="">(Select)</option>';
                    list.forEach((c, i) => {
                        const opt = document.createElement('option');
                        opt.value = i; // The index 'i' will map to the unsortedCandidates list
                        opt.text = `${c.name || c.filename} (${(c.sections && c.sections.ats_score) ? c.sections.ats_score + '%' : 'N/A'})`;
                        sel.appendChild(opt);
                    });
                });
            }
            
            populateSelects(unsortedCandidates); // Use the unsorted list
            
            randomBtn && randomBtn.addEventListener('click', () => {
                // --- MODIFIED ---
                if (unsortedCandidates.length < 2) { 
                    ModalManager.show({ title: 'Not enough resumes', message: 'Need at least 2 resumes to compare.', type: 'info' }); 
                    return; 
                }
                // --- END MODIFIED ---
                const a = unsortedCandidates[Math.floor(Math.random() * unsortedCandidates.length)];
                let b = unsortedCandidates[Math.floor(Math.random() * unsortedCandidates.length)];
                let attempts = 0;
                while (b && a && b.id === a.id && attempts < 10) {
                    b = unsortedCandidates[Math.floor(Math.random() * unsortedCandidates.length)];
                    attempts++;
                }
                openComparisonModal(a, b || unsortedCandidates[0]);
            });

            topBtn && topBtn.addEventListener('click', () => {
                // --- MODIFIED ---
                if (unsortedCandidates.length < 2) { 
                    ModalManager.show({ title: 'Not enough resumes', message: 'Need at least 2 resumes to compare.', type: 'info' }); 
                    return; 
                }
                // --- END MODIFIED ---
                // This logic is self-contained and correct, as it creates its own sorted list
                const sorted = unsortedCandidates.slice().sort((x,y)=> (parseInt((y.sections && y.sections.ats_score) || 0,10)||0)-(parseInt((x.sections && x.sections.ats_score) || 0,10)||0));
                openComparisonModal(sorted[0], sorted[1] || sorted[0]);
            });

            [selectA, selectB].forEach(sel => {
                sel && sel.addEventListener('change', () => {
                    const aIdx = selectA.value;
                    const bIdx = selectB.value;
                    if (aIdx !== '' && bIdx !== '' && aIdx !== bIdx) {
                        // This is correct: it uses indices from the dropdowns on the unsorted list
                        openComparisonModal(unsortedCandidates[aIdx], unsortedCandidates[bIdx]);
                    }
                });
            });

            uploadBtn && uploadBtn.addEventListener('click', () => uploadInput && uploadInput.click());
            uploadInput && uploadInput.addEventListener('change', async (ev) => {
                const files = Array.from(ev.target.files);
                if (files.length === 0) return;
                // --- MODIFIED ---
                if (files.length > 1) { 
                    ModalManager.show({ title: 'Too many files', message: 'Please upload only one file for comparison at a time.', type: 'error' }); 
                    return; 
                }
                
                const file = files[0];
                const jd = localStorage.getItem('jobDescription') || (JSON.parse(localStorage.getItem('currentProject') || '{}')).description || '';
                if (!jd) { 
                    ModalManager.show({ title: 'Missing JD', message: 'Please provide a job description in the Upload or Gmail page before comparing with an uploaded resume.', type: 'error' }); 
                    return; 
                }
                // --- END MODIFIED ---
                
                const form = new FormData();
                form.append('resume', file);
                form.append('job_description', jd);
                
                try {
                    const res = await fetch('/upload_resume', { method: 'POST', body: form });
                    const data = await res.json();
                    if (res.ok && data.candidates && data.candidates.length > 0) {
                        const uploaded = data.candidates[0];
                        // This is also correct: it uses the dropdown index on the unsorted list
                        const selIdx = selectA.value || selectB.value;
                        const base = (selIdx !== '' && typeof unsortedCandidates[selIdx] !== 'undefined') ? unsortedCandidates[selIdx] : unsortedCandidates[0];
                        openComparisonModal(base, uploaded);
                    } else {
                        // --- MODIFIED ---
                        ModalManager.show({ title: 'Analysis failed', message: data.error || 'Could not analyze uploaded file.', type: 'error' });
                        // --- END MODIFIED ---
                    }
                } catch (err) {
                    // --- MODIFIED ---
                    ModalManager.show({ title: 'Network Error', message: 'Failed to upload file: ' + err.message, type: 'error' });
                    // --- END MODIFIED ---
                }
            });
        }
    } else {
        resultsContainer.innerHTML = `<div class="text-center text-muted p-16 col-span-full">No stored evaluations for this project.</div>`;
    }

    page.appendChild(renderFooter());
    return page;
}

/**
 * === ROBUST LOADING FUNCTION ===
 * This function bridges the gap between the UI (buttons) and the 
 * LoadingManager/ModalManager classes.
 * * It handles both 'upload' and 'gmail' types, defines the API call,
 * constructs the loading steps, and manages the success/error response.
 */
async function startLoading(type, options = {}) {
    const app = document.getElementById('app');
    if (!app) return;

    let steps = [];
    let apiEndpoint = '';
    let apiOptions = {};
    let successMessage = '';
    let projectToSave = null;
    let apiResponse = null; // To store the API result

    // Helper to update the LoadingManager's text
    const updateStatus = (text, subtext = '') => {
        const statusEl = document.getElementById('loadingStatus');
        const subStatusEl = document.getElementById('loadingSubStatus');
        if (statusEl) statusEl.textContent = text;
        if (subStatusEl) subStatusEl.textContent = subtext;
    };

    // This is the core API call, wrapped in an action for the loader
    const performApiCall = async () => {
        updateStatus('AI analysis in progress...', 'This may take a moment...');
        try {
            const response = await fetch(apiEndpoint, apiOptions);
            
            if (!response.ok) {
                const errData = await response.json().catch(() => ({ error: `API Error: ${response.status}` }));
                throw new Error(errData.error || `API Error: ${response.status}`);
            }
            
            apiResponse = await response.json();
            updateStatus('Finalizing results...', 'Parsing candidate data...');

        } catch (error) {
            // Re-throw the error to be caught by LoadingManager's .start()
            throw error;
        }
    };

    // --- Configure based on 'type' ---
    if (type === 'upload') {
        if (!options.formData) {
            ModalManager.show({ title: 'Error', message: 'No files selected for upload.', type: 'error' });
            return;
        }

        if (options.projectId) {
            apiEndpoint = `/projects/${options.projectId}/upload_resume`;
            projectToSave = options.projectId;
        } else {
            apiEndpoint = '/upload_resume';
        }

        apiOptions = { method: 'POST', body: options.formData };
        successMessage = 'Resumes analyzed successfully!';

        steps = [
            { icon: 'fa-file-alt', action: () => updateStatus('Uploading resumes...') },
            { icon: 'fa-database', action: () => updateStatus('Saving files to secure storage...') },
            { icon: 'fa-robot', action: performApiCall }, // API call is the 3rd step
            { icon: 'fa-check-circle', action: () => updateStatus('Success! Loading results...') }
        ];

    } else if (type === 'gmail') {
        const jdField = document.getElementById('jobDescription');
        const jobRoleField = document.getElementById('jobRole');
        
        // Use the values from the form, which were validated by the .onclick handler
        const jobDesc = jdField ? jdField.value.trim() : '';
        const jobRole = (jobRoleField ? jobRoleField.value.trim() : options.jobRole) || '';
        
        // Save the job description to localStorage so other pages (like results/email) can use it
        localStorage.setItem('jobDescription', jobDesc);

        apiEndpoint = '/fetch_resumes';
        apiOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                job_description: jobDesc,
                job_role: jobRole,
                days_filter: options.daysFilter || 7,
                project_id: options.projectId
            })
        };
        
        if (options.projectId) {
            projectToSave = options.projectId;
        }
        successMessage = 'Resumes fetched and analyzed!';

        steps = [
            { icon: 'fa-envelope', action: () => updateStatus('Connecting to Gmail...') },
            { icon: 'fa-file-alt', action: () => updateStatus('Fetching attachments...') },
            { icon: 'fa-robot', action: performApiCall }, // API call is the 3rd step
            { icon: 'fa-check-circle', action: () => updateStatus('Success! Loading results...') }
        ];
    } else {
        ModalManager.show({ title: 'Error', message: 'Unknown loading type.', type: 'error' });
        return;
    }

    // --- Start the Loading Process ---
    const loader = new LoadingManager(app, steps);
    
    try {
        // .start() will create the UI and execute all 'action' steps in sequence
        const success = await loader.start(); 
        
        if (success && apiResponse) {
            // We have a successful API call and the UI is done
            ModalManager.show({ title: 'Success', message: successMessage, type: 'success' });
            
            // Save data to localStorage for the results page
            if (apiResponse.project) {
                // This was saved to a project
                localStorage.setItem('currentProject', JSON.stringify(apiResponse.project));
                localStorage.setItem('candidates', JSON.stringify(apiResponse.project.resumes || apiResponse.project.top_resumes || []));
            } else if (apiResponse.candidates) {
                // This was a standalone upload/fetch
                localStorage.setItem('candidates', JSON.stringify(apiResponse.candidates));
                if (!projectToSave) {
                    localStorage.removeItem('currentProject');
                }
            }
            
            // Navigate to the results page
            navigateTo('results');
            
        } else if (success) {
            // Loader finished but apiResponse is missing (e.g., /fetch_resumes returned no candidates)
             ModalManager.show({ title: 'No New Resumes', message: 'The process completed, but no new resumes were found.', type: 'info' });
             navigateTo('landing');
        }
        // If !success, LoadingManager's catch block already showed an error modal
        // We just need to navigate back to a safe page.
        else {
            navigateTo('landing');
        }

    } catch (error) {
        // This catches errors from loader.start() or the API call
        console.error('Fatal loading error:', error);
        // The LoadingManager already shows the modal, but we can go home.
        navigateTo('landing');
    }
}

// --- Comparison Modal ---
function openComparisonModal(candidateA, candidateB) {
    if (!candidateA || !candidateB) {
        // --- MODIFIED ---
        ModalManager.show({
            title: 'Comparison Error',
            message: 'Both candidates must be provided for comparison.',
            type: 'error'
        });
        // --- END MODIFIED ---
        return;
    }
    
    const htmlA = generateCandidateComparisonHtml(candidateA);
    const htmlB = generateCandidateComparisonHtml(candidateB);
    
    // --- MODIFIED ---
    // This now calls ModalManager.show, but we need to build the content ourselves
    // and use the 'buttons' array.
    
    // 1. Create the content for the modal
    const modalContent = `
        <div class="comparison-header p-6 border-b">
            <h2 class="text-2xl font-bold">Resume Comparison</h2>
            <div class="text-sm text-muted">Side-by-side comparison of two candidates</div>
        </div>
        <div class="comparison-body grid grid-cols-1 md:grid-cols-2 gap-0">
            <div class="comparison-panel p-4">${htmlA}</div>
            <div class="comparison-panel p-4 border-l">${htmlB}</div>
        </div>
    `;
    
    // 2. Show the modal using ModalManager.show
    // We pass the HTML content as the 'message'
    ModalManager.show({
        title: '', // Title is already in our custom HTML
        message: modalContent,
        type: 'info', // Type doesn't matter as much, but 'info' is fine
        buttons: [
            { text: 'Close', type: 'secondary', onClick: () => ModalManager.close() }
        ]
    });
    
    // 3. (Optional but recommended) Adjust the modal for full-width
    const modal = document.querySelector('.modal-content');
    if (modal) {
        modal.style.maxWidth = '90vw';
        modal.style.width = '90vw';
    }
    // --- END MODIFIED ---
}

function generateCandidateComparisonHtml(candidate) {
const name = candidate.name || candidate.filename || 'Unknown';
const ats = candidate.sections && candidate.sections.ats_score ? candidate.sections.ats_score + '%' : 'N/A';
const hrSummary = candidate.sections && candidate.sections.hr_summary ? formatTextWithMarkdown(candidate.sections.hr_summary) : '';
const strengths = candidate.sections && candidate.sections.strengths_weaknesses ? renderStrengths(candidate.sections.strengths_weaknesses) : '';
const weaknesses = candidate.sections && candidate.sections.strengths_weaknesses ? renderWeaknesses(candidate.sections.strengths_weaknesses) : '';
const interviewQs = candidate.sections && candidate.sections.interview_questions ? parseInterviewQuestions(candidate.sections.interview_questions) : '';

return `
<div>
<div class="flex items-center justify-between mb-4">
<h3 class="text-xl font-bold">${name}</h3>
<div class="text-center">
<div class="text-sm text-muted">ATS Score</div>
<div class="text-2xl font-bold text-primary-orange">${ats}</div>
</div>
</div>
<div class="space-y-4">
<div>
<h4 class="font-semibold text-lg mb-2 border-b pb-1">HR Summary</h4>
<div class="prose prose-sm max-w-none">${hrSummary}</div>
</div>
<div>
<h4 class="font-semibold text-lg mb-2 border-b pb-1">Strengths</h4>
${strengths}
</div>
<div>
<h4 class="font-semibold text-lg mb-2 border-b pb-1">Weaknesses</h4>
${weaknesses}
</div>
<div>
<h4 class="font-semibold text-lg mb-2 border-b pb-1">Interview Questions</h4>
<div class="prose prose-sm max-w-none">${interviewQs}</div>
</div>
</div>
</div>
`;
}

function showCandidateDetailModal(candidate) {
modalContainer.innerHTML = `
<div class="modal-overlay-full">
    <div class="modal-content-full modal-content-animated">
    <button class="modal-close-btn" onclick="ModalManager.close()"><i class="fas fa-times"></i></button>
    <div class="modal-header-full">
<div class="profile-picture-large">
<i class="fas fa-user text-4xl text-gray-500"></i>
</div>
<div class="candidate-info-header">
<h2 class="text-3xl font-bold text-heading">${candidate.name || 'Unknown Candidate'}</h2>
<p class="text-body">${candidate.email || 'No email'}</p>
</div>
<div class="header-actions">
<button class="btn-primary email-btn" data-email-type="accept"><i class="fas fa-check-circle mr-2"></i> Accept</button>
<button class="btn-secondary email-btn" data-email-type="reject"><i class="fas fa-times-circle mr-2"></i> Reject</button>
</div>
</div>
<div class="modal-body-full">
<div class="tabs-full">
<button class="tab-button active" data-tab="info"><i class="fas fa-user-circle mr-2"></i>Basic Info</button>
<button class="tab-button" data-tab="strengths"><i class="fas fa-bullseye mr-2"></i>Strengths & Weaknesses</button>
<button class="tab-button" data-tab="summary"><i class="fas fa-file-alt mr-2"></i>Summary & Justification</button>
<button class="tab-button" data-tab="recommendation"><i class="fas fa-star mr-2"></i>Recommendation</button>
<button class="tab-button" data-tab="interview"><i class="fas fa-question-circle mr-2"></i>Interview Qs</button>
</div>
<div class="tab-content-pane-full">
</div>
</div>
</div>
</div>
</div>
`;

const tabsContainer = modalContainer.querySelector('.tabs-full');
const contentContainer = modalContainer.querySelector('.tab-content-pane-full');

contentContainer.innerHTML = renderTabContent('info', candidate);

tabsContainer.addEventListener('click', (e) => {
const tabButton = e.target.closest('.tab-button');
if (!tabButton) return;

tabsContainer.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
tabButton.classList.add('active');

const tabName = tabButton.dataset.tab;
contentContainer.innerHTML = renderTabContent(tabName, candidate);
});

modalContainer.querySelectorAll('.email-btn').forEach(button => {
button.addEventListener('click', (event) => {
const emailType = button.dataset.emailType;
sendEmail(emailType, candidate, event);
});
});
}

function processTextForSingleBoxBullets(text, iconColorVar = 'var(--blue-500)') {
    if (!text || text.trim() === '') return '<p class="text-muted">No data provided.</p>';

    let points = [];
    const cleanedText = text.replace(/^\*\*/, '').trim();

    // Check if the text is already a list (contains newlines)
    if (cleanedText.includes('\n')) {
        points = cleanedText.split('\n'); // Split by newline
    } else {
        // If it's a single paragraph, split by sentences.
        points = cleanedText.split(/(?<=[.?!])\s+/);
    }

    const subHeadings = [
        'Growth Consistency:', 
        'Career Trajectory:',
        'Expertise Depth:',
        'Problem-Solving/Innovation:',
        'Risk Indicators:',
        'Leadership/Influence:',
        'Adaptability/Resilience:'
    ];

    return points
        .filter(line => line.trim() !== '') // Remove any empty lines
        .map(line => {
            let cleanLine = line.trim();
            
            // Check for and bold subheadings
            let isSubHeading = false;
            for (const sub of subHeadings) {
                // Use startsWith for a robust check
                if (cleanLine.startsWith(sub)) {
                    isSubHeading = true;
                    break;
                }
            }

            // Remove existing hyphen just in case
            if (cleanLine.startsWith('-')) {
                cleanLine = cleanLine.substring(1).trim();
            }

            if (isSubHeading) {
                // Use a span with utility classes instead of <strong>
                // This will not be overridden by the 'prose' class
                return `<span class="font-bold text-heading">${cleanLine}</span>`;
            } else {
                // Use inline style for the icon color
                return `<i class="fas fa-play mr-2" style="color: ${iconColorVar}"></i> <span>${cleanLine}</span>`;
            }
        })
        .join('\n\n'); // Join with double newline for extra space
}

function renderTabContent(tabName, candidate) {
    switch (tabName) {
        case 'info':
            // --- MODIFICATION START ---
            let basicInfoContent = candidate.sections.basic_info || '';
            let basicInfoHtml = '';

            if (basicInfoContent) {
                // 1. Split the content into lines
                const lines = basicInfoContent.split('\n');
                
                // 2. Clean, filter, and re-format the lines
                const filteredLines = lines
                    .map(line => {
                        // Clean the line of any hyphens or markdown
                        let cleanLine = line.trim();
                        if (cleanLine.startsWith('-')) {
                            cleanLine = cleanLine.substring(1).trim();
                        }
                        cleanLine = cleanLine.replace(/\*\*/g, ''); // Remove bold markdown
                        return cleanLine;
                    })
                    .filter(line => {
                        // Now filter the *clean* line
                        const checkLine = line.toLowerCase();
                        return !checkLine.startsWith('name:') && 
                               !checkLine.startsWith('email:') && 
                               !checkLine.startsWith('phone:') &&
                               line.trim() !== ''; // Remove any empty lines
                    })
                    .map(line => {
                        // Re-bold the subheadings that are left
                        return line.replace(/^(.*?):/gm, '<strong>$1:</strong>');
                    });
                
                let cleanedInfo = filteredLines.join('\n').trim();

                if (cleanedInfo) {
                    // 3. Create the HTML, now with the correct bolded heading
                    basicInfoHtml = `
                        <h4 class="text-heading mt-6 font-bold">Basic Info Summary</h4>
                        <div class="prose">${formatTextWithMarkdown(cleanedInfo)}</div>
                    `;
                }
            }

            // 4. Return the final HTML
            return `
        <div class="prose max-w-none">
        <h4 class="text-heading">Candidate Details</h4>
        <p><strong>Name:</strong> ${candidate.name || 'Not available'}</p>
        <p><strong>Email:</strong> ${candidate.email || 'Not available'}</p>
        <p><strong>Phone:</strong> ${candidate.phone || 'Not available'}</p>
        <h4 class="text-heading mt-6">Email Metadata</h4>
        <p><strong>Sender:</strong> ${candidate.sender || 'Unknown'}</p>
        <p><strong>Subject:</strong> ${candidate.subject || 'N/A'}</p>
        <p><strong>Filename:</strong> ${candidate.filename}</p>
        ${basicInfoHtml}
        </div>
        `;
            // --- MODIFICATION END ---
        case 'strengths':
            return `
<div class="prose max-w-none">
<h4 class="text-heading">Strengths</h4>
${renderStrengths(candidate.sections.strengths_weaknesses)}
<h4 class="text-heading mt-6">Weaknesses</h4>
${renderWeaknesses(candidate.sections.strengths_weaknesses)}
</div>
`;
        case 'summary':
            // Pass the blue color variable
            const hrSummaryProcessed = processTextForSingleBoxBullets(candidate.sections.hr_summary, 'var(--blue-500)');
            const justificationProcessed = processTextForSingleBoxBullets(candidate.sections.justification, 'var(--blue-500)');

            return `
            <div class="prose max-w-none">
                <h4 class="text-heading font-bold">HR Summary</h4>
                <div class="space-y-4">
                    <div class="strength-item">
                        ${formatTextWithMarkdown(hrSummaryProcessed)}
                    </div>
                </div>
                
                <h4 class="text-heading mt-6 font-bold">Justification</h4>
                <div class="space-y-4">
                    <div class="strength-item">
                        ${formatTextWithMarkdown(justificationProcessed)}
                    </div>
                </div>
            </div>
            `;
        case 'recommendation':
            const rawText = candidate.sections.recommendation || '';
            const sections = rawText.split(/(?=Why Select This Candidate|Why This Candidate not Suitable|Additional Future Potential)/i);
            
            let html = '';

            for (const section of sections) {
                const trimmedSection = section.trim().replace(/\*\*/g, '');
                if (trimmedSection === '') continue;

                const parts = trimmedSection.split(':');
                const headingText = parts[0].trim();
                const contentText = parts.slice(1).join(':').trim();
                
                html += `<h4 class="text-heading font-bold mt-6">${headingText}</h4>`;
                
                // Pass the primary orange/yellow color variable
                const processedContent = processTextForSingleBoxBullets(contentText, 'var(--primary-orange)');

                // Removed 'prose' class from the yellow box to prevent style conflicts
                html += `<div class="space-y-4">
                            <div class="max-w-none p-4 rounded-xl recommendation-section">
                                ${formatTextWithMarkdown(processedContent)}
                            </div>
                         </div>`;
            }

            // Keep 'prose' on the main container for consistent spacing
            return `<div class="prose max-w-none">${html}</div>`;
        case 'interview':
            return `
<div class="prose max-w-none">
${parseInterviewQuestions(candidate.sections.interview_questions)}
</div>
`;
        default:
            return '';
    }
}

// FIX APPLIED: Updated to correctly handle Bolding and simplified list parsing
function formatTextWithMarkdown(text) {
    if (!text) return '';
    
    // 1. Convert bolding first (non-greedy match for **text**)
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); 
    
    // 2. Convert list items: replace each bullet point at the start of a line with an LI tag (global, multiline)
    text = text.replace(/^- (.*$)/gm, '<li>$1</li>');
    
    // 3. Wrap consecutive <li> tags in a <ul> tag
    // This is necessary to correctly create bulleted lists from the raw data
    text = text.replace(/(<li>.*?<\/li>)+/gs, '<ul>$&</ul>');
    
    // 4. Finally, convert remaining newlines to <br> tags (outside of the lists and headers)
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

function renderStrengths(text) {
if (!text) return '<p class="text-muted">No strengths provided.</p>';
let html = '';
const strengths = text.split('- **Weakness:**')[0].split('- **Strength:**').slice(1);
if (strengths.length > 0) {
strengths.forEach(strength => {
html += `
<div class="strength-item">
<i class="fas fa-plus-circle mr-2 text-blue-500"></i>
<span>${formatTextWithMarkdown(strength)}</span>
</div>
`;
});
} else {
return `<p class="text-muted">No strengths provided.</p>`;
}
return html;
}
function formatRecommendationText(text) {
    if (!text || text.trim() === '') return '<p class="text-muted">No data provided.</p>';

    const lines = text.split('\n');
    const newLines = [];

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine === '') continue;

        // Clean all asterisks
        const cleanLine = trimmedLine.replace(/\*\*/g, '');

        // Check for main headings and bold them
        if (cleanLine.startsWith('Why Select This Candidate:')) {
            newLines.push(`<strong>${cleanLine}</strong>`);
        } else if (cleanLine.startsWith('Why This Candidate not Suitable:')) {
            newLines.push(`<strong>${cleanLine}</strong>`);
        } else if (cleanLine.startsWith('Additional Future Potential:')) {
            newLines.push(`<strong>${cleanLine}</strong>`);
        }
        // Check for sub-headings and bold them
        else if (cleanLine.startsWith('Growth Consistency:')) {
            newLines.push(`<strong>${cleanLine}</strong>`);
        } else if (cleanLine.startsWith('Career Trajectory:')) {
            newLines.push(`<strong>${cleanLine}</strong>`);
        }
        // Else, it's a regular point, so add the bullet
        else {
            newLines.push(`<i class="fas fa-play mr-2 text-blue-500"></i> <span>${cleanLine}</span>`);
        }
    }

    return newLines.join('\n\n'); // Join with double newline for spacing
}
function renderWeaknesses(text) {
if (!text) return '<p class="text-muted">No weaknesses provided.</p>';
let html = '';
const weaknesses = text.split('- **Weakness:**').slice(1);
if (weaknesses.length > 0) {
weaknesses.forEach(weakness => {
html += `
<div class="weakness-item">
<i class="fas fa-minus-circle mr-2 text-orange-500"></i>
<span>${formatTextWithMarkdown(weakness)}</span>
</div>
`;
});
} else {
return `<p class="text-muted">No weaknesses provided.</p>`;
}
return html;
}

function parseInterviewQuestions(text) {
    if (!text) return '<p class="text-muted">No interview questions provided.</p>';
    
    // Split all items by the numbering (e.g., "1. ", "2. ")
    const allItems = text.split(/\d+\.\s/).filter(q => q.trim() !== '');
    
    // 1. Remove the first item ("& Resume Match Evaluation:**")
    const questions = allItems.slice(1); 
    
    let html = '';
    
    // 2. Loop through the *actual* questions
    questions.forEach((question, index) => {
        
        // Split the question block by newlines to separate question, match, and explanation
        const parts = question.split('\n').map(p => p.trim()).filter(p => p);
        
        const questionText = parts[0] ? parts[0].trim() : '';
        
        // Find the match level and explanation from the parts
        let matchLevel = '';
        let explanation = '';
        
        parts.forEach(part => {
            if (part.startsWith('- Match level:')) {
                matchLevel = part.replace('- Match level:', '').trim();
            } else if (part.startsWith('- Explanation:')) {
                explanation = part.replace('- Explanation:', '').trim();
            }
        });
        
        // Format any markdown (like bolding) *within* the question text itself
        const formattedQuestionText = formatTextWithMarkdown(questionText);

        // 3. Apply specific bolding as requested
        html += `
<div class="question-item bg-card p-4 rounded-lg mb-3 border border-gray-400 dark:border-gray-700">
    <p class="text-heading">
        <strong>${index + 1}.</strong> <strong>${formattedQuestionText}</strong>
    </p>
    
    ${matchLevel ? `
    <div class="mt-2 text-sm">
        <strong>Match level:</strong> ${matchLevel}
    </div>
    ` : ''}
    
    ${explanation ? `
    <div class="mt-2 text-sm">
        <strong>Explanation:</strong> ${explanation}
    </div>
    ` : ''}
</div>
`;
    });
    return html;
}

function getMatchClass(level) {
    if (!level) return '';
    const lowerLevel = level.toLowerCase();
    if (lowerLevel.includes('clear')) return 'bg-green-500';
    if (lowerLevel.includes('partial')) return 'bg-yellow-500';
    if (lowerLevel.includes('not evident')) return 'bg-red-500';
    return 'bg-gray-400';
}
