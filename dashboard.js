/**
 * TestSarthi Dashboard - Main Application Logic
 * Handles all navigation, data loading, and user interactions
 */

// Global state
let currentUser = null;
let tg = window.Telegram ? window.Telegram.WebApp : null;
let currentPage = 'home';

// Initialize Telegram WebApp
if (tg) {
    tg.ready();
    tg.expand();
    console.log('Telegram WebApp initialized');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Dashboard initializing...');
    await initializeApp();
});

/**
 * Initialize application
 */
async function initializeApp() {
    try {
        // Get user info from Telegram
        if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
            const tgUser = tg.initDataUnsafe.user;
            currentUser = {
                user_id: tgUser.id,
                name: tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : ''),
                username: tgUser.username
            };
        } else {
            // Fallback for testing
            currentUser = {
                user_id: 123456789,
                name: 'Test User',
                username: 'testuser'
            };
        }

        // Update UI with user info
        document.getElementById('user-name').textContent = currentUser.name;

        // Load user data
        await loadUserData();
        
        // Load home page data
        await loadHomePage();
        
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize app');
    }
}

/**
 * Load user data from Firebase
 */
async function loadUserData() {
    try {
        // TODO: Fetch from Firebase
        // For now, use mock data
        const userData = {
            is_premium: false,
            tests_taken: 0,
            total_score: 0,
            accuracy: 0,
            rank: null,
            streak: 0
        };

        // Update UI
        updateUserStats(userData);
        
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

/**
 * Update user statistics display
 */
function updateUserStats(data) {
    document.getElementById('stat-tests').textContent = data.tests_taken || 0;
    document.getElementById('stat-accuracy').textContent = (data.accuracy || 0) + '%';
    document.getElementById('stat-rank').textContent = data.rank || '-';
    document.getElementById('stat-streak').textContent = data.streak || 0;
    
    // Update premium badge
    const badge = document.getElementById('plan-badge');
    if (data.is_premium) {
        badge.textContent = 'PREMIUM 💎';
        badge.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    } else {
        badge.textContent = 'FREE';
        badge.style.background = 'rgba(255,255,255,0.3)';
    }
}

/**
 * Navigation Functions
 */
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById('page-' + pageName).classList.add('active');
    
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update current page
    currentPage = pageName;
    
    // Load page content
    loadPageContent(pageName);
}

function bottomNav(pageName) {
    // Update bottom nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Update top nav
    document.querySelectorAll('.nav-tab').forEach((tab, index) => {
        tab.classList.remove('active');
        if (tab.textContent.toLowerCase().includes(pageName)) {
            tab.classList.add('active');
        }
    });
    
    // Show page
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById('page-' + pageName).classList.add('active');
    
    currentPage = pageName;
    loadPageContent(pageName);
}

/**
 * Load page specific content
 */
async function loadPageContent(pageName) {
    console.log('Loading page:', pageName);
    
    switch(pageName) {
        case 'home':
            await loadHomePage();
            break;
        case 'tests':
            await loadTestsPage();
            break;
        case 'results':
            await loadResultsPage();
            break;
        case 'leaderboard':
            await loadLeaderboardPage();
            break;
        case 'browse':
            await loadBrowsePage();
            break;
    }
}

/**
 * Home Page
 */
async function loadHomePage() {
    console.log('Loading home page...');
    
    try {
        // Load recent activity
        const activities = await fetchRecentActivity();
        displayRecentActivity(activities);
        
    } catch (error) {
        console.error('Error loading home page:', error);
    }
}

async function fetchRecentActivity() {
    // TODO: Fetch from Firebase
    return [];
}

function displayRecentActivity(activities) {
    const container = document.getElementById('recent-activity');
    
    if (!activities || activities.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">📚</div>
                <div class="title">No activity yet</div>
                <div class="subtitle">Start taking tests to see your progress</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = activities.map(activity => `
        <div class="list-item">
            <div class="list-item-header">
                <div class="list-item-title">${activity.title}</div>
                <span class="badge ${activity.status}">${activity.status}</span>
            </div>
            <div class="list-item-meta">
                <span>📅 ${activity.date}</span>
                <span>⏱️ ${activity.time}</span>
            </div>
        </div>
    `).join('');
}

/**
 * Tests Page
 */
async function loadTestsPage() {
    console.log('Loading tests page...');
    
    const container = document.getElementById('tests-list');
    container.innerHTML = '<div class="loading"><div class="spinner"></div><div>Loading tests...</div></div>';
    
    try {
        // TODO: Fetch available tests from Firebase
        const tests = await fetchAvailableTests();
        displayTestsList(tests);
        
    } catch (error) {
        console.error('Error loading tests:', error);
        container.innerHTML = '<div class="empty-state"><div class="icon">❌</div><div class="title">Error loading tests</div></div>';
    }
}

async function fetchAvailableTests() {
    // Mock data for now
    return [
        {
            id: 'daily_20250101',
            title: 'Daily Test - January 1, 2025',
            type: 'daily',
            questions: 20,
            duration: 60,
            status: 'available'
        }
    ];
}

function displayTestsList(tests) {
    const container = document.getElementById('tests-list');
    
    if (!tests || tests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">📝</div>
                <div class="title">No tests available</div>
                <div class="subtitle">Check back later for new tests</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tests.map(test => `
        <div class="list-item" onclick="openTest('${test.id}')">
            <div class="list-item-header">
                <div class="list-item-title">${test.title}</div>
                <span class="badge ${test.status}">${test.status}</span>
            </div>
            <div class="list-item-meta">
                <span>📋 ${test.questions} Qs</span>
                <span>⏱️ ${test.duration} min</span>
            </div>
        </div>
    `).join('');
}

/**
 * Results Page
 */
async function loadResultsPage() {
    console.log('Loading results page...');
    
    const container = document.getElementById('results-list');
    container.innerHTML = '<div class="loading"><div class="spinner"></div><div>Loading results...</div></div>';
    
    try {
        const results = await fetchUserResults();
        displayResultsList(results);
        
    } catch (error) {
        console.error('Error loading results:', error);
        container.innerHTML = '<div class="empty-state"><div class="icon">❌</div><div class="title">Error loading results</div></div>';
    }
}

async function fetchUserResults() {
    // TODO: Fetch from Firebase
    return [];
}

function displayResultsList(results) {
    const container = document.getElementById('results-list');
    
    if (!results || results.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">📊</div>
                <div class="title">No results yet</div>
                <div class="subtitle">Complete a test to see your results</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = results.map(result => {
        const percentage = ((result.score / result.total_marks) * 100).toFixed(1);
        return `
            <div class="list-item" onclick="viewResult('${result.id}')">
                <div class="list-item-header">
                    <div class="list-item-title">${result.test_name}</div>
                    <div class="rank-score">${result.score}/${result.total_marks}</div>
                </div>
                <div class="list-item-meta">
                    <span>📅 ${result.date}</span>
                    <span>✅ ${percentage}%</span>
                    <span>⏱️ ${result.time_taken}</span>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Leaderboard Page
 */
async function loadLeaderboardPage() {
    console.log('Loading leaderboard...');
    
    const container = document.getElementById('leaderboard-list');
    container.innerHTML = '<div class="loading"><div class="spinner"></div><div>Loading rankings...</div></div>';
    
    try {
        const rankings = await fetchLeaderboard();
        displayLeaderboard(rankings);
        
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        container.innerHTML = '<div class="empty-state"><div class="icon">❌</div><div class="title">Error loading leaderboard</div></div>';
    }
}

async function fetchLeaderboard() {
    // TODO: Fetch from Firebase
    return [];
}

function displayLeaderboard(rankings) {
    const container = document.getElementById('leaderboard-list');
    
    if (!rankings || rankings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">🏆</div>
                <div class="title">Leaderboard is empty</div>
                <div class="subtitle">Be the first to take a test!</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = rankings.map((user, index) => {
        let badgeClass = 'default';
        if (index === 0) badgeClass = 'gold';
        else if (index === 1) badgeClass = 'silver';
        else if (index === 2) badgeClass = 'bronze';
        
        const isCurrentUser = user.user_id === currentUser.user_id;
        
        return `
            <div class="rank-item" style="${isCurrentUser ? 'border: 2px solid var(--primary);' : ''}">
                <div class="rank-badge ${badgeClass}">${index + 1}</div>
                <div class="rank-info">
                    <div class="rank-name">${user.name}${isCurrentUser ? ' (You)' : ''}</div>
                    <div class="rank-meta">${user.tests_taken} tests • ${user.accuracy}% accuracy</div>
                </div>
                <div class="rank-score">${user.total_score}</div>
            </div>
        `;
    }).join('');
}

/**
 * Browse Page
 */
async function loadBrowsePage() {
    console.log('Loading browse page...');
    await loadSubjects();
}

async function loadSubjects() {
    const collection = document.getElementById('browse-collection').value;
    const container = document.getElementById('subjects-grid');
    
    container.innerHTML = '<div class="loading"><div class="spinner"></div><div>Loading subjects...</div></div>';
    
    try {
        const subjects = await fetchSubjects(collection);
        displaySubjects(subjects);
        
    } catch (error) {
        console.error('Error loading subjects:', error);
        container.innerHTML = '<div class="empty-state"><div class="icon">❌</div><div class="title">Error loading subjects</div></div>';
    }
}

async function fetchSubjects(collection) {
    // Mock data
    const subjectsMap = {
        'upsc': [
            { name: 'History', icon: '📜', count: 250 },
            { name: 'Geography', icon: '🌍', count: 200 },
            { name: 'Polity', icon: '⚖️', count: 220 },
            { name: 'Economy', icon: '💰', count: 180 },
            { name: 'Science', icon: '🔬', count: 150 },
            { name: 'Environment', icon: '🌱', count: 100 }
        ],
        'current': [
            { name: 'National', icon: '🇮🇳', count: 300 },
            { name: 'International', icon: '🌐', count: 250 },
            { name: 'Sports', icon: '⚽', count: 150 },
            { name: 'Economy', icon: '💹', count: 200 }
        ],
        'general': [
            { name: 'General Knowledge', icon: '📚', count: 500 },
            { name: 'Reasoning', icon: '🧠', count: 400 },
            { name: 'Mathematics', icon: '🔢', count: 350 }
        ]
    };
    
    return subjectsMap[collection] || [];
}

function displaySubjects(subjects) {
    const container = document.getElementById('subjects-grid');
    
    if (!subjects || subjects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">📚</div>
                <div class="title">No subjects found</div>
            </div>
        `;
        return;
    }
    
    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;';
    
    grid.innerHTML = subjects.map(subject => `
        <div class="list-item" onclick="browseSubject('${subject.name}')" style="text-align: center; cursor: pointer;">
            <div style="font-size: 36px; margin-bottom: 8px;">${subject.icon}</div>
            <div class="list-item-title" style="margin-bottom: 4px;">${subject.name}</div>
            <div style="font-size: 12px; color: var(--gray-800);">${subject.count} questions</div>
        </div>
    `).join('');
    
    container.innerHTML = '';
    container.appendChild(grid);
}

/**
 * Test Actions
 */
function openDailyTest() {
    console.log('Opening daily test...');
    window.location.href = 'index.html';
}

function selectTest(type) {
    console.log('Selected test type:', type);
    
    if (type === 'mains') {
        alert('📝 Mains Practice\n\nAccess mains practice through Telegram bot.\nSend /mains to start.');
        return;
    }
    
    showPage('browse');
    document.getElementById('browse-collection').value = type;
    loadSubjects();
}

function openTest(testId) {
    console.log('Opening test:', testId);
    // Navigate to test interface
    window.location.href = `index.html?test=${testId}`;
}

function browseSubject(subjectName) {
    console.log('Browse subject:', subjectName);
    alert(`📚 ${subjectName}\n\nQuestion browser coming soon!\nYou'll be able to practice questions by subject.`);
}

function viewResult(resultId) {
    console.log('View result:', resultId);
    alert('📊 Detailed result view coming soon!');
}

/**
 * Settings & Notifications
 */
function showNotifications() {
    console.log('Show notifications');
    alert('🔔 Notifications\n\nNo new notifications');
}

function showSettings() {
    console.log('Show settings');
    alert('⚙️ Settings\n\n• Profile\n• Upgrade to Premium\n• Help & Support\n• Logout\n\nFull settings coming soon!');
}

/**
 * Utility Functions
 */
function showError(message) {
    if (tg && tg.showAlert) {
        tg.showAlert('❌ ' + message);
    } else {
        alert('❌ ' + message);
    }
}

function showSuccess(message) {
    if (tg && tg.showAlert) {
        tg.showAlert('✅ ' + message);
    } else {
        alert('✅ ' + message);
    }
}

// Log initialization
console.log('Dashboard JS loaded');
