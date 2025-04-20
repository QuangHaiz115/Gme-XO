// Game menu functionality
document.addEventListener('DOMContentLoaded', function() {
    // Show the menu when the page loads and hide the game
    showMenu();
    hideGame();

    // Add event listeners to menu buttons
    document.getElementById('play-with-friend').addEventListener('click', function() {
        window.singlePlayerMode = false;
        startGame();
    });

    document.getElementById('play-with-bot').addEventListener('click', function() {
        window.singlePlayerMode = true;
        startGame();
    });

    document.getElementById('how-to-play').addEventListener('click', function() {
        showHowToPlay();
    });

    document.getElementById('quit-game').addEventListener('click', function() {
        quitGame();
    });

    document.getElementById('back-to-menu').addEventListener('click', function() {
        hideHowToPlay();
        showMenu();
    });

    document.getElementById('menu-button').addEventListener('click', function() {
        hideGame();
        hideGameOverPopup();
        showMenu();
    });

    // Đảm bảo các hàm hiển thị/ẩn popup có sẵn trong window
    window.hideGameOverPopup = function() {
        const gameOverContainer = document.getElementById('game-over-container');
        if (gameOverContainer) {
            gameOverContainer.style.display = 'none';

            // Xóa confetti
            document.querySelectorAll('.confetti').forEach(el => el.remove());
        }
    };
});

function showMenu() {
    document.getElementById('menu-container').style.display = 'flex';
}

function hideMenu() {
    document.getElementById('menu-container').style.display = 'none';
}

function showGame() {
    document.getElementById('game-container').style.display = 'block';
}

function hideGame() {
    document.getElementById('game-container').style.display = 'none';
}

function showHowToPlay() {
    hideMenu();
    document.getElementById('how-to-play-container').style.display = 'block';
}

function hideHowToPlay() {
    document.getElementById('how-to-play-container').style.display = 'none';
}

function startGame() {
    hideMenu();
    showGame();

    // Update single player toggle button appearance first
    const singlePlayerToggle = document.getElementById('single-player-toggle');
    if (singlePlayerToggle) {
        if (window.singlePlayerMode) {
            singlePlayerToggle.innerHTML = '&#x1F4BB;'; // Computer icon
        } else {
            singlePlayerToggle.innerHTML = '&#x1F477; '; // Person icon
        }
    }

    // Give the DOM time to update before rendering the board
    setTimeout(function() {
        // Reset the game state
        if (typeof window.restartGame === 'function') {
            window.restartGame();
        }
    }, 100);
}

function quitGame() {
    const confirmClose = confirm('Are you sure you want to quit the game?');
    if (confirmClose) {
        window.close();

        // Some browsers prevent window.close() from working
        // Add a fallback message
        alert('This browser prevented the game from closing automatically. Please close this tab or window manually.');
    }
}