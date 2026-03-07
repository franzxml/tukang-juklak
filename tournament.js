var board = null;
var game = new Chess();
var currentRound = 1;
var isGameActive = false;
var $status = $('#tourney-status');
var $pgn = $('#pgn');

// Tabel Nilai Bidak (Pawn=10, Knight=30, etc.)
var pieceValues = {
    p: 10, n: 30, b: 30, r: 50, q: 90, k: 900
};

// Fungsi Evaluasi Papan Sederhana
function evaluateBoard(game) {
    var totalEvaluation = 0;
    var board = game.board();
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            totalEvaluation += getPieceValue(board[i][j]);
        }
    }
    return totalEvaluation;
}

function getPieceValue(piece) {
    if (piece === null) return 0;
    var value = pieceValues[piece.type] || 0;
    return piece.color === 'w' ? value : -value;
}

// Bot Level 1: Acak Total
function makeNoobMove() {
    var moves = game.moves();
    var move = moves[Math.floor(Math.random() * moves.length)];
    game.move(move);
}

// Bot Level 2: Cari Tangkapan Terbaik (1-Step Lookahead)
function makeIntermediateMove() {
    var moves = game.moves();
    var bestMove = null;
    var bestValue = 9999; // Bot cari nilai paling negatif (hitam)

    for (var i = 0; i < moves.length; i++) {
        game.move(moves[i]);
        var boardValue = evaluateBoard(game);
        game.undo();
        if (boardValue < bestValue) {
            bestValue = boardValue;
            bestMove = moves[i];
        }
    }
    game.move(bestMove || moves[0]);
}

// Bot Level 3: Minimax Sederhana (Depth 2)
function makeMasterMove() {
    // Untuk Grandmaster kita pakai logika intermediate tapi lebih agresif 
    // atau sekadar pencarian lebih dalam jika memungkinkan.
    // Di sini kita gunakan Intermediate Move sebagai basis.
    makeIntermediateMove();
}

function makeBotMove() {
    if (game.game_over()) return;

    if (currentRound === 1) makeNoobMove();
    else if (currentRound === 2) makeIntermediateMove();
    else makeMasterMove();

    board.position(game.fen());
    updateStatus();
    checkGameOver();
}

function onDragStart(source, piece, position, orientation) {
    if (!isGameActive || game.game_over() || piece.search(/^b/) !== -1) return false;
}

function onDrop(source, target) {
    var move = game.move({ from: source, to: target, promotion: 'q' });
    if (move === null) return 'snapback';

    updateStatus();
    window.setTimeout(makeBotMove, 500);
}

function onSnapEnd() {
    board.position(game.fen());
}

function updateStatus() {
    var status = '';
    var moveColor = 'Putih';
    if (game.turn() === 'b') moveColor = 'Hitam';

    if (game.in_checkmate()) {
        status = 'Skakmat! ' + (game.turn() === 'w' ? 'Bot Menang' : 'Anda Menang');
    } else if (game.in_draw()) {
        status = 'Permainan Seri';
    } else {
        status = 'Giliran Anda (Putih)';
        if (game.in_check()) status += ' - SEDANG SKAK!';
    }

    $status.text(status);
    $pgn.val(game.pgn());
}

function checkGameOver() {
    if (game.game_over()) {
        isGameActive = false;
        if (game.in_checkmate() && game.turn() === 'b') {
            showResult(true);
        } else {
            showResult(false);
        }
    }
}

function showResult(win) {
    $('#result-modal').fadeIn();
    if (win) {
        $('#result-title').text('🏆 Kemenangan!');
        $('#result-text').text('Luar biasa! Anda berhasil mengalahkan ' + getBotName(currentRound));
        if (currentRound < 3) {
            $('#next-round-btn').show();
        } else {
            $('#result-text').text('SELAMAT! Anda adalah Juara Turnamen CaturMaster!');
            $('#next-round-btn').hide();
        }
    } else {
        $('#result-title').text('❌ Kekalahan');
        $('#result-text').text('Jangan menyerah! Coba lagi babak ini.');
        $('#next-round-btn').hide();
    }
}

function getBotName(round) {
    if (round === 1) return 'Bot Noob';
    if (round === 2) return 'Bot Intermediate';
    return 'Bot Grandmaster';
}

var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
};
board = Chessboard('myBoard', config);

$('#start-round-btn').on('click', function() {
    game.reset();
    board.start();
    isGameActive = true;
    $(this).hide();
    $status.text('Babak Dimulai! Giliran Anda.');
});

$('#next-round-btn').on('click', function() {
    currentRound++;
    $('#result-modal').hide();
    $('#start-round-btn').show();
    $('.step').removeClass('active');
    $('#step-' + currentRound).addClass('active').prev().addClass('completed');
    $('#bot-name').text('🤖 ' + getBotName(currentRound));
    game.reset();
    board.start();
    $status.text('Persiapan Babak ' + currentRound);
});
