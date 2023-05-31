document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('tetris');
    const context = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const rankingsList = document.getElementById('rankings-list');
    const blockSize = 20;
    const width = canvas.width / blockSize;
    const height = canvas.height / blockSize;
    const emptyColor = '#FFFFFF';
    const pieces = [
      { color: '#FF4D4D', shape: [[1, 1, 1, 1]] },      // Vermelho
      { color: '#4DFF4D', shape: [[1, 1], [1, 1]] },      // Verde
      { color: '#4D4DFF', shape: [[0, 1, 1], [1, 1, 0]] },      // Azul
      { color: '#FFFF4D', shape: [[1, 1, 1], [0, 1, 0]] },      // Amarelo
      { color: '#FF4DFF', shape: [[1, 1, 1], [0, 0, 1]] },      // Magenta
      { color: '#4DFFFF', shape: [[1, 1, 1], [1, 0, 0]] },      // Ciano
      { color: '#FFA64D', shape: [[1, 1, 1], [1, 1, 1]] },      // Laranja
    ];
  
    let score = 0;
    let clearedRows = 0;
    let board = createBoard();
    let currentPiece = getRandomPiece();
    let currentPosition = { x: Math.floor(width / 2) - Math.floor(currentPiece.shape[0].length / 2), y: 0 };
    let intervalId = null;
  
    // Iniciar o jogo
    startGame();
  
    // Funções para manipular o jogo
    function startGame() {
      drawBoard();
      updateScore();
      addEventListener('keydown', handleKeyPress);
      intervalId = setInterval(update, 500); // Intervalo de atualização do jogo (500 ms)
    }
  
    function update() {
      if (canMoveDown()) {
        currentPosition.y++;
        drawBoard(); // Redesenha o quadro a cada atualização
      } else {
        mergePiece();
        checkLines();
        if (gameOver()) {
          gameOverHandler();
          return;
        }
        currentPiece = getRandomPiece();
        currentPosition = { x: Math.floor(width / 2) - Math.floor(currentPiece.shape[0].length / 2), y: 0 };
        if (!canMoveDown()) {
          gameOverHandler();
          return;
        }
      }
    }
  
    function handleKeyPress(event) {
      switch (event.keyCode) {
        case 37: // Setas para a esquerda
          if (canMoveLeft()) {
            currentPosition.x--;
            drawBoard();
          }
          break;
        case 39: // Setas para a direita
          if (canMoveRight()) {
            currentPosition.x++;
            drawBoard();
          }
          break;
        case 40: // Seta para baixo
          if (canMoveDown()) {
            currentPosition.y++;
            drawBoard();
          }
          break;
        case 38: // Seta para cima
          rotatePiece();
          drawBoard();
          break;
      }
    }
  
    function mergePiece() {
      for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
          if (currentPiece.shape[row][col]) {
            const newX = currentPosition.x + col;
            const newY = currentPosition.y + row;
            board[newY][newX] = currentPiece.color;
          }
        }
      }
    }
  
    function checkLines() {
      let fullLines = [];
      for (let row = height - 1; row >= 0; row--) {
        let isFull = true;
        for (let col = 0; col < width; col++) {
          if (board[row][col] === emptyColor) {
            isFull = false;
            break;
          }
        }
        if (isFull) {
          fullLines.push(row);
        }
      }
  
      if (fullLines.length > 0) {
        removeLines(fullLines);
        updateScore(fullLines.length);
      }
    }
  
    function removeLines(lines) {
      lines.forEach((line) => {
        board.splice(line, 1);
        board.unshift(new Array(width).fill(emptyColor));
      });
    }
  
    function gameOver() {
      for (let col = 0; col < width; col++) {
        if (board[0][col] !== emptyColor) {
          return true;
        }
      }
      return false;
    }
  
    function gameOverHandler() {
      clearInterval(intervalId);
      removeEventListener('keydown', handleKeyPress);
      showGameOverMessage();
      saveScore();
      loadRankings();
    }
  
    function showGameOverMessage() {
      context.fillStyle = '#000000';
      context.fillRect(0, canvas.height / 3, canvas.width, canvas.height / 3);
  
      context.font = '30px Arial';
      context.fillStyle = '#FFFFFF';
      context.textAlign = 'center';
      context.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    }
  
    function saveScore() {
      const playerName = prompt('Digite o seu nome:');
      if (playerName) {
        const scoreItem = { name: playerName, score: score };
        const rankings = getSavedRankings();
        rankings.push(scoreItem);
        rankings.sort((a, b) => b.score - a.score);
        localStorage.setItem('rankings', JSON.stringify(rankings));
      }
    }
  
    function getSavedRankings() {
      const rankingsData = localStorage.getItem('rankings');
      return rankingsData ? JSON.parse(rankingsData) : [];
    }
  
    function loadRankings() {
      const rankings = getSavedRankings();
      rankingsList.innerHTML = '';
      rankings.forEach((item) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.name}: ${item.score}`;
        rankingsList.appendChild(listItem);
      });
    }
  
    function updateScore(linesCleared = 0) {
      const points = linesCleared * linesCleared * 100;
      score += points;
      clearedRows += linesCleared;
      scoreElement.textContent = score;
  
      // Check if the player has cleared 10 or more rows and increase the game speed
      if (clearedRows >= 10) {
        clearInterval(intervalId);
        intervalId = setInterval(update, 500 - clearedRows * 10);
        clearedRows = 0;
      }
    }
  
    function getRandomPiece() {
      const randomIndex = Math.floor(Math.random() * pieces.length);
      return {
        color: pieces[randomIndex].color,
        shape: pieces[randomIndex].shape,
      };
    }
  
    function createBoard() {
      const board = [];
      for (let row = 0; row < height; row++) {
        board[row] = [];
        for (let col = 0; col < width; col++) {
          board[row][col] = emptyColor;
        }
      }
      return board;
    }
  
    function drawBlock(x, y, color) {
      context.fillStyle = color;
      context.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
      context.strokeStyle = '#000000';
      context.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
    }
  
    function drawBoard() {
      for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
          drawBlock(col, row, board[row][col]);
        }
      }
  
      for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
          if (currentPiece.shape[row][col]) {
            const newX = currentPosition.x + col;
            const newY = currentPosition.y + row;
            drawBlock(newX, newY, currentPiece.color);
          }
        }
      }
    }
  
    function canMoveLeft() {
      for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
          if (currentPiece.shape[row][col]) {
            const newX = currentPosition.x + col - 1;
            if (newX < 0 || board[currentPosition.y + row][newX] !== emptyColor) {
              return false;
            }
          }
        }
      }
      return true;
    }
  
    function canMoveRight() {
      for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
          if (currentPiece.shape[row][col]) {
            const newX = currentPosition.x + col + 1;
            if (newX >= width || board[currentPosition.y + row][newX] !== emptyColor) {
              return false;
            }
          }
        }
      }
      return true;
    }
  
    function canMoveDown() {
      for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
          if (currentPiece.shape[row][col]) {
            const newY = currentPosition.y + row + 1;
            if (newY >= height || board[newY][currentPosition.x + col] !== emptyColor) {
              return false;
            }
          }
        }
      }
      return true;
    }
  
    function rotatePiece() {
      const previousShape = currentPiece.shape;
      currentPiece.shape = rotateMatrix(currentPiece.shape);
      if (!isValidMove(currentPosition.x, currentPosition.y)) {
        currentPiece.shape = previousShape;
      }
    }
  
    function rotateMatrix(matrix) {
      const rows = matrix.length;
      const cols = matrix[0].length;
      const result = [];
      for (let col = 0; col < cols; col++) {
        const newRow = [];
        for (let row = rows - 1; row >= 0; row--) {
          newRow.push(matrix[row][col]);
        }
        result.push(newRow);
      }
      return result;
    }
  
    function isValidMove(newX, newY) {
      for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
          if (currentPiece.shape[row][col]) {
            const blockX = newX + col;
            const blockY = newY + row;
            if (
              blockX < 0 ||
              blockX >= width ||
              blockY >= height ||
              board[blockY][blockX] !== emptyColor
            ) {
              return false;
            }
          }
        }
      }
      return true;
    }
  });
  