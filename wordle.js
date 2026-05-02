// Variables
const board = document.getElementById("board");
const keyboard = document.getElementById("keyboard");
const message = document.getElementById("message");
const leaderboard = document.getElementById("leaderboard");
const keyColor = [];
const cols = 5;
const rows = 6;

// Array of potential words
const wordList = ["APPLE", "KIWIS", "BERRY", "PEARS", "GRAPE","MANGO","FRUIT","MELON","LEMON","LIMES","PEACH","GUAVA","PLUMS"];

//Game Dictionary
const game = {
  targetWord: wordList[Math.floor(Math.random() * wordList.length)],
  currentRow: 0,
  guesses: ["", "", "", "", "", ""],
  color: "",
  state: "playing",
};

// Create grid of divs for the board
for (let i = 1; i <= 30; i++) {
  const cell = document.createElement("div"); //Creates a div for each cell
  cell.className = "grid-item"; //Assigns a class to each cell for styling
  cell.textContent = "";
  board.appendChild(cell); //Adds cells to the board
}

// Create grid of divs for the keyboard
const rowOne = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
const rowTwo = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
const rowThree = ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"];

/*
END OF DEFINING VARIABLES, ARRAYS, AND GAME DICTIONARY
*/
/*
MENTAL
SPACE
BREAK
*/
/*
START OF DEFINING FUNCTIONS
*/

//test--
const resetGame = () => {
  game.targetWord = wordList[Math.floor(Math.random() * wordList.length)];
  game.currentRow = 0;
  game.guesses = ["", "", "", "", "", ""];
  game.state = "playing";
  //
  const cells = document.querySelectorAll(".grid-item");
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.style.backgroundColor = "";
    cell.style.color = "";
    cell.classList.remove("flip", "pop", "shake");
  });
  //
  const keys = document.querySelectorAll(".key");
  keys.forEach((key) => {
    key.style.backgroundColor = "";
  });
  message.textContent = "You are playing!";
};
//test--

//Defines checkState function: Switch between messages based on the state
const checkState = () => {
  switch (game.state) {
    case "won":
      message.textContent = "You have won!";
      break;
    case "lost":
      message.textContent = `You have lost! The word was: ${game.targetWord}`;
      break;
    default:
      message.textContent = "You are still playing!";
      break;
  }
}; // end of defining checkState function (state message)

//NOT WORKING YET...
//Defines displayLeaderboard function: Displays leaderboard
const displayLeaderboard = () => {
  leaderboard.innerHTML = "<h3>Top 5 Scores</h3>"; //clears the leaderboard

  //this part down, unknown what's not working
  const history = JSON.parse(localStorage.getItem("scores")) || [];
  console.log(history);
  //
  if (history.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.textContent = "-- PLAY TO ADD TO LEADERBOARD --";
    emptyMsg.classList.add("emptyMsg");
    leaderboard.appendChild(emptyMsg);
    return;
  }
  //
  history.forEach((entry, index) => {
    //for each entry in history
    const line = document.createElement("p"); //create a paragraph
    line.textContent = `${index + 1}. ${entry.score} guesses (${entry.word}) - ${entry.date}`; //adds the score, word, and date to the paragraph
    leaderboard.appendChild(line); //adds the paragraph to the leaderboard
  });
}; //end of displayLeaderboard function

//Defines saveScore function: Saves score to local storage
const saveScore = (score) => {
  //only works during submitRow "ENTER"
  const history = JSON.parse(localStorage.getItem("scores")) || [];

  history.push({
    score: score,
    date: new Date().toLocaleDateString(),
    word: game.targetWord,
  }); //history dictionary

  //Sort lowest score (fewer guesses = better)
  history.sort((a, b) => a.score - b.score);
  localStorage.setItem("scores", JSON.stringify(topFive));
  displayLeaderboard();
}; //end of saveScore function
/*NOT WORKING YET...*/

//Defines submitRow function: Updates color titles / keys and game state
const submitRow = () => {
  const currentGuess = game.guesses[game.currentRow];
  const target = game.targetWord;

  //Defines colorTiles function: color tiles and keys based on if they are in the correct position, in the word, or not in the word (NESTED in submitRow)
  const colorTiles = (guess, chosen) => {
    const startIdx = game.currentRow * 5;
    const rowTiles = document.querySelectorAll(".grid-item");
    const keys = document.querySelectorAll(".key");

    //loops each letter in the guess (pulled parameter)
    guess.split("").forEach((letter, index) => {
      const rTi = rowTiles[startIdx + index];

      //loops through each key and finds the matching letter
      let targetKey;
      keys.forEach((k) => {
        if (k.textContent === letter) {
          targetKey = k;
        }
      });

      // Add the flip class with a staggered delay for each tile
      setTimeout(() => {
        rTi.classList.add("flip"); // adds flip animation

        // Change color halfway through the flip (at 250ms)
        setTimeout(() => {
          if (letter === chosen[index]) {
            //green
            rTi.style.backgroundColor = "#54a065"; //green
            targetKey.style.backgroundColor = "#54a065"; //green
          } else if (chosen.includes(letter)) {
            //yellow if not green
            rTi.style.backgroundColor = "#ecc75f"; //yellow
            if (targetKey.style.backgroundColor !== "#54a065") {
              //green
              targetKey.style.backgroundColor = "#ecc75f"; //yellow
            }
          } else {
            rTi.style.backgroundColor = "#a79fad"; //gray
            targetKey.style.backgroundColor = "#a79fad"; //gray
          }
          rTi.style.color = "black";
        }, 250);
      }, index * 100); // 100ms delay between each tile
    });
  }; // end of defining colorTiles function

  //calls colorTiles function (STILL INSIDE submitRow)
  colorTiles(currentGuess, target);

  if (currentGuess === game.targetWord) {
    game.state = "won"; //if the guess is the target word: win
    checkState();
    saveScore(game.currentRow + 1); //+1 bc current row starts at 0
  } else if (game.currentRow === rows - 1) {
    game.state = "lost"; //if the guess is the last row & failed: lost
    checkState();
  } else {
    game.currentRow++; // otherwise the game continues into the next row
  }
}; // end of defining submitRow function (colors/states)

//Defines processInput function: applies key inputs into cells
const processInput = (key) => {
  if (game.state !== "playing") {
    //stop from playing if won/lost
    return;
  }
  const currentGuess = game.guesses[game.currentRow];
  if (key === "ENTER") {
    if (currentGuess.length === cols) {
      submitRow(); //calls submitRow function when enter is pressed
    } else {
      const startIdx = game.currentRow * 5; //only target current row cells
      const cells = document.querySelectorAll(".grid-item");

      for (let i = 0; i < cols; i++) {
        const cell = cells[startIdx + i];
        cell.classList.add("shake"); // Add shake animation to each cell

        setTimeout(() => {
          cell.classList.remove("shake");
        }, 500); // remove shake after 500ms
      }
    }
  } else if (key === "BACKSPACE") {
    //removes last letter
    game.guesses[game.currentRow] = currentGuess.slice(0, -1);
  } else if (/^[A-Z]$/.test(key)) {
    //adds a letter
    if (currentGuess.length < cols) {
      game.guesses[game.currentRow] += key;
    }
  }
}; // end of defining processInput function (submit/add/remove letters)

//Defines renderGame function: combines all cells to one variable, then loops through each letter in the guess(row) and each cell(column) in the guess
const renderGame = () => {
  const cells = document.querySelectorAll(".grid-item");
  game.guesses.forEach((letter, rowIndex) => {
    //for each letter in guess
    for (let colIndex = 0; colIndex < cols; colIndex++) {
      const cellIndex = rowIndex * cols + colIndex; //find specific cell from inside the #board grid (cell = .grid-item)
      const cell = cells[cellIndex];
      const newLetter = letter[colIndex] || "";

      // Add emphasis to the new letter being added
      if (cell.innerText === "" && newLetter !== "") {
        //ONLY animate the cell with a new letter being added
        cell.classList.add("pop");
        setTimeout(() => {
          cell.classList.remove("pop");
        }, 100); // remove pop after 100ms
      }
      cell.innerText = newLetter; //adds the new letter to the cell
    }
  });
}; // end of defining renderGame function (#board & .grid-item)

//Define renderKeyboard function: Creates keyboard
const renderKeyboard = (row) => {
  for (let i = 0; i < row.length; i++) {
    const key = document.createElement("div");
    key.className = "key";
    key.textContent = row[i]; //adds the a-z letters on the #keyboard
    keyboard.appendChild(key);
  }
  const br = document.createElement("br"); //makes each row on a new line
  keyboard.appendChild(br);
}; // end of defining renderKeyboard function (#keyboard & .key)

/*
END OF DEFINING FUNCTIONS
*/
/*
MENTAL
SPACE
BREAK
*/
/*
START OF INITALIZING THE GAME
*/

//Initial Keyboard Rendering (so it's there before your first guess)
renderKeyboard(rowOne);
renderKeyboard(rowTwo);
renderKeyboard(rowThree);
displayLeaderboard(); //initialize the leaderboard

//test--
const resetB = document.getElementById("reset");
resetB.addEventListener("click", resetGame);
//test--

//If click mouse to #keyboard, processInput()
keyboard.addEventListener("click", (event) => {
  //checks for clicks on the #keyboard
  const target = event.target;
  if (target.classList.contains("key")) {
    //if the clicked element is #keyboard, input letter from the pressed .key
    const letter = target.textContent.toUpperCase();
    processInput(letter); //calls processInput function (clicking)
    renderGame(); //redraws the #board
  }
}); // end of onClick event (#keyboard)

//if game is playing, process typed key input, then render the board
document.addEventListener("keydown", (event) => {
  if (game.state !== "playing") {
    checkState();
    return;
  }
  const key = event.key.toUpperCase();
  processInput(key); //calls processInput function (typing)
  renderGame(); //redraws the #board
});

//Assigns initial message for the game state (before the game starts).
message.textContent = "You are playing!";
