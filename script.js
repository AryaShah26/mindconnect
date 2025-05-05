// DOM Elements
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('.section');
const moodOptions = document.querySelectorAll('.mood-option');
const moodQuoteText = document.getElementById('mood-quote-text');
const moodHistoryContainer = document.getElementById('mood-history-container');
const timerBtns = document.querySelectorAll('.timer-btn');
const startTimerBtn = document.getElementById('start-timer');
const stopTimerBtn = document.getElementById('stop-timer');
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const breathingCircle = document.querySelector('.breathing-circle');
const journalTitle = document.getElementById('journal-title');
const journalContent = document.getElementById('journal-content');
const saveJournalBtn = document.getElementById('save-journal');
const downloadJournalBtn = document.getElementById('download-journal');
const journalEntriesContainer = document.getElementById('journal-entries-container');
const affirmationText = document.getElementById('affirmation-text');
const newAffirmationBtn = document.getElementById('new-affirmation');
const copyAffirmationBtn = document.getElementById('copy-affirmation');
const favoriteAffirmationBtn = document.getElementById('favorite-affirmation');
const favoriteAffirmationsContainer = document.getElementById('favorite-affirmations-container');
const doodleCanvas = document.getElementById('doodle-canvas');
const colorPicker = document.getElementById('color-picker');
const brushSize = document.getElementById('brush-size');
const clearCanvasBtn = document.getElementById('clear-canvas');
const downloadCanvasBtn = document.getElementById('download-canvas');

// Initialize the app
function initApp() {
    setupNavigation();
    setupMoodSelector();
    setupMeditationTimer();
    setupJournal();
    setupAffirmations();
    setupDoodlePad();
    loadDataFromLocalStorage();
}

// Navigation
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show corresponding section
            const targetId = link.getAttribute('href').substring(1);
            sections.forEach(section => {
                section.classList.add('hidden');
                if (section.id === targetId) {
                    section.classList.remove('hidden');
                }
            });
        });
    });
}

// Mood Selector
function setupMoodSelector() {
    const moodQuotes = {
        happy: "Happiness is not something ready-made. It comes from your own actions.",
        sad: "Even the darkest night will end and the sun will rise.",
        calm: "Peace comes from within. Do not seek it without.",
        anxious: "You are braver than you believe, stronger than you seem, and smarter than you think.",
        irritated: "Take a deep breath. It's just a bad day, not a bad life.",
        angry: "For every minute you are angry you lose sixty seconds of happiness."
    };
    
    moodOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Update selected mood
            moodOptions.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            
            // Update quote
            const mood = option.getAttribute('data-mood');
            moodQuoteText.textContent = moodQuotes[mood];
            
            // Save mood to history
            saveMoodToHistory(mood);
        });
    });
}

function saveMoodToHistory(mood) {
    const date = new Date();
    const moodData = {
        mood: mood,
        timestamp: date.toISOString(),
        displayDate: date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    
    // Get existing history or initialize new array
    let moodHistory = JSON.parse(localStorage.getItem('moodHistory')) || [];
    
    // Add new mood to history
    moodHistory.push(moodData);
    
    // Limit history to last 10 entries
    if (moodHistory.length > 10) {
        moodHistory = moodHistory.slice(-10);
    }
    
    // Save to localStorage
    localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
    
    // Update UI
    displayMoodHistory();
}

function displayMoodHistory() {
    const moodHistory = JSON.parse(localStorage.getItem('moodHistory')) || [];
    
    // Clear container
    moodHistoryContainer.innerHTML = '';
    
    // Display mood history (most recent first)
    moodHistory.slice().reverse().forEach(entry => {
        const moodItem = document.createElement('div');
        moodItem.className = 'mood-history-item';
        
        // Get emoji based on mood
        let emoji;
        switch(entry.mood) {
            case 'happy': emoji = '😄'; break;
            case 'sad': emoji = '😔'; break;
            case 'calm': emoji = '😌'; break;
            case 'anxious': emoji = '😟'; break;
            case 'irritated': emoji = '😠'; break;
            case 'angry': emoji = '😡'; break;
            default: emoji = '😐';
        }
        
        moodItem.innerHTML = `
            <span>${emoji}</span>
            <span>${entry.displayDate}</span>
        `;
        
        moodHistoryContainer.appendChild(moodItem);
    });
    
    // Show message if no history
    if (moodHistory.length === 0) {
        moodHistoryContainer.innerHTML = '<p>No mood history yet. Select a mood to start tracking.</p>';
    }
}

// Meditation Timer
function setupMeditationTimer() {
    let timerDuration = 5; // Default 5 minutes
    let timerInterval;
    let timeLeft;
    let isTimerRunning = false;
    
    // Set active timer button
    timerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            timerBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            timerDuration = parseInt(btn.getAttribute('data-time'));
            updateTimerDisplay(timerDuration * 60);
        });
    });
    
    // Set default active button
    timerBtns[0].classList.add('active');
    updateTimerDisplay(timerDuration * 60);
    
    // Start timer
    startTimerBtn.addEventListener('click', () => {
        if (isTimerRunning) return;
        
        isTimerRunning = true;
        startTimerBtn.classList.add('hidden');
        stopTimerBtn.classList.remove('hidden');
        
        // Start breathing animation
        breathingCircle.style.animationPlayState = 'running';
        
        // Set timer
        timeLeft = timerDuration * 60;
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay(timeLeft);
            
            if (timeLeft <= 0) {
                endMeditation();
            }
        }, 1000);
    });
    
    // Stop timer
    stopTimerBtn.addEventListener('click', endMeditation);
    
    function endMeditation() {
        clearInterval(timerInterval);
        isTimerRunning = false;
        startTimerBtn.classList.remove('hidden');
        stopTimerBtn.classList.add('hidden');
        updateTimerDisplay(timerDuration * 60);
        breathingCircle.style.animationPlayState = 'paused';
    }
    
    function updateTimerDisplay(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        minutesDisplay.textContent = mins.toString().padStart(2, '0');
        secondsDisplay.textContent = secs.toString().padStart(2, '0');
    }
}

// Journal
function setupJournal() {
    // Save journal entry
    saveJournalBtn.addEventListener('click', () => {
        const title = journalTitle.value.trim();
        const content = journalContent.value.trim();
        
        if (!title || !content) {
            alert('Please enter both a title and content for your journal entry.');
            return;
        }
        
        const date = new Date();
        const entry = {
            title: title,
            content: content,
            timestamp: date.toISOString(),
            displayDate: date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        
        // Get existing entries or initialize new array
        let journalEntries = JSON.parse(localStorage.getItem('journalEntries')) || [];
        
        // Add new entry
        journalEntries.push(entry);
        
        // Save to localStorage
        localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
        
        // Clear form
        journalTitle.value = '';
        journalContent.value = '';
        
        // Update UI
        displayJournalEntries();
        
        alert('Journal entry saved successfully!');
    });
    
    // Download journal entries
    downloadJournalBtn.addEventListener('click', () => {
        const journalEntries = JSON.parse(localStorage.getItem('journalEntries')) || [];
        
        if (journalEntries.length === 0) {
            alert('No journal entries to download.');
            return;
        }
        
        let content = 'MindConnect Journal Entries\n\n';
        
        journalEntries.forEach(entry => {
            content += `Date: ${entry.displayDate}\n`;
            content += `Title: ${entry.title}\n`;
            content += `${entry.content}\n\n`;
        });
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mindconnect-journal.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

function displayJournalEntries() {
    const journalEntries = JSON.parse(localStorage.getItem('journalEntries')) || [];
    
    // Clear container
    journalEntriesContainer.innerHTML = '';
    
   
    journalEntries.slice().reverse().forEach(entry => {
        const entryItem = document.createElement('div');
        entryItem.className = 'journal-entry-item';
        
        entryItem.innerHTML = `
            <h4>${entry.title}</h4>
            <p class="journal-entry-date">${entry.displayDate}</p>
        `;
        
        entryItem.addEventListener('click', () => {
            journalTitle.value = entry.title;
            journalContent.value = entry.content;
        });
        
        journalEntriesContainer.appendChild(entryItem);
    });
    
    // Show message if no entries
    if (journalEntries.length === 0) {
        journalEntriesContainer.innerHTML = '<p>No journal entries yet. Write your first entry!</p>';
    }
}

// Affirmations
function setupAffirmations() {
    const affirmations = [
        "I am enough just as I am.",
        "I believe in myself and my abilities.",
        "I am in control of my thoughts and emotions.",
        "I am worthy of love and respect.",
        "I choose to be happy and positive today.",
        "I am grateful for all that I have.",
        "I am becoming better every day.",
        "I trust my intuition and inner wisdom.",
        "I release all negativity from my mind and body.",
        "I am capable of overcoming any challenge.",
        "My potential is limitless.",
        "I radiate confidence and positivity.",
        "I am surrounded by love and support.",
        "I am at peace with my past.",
        "I welcome joy and abundance into my life.",
        "I am strong in mind, body, and spirit.",
        "I am creating the life of my dreams.",
        "I forgive myself and others.",
        "I am exactly where I need to be right now.",
        "I love and accept myself completely."
    ];
    
    // Generate random affirmation
    newAffirmationBtn.addEventListener('click', () => {
        const randomIndex = Math.floor(Math.random() * affirmations.length);
        affirmationText.textContent = affirmations[randomIndex];
        
        // Add fade-in effect
        affirmationText.style.opacity = '0';
        setTimeout(() => {
            affirmationText.style.opacity = '1';
        }, 100);
    });
    
    copyAffirmationBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(affirmationText.textContent)
            .then(() => {
                const originalText = copyAffirmationBtn.textContent;
                copyAffirmationBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyAffirmationBtn.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                alert('Failed to copy affirmation. Please try again.');
            });
    });
    
    // Add to favorites
    favoriteAffirmationBtn.addEventListener('click', () => {
        const affirmation = affirmationText.textContent;
        
        // Get existing favorites or initialize new array
        let favorites = JSON.parse(localStorage.getItem('favoriteAffirmations')) || [];
        
        // Check if already in favorites
        if (favorites.includes(affirmation)) {
            alert('This affirmation is already in your favorites.');
            return;
        }
        
        // Add to favorites
        favorites.push(affirmation);
        
        // Save to localStorage
        localStorage.setItem('favoriteAffirmations', JSON.stringify(favorites));
        
        // Update UI
        displayFavoriteAffirmations();
        
        // Confirmation
        const originalText = favoriteAffirmationBtn.textContent;
        favoriteAffirmationBtn.textContent = 'Added!';
        setTimeout(() => {
            favoriteAffirmationBtn.textContent = originalText;
        }, 2000);
    });
}

function displayFavoriteAffirmations() {
    const favorites = JSON.parse(localStorage.getItem('favoriteAffirmations')) || [];
    
    // Clear container
    favoriteAffirmationsContainer.innerHTML = '';
    
    // Display favorites
    favorites.forEach((affirmation, index) => {
        const favoriteItem = document.createElement('div');
        favoriteItem.className = 'favorite-item';
        
        favoriteItem.innerHTML = `
            <p>${affirmation}</p>
            <span class="remove-favorite" data-index="${index}">×</span>
        `;
        
        favoriteAffirmationsContainer.appendChild(favoriteItem);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-favorite').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            removeFavoriteAffirmation(index);
        });
    });
    
    // Show message if no favorites
    if (favorites.length === 0) {
        favoriteAffirmationsContainer.innerHTML = '<p>No favorite affirmations yet. Click "Add to Favorites" to save affirmations you like.</p>';
    }
}

function removeFavoriteAffirmation(index) {
    let favorites = JSON.parse(localStorage.getItem('favoriteAffirmations')) || [];
    
    // Remove item at index
    favorites.splice(index, 1);
    
    // Save to localStorage
    localStorage.setItem('favoriteAffirmations', JSON.stringify(favorites));
    
    // Update UI
    displayFavoriteAffirmations();
}


// Load data from localStorage
function loadDataFromLocalStorage() {
    displayMoodHistory();
    displayJournalEntries();
    displayFavoriteAffirmations();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);