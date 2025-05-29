let userSequence = [];
let currentLevel = 1;


function generateNewSequence(level) {
    const shapes = [
        [0, 1, 3, 4], // Level 1: 2x2 square
        [1, 3, 4, 5, 7], // Level 2: Plus shape
        [0, 1, 3, 4, 5, 7, 8], // Level 3: Custom 3x3
        [0, 1, 2, 3, 4, 5, 6, 7, 8] // Level 4: Full 3x3
    ];

    if (level < 1 || level > shapes.length) {
        console.error("Invalid level:", level);
        return [];
    }

    const shape = shapes[level - 1];
    return shape.sort(() => Math.random() - 0.5);
}

function createBoard(sequence) {
    const board = document.getElementById('game-board');
    board.innerHTML = '';

    const maxIndex = Math.max(...sequence);
    const gridSize = Math.ceil(Math.sqrt(maxIndex + 1));
    board.style.gridTemplateColumns = `repeat(${gridSize}, 100px)`;

    for (let i = 0; i < gridSize * gridSize; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        square.id = i;

        if (sequence.includes(i)) {
            square.addEventListener('click', () => checkSquare(i));
        } else {
            square.style.visibility = 'hidden';
        }

        board.appendChild(square);
    }

    // Add the ASCII overlay if not already present
    if (!document.getElementById('ascii-overlay')) {
        const asciiOverlay = document.createElement('div');
        asciiOverlay.id = 'ascii-overlay';
        board.appendChild(asciiOverlay);
    }
}

function checkSquare(id) {
    const square = document.getElementById(id);
    const status = document.getElementById('status');
    const asciiOverlay = document.getElementById('ascii-overlay');

    if (square.classList.contains('correct') || square.classList.contains('processing')) {
        return;
    }

    if (id === initialSequence[userSequence.length]) {
        square.classList.add('correct', 'jiggle-happy');
        setTimeout(() => square.classList.remove('jiggle-happy'), 500);
        userSequence.push(id);

        if (userSequence.length === initialSequence.length) {
            if (currentLevel < 4) {
                asciiOverlay.innerHTML = `
                    <pre style="font-family: monospace; text-align: center; color: #d3d3d3;">
 ██████╗ ███████╗██████╗ ███████╗
 ██╔══██╗██╔════╝██╔══██╗██╔════╝
 ██████╔╝█████╗  ██████╔╝█████╗  
 ██╔═══╝ ██╔══╝  ██╔═══╝ ██╔══╝  
 ██║     ███████╗██║     ███████╗
 ╚═╝     ╚══════╝╚═╝     ╚══════╝
                    </pre>
                `;
                asciiOverlay.style.display = 'block';
                status.innerText = `good job! get ready for the next level >:3`;
                userSequence = [];
                currentLevel++;

                setTimeout(() => {
                    asciiOverlay.style.display = 'none';
                }, 3000);

                setTimeout(() => {
                    initialSequence = generateNewSequence(currentLevel);
                    createBoard(initialSequence);
                }, 3100);

                setTimeout(() => {
                    status.innerText = '';
                }, 4000);
            } else {
                // ✅ Increment win count in Firebase
                if (window.winRef) {
                    firebase.functions().httpsCallable('incrementMemoryGameWins')()
                    .then((result) => {
                      console.log("Secure increment success:", result.data.newCount);
                    })
                    .catch((error) => {
                      console.error("Increment failed:", error);
                    });
                                    }
                  
                const message = 'yoooou   win!';
                status.innerHTML = '';
                message.split('').forEach((char, index) => {
                    const span = document.createElement('span');
                    span.textContent = char;
                    span.style.animationDelay = `${index * 0.1}s`;
                    span.classList.add('wave');
                    status.appendChild(span);
                });
            }
        }
    } else {
        square.classList.add('incorrect', 'jiggle-sad');
        status.innerText = 'try again D:';

        setTimeout(() => {
            square.classList.remove('incorrect', 'jiggle-sad');
            resetBoard();
            status.innerText = '';
        }, 750);
    }
}


function resetBoard(skipSquareId = null) {
    // Clear the user sequence
    userSequence = [];

    // Grab all squares
    const squares = document.querySelectorAll('.square');

    // Remove dynamic classes from each square, except the one we want to skip
    squares.forEach(square => {
        if (square.id === skipSquareId) {
            // Skip removing classes for the “incorrect” square 
            return;
        }
        // Remove any classes that mark correct/incorrect or cause animations
        square.classList.remove('correct', 'incorrect', 'jiggle-happy', 'jiggle-sad');
    });
}


function fadeToGreen() {
    const squares = document.querySelectorAll('.square');
    let opacity = 0;
    const interval = setInterval(() => {
        opacity += 0.01;
        squares.forEach(square => {
            square.style.backgroundColor = `rgba(0, 128, 0, ${opacity})`;
        });
        if (opacity >= 1) {
            clearInterval(interval);
        }
    }, 50);
}

window.onload = () => {
    initialSequence = generateNewSequence(currentLevel);
    createBoard(initialSequence);

    // ✅ WIN COUNTER TRACKING – safe to use Firebase now
    const winRef = firebase.database().ref('memoryGameWins');

    // OPTIONAL: live count on screen (only if you're displaying it)
    const winCounter = document.getElementById('win-counter');
    if (winCounter) {
        winRef.on('value', (snapshot) => {
            const count = snapshot.val() || 0;
            winCounter.textContent = `people who beat the puzzle: ${count}`;
            winCounter.style.transform = 'scale(1.1)';
            setTimeout(() => winCounter.style.transform = 'scale(1)', 200);
          });
          
    }

    // ✅ Store the ref globally if needed in checkSquare
    window.winRef = winRef;
};


document.querySelectorAll('.l33t').forEach(el => {
    const normalText = el.getAttribute('data-normal');
    const originalText = el.textContent;

    el.addEventListener('mouseenter', () => {
        if (originalText !== normalText) {
            el.textContent = normalText; // Replace with normal counterpart
        }
    });

    el.addEventListener('mouseleave', () => {
        el.textContent = originalText; // Restore leetspeak
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggle-composition');
    const languageBar = document.getElementById('language-bar');

    if (toggleButton && languageBar) {
        toggleButton.addEventListener('click', () => {
            languageBar.classList.toggle('hidden');
            languageBar.classList.toggle('visible');
        });
    }

    // leetspeak behavior: hover on desktop, tap on mobile
    document.querySelectorAll('.l33t').forEach(el => {
        const normalText = el.getAttribute('data-normal');
        const originalText = el.textContent;

        // hover effect (for desktop)
        el.addEventListener('mouseenter', () => {
            el.textContent = normalText;
        });
        el.addEventListener('mouseleave', () => {
            el.textContent = originalText;
        });

        // tap to toggle (for mobile)
        el.addEventListener('click', () => {
            el.textContent = el.textContent === normalText ? originalText : normalText;
        });
    });
});
