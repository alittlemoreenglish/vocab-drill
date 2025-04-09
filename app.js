let currentWords = [];
let missedWords = [];
let currentWordBank = '';
let startTime;
let totalPoints = parseInt(localStorage.getItem('totalPoints')) || 0;
let wordsMastered = parseInt(localStorage.getItem('wordsMastered')) || 0;

function showMainMenu() {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('main-menu').classList.add('active');
    // Reset to default avatar
    document.getElementById('avatar').src = "https://alittlemoreenglish.weebly.com/uploads/2/6/6/3/26638990/1_orig.png";
    updateCustomBanksDisplay();
    updateStats();
}

function startWordBank(bankName) {
    currentWordBank = bankName;
    const bank = bankName.startsWith('custom_') ? 
        customBanks[bankName.replace('custom_', '')] :
        wordBanks[bankName];
    
    // Randomly select 10 words
    const allWords = Object.keys(bank);
    currentWords = [];
    while (currentWords.length < 10 && allWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * allWords.length);
        currentWords.push(allWords.splice(randomIndex, 1)[0]);
    }
    
    missedWords = [];
    startTime = new Date();
    
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('practice').classList.add('active');

    // Show "Ready?" avatar and message
    document.getElementById('avatar').src = "https://alittlemoreenglish.weebly.com/uploads/2/6/6/3/26638990/4_orig.png";
    
    // Add a slight delay before showing the first word
    setTimeout(showNextWord, 1000);
}

function showNextWord() {
    // Show "Ready?" avatar first
    document.getElementById('avatar').src = "https://alittlemoreenglish.weebly.com/uploads/2/6/6/3/26638990/4_orig.png";
    
    if (currentWords.length === 0) {
        showResults();
        return;
    }

    const currentWord = currentWords[0];
    const bank = currentWordBank.startsWith('custom_') ? 
        customBanks[currentWordBank.replace('custom_', '')] :
        wordBanks[currentWordBank];
    
    document.getElementById('word').textContent = `Question ${11-currentWords.length}/10: ${currentWord}`;
    
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    // Shuffle options
    const options = bank[currentWord].options;
    const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
    
    shuffledOptions.forEach(option => {
        const button = document.createElement('div');
        button.className = 'option';
        button.textContent = option;
        button.onclick = () => {
            // Reset avatar to default when user makes a selection
            document.getElementById('avatar').src = "https://alittlemoreenglish.weebly.com/uploads/2/6/6/3/26638990/1_orig.png";
            checkAnswer(option, bank[currentWord].options[0], bank[currentWord].explanation);
        };
        optionsContainer.appendChild(button);
    });

    document.getElementById('explanation').classList.add('hidden');
    document.getElementById('next-word-btn').classList.add('hidden');
    updateProgress();
}

function checkAnswer(selected, correct, explanation) {
    const options = document.querySelectorAll('.option');
    const avatar = document.getElementById('avatar');
    
    options.forEach(option => {
        option.onclick = null;
        if (option.textContent === correct) {
            option.classList.add('correct');
        } else if (option.textContent === selected && selected !== correct) {
            option.classList.add('incorrect');
        }
    });

    if (selected !== correct) {
        missedWords.push(currentWords[0]);
        avatar.src = "https://alittlemoreenglish.weebly.com/uploads/2/6/6/3/26638990/3_orig.png";
    } else {
        avatar.src = "https://alittlemoreenglish.weebly.com/uploads/2/6/6/3/26638990/2_orig.png";
    }

    document.getElementById('explanation').textContent = explanation;
    document.getElementById('explanation').classList.remove('hidden');
    document.getElementById('next-word-btn').classList.remove('hidden');
    
    currentWords.shift();
}

function showResults() {
    const endTime = new Date();
    const timeUsed = Math.round((endTime - startTime) / 1000);
    const correctCount = 10 - missedWords.length;
    const points = correctCount * 10;
    totalPoints += points;
    
    if (correctCount === 10) {
        wordsMastered++;
    }
    
    localStorage.setItem('totalPoints', totalPoints);
    localStorage.setItem('wordsMastered', wordsMastered);
    
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('results').classList.add('active');
    
    const scoreDisplay = document.getElementById('score-display');
    scoreDisplay.innerHTML = `
        <p>Time used: ${timeUsed} seconds</p>
        <p>Correct answers: ${correctCount}/10</p>
        <p>Points earned: ${points}</p>
    `;
    
    const needsPractice = document.getElementById('needs-practice');
    if (missedWords.length > 0) {
        needsPractice.innerHTML = '<h3>Words to Practice:</h3>' + 
            missedWords.join(', ');
        document.querySelector('#results button:last-child').style.display = 'block';
    } else {
        needsPractice.innerHTML = '<h3>Perfect Score! </h3>';
        document.querySelector('#results button:last-child').style.display = 'none';
    }
}

function retryMissedWords() {
    currentWords = [...missedWords];
    missedWords = [];
    startTime = new Date();
    
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('practice').classList.add('active');
    showNextWord();
}

function showCustomBank() {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('custom-bank').classList.add('active');
    // Set the custom bank avatar
    document.getElementById('avatar').src = "https://alittlemoreenglish.weebly.com/uploads/2/6/6/3/26638990/5_orig.png";
}

function saveCustomBank() {
    const name = document.getElementById('custom-bank-name').value.trim();
    const wordsText = document.getElementById('custom-words').value.trim();
    
    if (!name) {
        alert('Please enter a name for your word bank');
        return;
    }
    
    const wordPairs = wordsText.split('\n')
        .map(line => line.trim())
        .filter(line => line.includes(':'));
        
    if (wordPairs.length < 10) {
        alert('Please enter at least 10 words with definitions');
        return;
    }
    
    const wordBank = {};
    wordPairs.forEach(pair => {
        const [word, definition] = pair.split(':').map(s => s.trim());
        wordBank[word] = {
            definition: definition,
            explanation: definition,
            options: [definition] // We'll add random options later
        };
    });
    
    // Add random options for each word
    const allDefinitions = wordPairs.map(pair => pair.split(':')[1].trim());
    Object.keys(wordBank).forEach(word => {
        const correctDef = wordBank[word].definition;
        const otherDefs = allDefinitions.filter(def => def !== correctDef);
        const randomDefs = otherDefs.sort(() => Math.random() - 0.5).slice(0, 3);
        wordBank[word].options = [correctDef, ...randomDefs].sort(() => Math.random() - 0.5);
    });
    
    const banks = JSON.parse(localStorage.getItem('customBanks') || '{}');
    banks[name] = wordBank;
    localStorage.setItem('customBanks', JSON.stringify(banks));
    
    document.getElementById('custom-bank-name').value = '';
    document.getElementById('custom-words').value = '';
    
    updateCustomBanksDisplay();
    showMainMenu();
}

function updateCustomBanksDisplay() {
    const container = document.getElementById('custom-banks-container');
    const banks = JSON.parse(localStorage.getItem('customBanks') || '{}');
    
    container.innerHTML = '';
    Object.keys(banks).forEach(bankName => {
        const button = document.createElement('button');
        button.textContent = bankName;
        button.onclick = () => startWordBank('custom_' + bankName);
        container.appendChild(button);
    });
}

function updateStats() {
    document.getElementById('total-points').textContent = totalPoints;
    document.getElementById('words-mastered').textContent = wordsMastered;
    updateBadges();
}

function updateBadges() {
    const badges = document.getElementById('badges');
    badges.innerHTML = '';
    
    if (wordsMastered >= 1) badges.innerHTML += '<span class="badge">Beginner</span>';
    if (wordsMastered >= 5) badges.innerHTML += '<span class="badge">Amateur</span>';
    if (wordsMastered >= 10) badges.innerHTML += '<span class="badge">Expert</span>';
    if (totalPoints >= 1000) badges.innerHTML += '<span class="badge">Point Master</span>';
}

function confirmBackToMenu() {
    if (confirm('Are you sure you want to go back to the menu? Your progress will be lost.')) {
        showMainMenu();
    }
}

function updateProgress(isCustomBank = false) {
    const total = 10; 
    const completed = 10 - currentWords.length;
    const progress = (completed / total) * 100;
    document.getElementById('progress').style.width = `${progress}%`;
}

document.addEventListener('DOMContentLoaded', () => {
    showMainMenu();
});