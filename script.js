const API_BASE = "https://phi-lab-server.vercel.app/api/v1/lab";
const container = document.getElementById('issues-container');
const loader = document.getElementById('loader');
const countEl = document.getElementById('issue-count');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const tabs = document.querySelectorAll('.tab-btn');
const modal = document.getElementById('issue-modal');

let allIssues = [];
let currentFilter = 'all';

/**
 * 1. FETCH DATA FROM API
 * This function fetches the main list of issues.
 */
async function fetchIssues() {
    showLoader(true);
    try {
        const res = await fetch(`${API_BASE}/issues`);
        const result = await res.json();
        
        // Ensure we handle the API structure correctly (usually result.data)
        allIssues = result.data || result; 
        
        renderIssues();
    } catch (err) {
        console.error("Fetch Error:", err);
        container.innerHTML = `<p class="text-red-500 text-center col-span-full">Failed to load issues. Please try again later.</p>`;
    } finally {
        showLoader(false);
    }
}

/**
 * 2. SEARCH FUNCTIONALITY
 */
async function searchIssues() {
    const query = searchInput.value.trim();
    
    // If search is empty, just load all issues again
    if (!query) {
        fetchIssues();
        return;
    }

    showLoader(true);
    try {
        const res = await fetch(`${API_BASE}/issues/search?q=${query}`);
        const result = await res.json();
        allIssues = result.data || result;
        renderIssues();
    } catch (err) {
        console.error("Search Error:", err);
    } finally {
        showLoader(false);
    }
}

/**
 * 3. RENDER CARDS TO THE DOM
 */
function renderIssues() {
    container.innerHTML = '';
    
    // Filter issues based on active tab (All, Open, Closed)
    const filtered = allIssues.filter(issue => {
        if (currentFilter === 'all') return true;
        return issue.status.toLowerCase() === currentFilter.toLowerCase();
    });

    // Update the counter text
    countEl.innerText = filtered.length;

    if (filtered.length === 0) {
        container.innerHTML = `<p class="text-gray-500 text-center col-span-full py-10">No issues found.</p>`;
        return;
    }

    filtered.forEach(issue => {
        const card = document.createElement('div');
        const isClosed = issue.status.toLowerCase() === 'closed';
        const statusClass = isClosed ? 'card-closed' : 'card-open';
        
        card.className = `bg-white p-5 rounded-b-lg shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition cursor-pointer ${statusClass}`;
        
        card.innerHTML = `
            <div>
                <h3 class="font-bold text-blue-600 hover:underline mb-2 line-clamp-1">${issue.title}</h3>
                <p class="text-sm text-gray-600 mb-4 line-clamp-2">${issue.description}</p>
                <div class="flex flex-wrap gap-2 mb-4">
                    <span class="px-2 py-0.5 bg-gray-100 text-[10px] font-bold rounded-full border border-gray-300 uppercase">${issue.label}</span>
                    <span class="px-2 py-0.5 bg-yellow-50 text-[10px] font-bold text-yellow-700 rounded-full border border-yellow-200 uppercase">${issue.priority}</span>
                </div>
            </div>
            <div class="pt-3 border-t border-gray-100 mt-auto">
                <div class="flex justify-between items-center text-[11px] text-gray-500">
                    <span>Author: <span class="font-semibold text-gray-700">${issue.author}</span></span>
                    <span>${new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        `;

        // Click event to open modal
        card.addEventListener('click', () => openModal(issue));
        container.appendChild(card);
    });
}

/**
 * 4. MODAL LOGIC
 */
function openModal(issue) {
    document.getElementById('modal-title').innerText = issue.title;
    const content = document.getElementById('modal-content');
    
    content.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
            <p><strong class="text-gray-500">Category:</strong> ${issue.category}</p>
            <p><strong class="text-gray-500">Status:</strong> ${issue.status}</p>
            <p><strong class="text-gray-500">Priority:</strong> ${issue.priority}</p>
            <p><strong class="text-gray-500">Label:</strong> ${issue.label}</p>
            <p><strong class="text-gray-500">Author:</strong> ${issue.author}</p>
            <p><strong class="text-gray-500">Created At:</strong> ${new Date(issue.createdAt).toLocaleString()}</p>
        </div>
        <div class="mt-6">
            <h4 class="font-bold text-gray-800 mb-2 border-b pb-1">Description</h4>
            <p class="text-gray-700 leading-relaxed whitespace-pre-line">${issue.description}</p>
        </div>
    `;
    modal.classList.remove('hidden');
}

/**
 * 5. UI UTILITIES
 */
function showLoader(show) {
    if (show) {
        loader.classList.remove('hidden');
        container.classList.add('hidden');
    } else {
        loader.classList.add('hidden');
        container.classList.remove('hidden');
    }
}

/**
 * 6. EVENT LISTENERS
 */

// Tab Switching
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Update UI styles
        tabs.forEach(t => {
            t.classList.remove('active-tab');
            t.classList.add('text-gray-500');
        });
        tab.classList.add('active-tab');
        tab.classList.remove('text-gray-500');

        // Update Filter and Re-render
        currentFilter = tab.dataset.filter;
        renderIssues();
    });
});

// Search Button and Enter Key
searchBtn.addEventListener('click', searchIssues);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchIssues();
});

// Close Modal
document.getElementById('close-modal').addEventListener('click', () => {
    modal.classList.add('hidden');
});

// Close modal when clicking outside the box
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
});

/**
 * 7. INITIALIZATION (The Fix)
 * This runs every time the script loads.
 */
function init() {
    // If the user is logged in, fetch data immediately
    if (localStorage.getItem('isLoggedIn') === 'true') {
        fetchIssues();
    }
}

init();