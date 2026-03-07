var board = null;
var game = new Chess();
var isBotMatch = false;
var isModeSelected = false; // Flag untuk mengecek apakah mode sudah dipilih
var $status = $('#status');
var $pgn = $('#pgn');

// Fungsi untuk menghapus highlight langkah legal
function removeGreySquares () {
  $('#myBoard .square-55d63').removeClass('highlight-hint');
}

// Fungsi untuk menambah highlight langkah legal
function greySquare (square) {
  var $square = $('#myBoard .square-' + square);
  $square.addClass('highlight-hint');
}

function onDragStart (source, piece, position, orientation) {
  // JANGAN izinkan mindahin bidak kalau mode belum dipilih
  if (!isModeSelected) return false;

  // Jangan izinkan mindahin bidak kalau game sudah selesai
  if (game.game_over()) return false;

  // Hanya izinkan mindahin bidak sesuai giliran
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }

  // Jika main lawan Bot, jangan izinkan pemain mindahin bidak Hitam
  if (isBotMatch && game.turn() === 'b') {
    return false;
  }
}

// Munculkan saran langkah saat mouse berada di atas bidak
function onMouseoverSquare (square, piece) {
  if (!isModeSelected) return;

  var moves = game.moves({
    square: square,
    verbose: true
  });

  if (moves.length === 0) return;

  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to);
  }
}

function onMouseoutSquare (square, piece) {
  removeGreySquares();
}

function makeBotMove () {
  var possibleMoves = game.moves();
  if (possibleMoves.length === 0) return;

  var randomIdx = Math.floor(Math.random() * possibleMoves.length);
  game.move(possibleMoves[randomIdx]);
  
  board.position(game.fen());
  updateStatus();
}

function onDrop (source, target) {
  removeGreySquares();

  var move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  });

  if (move === null) return 'snapback';

  updateStatus();

  if (isBotMatch) {
    window.setTimeout(makeBotMove, 400);
  }
}

function onSnapEnd () {
  board.position(game.fen());
}

function updateStatus () {
  var statusHTML = '';
  var moveColor = (game.turn() === 'w') ? 'Putih' : 'Hitam';

  if (game.in_checkmate()) {
    statusHTML = 'Game Over, ' + moveColor + ' Skakmat.';
  } else if (game.in_draw()) {
    statusHTML = 'Game Over, Seri.';
  } else {
    statusHTML = 'Giliran: ' + moveColor;
    if (game.in_check()) {
      statusHTML += ' (' + moveColor + ' sedang Skak!)';
    }
  }

  $status.html(statusHTML);
  $pgn.html(game.pgn());
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
  onMouseoverSquare: onMouseoverSquare,
  onMouseoutSquare: onMouseoutSquare,
  pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
};

board = Chessboard('myBoard', config);
updateStatus();

// Logika Pemilihan Mode (Modal & Sidebar)
function selectMode(bot) {
  isBotMatch = bot;
  isModeSelected = true;
  game.reset();
  board.start();
  
  // Update UI Sidebar
  $('.mode-btn').removeClass('active');
  if (bot) {
    $('#btn-bot').addClass('active');
    $('#current-mode').text("Player vs Bot");
  } else {
    $('#btn-pvp').addClass('active');
    $('#current-mode').text("Player vs Player (Lokal)");
  }
  
  // Sembunyikan Modal
  $('#mode-modal').fadeOut();
  updateStatus();
}

// Event Listeners untuk Modal
$('#modal-btn-pvp').on('click', function() { selectMode(false); });
$('#modal-btn-bot').on('click', function() { selectMode(true); });

// Event Listeners untuk Sidebar (Reset game dengan mode baru)
$('#btn-pvp').on('click', function() { selectMode(false); });
$('#btn-bot').on('click', function() { selectMode(true); });
