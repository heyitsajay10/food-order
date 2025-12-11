class ChessAI {
    constructor(game) {
        this.game = game;
        this.maxDepth = 3;
        this.pieceValues = {
            'pawn': 100,
            'knight': 320,
            'bishop': 330,
            'rook': 500,
            'queen': 900,
            'king': 20000
        };
        
        this.positionBonus = {
            'pawn': [
                [0,  0,  0,  0,  0,  0,  0,  0],
                [50, 50, 50, 50, 50, 50, 50, 50],
                [10, 10, 20, 30, 30, 20, 10, 10],
                [5,  5, 10, 25, 25, 10,  5,  5],
                [0,  0,  0, 20, 20,  0,  0,  0],
                [5, -5,-10,  0,  0,-10, -5,  5],
                [5, 10, 10,-20,-20, 10, 10,  5],
                [0,  0,  0,  0,  0,  0,  0,  0]
            ],
            'knight': [
                [-50,-40,-30,-30,-30,-30,-40,-50],
                [-40,-20,  0,  0,  0,  0,-20,-40],
                [-30,  0, 10, 15, 15, 10,  0,-30],
                [-30,  5, 15, 20, 20, 15,  5,-30],
                [-30,  0, 15, 20, 20, 15,  0,-30],
                [-30,  5, 10, 15, 15, 10,  5,-30],
                [-40,-20,  0,  5,  5,  0,-20,-40],
                [-50,-40,-30,-30,-30,-30,-40,-50]
            ],
            'bishop': [
                [-20,-10,-10,-10,-10,-10,-10,-20],
                [-10,  0,  0,  0,  0,  0,  0,-10],
                [-10,  0,  5, 10, 10,  5,  0,-10],
                [-10,  5,  5, 10, 10,  5,  5,-10],
                [-10,  0, 10, 10, 10, 10,  0,-10],
                [-10, 10, 10, 10, 10, 10, 10,-10],
                [-10,  5,  0,  0,  0,  0,  5,-10],
                [-20,-10,-10,-10,-10,-10,-10,-20]
            ],
            'rook': [
                [0,  0,  0,  0,  0,  0,  0,  0],
                [5, 10, 10, 10, 10, 10, 10,  5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [-5,  0,  0,  0,  0,  0,  0, -5],
                [0,  0,  0,  5,  5,  0,  0,  0]
            ],
            'queen': [
                [-20,-10,-10, -5, -5,-10,-10,-20],
                [-10,  0,  0,  0,  0,  0,  0,-10],
                [-10,  0,  5,  5,  5,  5,  0,-10],
                [-5,  0,  5,  5,  5,  5,  0, -5],
                [0,  0,  5,  5,  5,  5,  0, -5],
                [-10,  5,  5,  5,  5,  5,  0,-10],
                [-10,  0,  5,  0,  0,  0,  0,-10],
                [-20,-10,-10, -5, -5,-10,-10,-20]
            ],
            'king': [
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-30,-40,-40,-50,-50,-40,-40,-30],
                [-20,-30,-30,-40,-40,-30,-30,-20],
                [-10,-20,-20,-20,-20,-20,-20,-10],
                [20, 20,  0,  0,  0,  0, 20, 20],
                [20, 30, 10,  0,  0, 10, 30, 20]
            ]
        };
    }

    findBestMove() {
        const startTime = Date.now();
        let bestMove = null;
        let bestValue = -Infinity;
        
        const moves = this.game.getAllValidMoves('black');
        
        if (moves.length === 0) return null;
        
        moves.sort((a, b) => {
            const scoreA = this.scoreMoveQuick(a);
            const scoreB = this.scoreMoveQuick(b);
            return scoreB - scoreA;
        });
        
        for (const move of moves) {
            const value = this.minimaxWithAlphaBeta(
                move,
                this.maxDepth - 1,
                -Infinity,
                Infinity,
                false
            );
            
            if (value > bestValue) {
                bestValue = value;
                bestMove = move;
            }
        }
        
        const endTime = Date.now();
        console.log(`AI calculated move in ${endTime - startTime}ms. Best value: ${bestValue}`);
        
        return bestMove;
    }

    scoreMoveQuick(move) {
        const targetPiece = this.game.getPieceAt(move.to.row, move.to.col);
        if (targetPiece) {
            const pieceType = this.game.getPieceType(targetPiece.piece);
            return this.pieceValues[pieceType];
        }
        return 0;
    }

    minimaxWithAlphaBeta(move, depth, alpha, beta, isMaximizing) {
        const originalBoard = this.game.cloneBoard();
        const originalPlayer = this.game.currentPlayer;
        const originalKingPositions = { ...this.game.kingPositions };
        
        this.applyMove(move);
        
        if (depth === 0 || this.game.isCheckmate('white') || this.game.isCheckmate('black') || 
            this.game.isStalemate('white') || this.game.isStalemate('black')) {
            const evaluation = this.evaluatePosition();
            this.undoMove(originalBoard, originalPlayer, originalKingPositions);
            return evaluation;
        }
        
        const color = isMaximizing ? 'black' : 'white';
        const moves = this.game.getAllValidMoves(color);
        
        if (moves.length === 0) {
            const evaluation = this.evaluatePosition();
            this.undoMove(originalBoard, originalPlayer, originalKingPositions);
            return evaluation;
        }
        
        if (isMaximizing) {
            let maxEval = -Infinity;
            
            for (const nextMove of moves) {
                const evaluation = this.minimaxWithAlphaBeta(nextMove, depth - 1, alpha, beta, false);
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                
                if (beta <= alpha) {
                    break;
                }
            }
            
            this.undoMove(originalBoard, originalPlayer, originalKingPositions);
            return maxEval;
        } else {
            let minEval = Infinity;
            
            for (const nextMove of moves) {
                const evaluation = this.minimaxWithAlphaBeta(nextMove, depth - 1, alpha, beta, true);
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                
                if (beta <= alpha) {
                    break;
                }
            }
            
            this.undoMove(originalBoard, originalPlayer, originalKingPositions);
            return minEval;
        }
    }

    applyMove(move) {
        const piece = this.game.board[move.from.row][move.from.col];
        this.game.board[move.to.row][move.to.col] = piece;
        this.game.board[move.from.row][move.from.col] = null;
        
        if (this.game.getPieceType(piece.piece) === 'king') {
            this.game.kingPositions[piece.color] = { row: move.to.row, col: move.to.col };
        }
        
        this.game.currentPlayer = this.game.currentPlayer === 'white' ? 'black' : 'white';
    }

    undoMove(originalBoard, originalPlayer, originalKingPositions) {
        this.game.board = originalBoard;
        this.game.currentPlayer = originalPlayer;
        this.game.kingPositions = originalKingPositions;
    }

    evaluatePosition() {
        let score = 0;
        
        if (this.game.isCheckmate('white')) return -50000;
        if (this.game.isCheckmate('black')) return 50000;
        if (this.game.isStalemate('white') || this.game.isStalemate('black')) return 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.game.getPieceAt(row, col);
                if (piece) {
                    const pieceType = this.game.getPieceType(piece.piece);
                    const pieceValue = this.pieceValues[pieceType];
                    
                    let positionValue = 0;
                    if (this.positionBonus[pieceType]) {
                        const posRow = piece.color === 'white' ? row : 7 - row;
                        positionValue = this.positionBonus[pieceType][posRow][col];
                    }
                    
                    const totalValue = pieceValue + positionValue;
                    
                    if (piece.color === 'black') {
                        score += totalValue;
                    } else {
                        score -= totalValue;
                    }
                }
            }
        }
        
        if (this.game.isInCheck('white')) {
            score += 50;
        }
        if (this.game.isInCheck('black')) {
            score -= 50;
        }
        
        const blackMoves = this.game.getAllValidMoves('black').length;
        const whiteMoves = this.game.getAllValidMoves('white').length;
        score += (blackMoves - whiteMoves) * 5;
        
        return score;
    }

    setDepth(depth) {
        this.maxDepth = Math.max(1, Math.min(5, depth));
    }
}
