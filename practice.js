var board = null;
var game = new Chess();
var $status = $('#status');
var $pgn = $('#pgn');
var $evalBar = $('#eval-bar');
var $evalText = $('#eval-text');

// Nilai Bidak & Evaluasi Posisi
var pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

function evaluatePosition() {
    var totalEvaluation = 0;
    var board = game.board();

    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            totalEvaluation += getPieceValue(board[i][j]);
        }
    }

    // Update UI Evaluasi
    var displayValue = totalEvaluation.toFixed(1);
    $evalText.text(displayValue > 0 ? '+' + displayValue : displayValue);
    
    // Bar: 0.0 -> 50%, +5.0 -> 90%, -5.0 -> 10%
    var barPercentage = 50 + (totalEvaluation * 8);
    barPercentage = Math.max(5, Math.min(95, barPercentage));
    $evalBar.css('width', barPercentage + '%');
}

function getPieceValue(piece) {
    if (piece === null) return 0;
    var val = pieceValues[piece.type];
    return piece.color === 'w' ? val : -val;
}

// Logika Bot untuk Latihan (Level Intermediate)
function makeBotMove() {
    var moves = game.moves();
    if (moves.length === 0) return;

    var bestMove = null;
    var bestValue = 9999; 

    for (var i = 0; i < moves.length; i++) {
        game.move(moves[i]);
        var boardValue = 0;
        var b = game.board();
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                boardValue += getPieceValue(b[r][c]);
            }
        }
        game.undo();

        if (boardValue < bestValue) {
            bestValue = boardValue;
            bestMove = moves[i];
        }
    }

    game.move(bestMove || moves[0]);
    board.position(game.fen());
    updateStatus();
    evaluatePosition();
}

// Fitur Hint (Cari langkah terbaik untuk Putih)
function findBestMove() {
    var moves = game.moves({ verbose: true });
    if (moves.length === 0) return null;

    var bestMove = null;
    var bestValue = -9999;

    for (var i = 0; i < moves.length; i++) {
        game.move(moves[i]);
        var boardValue = 0;
        var b = game.board();
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                boardValue += getPieceValue(b[r][c]);
            }
        }
        game.undo();

        if (boardValue > bestValue) {
            bestValue = boardValue;
            bestMove = moves[i];
        }
    }
    return bestMove;
}

function onDragStart(source, piece, position, orientation) {
    if (game.game_over()) return false;
    
    // Hanya izinkan player menggerakkan bidak Putih
    if (piece.search(/^b/) !== -1) return false;
}

function onDrop(source, target) {
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });

    if (move === null) return 'snapback';

    removeHighlights();
    updateStatus();
    evaluatePosition();

    // Giliran Bot setelah 500ms
    window.setTimeout(makeBotMove, 500);
}

function onSnapEnd() {
    board.position(game.fen());
}

function updateStatus() {
    var status = (game.turn() === 'w' ? 'Giliran Anda (Putih)' : 'Bot sedang berpikir...');
    if (game.in_checkmate()) status = 'Skakmat! ' + (game.turn() === 'w' ? 'Bot Menang' : 'Anda Menang');
    else if (game.in_draw()) status = 'Permainan Seri!';
    else if (game.in_check()) status += ' (Sedang Skak!)';

    $status.text(status);
    $pgn.val(game.pgn());
}

function removeHighlights() {
    $('#myBoard .square-55d63').removeClass('highlight-hint highlight-source');
}

// Event Listeners
$('#hint-btn').on('click', function() {
    removeHighlights();
    var best = findBestMove();
    if (best) {
        $('.square-' + best.from).addClass('highlight-source');
        $('.square-' + best.to).addClass('highlight-hint');
        $status.text('Saran AI: ' + best.san);
    }
});

$('#undo-btn').on('click', function() {
    game.undo(); // Batalkan gerakan Bot
    game.undo(); // Batalkan gerakan Player
    board.position(game.fen());
    removeHighlights();
    updateStatus();
    evaluatePosition();
});

$('#reset-btn').on('click', function() {
    game.reset();
    board.start();
    removeHighlights();
    updateStatus();
    evaluatePosition();
});

var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
};
board = Chessboard('myBoard', config);
updateStatus();
evaluatePosition();
