// Daily Test Data - Questions and Answer Keys
// Format: YYYY-MM-DD

const DAILY_TESTS = {
    "2025-10-31": {
        meta: {
            date: "31 October 2025",
            totalQuestions: 20,
            totalMarks: 80,
            duration: 60, // minutes
            leaderboardTime: "22:00" // 10 PM
        },
        questions: [
            {
                id: 1,
                question: "What is the capital of India?",
                options: ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
                answer: 1, // Index: 0=A, 1=B, 2=C, 3=D
                subject: "General Knowledge",
                difficulty: "easy"
            },
            {
                id: 2,
                question: "Who is known as the Father of the Indian Constitution?",
                options: ["Mahatma Gandhi", "Jawaharlal Nehru", "Dr. B.R. Ambedkar", "Sardar Patel"],
                answer: 2,
                subject: "History",
                difficulty: "easy"
            },
            {
                id: 3,
                question: "What is the SI unit of electric current?",
                options: ["Volt", "Ampere", "Ohm", "Watt"],
                answer: 1,
                subject: "Physics",
                difficulty: "easy"
            },
            {
                id: 4,
                question: "Which river is known as the 'Ganga of the South'?",
                options: ["Krishna", "Godavari", "Kaveri", "Narmada"],
                answer: 1,
                subject: "Geography",
                difficulty: "medium"
            },
            {
                id: 5,
                question: "What is the value of √144?",
                options: ["10", "11", "12", "13"],
                answer: 2,
                subject: "Mathematics",
                difficulty: "easy"
            },
            {
                id: 6,
                question: "Which of the following is a greenhouse gas?",
                options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
                answer: 2,
                subject: "Science",
                difficulty: "easy"
            },
            {
                id: 7,
                question: "In which year did India gain independence?",
                options: ["1945", "1946", "1947", "1948"],
                answer: 2,
                subject: "History",
                difficulty: "easy"
            },
            {
                id: 8,
                question: "What is the chemical formula of water?",
                options: ["H2O", "CO2", "O2", "H2SO4"],
                answer: 0,
                subject: "Chemistry",
                difficulty: "easy"
            },
            {
                id: 9,
                question: "Who wrote 'Gitanjali'?",
                options: ["Rabindranath Tagore", "Sarojini Naidu", "R.K. Narayan", "Munshi Premchand"],
                answer: 0,
                subject: "Literature",
                difficulty: "easy"
            },
            {
                id: 10,
                question: "What is the largest planet in our solar system?",
                options: ["Earth", "Mars", "Jupiter", "Saturn"],
                answer: 2,
                subject: "Science",
                difficulty: "easy"
            },
            {
                id: 11,
                question: "What is 15% of 200?",
                options: ["20", "25", "30", "35"],
                answer: 2,
                subject: "Mathematics",
                difficulty: "medium"
            },
            {
                id: 12,
                question: "Which article of the Indian Constitution abolished untouchability?",
                options: ["Article 14", "Article 15", "Article 17", "Article 19"],
                answer: 2,
                subject: "Polity",
                difficulty: "medium"
            },
            {
                id: 13,
                question: "What is the speed of light in vacuum?",
                options: ["3 × 10⁸ m/s", "3 × 10⁷ m/s", "3 × 10⁹ m/s", "3 × 10⁶ m/s"],
                answer: 0,
                subject: "Physics",
                difficulty: "medium"
            },
            {
                id: 14,
                question: "Which mountain range separates Europe from Asia?",
                options: ["Himalayas", "Alps", "Ural Mountains", "Andes"],
                answer: 2,
                subject: "Geography",
                difficulty: "medium"
            },
            {
                id: 15,
                question: "What is the powerhouse of the cell?",
                options: ["Nucleus", "Mitochondria", "Ribosome", "Chloroplast"],
                answer: 1,
                subject: "Biology",
                difficulty: "easy"
            },
            {
                id: 16,
                question: "If a = 5 and b = 3, what is (a + b)²?",
                options: ["64", "56", "49", "36"],
                answer: 0,
                subject: "Mathematics",
                difficulty: "medium"
            },
            {
                id: 17,
                question: "Who discovered penicillin?",
                options: ["Louis Pasteur", "Alexander Fleming", "Marie Curie", "Isaac Newton"],
                answer: 1,
                subject: "Science",
                difficulty: "medium"
            },
            {
                id: 18,
                question: "Which Indian state has the longest coastline?",
                options: ["Maharashtra", "Gujarat", "Tamil Nadu", "Andhra Pradesh"],
                answer: 1,
                subject: "Geography",
                difficulty: "hard"
            },
            {
                id: 19,
                question: "What is the national game of India?",
                options: ["Cricket", "Hockey", "Football", "Kabaddi"],
                answer: 1,
                subject: "General Knowledge",
                difficulty: "easy"
            },
            {
                id: 20,
                question: "Who was the first woman Prime Minister of India?",
                options: ["Sarojini Naidu", "Indira Gandhi", "Pratibha Patil", "Sonia Gandhi"],
                answer: 1,
                subject: "History",
                difficulty: "easy"
            }
        ]
    }
};

// Get today's test
function getTodayTest() {
    const today = new Date().toISOString().split('T')[0];
    return DAILY_TESTS[today] || null;
}

// Get test by date
function getTestByDate(dateStr) {
    return DAILY_TESTS[dateStr] || null;
}
