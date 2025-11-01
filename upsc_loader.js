// UPSC Question Data Loader for WebApp
// Fetches questions from Firebase and formats for daily tests

class UPSCQuestionLoader {
    constructor() {
        this.apiBaseUrl = window.location.origin + '/api';
    }
    
    /**
     * Fetch UPSC daily test questions
     * @param {string} date - Date in YYYY-MM-DD format
     * @param {number} count - Number of questions
     * @returns {Promise<Object>} Test data object
     */
    async fetchDailyTest(date, count = 10) {
        try {
            const response = await fetch(
                `${this.apiBaseUrl}/upsc/daily-test?date=${date}&count=${count}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch test');
            }
            
            const data = await response.json();
            return this.formatTestData(data, date);
            
        } catch (error) {
            console.error('Error fetching UPSC test:', error);
            return null;
        }
    }
    
    /**
     * Format raw question data into webapp test format
     * @param {Object} data - Raw test data from API
     * @param {string} date - Test date
     * @returns {Object} Formatted test object
     */
    formatTestData(data, date) {
        const questions = data.questions.map((q, index) => {
            // Get English language data
            const langData = q.language.en;
            
            return {
                id: index + 1,
                questionId: q.question_id,
                question: langData.question_text,
                options: langData.options.filter(opt => opt), // Remove empty options
                answer: this.getAnswerIndex(q.correct_answer),
                subject: q.subject || 'General Studies',
                difficulty: q.difficulty || 'medium',
                explanation: langData.explanation || '',
                year: q.year || 2020
            };
        });
        
        return {
            meta: {
                date: this.formatDate(date),
                totalQuestions: questions.length,
                totalMarks: questions.length * 2,
                duration: Math.ceil(questions.length * 1.5), // 1.5 min per question
                type: 'UPSC Prelims',
                year: data.year || 2020
            },
            questions: questions
        };
    }
    
    /**
     * Convert answer letter to index
     * @param {string} answer - Answer letter (A, B, C, D)
     * @returns {number} Answer index (0-3)
     */
    getAnswerIndex(answer) {
        const mapping = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
        return mapping[answer.toUpperCase()] || 0;
    }
    
    /**
     * Format date to display format
     * @param {string} dateStr - Date string YYYY-MM-DD
     * @returns {string} Formatted date
     */
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-IN', options);
    }
    
    /**
     * Load test into global DAILY_TESTS object
     * @param {string} date - Date in YYYY-MM-DD format
     * @param {number} count - Number of questions
     */
    async loadTestForDate(date, count = 10) {
        console.log(`Loading UPSC test for ${date}...`);
        
        const testData = await this.fetchDailyTest(date, count);
        
        if (testData) {
            // Add to global DAILY_TESTS object
            if (typeof DAILY_TESTS === 'undefined') {
                window.DAILY_TESTS = {};
            }
            
            DAILY_TESTS[date] = testData;
            console.log(`✅ Loaded UPSC test for ${date}:`, testData);
            return testData;
        } else {
            console.error(`❌ Failed to load test for ${date}`);
            return null;
        }
    }
    
    /**
     * Get practice test with filters
     * @param {Object} filters - Filter options
     * @returns {Promise<Object>} Test data
     */
    async fetchPracticeTest(filters = {}) {
        try {
            const params = new URLSearchParams({
                count: filters.count || 10,
                subject: filters.subject || '',
                difficulty: filters.difficulty || '',
                year: filters.year || ''
            });
            
            const response = await fetch(
                `${this.apiBaseUrl}/upsc/practice-test?${params}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch practice test');
            }
            
            const data = await response.json();
            return this.formatTestData(data, new Date().toISOString().split('T')[0]);
            
        } catch (error) {
            console.error('Error fetching practice test:', error);
            return null;
        }
    }
}

// Initialize loader
const upscLoader = new UPSCQuestionLoader();

// Auto-load today's test if needed
document.addEventListener('DOMContentLoaded', async function() {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if today's test exists
    if (typeof DAILY_TESTS === 'undefined' || !DAILY_TESTS[today]) {
        console.log('No local test data found, fetching from API...');
        await upscLoader.loadTestForDate(today, 10);
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UPSCQuestionLoader;
}
