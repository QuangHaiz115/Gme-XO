// Computer player logic for the Tic-Tac-Toe game
function makeComputerMove() {
    if (!window.singlePlayerMode || window.theWinner) {
        return;
    }

    const humanPlayer = window.xIsNext ? 'X' : 'O';
    const computerPlayer = window.xIsNext ? 'O' : 'X';

    // For very large boards, we'll limit where we consider moves to make minimax feasible
    // Get only viable moves (near existing pieces or center for first move)
    const viableMoves = getViableMoves(window.squares, computerPlayer, humanPlayer);

    if (viableMoves.length > 0) {
        let bestMove;

        // If it's the first move or very early in the game, play near the center
        if (countNonEmptySquares(window.squares) <= 2) {
            const center = Math.floor(window.dimension / 2);
            const offset = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
            bestMove = [center + offset, center + offset];
        } else {
            // Check if computer can win in one move
            bestMove = findWinningMove(window.squares, computerPlayer);

            // If no immediate win, check if need to block human
            if (!bestMove) {
                bestMove = findWinningMove(window.squares, humanPlayer);
            }

            // If no immediate win or block needed, use minimax with limited depth
            if (!bestMove) {
                // Limit search space based on board size
                const searchDepth = calculateSearchDepth(window.dimension, viableMoves.length);
                const result = minimax(window.squares, searchDepth, true, computerPlayer, humanPlayer, -Infinity, Infinity);
                bestMove = result.move;
            }
        }

        if (bestMove) {
            window.handleClick(bestMove[0], bestMove[1]);
        }
    }
}

// Helper function to count non-empty squares
function countNonEmptySquares(board) {
    let count = 0;
    for (let row = 0; row < window.dimension; row++) {
        for (let col = 0; col < window.dimension; col++) {
            if (board[row][col]) {
                count++;
            }
        }
    }
    return count;
}

// Calculate appropriate search depth based on board size and number of viable moves
function calculateSearchDepth(dimension, movesCount) {
    // Limit search depth for larger boards to keep the algorithm responsive
    if (dimension >= 16) return 2;
    if (dimension >= 12) return 3;
    if (movesCount > 15) return 2;
    return 3; // Default depth for 10x10 board with few moves
}

// Find moves that are viable (near existing pieces)
function getViableMoves(board, computerPlayer, humanPlayer) {
    const viableMoves = [];
    const seen = {}; // To track already added moves

    // First, check if board is empty - if so, return center area
    let isEmpty = true;
    for (let row = 0; row < window.dimension; row++) {
        for (let col = 0; col < window.dimension; col++) {
            if (board[row][col]) {
                isEmpty = false;
                break;
            }
        }
        if (!isEmpty) break;
    }

    if (isEmpty) {
        const center = Math.floor(window.dimension / 2);
        return [
            [center, center]
        ];
    }

    // Find viable moves around existing pieces
    for (let row = 0; row < window.dimension; row++) {
        for (let col = 0; col < window.dimension; col++) {
            if (board[row][col]) { // If there's a piece here
                // Check surrounding cells (within 2 spaces)
                for (let i = -2; i <= 2; i++) {
                    for (let j = -2; j <= 2; j++) {
                        const newRow = row + i;
                        const newCol = col + j;

                        // Skip if outside board or already seen
                        if (newRow < 0 || newRow >= window.dimension ||
                            newCol < 0 || newCol >= window.dimension ||
                            seen[`${newRow},${newCol}`]) {
                            continue;
                        }

                        // Add empty cells near pieces
                        if (!board[newRow][newCol]) {
                            viableMoves.push([newRow, newCol]);
                            seen[`${newRow},${newCol}`] = true;
                        }
                    }
                }
            }
        }
    }

    return viableMoves;
}

// Find an immediate winning move if available
function findWinningMove(board, player) {
    for (let row = 0; row < window.dimension; row++) {
        for (let col = 0; col < window.dimension; col++) {
            if (!board[row][col]) {
                const newBoard = board.map(row => [...row]);
                newBoard[row][col] = player;

                if (calculateWinnerForComputer(newBoard, row, col) === player) {
                    return [row, col];
                }
            }
        }
    }
    return null;
}

// Minimax algorithm with alpha-beta pruning
function minimax(board, depth, isMaximizing, computerPlayer, humanPlayer, alpha, beta) {
    // Terminal cases: winning state or depth limit reached
    if (depth === 0) {
        return {
            score: evaluateBoard(board, computerPlayer, humanPlayer),
            move: null
        };
    }

    // Get viable moves to consider
    const viableMoves = getViableMoves(board, computerPlayer, humanPlayer);

    if (viableMoves.length === 0) {
        return {
            score: 0,
            move: null
        };
    }

    let bestMove = null;

    if (isMaximizing) {
        let bestScore = -Infinity;

        for (const [row, col] of viableMoves) {
            if (!board[row][col]) {
                // Try this move
                const newBoard = board.map(row => [...row]);
                newBoard[row][col] = computerPlayer;

                // Check if winning move
                if (calculateWinnerForComputer(newBoard, row, col) === computerPlayer) {
                    return {
                        score: 1000,
                        move: [row, col]
                    };
                }

                const result = minimax(newBoard, depth - 1, false, computerPlayer, humanPlayer, alpha, beta);

                if (result.score > bestScore) {
                    bestScore = result.score;
                    bestMove = [row, col];
                }

                alpha = Math.max(alpha, bestScore);
                if (beta <= alpha) {
                    break; // Beta cutoff
                }
            }
        }

        return {
            score: bestScore,
            move: bestMove
        };
    } else {
        let bestScore = Infinity;

        for (const [row, col] of viableMoves) {
            if (!board[row][col]) {
                // Try this move
                const newBoard = board.map(row => [...row]);
                newBoard[row][col] = humanPlayer;

                // Check if winning move for human
                if (calculateWinnerForComputer(newBoard, row, col) === humanPlayer) {
                    return {
                        score: -1000,
                        move: [row, col]
                    };
                }

                const result = minimax(newBoard, depth - 1, true, computerPlayer, humanPlayer, alpha, beta);

                if (result.score < bestScore) {
                    bestScore = result.score;
                    bestMove = [row, col];
                }

                beta = Math.min(beta, bestScore);
                if (beta <= alpha) {
                    break; // Alpha cutoff
                }
            }
        }

        return {
            score: bestScore,
            move: bestMove
        };
    }
}

// Evaluate board state - higher score is better for computer
function evaluateBoard(board, computerPlayer, humanPlayer) {
    let score = 0;

    // Check rows, columns, and diagonals for sequences
    score += evaluateLines(board, computerPlayer, humanPlayer);

    return score;
}

// Evaluate lines (rows, columns, diagonals)
function evaluateLines(board, computerPlayer, humanPlayer) {
    let score = 0;

    // Evaluate rows
    for (let row = 0; row < window.dimension; row++) {
        for (let col = 0; col < window.dimension - 4; col++) {
            score += evaluateWindow(
                [board[row][col], board[row][col + 1], board[row][col + 2],
                    board[row][col + 3], board[row][col + 4]
                ],
                computerPlayer, humanPlayer
            );
        }
    }

    // Evaluate columns
    for (let col = 0; col < window.dimension; col++) {
        for (let row = 0; row < window.dimension - 4; row++) {
            score += evaluateWindow(
                [board[row][col], board[row + 1][col], board[row + 2][col],
                    board[row + 3][col], board[row + 4][col]
                ],
                computerPlayer, humanPlayer
            );
        }
    }

    // Evaluate diagonals (top-left to bottom-right)
    for (let row = 0; row < window.dimension - 4; row++) {
        for (let col = 0; col < window.dimension - 4; col++) {
            score += evaluateWindow(
                [board[row][col], board[row + 1][col + 1], board[row + 2][col + 2],
                    board[row + 3][col + 3], board[row + 4][col + 4]
                ],
                computerPlayer, humanPlayer
            );
        }
    }

    // Evaluate diagonals (bottom-left to top-right)
    for (let row = 4; row < window.dimension; row++) {
        for (let col = 0; col < window.dimension - 4; col++) {
            score += evaluateWindow(
                [board[row][col], board[row - 1][col + 1], board[row - 2][col + 2],
                    board[row - 3][col + 3], board[row - 4][col + 4]
                ],
                computerPlayer, humanPlayer
            );
        }
    }

    return score;
}

// Evaluate a window of 5 positions
function evaluateWindow(window, computerPlayer, humanPlayer) {
    let score = 0;

    const computerCount = window.filter(cell => cell === computerPlayer).length;
    const humanCount = window.filter(cell => cell === humanPlayer).length;
    const emptyCount = window.filter(cell => cell === null).length;

    // Prioritize 4-in-a-row situations
    if (computerCount === 4 && emptyCount === 1) {
        score += 500;
    } else if (humanCount === 4 && emptyCount === 1) {
        score -= 500;
    }

    // Value pieces in a line with potential
    if (computerCount === 3 && emptyCount === 2) {
        score += 50;
    } else if (humanCount === 3 && emptyCount === 2) {
        score -= 50;
    }

    if (computerCount === 2 && emptyCount === 3) {
        score += 10;
    } else if (humanCount === 2 && emptyCount === 3) {
        score -= 10;
    }

    return score;
}

// Existing function to check for winner
function calculateWinnerForComputer(currentSquares, row, col) {
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