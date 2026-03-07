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

async function fetchIssues() {
    showLoader(true);
    try {
        const res = await fetch(`${API_BASE}/issues`);
        const data = await res.json();
        allIssues = data.data; // Adjusting based on standard API response patterns
        renderIssues();
    } catch (err) {
        console.error("Fetch Error:", err);
    } finally {
        showLoader(false);
    }
}

async function searchIssues() {
    const query = searchInput.value.trim();
    if (!query) return fetchIssues();

    showLoader(true);
    try {
        const res = await fetch(`${API_BASE}/issues/search?q=${query}`);
        const data = await res.json();
        allIssues = data.data;
        renderIssues();
    } catch (err) {
        console.error("Search Error:", err);
    } finally {
        showLoader(false);
    }
}

function renderIssues() {
    container.innerHTML = '';
    
    const filtered = allIssues.filter(issue => {
        if (currentFilter === 'all') return true;
        return issue.status.toLowerCase() === currentFilter;
    });

    countEl.innerText = filtered.length;

    filtered.forEach(issue => {
        const card = document.createElement('div');
        const statusClass = issue.status.toLowerCase() === 'open' ? 'card-open' : 'card-closed';
        
        card.className = `bg-white p-4 rounded-b-lg shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition cursor-pointer ${statusClass}`;
        
        card.innerHTML = `
            <div>
                <h3 class="font-bold text-blue-600 hover:underline mb-2 line-clamp-1 title-click">${issue.title}</h3>
                <p class="text-sm text-gray-600 mb-4 line-clamp-2">${issue.description}</p>
                <div class="flex flex-wrap gap-2 mb-4">
                    
                    <span class="px-2 py-0.5 bg-yellow-50 text-[10px] font-bold text-yellow-700 rounded-full border border-yellow-200">${issue.priority?issue.priority:"Help Wanted"}</span>
                    <span class="px-2 py-0.5 bg-[#FEECEC] text-[10px] font-bold rounded-full border border-gray-300">${issue.label?issue.label:"BUG"}</span>
                    <span class="px-2 py-0.5 bg-[#FFF8DB] text-[10px] font-bold rounded-full border border-gray-300">${issue.label?"Help wanted":"Help wanted"}</span>
                </div>
            </div>
            <div class="pt-3 border-t border-gray-100 mt-auto">
                <div class="flex justify-between items-center text-[11px] text-gray-500">
                    <span>By: <span class="font-semibold">${issue.author}</span></span>
                    <span>${new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => openModal(issue));
        container.appendChild(card);
    });
}

function openModal(issue) {
    document.getElementById('modal-title').innerText = issue.title;
    const content = document.getElementById('modal-content');
    
    content.innerHTML = `
        <div class="grid grid-cols-2 gap-4 text-sm">
            <p><strong>Category:</strong> ${issue.category}</p>
            <p><strong>Status:</strong> ${issue.status}</p>
            <p><strong>Priority:</strong> ${issue.priority}</p>
            <p><strong>Label:</strong> ${issue.label}</p>
            <p><strong>Author:</strong> ${issue.author}</p>
            <p><strong>Created:</strong> ${new Date(issue.createdAt).toLocaleString()}</p>
        </div>
        <div class="mt-4 border-t pt-4">
            <h4 class="font-bold mb-2">Description</h4>
            <p class="text-gray-700 leading-relaxed">${issue.description}</p>
        </div>
    `;
    modal.classList.remove('hidden');
}

// Event Listeners
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => {
            t.classList.remove('active-tab');
            t.classList.add('text-gray-500');
        });
        tab.classList.add('active-tab');
        tab.classList.remove('text-gray-500');
        currentFilter = tab.dataset.filter;
        renderIssues();
    });
});

searchBtn.addEventListener('click', searchIssues);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchIssues();
});

document.getElementById('close-modal').addEventListener('click', () => {
    modal.classList.add('hidden');
});

function showLoader(show) {
    loader.classList.toggle('hidden', !show);
    container.classList.toggle('hidden', show);
}