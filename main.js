document.addEventListener('DOMContentLoaded', function() {
    const dimensionButton = document.getElementById('dimension-button');
    const statusElement = document.getElementById('status');
    const restartButton = document.getElementById('restart-btn');
    const singlePlayerToggle = document.getElementById('single-player-toggle');
    const boardElement = document.getElementById('board');
    const gameOverContainer = document.getElementById('game-over-container');
    const winnerMessage = document.getElementById('winner-message');
    const winningIcon = document.getElementById('winning-icon');
    const playAgainButton = document.getElementById('play-again');
    const backToMenuFromGameOver = document.getElementById('back-to-menu-from-game-over');

    // Making variables accessible globally for computerPlayer.js
    window.dimension = 10; // Default value
    dimensionButton.textContent = `${window.dimension}x${window.dimension}`;

    window.singlePlayerMode = false;
    window.squares = Array(window.dimension).fill().map(() => Array(window.dimension).fill(null));
    window.xIsNext = Math.random() < 0.5;
    window.theWinner = null;
    window.winningLine = [];

    const dimensions = [10, 12, 16, 20];
    let dimensionIndex = 0;

    // Game over event handlers
    playAgainButton.addEventListener('click', function() {
        hideGameOverPopup();
        window.restartGame();
    });

    backToMenuFromGameOver.addEventListener('click', function() {
        hideGameOverPopup();
        if (typeof hideGame === 'function' && typeof showMenu === 'function') {
            hideGame();
            showMenu();
        }
    });

    // Making restartGame accessible globally for menu.js
    window.restartGame = function() {
        window.squares = Array(window.dimension).fill().map(() => Array(window.dimension).fill(null));
        window.xIsNext = true;
        window.theWinner = null;
        window.winningLine = [];
        renderBoard();
        updateStatus();
    };

    // Event listeners
    dimensionButton.addEventListener('click', function() {
        dimensionIndex = (dimensionIndex + 1) % dimensions.length;
        window.dimension = dimensions[dimensionIndex];
        dimensionButton.textContent = `${window.dimension}x${window.dimension}`;
        window.restartGame();
    });

    restartButton.addEventListener('click', window.restartGame);

    singlePlayerToggle.addEventListener('click', function() {
        toggleSinglePlayerMode();
        window.restartGame();
        if (window.singlePlayerMode && !window.xIsNext) {
            makeComputerMove();
        }
    });

    // Making handleClick accessible globally for computerPlayer.js
    window.handleClick = function(row, col) {
        if (window.theWinner || window.squares[row][col]) {
            return;
        }

        const newSquares = window.squares.map((row) => [...row]);
        newSquares[row][col] = window.xIsNext ? 'X' : 'O';
        window.squares = newSquares;
        window.xIsNext = !window.xIsNext;

        const winner = calculateWinner(newSquares, row, col);
        if (winner) {
            window.theWinner = winner;
            window.winningLine = findWinningLine(newSquares, row, col, winner);

            // Hiển thị popup khi có người thắng
            setTimeout(function() {
                showGameOverPopup(winner);
            }, 500); // Delay nhỏ để người chơi thấy được nước đi cuối cùng
        }

        renderBoard();
        updateStatus();

        if (window.singlePlayerMode && !window.theWinner && !window.xIsNext) {
            makeComputerMove();
        }
    }

    function calculateWinner(currentSquares, row, col) {
        const currentPlayer = currentSquares[row][col];

        // Check horizontally
        let count = 1;
        let leftCol = col - 1;
        while (leftCol >= 0 && currentSquares[row][leftCol] === currentPlayer) {
            count++;
            leftCol--;
        }
        let rightCol = col + 1;
        while (rightCol < window.dimension && currentSquares[row][rightCol] === currentPlayer) {
            count++;
            rightCol++;
        }
        if (count >= 5) {
            return currentPlayer;
        }

        // Check vertically
        count = 1;
        let topRow = row - 1;
        while (topRow >= 0 && currentSquares[topRow][col] === currentPlayer) {
            count++;
            topRow--;
        }
        let bottomRow = row + 1;
        while (bottomRow < window.dimension && currentSquares[bottomRow][col] === currentPlayer) {
            count++;
            bottomRow++;
        }
        if (count >= 5) {
            return currentPlayer;
        }

        // Check diagonally (top-left to bottom-right)
        count = 1;
        let topLeftRow = row - 1;
        let topLeftCol = col - 1;
        while (topLeftRow >= 0 && topLeftCol >= 0 && currentSquares[topLeftRow][topLeftCol] === currentPlayer) {
            count++;
            topLeftRow--;
            topLeftCol--;
        }
        let bottomRightRow = row + 1;
        let bottomRightCol = col + 1;
        while (bottomRightRow < window.dimension && bottomRightCol < window.dimension && currentSquares[bottomRightRow][bottomRightCol] === currentPlayer) {
            count++;
            bottomRightRow++;
            bottomRightCol++;
        }
        if (count >= 5) {
            return currentPlayer;
        }

        // Check diagonally (top-right to bottom-left)
        count = 1;
        let topRightRow = row - 1;
        let topRightCol = col + 1;
        while (topRightRow >= 0 && topRightCol < window.dimension && currentSquares[topRightRow][topRightCol] === currentPlayer) {
            count++;
            topRightRow--;
            topRightCol++;
        }
        let bottomLeftRow = row + 1;
        let bottomLeftCol = col - 1;
        while (bottomLeftRow < window.dimension && bottomLeftCol >= 0 && currentSquares[bottomLeftRow][bottomLeftCol] === currentPlayer) {
            count++;
            bottomLeftRow++;
            bottomLeftCol--;
        }
        if (count >= 5) {
            return currentPlayer;
        }

        return null;
    }

    function findWinningLine(currentSquares, row, col, winner) {
        const currentPlayer = currentSquares[row][col];
        const lines = [];

        // Check horizontally
        let leftCol = col - 1;
        while (leftCol >= 0 && currentSquares[row][leftCol] === currentPlayer) {
            lines.push([row, leftCol]);
            leftCol--;
        }
        lines.push([row, col]);
        let rightCol = col + 1;
        while (rightCol < window.dimension && currentSquares[row][rightCol] === currentPlayer) {
            lines.push([row, rightCol]);
            rightCol++;
        }
        if (lines.length >= 5) {
            return lines;
        }

        // Check vertically
        let topRow = row - 1;
        while (topRow >= 0 && currentSquares[topRow][col] === currentPlayer) {
            lines.push([topRow, col]);
            topRow--;
        }
        lines.push([row, col]);
        let bottomRow = row + 1;
        while (bottomRow < window.dimension && currentSquares[bottomRow][col] === currentPlayer) {
            lines.push([bottomRow, col]);
            bottomRow++;
        }
        if (lines.length >= 5) {
            return lines;
        }

        // Check diagonally (top-left to bottom-right)
        let topLeftRow = row - 1;
        let topLeftCol = col - 1;
        while (topLeftRow >= 0 && topLeftCol >= 0 && currentSquares[topLeftRow][topLeftCol] === currentPlayer) {
            lines.push([topLeftRow, topLeftCol]);
            topLeftRow--;
            topLeftCol--;
        }
        lines.push([row, col]);
        let bottomRightRow = row + 1;
        let bottomRightCol = col + 1;
        while (bottomRightRow < window.dimension && bottomRightCol < window.dimension && currentSquares[bottomRightRow][bottomRightCol] === currentPlayer) {
            lines.push([bottomRightRow, bottomRightCol]);
            bottomRightRow++;
            bottomRightCol++;
        }
        if (lines.length >= 5) {
            return lines;
        }

        // Check diagonally (top-right to bottom-left)
        let topRightRow = row - 1;
        let topRightCol = col + 1;
        while (topRightRow >= 0 && topRightCol < window.dimension && currentSquares[topRightRow][topRightCol] === currentPlayer) {
            lines.push([topRightRow, topRightCol]);
            topRightRow--;
            topRightCol++;
        }
        lines.push([row, col]);
        let bottomLeftRow = row + 1;
        let bottomLeftCol = col - 1;
        while (bottomLeftRow < window.dimension && bottomLeftCol >= 0 && currentSquares[bottomLeftRow][bottomLeftCol] === currentPlayer) {
            lines.push([bottomLeftRow, bottomLeftCol]);
            bottomLeftRow++;
            bottomLeftCol--;
        }
        if (lines.length >= 5) {
            return lines;
        }

        return [];
    }

    function renderBoard() {
        boardElement.innerHTML = '';
        for (let row = 0; row < window.dimension; row++) {
            const rowElement = document.createElement('div');
            rowElement.className = 'board-row';

            for (let col = 0; col < window.dimension; col++) {
                const value = window.squares[row][col];
                const isWinningSquare = window.winningLine.some(([winRow, winCol]) => winRow === row && winCol === col);

                const squareButton = document.createElement('button');
                squareButton.className = 'square';
                squareButton.style.backgroundColor = isWinningSquare ? 'yellow' : 'white';
                squareButton.style.color = value === 'X' ? 'blue' : 'red';
                squareButton.style.fontWeight = isWinningSquare ? 'bold' : 'normal';
                squareButton.textContent = value;
                squareButton.addEventListener('click', () => {
                    if (!window.singlePlayerMode || (window.singlePlayerMode && window.xIsNext)) {
                        window.handleClick(row, col);
                    }
                });

                rowElement.appendChild(squareButton);
            }

            boardElement.appendChild(rowElement);
        }
    }

    function updateStatus() {
        if (window.theWinner) {
            statusElement.textContent = `Chiến thắng: ${window.theWinner}`;
        } else {
            statusElement.textContent = `Người chơi: ${window.xIsNext ? 'X' : 'O'}`;
        }
    }

    function toggleSinglePlayerMode() {
        window.singlePlayerMode = !window.singlePlayerMode;
        if (window.singlePlayerMode) {
            singlePlayerToggle.innerHTML = '&#x1F4BB;';
        } else {
            singlePlayerToggle.innerHTML = '&#x1F477; ';
        }
    }

    // Hiển thị popup kết thúc trò chơi
    function showGameOverPopup(winner) {
        // Set message và icon dựa vào người thắng và chế độ chơi
        let message = '';
        let winnerClass = '';
        let icon = '🏆';

        if (window.singlePlayerMode) {
            // Chế độ chơi với máy
            if (winner === 'X') {
                message = 'Bạn đã chiến thắng!';
                winnerClass = 'winner-x';
                icon = '🎉';
            } else {
                message = 'Bot đã chiến thắng!';
                winnerClass = 'winner-o';
                icon = '🤖';
            }
        } else {
            // Chế độ chơi với bạn
            if (winner === 'X') {
                message = 'Người chơi X đã chiến thắng!';
                winnerClass = 'winner-x';
            } else {
                message = 'Người chơi O đã chiến thắng!';
                winnerClass = 'winner-o';
            }
        }

        // Cập nhật nội dung popup
        winnerMessage.textContent = message;
        winnerMessage.className = 'winner-message ' + winnerClass;
        winningIcon.textContent = icon;

        // Tạo hiệu ứng confetti
        createConfetti();

        // Hiển thị popup
        gameOverContainer.style.display = 'flex';
    }

    // Ẩn popup kết thúc trò chơi
    function hideGameOverPopup() {
        gameOverContainer.style.display = 'none';

        // Xóa confetti
        document.querySelectorAll('.confetti').forEach(el => el.remove());
    }

    // Tạo hiệu ứng confetti
    function createConfetti() {
        const colors = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f', '#ff8800', '#8800ff'];
        const container = document.querySelector('body');

        // Tạo 50 confetti
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            container.appendChild(confetti);

            // Xóa confetti sau khi animation kết thúc
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
    }

    // Initialize the game
    renderBoard();
    updateStatus();
});