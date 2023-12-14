document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('grid');
  const flagsLeft = document.getElementById('flags-left');
  const timerDisplay = document.getElementById('timer');
  localStorage.removeItem('score');

  let width = 10;
  let bombAmount = 2;
  let flags = 0;
  let squares = [];
  let isGameOver = false;
  let timeRemaining = 120; // 2 minutes in seconds

  const music = new Audio('./audio/Minesweeper.mp3');


  // Timer function
  function startTimer() {
    const timerInterval = setInterval(() => {
      timeRemaining--;
      timerDisplay.textContent = `Time: ${formatTime(timeRemaining)}`;

      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        gameOver();
      }
    }, 1000);

    music.play()
    music.loop() = true
  }

  // Format time function (convert seconds to MM:SS format)
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }

  // create Board
  function createBoard() {
    flagsLeft.innerHTML = bombAmount;

    // get shuffled game array with random bombs
    const bombsArray = Array(bombAmount).fill('bomb');
    const emptyArray = Array(width * width - bombAmount).fill('valid');
    const gameArray = emptyArray.concat(bombsArray);
    const shuffledArray = gameArray.sort(() => Math.random() - 0.5);

    for (let i = 0; i < width * width; i++) {
      const square = document.createElement('div');
      square.setAttribute('id', i);
      square.classList.add(shuffledArray[i]);
      grid.appendChild(square);
      squares.push(square);

      // normal click
      square.addEventListener('click', function (e) {
        click(square);
      });

      // cntrl and left click
      square.oncontextmenu = function (e) {
        e.preventDefault();
        addFlag(square);
      };
    }

    // add numbers
    for (let i = 0; i < squares.length; i++) {
      let total = 0;
      const isLeftEdge = i % width === 0;
      const isRightEdge = i % width === width - 1;

      if (squares[i].classList.contains('valid')) {
        if (i > 0 && !isLeftEdge && squares[i - 1].classList.contains('bomb')) total++;
        if (i > 9 && !isRightEdge && squares[i + 1 - width].classList.contains('bomb')) total++;
        if (i > 10 && squares[i - width].classList.contains('bomb')) total++;
        if (i > 11 && !isLeftEdge && squares[i - 1 - width].classList.contains('bomb')) total++;
        if (i < 98 && !isRightEdge && squares[i + 1].classList.contains('bomb')) total++;
        if (i < 90 && !isLeftEdge && squares[i - 1 + width].classList.contains('bomb')) total++;
        if (i < 88 && !isRightEdge && squares[i + 1 + width].classList.contains('bomb')) total++;
        if (i < 89 && squares[i + width].classList.contains('bomb')) total++;
        squares[i].setAttribute('data', total);
      }
    }

    // Start the timer when the board is created
    startTimer();
  }
  createBoard();

  // add Flag with right click
  function addFlag(square) {
    if (isGameOver) return;
    if (!square.classList.contains('checked') && flags < bombAmount) {
      if (!square.classList.contains('flag')) {
        square.classList.add('flag');
        square.innerHTML = ' 🚩';
        flags++;
        flagsLeft.innerHTML = bombAmount - flags;
        checkForWin();
      } else {
        square.classList.remove('flag');
        square.innerHTML = '';
        flags--;
        flagsLeft.innerHTML = bombAmount - flags;
        checkForWin(); // Check for win after updating flags
      }
    }
  }

  // click on square actions
  function click(square) {
    let currentId = square.id;
    if (isGameOver) return;
    if (square.classList.contains('checked') || square.classList.contains('flag')) return;
    if (square.classList.contains('bomb')) {
      gameOver(square);
    } else {
      let total = square.getAttribute('data');
      if (total != 0) {
        square.classList.add('checked');
        if (total == 1) square.classList.add('one');
        if (total == 2) square.classList.add('two');
        if (total == 3) square.classList.add('three');
        if (total == 4) square.classList.add('four');
        square.innerHTML = total;
        return;
      }
      checkSquare(square, currentId);
    }
    square.classList.add('checked');
    checkForWin(); // Check for win after clicking
  }

  // check neighboring squares once square is clicked
  function checkSquare(square, currentId) {
    const isLeftEdge = currentId % width === 0;
    const isRightEdge = currentId % width === width - 1;

    setTimeout(() => {
      if (currentId > 0 && !isLeftEdge) {
        const newId = squares[parseInt(currentId) - 1].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
      if (currentId > 9 && !isRightEdge) {
        const newId = squares[parseInt(currentId) + 1 - width].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
      if (currentId > 10) {
        const newId = squares[parseInt(currentId - width)].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
      if (currentId > 11 && !isLeftEdge) {
        const newId = squares[parseInt(currentId) - 1 - width].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
      if (currentId < 98 && !isRightEdge) {
        const newId = squares[parseInt(currentId) + 1].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
      if (currentId < 90 && !isLeftEdge) {
        const newId = squares[parseInt(currentId) - 1 + width].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
      if (currentId < 88 && !isRightEdge) {
        const newId = squares[parseInt(currentId) + 1 + width].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
      if (currentId < 89) {
        const newId = squares[parseInt(currentId) + width].id;
        const newSquare = document.getElementById(newId);
        click(newSquare);
      }
    }, 10);
  }

  // Game over function
  function gameOver(square) {
    // Redirect to pg2.html
    window.location.href = 'pg2.html';

    // Show ALL the bombs
    squares.forEach((square) => {
      if (square.classList.contains('bomb')) {
        square.innerHTML = '💣';
        square.classList.remove('bomb');
        square.classList.add('checked');
      }
    });
  }

  // Check for win function
  function checkForWin() {
    let matches = 0;
    let score = 0;
  
    for (let i = 0; i < squares.length; i++) {
      if (squares[i].classList.contains('flag') && squares[i].classList.contains('bomb')) {
        matches++;
        score++; // Increment the score only if it's a bomb and has a flag
      }
    }
  
    if (matches === bombAmount) {
      isGameOver = true;
      localStorage.setItem('score', score);
      window.location.href = 'pg2.html';
    }
  }
  // Debug statement to check the initial value of 'score'
  console.log('Initial Score:', localStorage.getItem('score') || 0);
});

document.addEventListener('DOMContentLoaded', () => {
  const playerName = localStorage.getItem('playerName');
  const playerNickName = localStorage.getItem('playerNickname');

  // Display the stored values
  const gameName = document.getElementById('gameName');
  gameName.textContent = `Welcome, ${playerName} (${playerNickName})!`;
});
