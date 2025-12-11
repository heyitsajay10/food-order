class ChessGame {
    constructor() {
        this.board = this.createInitialBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.selectedSquare = null;
        this.moveHistory = [];
        this.lastMove = null;
        this.gameOver = false;
        this.kingPositions = {
            white: { row: 7, col: 4 },
            black: { row: 0, col: 4 }
        };
    }

    createInitialBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        const pieceSetup = {
            0: ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
            1: Array(8).fill('♟'),
            6: Array(8).fill('♙'),
            7: ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
        };
        
        for (let row in pieceSetup) {
            for (let col = 0; col < 8; col++) {
                board[row][col] = {
                    piece: pieceSetup[row][col],
                    color: row < 2 ? 'black' : 'white'
                };
            }
        }
        
        return board;
    }

    getPieceAt(row, col) {
        if (row < 0 || row > 7 || col < 0 || col > 7) return null;
        return this.board[row][col];
    }

    getPieceType(piece) {
        const whitePieces = { '♔': 'king', '♕': 'queen', '♖': 'rook', '♗': 'bishop', '♘': 'knight', '♙': 'pawn' };
        const blackPieces = { '♚': 'king', '♛': 'queen', '♜': 'rook', '♝': 'bishop', '♞': 'knight', '♟': 'pawn' };
        return whitePieces[piece] || blackPieces[piece];
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPieceAt(fromRow, fromCol);
        if (!piece || piece.color !== this.currentPlayer) return false;
        
        if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return false;
        
        const targetPiece = this.getPieceAt(toRow, toCol);
        if (targetPiece && targetPiece.color === piece.color) return false;
        
        const pieceType = this.getPieceType(piece.piece);
        let isValid = false;
        
        switch (pieceType) {
            case 'pawn':
                isValid = this.isValidPawnMove(fromRow, fromCol, toRow, toCol, piece.color);
                break;
            case 'rook':
                isValid = this.isValidRookMove(fromRow, fromCol, toRow, toCol);
                break;
            case 'knight':
                isValid = this.isValidKnightMove(fromRow, fromCol, toRow, toCol);
                break;
            case 'bishop':
                isValid = this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
                break;
            case 'queen':
                isValid = this.isValidQueenMove(fromRow, fromCol, toRow, toCol);
                break;
            case 'king':
                isValid = this.isValidKingMove(fromRow, fromCol, toRow, toCol);
                break;
        }
        
        if (!isValid) return false;
        
        return !this.wouldBeInCheck(fromRow, fromCol, toRow, toCol);
    }

    isValidPawnMove(fromRow, fromCol, toRow, toCol, color) {
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;
        const rowDiff = toRow - fromRow;
        const colDiff = Math.abs(toCol - fromCol);
        
        if (colDiff === 0) {
            if (rowDiff === direction && !this.getPieceAt(toRow, toCol)) {
                return true;
            }
            if (fromRow === startRow && rowDiff === 2 * direction) {
                const middleRow = fromRow + direction;
                if (!this.getPieceAt(middleRow, fromCol) && !this.getPieceAt(toRow, toCol)) {
                    return true;
                }
            }
        } else if (colDiff === 1 && rowDiff === direction) {
            const targetPiece = this.getPieceAt(toRow, toCol);
            if (targetPiece && targetPiece.color !== color) {
                return true;
            }
        }
        
        return false;
    }

    isValidRookMove(fromRow, fromCol, toRow, toCol) {
        if (fromRow !== toRow && fromCol !== toCol) return false;
        return this.isPathClear(fromRow, fromCol, toRow, toCol);
    }

    isValidKnightMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }

    isValidBishopMove(fromRow, fromCol, toRow, toCol) {
        if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false;
        return this.isPathClear(fromRow, fromCol, toRow, toCol);
    }

    isValidQueenMove(fromRow, fromCol, toRow, toCol) {
        return this.isValidRookMove(fromRow, fromCol, toRow, toCol) || 
               this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
    }

    isValidKingMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        return rowDiff <= 1 && colDiff <= 1;
    }

    isPathClear(fromRow, fromCol, toRow, toCol) {
        const rowStep = toRow > fromRow ? 1 : (toRow < fromRow ? -1 : 0);
        const colStep = toCol > fromCol ? 1 : (toCol < fromCol ? -1 : 0);
        
        let currentRow = fromRow + rowStep;
        let currentCol = fromCol + colStep;
        
        while (currentRow !== toRow || currentCol !== toCol) {
            if (this.getPieceAt(currentRow, currentCol)) return false;
            currentRow += rowStep;
            currentCol += colStep;
        }
        
        return true;
    }

    wouldBeInCheck(fromRow, fromCol, toRow, toCol) {
        const originalPiece = this.board[toRow][toCol];
        const movingPiece = this.board[fromRow][fromCol];
        
        this.board[toRow][toCol] = movingPiece;
        this.board[fromRow][fromCol] = null;
        
        let kingRow, kingCol;
        if (this.getPieceType(movingPiece.piece) === 'king') {
            kingRow = toRow;
            kingCol = toCol;
        } else {
            kingRow = this.kingPositions[this.currentPlayer].row;
            kingCol = this.kingPositions[this.currentPlayer].col;
        }
        
        const inCheck = this.isSquareUnderAttack(kingRow, kingCol, this.currentPlayer);
        
        this.board[fromRow][fromCol] = movingPiece;
        this.board[toRow][toCol] = originalPiece;
        
        return inCheck;
    }

    isSquareUnderAttack(row, col, color) {
        const opponentColor = color === 'white' ? 'black' : 'white';
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.getPieceAt(r, c);
                if (piece && piece.color === opponentColor) {
                    const pieceType = this.getPieceType(piece.piece);
                    let canAttack = false;
                    
                    switch (pieceType) {
                        case 'pawn':
                            const direction = opponentColor === 'white' ? -1 : 1;
                            const rowDiff = row - r;
                            const colDiff = Math.abs(col - c);
                            canAttack = rowDiff === direction && colDiff === 1;
                            break;
                        case 'rook':
                            canAttack = this.isValidRookMove(r, c, row, col);
                            break;
                        case 'knight':
                            canAttack = this.isValidKnightMove(r, c, row, col);
                            break;
                        case 'bishop':
                            canAttack = this.isValidBishopMove(r, c, row, col);
                            break;
                        case 'queen':
                            canAttack = this.isValidQueenMove(r, c, row, col);
                            break;
                        case 'king':
                            canAttack = this.isValidKingMove(r, c, row, col);
                            break;
                    }
                    
                    if (canAttack) return true;
                }
            }
        }
        
        return false;
    }

    isInCheck(color) {
        const kingPos = this.kingPositions[color];
        return this.isSquareUnderAttack(kingPos.row, kingPos.col, color);
    }

    getAllValidMoves(color) {
        const validMoves = [];
        
        for (let fromRow = 0; fromRow < 8; fromRow++) {
            for (let fromCol = 0; fromCol < 8; fromCol++) {
                const piece = this.getPieceAt(fromRow, fromCol);
                if (piece && piece.color === color) {
                    for (let toRow = 0; toRow < 8; toRow++) {
                        for (let toCol = 0; toCol < 8; toCol++) {
                            if (this.isValidMove(fromRow, fromCol, toRow, toCol)) {
                                validMoves.push({
                                    from: { row: fromRow, col: fromCol },
                                    to: { row: toRow, col: toCol }
                                });
                            }
                        }
                    }
                }
            }
        }
        
        return validMoves;
    }

    isCheckmate(color) {
        if (!this.isInCheck(color)) return false;
        return this.getAllValidMoves(color).length === 0;
    }

    isStalemate(color) {
        if (this.isInCheck(color)) return false;
        return this.getAllValidMoves(color).length === 0;
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) {
            return false;
        }
        
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        if (this.getPieceType(piece.piece) === 'king') {
            this.kingPositions[piece.color] = { row: toRow, col: toCol };
        }
        
        this.lastMove = { from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } };
        
        const notation = this.getMoveNotation(fromRow, fromCol, toRow, toCol, piece, capturedPiece);
        this.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece.piece,
            captured: capturedPiece,
            notation: notation
        });
        
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        return true;
    }

    getMoveNotation(fromRow, fromCol, toRow, toCol, piece, capturedPiece) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
        
        const pieceType = this.getPieceType(piece.piece);
        let notation = '';
        
        if (pieceType !== 'pawn') {
            notation += piece.piece;
        }
        
        notation += files[fromCol] + ranks[fromRow];
        notation += capturedPiece ? 'x' : '-';
        notation += files[toCol] + ranks[toRow];
        
        return notation;
    }

    getValidMovesForPiece(row, col) {
        const validMoves = [];
        
        for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
                if (this.isValidMove(row, col, toRow, toCol)) {
                    validMoves.push({ row: toRow, col: toCol });
                }
            }
        }
        
        return validMoves;
    }

    cloneBoard() {
        return this.board.map(row => row.map(cell => cell ? { ...cell } : null));
    }

    reset() {
        this.board = this.createInitialBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.selectedSquare = null;
        this.moveHistory = [];
        this.lastMove = null;
        this.gameOver = false;
        this.kingPositions = {
            white: { row: 7, col: 4 },
            black: { row: 0, col: 4 }
        };
    }
}
