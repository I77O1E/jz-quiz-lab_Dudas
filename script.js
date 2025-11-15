const quizData = [
    {
        question: "What does 'let' declare in JavaScript?",
        options: ["A constant value", "A changeable variable", "A function", "An array"],
        correct: 1
    },
    {
        question: "Which is the strict equality operator?",
        options: ["==", "=", "===", "!="],
        correct: 2
    },
    {
        question: "What is the purpose of a for loop?",
        options: ["To declare variables", "To repeat code a set number of times", "To handle events", "To style elements"],
        correct: 1
    },
    {
        question: "How do you select an element by ID in the DOM?",
        options: ["querySelector", "getElementById", "createElement", "appendChild"],
        correct: 1
    },
    {
        question: "What does HTML stand for?",
        options: ["Hyperlinks and Text Markup Language", "Home Tool Markup Language", "HyperText Markup Language", "Hyper Transfer Markup Language"],
        correct: 2
    },
    {
        question: "Which HTML tag is used to display the largest heading?",
        options: ["<h6>", "<heading>", "<h1>", "<head>"],
        correct: 2
    },
];
let currentQuestion = 0;
let score = 0;
let totalQuestions = quizData.length;
let selectedAnswer = -1;
let timerInterval; // For per-question timer
let timeLeft = 30; // 30 seconds per question
let highScore = localStorage.getItem('jsQuizHighScore') || 0;

function startQuiz() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    loadQuestion();  // NOW the quiz begins
}

// Utility: Update progress bar
function updateProgress() {
    const progress = ((currentQuestion + 1) / totalQuestions) * 100;
    const progressFill = document.getElementById('progress-fill');
    progressFill.style.width = progress + '%';
    document.getElementById('current-q').textContent = currentQuestion + 1;
    document.getElementById('total-q').textContent = totalQuestions;
    const hueStart = 0;
    const hueEnd = 120;
    const currentHue = hueStart + (hueEnd - hueStart) * (progress / 100);
    progressFill.style.background = `linear-gradient(90deg, hsl(${currentHue}, 80%, 60%), hsl(${currentHue + 20}, 80%, 50%))`;
}

// Extension: Start timer for each question
function startTimer() {
    timeLeft = 30;
    document.getElementById('timer-container').style.display = 'block';
    document.getElementById('timer-text').textContent = timeLeft;
    document.getElementById('timer-fill').style.width = '100%';
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-text').textContent = timeLeft;
        document.getElementById('timer-fill').style.width = (timeLeft / 30 * 100) + '%';
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            nextQuestion(); // Auto-advance on timeout
        }
    }, 1000);
}
// Extension: Clear timer
function clearTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        document.getElementById('timer-container').style.display = 'none';
    }
}
function loadQuestion() {
    try {
        const q = quizData[currentQuestion];
        if (!q) throw new Error('No question data');
        document.getElementById('question').textContent = q.question;
        const optionsDiv = document.getElementById('options');
        optionsDiv.innerHTML = '';
        q.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.textContent = option;
            btn.classList.add('option');
            btn.setAttribute('aria-label', `Option: ${option}`);
            btn.onclick = () => selectOption(index);
            optionsDiv.appendChild(btn);
        });
        document.getElementById('next-btn').style.display = 'none';
        updateProgress();
        startTimer(); // Extension: Timer starts
    } catch (error) {
        console.error('Error loading question:', error);
        document.getElementById('question').innerHTML = '<p style="color: red;">Error loading question. Check console.</p >';
    }

}

// Play sound using Web Audio API
function playSound(type) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Sound types: 'correct' = pleasant tone, 'incorrect' = short buzz
    if (type === 'correct') {
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    } else if (type === 'incorrect') {
        osc.type = 'square';
        osc.frequency.value = 220;
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
}

function selectOption(index) {
    if (selectedAnswer !== -1) return; // Prevent multiple selections
    selectedAnswer = index;
    clearTimer(); // Stop timer on answer
    const options = document.querySelectorAll('.option');
    options.forEach((opt, i) => {
        opt.disabled = true; // Disable after selection
        opt.classList.remove('correct', 'incorrect');
        if (i === quizData[currentQuestion].correct) {
            opt.classList.add('correct');
            if (i === index) playSound('correct'); // ✅ play correct chime
        } else if (i === index && index !== quizData[currentQuestion].correct) {
            opt.classList.add('incorrect');
            playSound('incorrect'); // ❌ play error buzz
        }
    });
    document.getElementById('next-btn').style.display = 'block';
}
function nextQuestion() {
    if (selectedAnswer === quizData[currentQuestion].correct) {
        score++;
    }
    currentQuestion++;
    selectedAnswer = -1;
    if (currentQuestion < totalQuestions) {
        loadQuestion();
    } else {
        showScore();
    }
}
function updateScoreCircle(percentage) {
  const circle = document.querySelector('.progress-ring__circle');
  const radius = circle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;

  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = circumference;

  const offset = circumference - (percentage / 100) * circumference;
  circle.style.strokeDashoffset = offset;

  const scoreText = document.querySelector('.score-circle-text');
  scoreText.textContent = `${percentage}%`;

  const scoreCircle = document.querySelector('.score-circle');
  scoreCircle.setAttribute('aria-valuenow', percentage);
}
function showScore() {
    clearTimer();
    document.getElementById('question-container').style.display = 'none';
    document.getElementById('score-container').style.display = 'block';
    const percentage = Math.round((score / totalQuestions) * 100);

    updateScoreCircle(percentage);
    document.querySelector('.score-circle-text').textContent = percentage + '%';

    let feedback = '';
    if (percentage >= 80) feedback = "Outstanding! You're a JavaScript wizard. 🌟";
    else if (percentage >= 60) feedback = "Well done! Keep practicing those concepts. 👍";
    else feedback = "Good start—dive back into the lecture notes for a refresh. 📚";

    document.getElementById('feedback').textContent = feedback;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('jsQuizHighScore', highScore);
        document.getElementById('high-score').style.display = 'block';
        document.getElementById('high-score-val').textContent = highScore;
    }
}

function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    selectedAnswer = -1;
    quizData.sort(() => Math.random() - 0.5);

    document.getElementById('question-container').style.display = 'block';
    document.getElementById('score-container').style.display = 'none';
    document.getElementById('high-score').style.display = 'none';
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('current-q').textContent = 1;
    document.getElementById('timer-fill').style.width = '100%';

    loadQuestion();
}
// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('start-btn').addEventListener('click', startQuiz);
});
