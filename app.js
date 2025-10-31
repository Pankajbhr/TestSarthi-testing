// Main Application Logic
let tg = window.Telegram ? window.Telegram.WebApp : null;
let currentTest = null;
let currentQuestionIndex = 0;
let userAnswers = {};
let timerInterval = null;
let startTime = null;
let timeRemaining = 0;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('App initializing...');
    
    // Initialize Telegram WebApp
    if (tg) {
        tg.ready();
        tg.expand();
        tg.enableClosingConfirmation();
    }
    
    // Hide all screens except loading
    hideAllScreensExcept('loading-screen');
    
    // Load test after short delay
    setTimeout(() => {
        loadTest();
    }, 800);
});

// Hide all screens except one
function hideAllScreensExcept(exceptId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        if (screen.id === exceptId) {
            screen.style.display = 'flex';
            screen.classList.add('active');
        } else {
            screen.style.display = 'none';
            screen.classList.remove('active');
        }
    });
    
    // Scroll to top
    window.scrollTo(0, 0);
    if (document.getElementById('app-container')) {
        document.getElementById('app-container').scrollTop = 0;
    }
}

// Load test data
function loadTest() {
    console.log('Loading test...');
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    console.log('Today:', today);
    
    currentTest = DAILY_TESTS[today];
    
    if (!currentTest) {
        console.error('No test found for today');
        document.querySelector('#loading-screen p').textContent = 'No test available for today';
        
        // Auto close after 3 seconds
        setTimeout(() => {
            if (tg) tg.close();
        }, 3000);
        return;
    }
    
    console.log('Test loaded:', currentTest);
    
    // Populate info screen
    document.getElementById('test-date').textContent = currentTest.meta.date;
    document.getElementById('total-questions').textContent = currentTest.meta.totalQuestions;
    document.getElementById('total-marks').textContent = currentTest.meta.totalMarks;
    document.getElementById('duration').textContent = currentTest.meta.duration + ' min';
    
    // Show info screen
    hideAllScreensExcept('info-screen');
    console.log('Info screen shown');
}

// Start test
function startTest() {
    console.log('Starting test...');
    
    if (!currentTest) {
        console.error('No test available');
        return;
    }
    
    // Initialize
    currentQuestionIndex = 0;
    userAnswers = {};
    startTime = Date.now();
    timeRemaining = currentTest.meta.duration * 60; // Convert to seconds
    
    // Setup UI
    document.getElementById('total-q').textContent = currentTest.meta.totalQuestions;
    buildQuestionGrid();
    
    // Start timer
    startTimer();
    
    // Show test screen
    hideAllScreensExcept('test-screen');
    displayQuestion();
    
    console.log('Test started');
}

// Start timer
function startTimer() {
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            autoSubmitTest();
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const display = document.getElementById('timer-display');
    if (display) {
        display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Warning color when less than 5 minutes
    const timer = document.getElementById('timer');
    if (timer && timeRemaining < 300) {
        timer.style.color = 'var(--danger)';
    }
}

// Build question grid
function buildQuestionGrid() {
    const grid = document.getElementById('question-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    currentTest.questions.forEach((q, index) => {
        const item = document.createElement('div');
        item.className = 'grid-item';
        item.textContent = q.id;
        item.onclick = () => jumpToQuestion(index);
        grid.appendChild(item);
    });
}

// Display question
function displayQuestion() {
    const question = currentTest.questions[currentQuestionIndex];
    
    // Update header
    const currentQ = document.getElementById('current-question');
    if (currentQ) currentQ.textContent = currentQuestionIndex + 1;
    
    // Update progress
    updateProgress();
    
    // Update meta
    const subjectTag = document.getElementById('subject-tag');
    if (subjectTag) subjectTag.textContent = question.subject;
    
    // Update question text
    const questionText = document.getElementById('question-text');
    if (questionText) questionText.textContent = question.question;
    
    // Update options
    const optionsContainer = document.getElementById('options-container');
    if (!optionsContainer) return;
    
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        if (userAnswers[question.id] === index) {
            optionDiv.classList.add('selected');
        }
        
        optionDiv.innerHTML = `
            <div class="option-radio"></div>
            <span class="option-label">${String.fromCharCode(65 + index)}.</span>
            <span class="option-text">${option}</span>
        `;
        
        optionDiv.onclick = () => selectOption(index);
        optionsContainer.appendChild(optionDiv);
    });
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    if (prevBtn) prevBtn.disabled = currentQuestionIndex === 0;
    if (nextBtn) nextBtn.disabled = currentQuestionIndex === currentTest.questions.length - 1;
    
    // Update grid
    updateQuestionGrid();
}

// Select option
function selectOption(optionIndex) {
    const question = currentTest.questions[currentQuestionIndex];
    userAnswers[question.id] = optionIndex;
    
    // Update UI
    const options = document.querySelectorAll('.option');
    options.forEach((opt, idx) => {
        if (idx === optionIndex) {
            opt.classList.add('selected');
        } else {
            opt.classList.remove('selected');
        }
    });
    
    updateProgress();
    updateQuestionGrid();
}

// Update progress
function updateProgress() {
    const answered = Object.keys(userAnswers).length;
    const total = currentTest.questions.length;
    const percentage = (answered / total) * 100;
    
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    if (progressBar) progressBar.style.width = percentage + '%';
    if (progressText) progressText.textContent = `${answered}/${total} Answered`;
}

// Update question grid
function updateQuestionGrid() {
    const gridItems = document.querySelectorAll('.grid-item');
    gridItems.forEach((item, index) => {
        const questionId = currentTest.questions[index].id;
        
        item.classList.remove('answered', 'current');
        
        if (userAnswers[questionId] !== undefined) {
            item.classList.add('answered');
        }
        
        if (index === currentQuestionIndex) {
            item.classList.add('current');
        }
    });
}

// Navigation
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

function nextQuestion() {
    if (currentQuestionIndex < currentTest.questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    }
}

function skipQuestion() {
    nextQuestion();
}

function jumpToQuestion(index) {
    currentQuestionIndex = index;
    displayQuestion();
    
    // Close grid if open
    const grid = document.getElementById('question-grid');
    const toggle = document.querySelector('.grid-toggle');
    if (grid && grid.classList.contains('active')) {
        grid.classList.remove('active');
        if (toggle) toggle.classList.remove('active');
    }
}

// Toggle question grid
function toggleQuestionGrid() {
    const grid = document.getElementById('question-grid');
    const toggle = document.querySelector('.grid-toggle');
    
    if (grid) grid.classList.toggle('active');
    if (toggle) toggle.classList.toggle('active');
}

// Show review
function showReview() {
    const answered = Object.keys(userAnswers).length;
    const unanswered = currentTest.questions.length - answered;
    
    const answeredCount = document.getElementById('answered-count');
    const unansweredCount = document.getElementById('unanswered-count');
    
    if (answeredCount) answeredCount.textContent = answered;
    if (unansweredCount) unansweredCount.textContent = unanswered;
    
    // Build review grid
    const reviewGrid = document.getElementById('review-grid');
    if (!reviewGrid) return;
    
    reviewGrid.innerHTML = '';
    
    currentTest.questions.forEach((q, index) => {
        const item = document.createElement('div');
        item.className = 'review-item';
        if (userAnswers[q.id] !== undefined) {
            item.classList.add('answered');
        }
        item.innerHTML = `
            <span style="font-size: 18px;">${q.id}</span>
            <span style="font-size: 11px;">${userAnswers[q.id] !== undefined ? '✓' : '-'}</span>
        `;
        item.onclick = () => {
            currentQuestionIndex = index;
            backToTest();
        };
        reviewGrid.appendChild(item);
    });
    
    hideAllScreensExcept('review-screen');
}

// Back to test
function backToTest() {
    hideAllScreensExcept('test-screen');
    displayQuestion();
}

// Confirm submit
function confirmSubmit() {
    const answered = Object.keys(userAnswers).length;
    const total = currentTest.questions.length;
    
    const confirmMessage = document.getElementById('confirm-message');
    if (confirmMessage) {
        confirmMessage.textContent = `You have answered ${answered}/${total} questions.`;
    }
    
    const modal = document.getElementById('confirm-modal');
    if (modal) modal.classList.add('active');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('confirm-modal');
    if (modal) modal.classList.remove('active');
}

// Submit test
function submitTest() {
    closeModal();
    clearInterval(timerInterval);
    
    console.log('Submitting test...');
    
    // Calculate results
    const results = calculateResults();
    
    // Send to bot
    sendResultsToBot(results);
    
    // Show results
    showResults(results);
}

// Auto submit (time's up)
function autoSubmitTest() {
    console.log('Time up! Auto submitting...');
    
    // Show alert
    if (tg && tg.showAlert) {
        tg.showAlert('⏰ Time is up! Submitting your test...');
    } else {
        alert('⏰ Time is up! Submitting your test...');
    }
    
    // Wait a moment then submit
    setTimeout(() => {
        submitTest();
    }, 1000);
}

// Calculate results
function calculateResults() {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    let score = 0;
    
    currentTest.questions.forEach(q => {
        const userAnswer = userAnswers[q.id];
        
        if (userAnswer === undefined) {
            skipped++;
        } else if (userAnswer === q.answer) {
            correct++;
            score += 2;
        } else {
            wrong++;
            score -= 0.667;
        }
    });
    
    // Don't allow negative scores
    score = Math.max(0, score);
    
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    return {
        score: score,
        totalMarks: currentTest.meta.totalMarks,
        correct: correct,
        wrong: wrong,
        skipped: skipped,
        timeTaken: timeTaken,
        totalQuestions: currentTest.questions.length,
        date: new Date().toISOString().split('T')[0],
        userAnswers: userAnswers
    };
}

// Send results to bot
function sendResultsToBot(results) {
    console.log('Sending results to bot:', results);
    
    // Send data to Telegram bot via WebApp API
    if (tg && tg.sendData) {
        const data = JSON.stringify({
            action: 'submit_test',
            results: {
                date: results.date,
                score: results.score,
                total_marks: results.totalMarks,
                correct: results.correct,
                wrong: results.wrong,
                skipped: results.skipped,
                time_taken: results.timeTaken
            }
        });
        console.log('Sending data:', data);
        tg.sendData(data);
    } else {
        console.warn('Telegram WebApp not available, cannot send data');
    }
}

// Show results
function showResults(results) {
    console.log('Showing results:', results);
    
    const percentage = (results.score / results.totalMarks * 100).toFixed(1);
    
    // Update result display
    const finalScore = document.getElementById('final-score');
    const finalTotal = document.getElementById('final-total');
    const percentageEl = document.getElementById('percentage');
    
    if (finalScore) finalScore.textContent = results.score;
    if (finalTotal) finalTotal.textContent = results.totalMarks;
    if (percentageEl) percentageEl.textContent = percentage + '%';
    
    const correctCount = document.getElementById('correct-count');
    const wrongCount = document.getElementById('wrong-count');
    const skippedCount = document.getElementById('skipped-count');
    
    if (correctCount) correctCount.textContent = results.correct;
    if (wrongCount) wrongCount.textContent = results.wrong;
    if (skippedCount) skippedCount.textContent = results.skipped;
    
    // Time taken
    const minutes = Math.floor(results.timeTaken / 60);
    const seconds = results.timeTaken % 60;
    const timeTaken = document.getElementById('time-taken');
    if (timeTaken) timeTaken.textContent = `${minutes}m ${seconds}s`;
    
    // Emoji and message based on percentage
    let emoji, title, message;
    
    if (percentage >= 90) {
        emoji = '🏆';
        title = 'Outstanding Performance!';
        message = 'You are a star! Keep shining! ⭐';
    } else if (percentage >= 80) {
        emoji = '🌟';
        title = 'Excellent Work!';
        message = 'Great job! You are doing amazing!';
    } else if (percentage >= 70) {
        emoji = '👏';
        title = 'Very Good!';
        message = 'Well done! Keep up the good work!';
    } else if (percentage >= 60) {
        emoji = '👍';
        title = 'Good Job!';
        message = 'Nice effort! A bit more practice will help!';
    } else if (percentage >= 40) {
        emoji = '💪';
        title = 'Keep Trying!';
        message = 'Don\'t give up! Practice makes perfect!';
    } else {
        emoji = '📚';
        title = 'Need More Practice';
        message = 'Focus on your studies. You can do better!';
    }
    
    const resultEmoji = document.getElementById('result-emoji');
    const resultTitle = document.getElementById('result-title');
    const resultMessage = document.getElementById('result-message');
    
    if (resultEmoji) resultEmoji.textContent = emoji;
    if (resultTitle) resultTitle.textContent = title;
    if (resultMessage) resultMessage.textContent = message;
    
    hideAllScreensExcept('result-screen');
    console.log('Result screen shown');
}

// View explanations
function viewExplanations() {
    console.log('View explanations clicked');
    
    // Tell bot to show explanation
    if (tg && tg.sendData) {
        tg.sendData(JSON.stringify({
            action: 'view_explanations',
            date: new Date().toISOString().split('T')[0]
        }));
    }
}

// Close app
function closeApp() {
    console.log('Closing app');
    
    if (tg && tg.close) {
        tg.close();
    } else {
        window.close();
    }
}
