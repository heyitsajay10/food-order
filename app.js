let game;
let ai;
let draggedPiece = null;
let draggedSquare = null;
let validMoves = [];

function initGame() {
    game = new ChessGame();
    ai = new ChessAI(game);
    
    renderBoard();
    updateStatus();
    
    document.getElementById('restart-btn').addEventListener('click', restartGame);
}

function renderBoard() {
    const chessboard = document.getElementById('chessboard');
    chessboard.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.className += (row + col) % 2 === 0 ? ' light' : ' dark';
            square.dataset.row = row;
            square.dataset.col = col;
            
            const piece = game.getPieceAt(row, col);
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.className = 'piece';
                pieceElement.textContent = piece.piece;
                pieceElement.draggable = piece.color === 'white' && !game.gameOver;
                
                if (piece.color === 'white') {
                    pieceElement.addEventListener('dragstart', handleDragStart);
                    pieceElement.addEventListener('dragend', handleDragEnd);
                    
                    pieceElement.addEventListener('touchstart', handleTouchStart, { passive: false });
                    pieceElement.addEventListener('touchmove', handleTouchMove, { passive: false });
                    pieceElement.addEventListener('touchend', handleTouchEnd, { passive: false });
                }
                
                square.appendChild(pieceElement);
            }
            
            square.addEventListener('dragover', handleDragOver);
            square.addEventListener('drop', handleDrop);
            square.addEventListener('click', handleSquareClick);
            
            chessboard.appendChild(square);
        }
    }
    
    highlightLastMove();
    highlightCheck();
}

function handleDragStart(e) {
    if (game.gameOver) return;
    
    draggedPiece = e.target;
    draggedSquare = e.target.parentElement;
    
    e.target.classList.add('dragging');
    
    const row = parseInt(draggedSquare.dataset.row);
    const col = parseInt(draggedSquare.dataset.col);
    
    validMoves = game.getValidMovesForPiece(row, col);
    highlightValidMoves();
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    clearHighlights();
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    
    if (!draggedSquare || game.gameOver) return;
    
    const fromRow = parseInt(draggedSquare.dataset.row);
    const fromCol = parseInt(draggedSquare.dataset.col);
    const toRow = parseInt(e.currentTarget.dataset.row);
    const toCol = parseInt(e.currentTarget.dataset.col);
    
    makePlayerMove(fromRow, fromCol, toRow, toCol);
}

function handleSquareClick(e) {
    if (game.gameOver) return;
    
    const square = e.currentTarget;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    
    if (game.selectedSquare) {
        const fromRow = game.selectedSquare.row;
        const fromCol = game.selectedSquare.col;
        
        makePlayerMove(fromRow, fromCol, row, col);
        
        game.selectedSquare = null;
        clearHighlights();
    } else {
        const piece = game.getPieceAt(row, col);
        if (piece && piece.color === 'white') {
            game.selectedSquare = { row, col };
            validMoves = game.getValidMovesForPiece(row, col);
            highlightValidMoves();
            square.classList.add('selected');
        }
    }
}

let touchStartPos = null;
let touchMovingPiece = null;
let touchClone = null;

function handleTouchStart(e) {
    if (game.gameOver) return;
    e.preventDefault();
    
    touchMovingPiece = e.target;
    const touch = e.touches[0];
    touchStartPos = { x: touch.clientX, y: touch.clientY };
    
    touchClone = touchMovingPiece.cloneNode(true);
    touchClone.style.position = 'fixed';
    touchClone.style.zIndex = '1000';
    touchClone.style.pointerEvents = 'none';
    touchClone.style.opacity = '0.8';
    touchClone.style.transform = 'scale(1.2)';
    document.body.appendChild(touchClone);
    
    updateTouchClonePosition(touch.clientX, touch.clientY);
    
    draggedSquare = touchMovingPiece.parentElement;
    const row = parseInt(draggedSquare.dataset.row);
    const col = parseInt(draggedSquare.dataset.col);
    
    validMoves = game.getValidMovesForPiece(row, col);
    highlightValidMoves();
}

function handleTouchMove(e) {
    if (!touchClone) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    updateTouchClonePosition(touch.clientX, touch.clientY);
}

function handleTouchEnd(e) {
    if (!touchClone || !draggedSquare) return;
    e.preventDefault();
    
    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    document.body.removeChild(touchClone);
    touchClone = null;
    
    const targetSquare = element?.closest('.square');
    
    if (targetSquare) {
        const fromRow = parseInt(draggedSquare.dataset.row);
        const fromCol = parseInt(draggedSquare.dataset.col);
        const toRow = parseInt(targetSquare.dataset.row);
        const toCol = parseInt(targetSquare.dataset.col);
        
        makePlayerMove(fromRow, fromCol, toRow, toCol);
    }
    
    clearHighlights();
    touchMovingPiece = null;
    draggedSquare = null;
}

function updateTouchClonePosition(x, y) {
    if (touchClone) {
        touchClone.style.left = (x - 30) + 'px';
        touchClone.style.top = (y - 30) + 'px';
    }
}

function makePlayerMove(fromRow, fromCol, toRow, toCol) {
    const success = game.makeMove(fromRow, fromCol, toRow, toCol);
    
    if (success) {
        renderBoard();
        updateStatus();
        updateMoveHistory();
        
        if (checkGameEnd()) return;
        
        setTimeout(() => {
            makeAIMove();
        }, 500);
    }
}

function makeAIMove() {
    if (game.gameOver || game.currentPlayer !== 'black') return;
    
    updateStatus('AI is thinking...');
    
    setTimeout(() => {
        const move = ai.findBestMove();
        
        if (move) {
            game.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
            renderBoard();
            updateStatus();
            updateMoveHistory();
            checkGameEnd();
        }
    }, 100);
}

function checkGameEnd() {
    if (game.isCheckmate('white')) {
        game.gameOver = true;
        updateStatus('Checkmate! Black (AI) wins!');
        return true;
    }
    
    if (game.isCheckmate('black')) {
        game.gameOver = true;
        updateStatus('Checkmate! White wins!');
        return true;
    }
    
    if (game.isStalemate('white') || game.isStalemate('black')) {
        game.gameOver = true;
        updateStatus('Stalemate! Game is a draw.');
        return true;
    }
    
    return false;
}

function highlightValidMoves() {
    clearHighlights();
    
    validMoves.forEach(move => {
        const square = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
        if (square) {
            square.classList.add('valid-move');
        }
    });
}

function highlightLastMove() {
    if (game.lastMove) {
        const fromSquare = document.querySelector(
            `[data-row="${game.lastMove.from.row}"][data-col="${game.lastMove.from.col}"]`
        );
        const toSquare = document.querySelector(
            `[data-row="${game.lastMove.to.row}"][data-col="${game.lastMove.to.col}"]`
        );
        
        if (fromSquare) fromSquare.classList.add('last-move');
        if (toSquare) toSquare.classList.add('last-move');
    }
}

function highlightCheck() {
    if (game.isInCheck('white')) {
        const kingPos = game.kingPositions.white;
        const square = document.querySelector(
            `[data-row="${kingPos.row}"][data-col="${kingPos.col}"]`
        );
        if (square) square.classList.add('in-check');
    }
    
    if (game.isInCheck('black')) {
        const kingPos = game.kingPositions.black;
        const square = document.querySelector(
            `[data-row="${kingPos.row}"][data-col="${kingPos.col}"]`
        );
        if (square) square.classList.add('in-check');
    }
}

function clearHighlights() {
    document.querySelectorAll('.valid-move').forEach(el => el.classList.remove('valid-move'));
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
}

function updateStatus(customMessage = null) {
    const statusElement = document.getElementById('game-status');
    const messageElement = document.getElementById('game-message');
    
    if (customMessage) {
        statusElement.textContent = customMessage;
        messageElement.textContent = '';
        return;
    }
    
    if (game.gameOver) {
        messageElement.textContent = 'Game Over';
        return;
    }
    
    const playerName = game.currentPlayer === 'white' ? "White's Turn (You)" : "Black's Turn (AI)";
    statusElement.textContent = playerName;
    
    if (game.isInCheck(game.currentPlayer)) {
        messageElement.textContent = '⚠️ Check!';
        messageElement.style.color = '#ff6b6b';
    } else {
        messageElement.textContent = '';
    }
}

function updateMoveHistory() {
    const historyList = document.getElementById('history-list');
    const lastMove = game.moveHistory[game.moveHistory.length - 1];
    
    if (lastMove) {
        const moveElement = document.createElement('div');
        moveElement.className = 'history-item';
        moveElement.className += lastMove.piece.charCodeAt(0) > 9817 ? ' white-move' : ' black-move';
        
        const moveNumber = Math.ceil(game.moveHistory.length / 2);
        const moveText = `${moveNumber}. ${lastMove.notation}`;
        
        moveElement.textContent = moveText;
        historyList.appendChild(moveElement);
        
        historyList.scrollTop = historyList.scrollHeight;
    }
}

function restartGame() {
    game.reset();
    validMoves = [];
    draggedPiece = null;
    draggedSquare = null;
    
    document.getElementById('history-list').innerHTML = '';
    
    renderBoard();
    updateStatus();
}

document.addEventListener('DOMContentLoaded', initGame);
