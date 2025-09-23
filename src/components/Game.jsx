import "./Game.css";
import React, { useEffect, useState } from "react";

function Game() {
  const [playerName1, setPlayerName1] = useState("");
  const [playerName2, setPlayerName2] = useState("");
  const [playerScore1, setPlayerScore1] = useState(0);
  const [playerScore2, setPlayerScore2] = useState(0);
  const [isPlayerOneTurn, setIsPlayerOneTurn] = useState(true);
  const [board, setBoard] = useState(Array(9).fill(""));
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  useEffect(() => {
    const p1 = window.prompt("Enter first player name:");
    const p2 = window.prompt("Enter second player name:");
    if (p1) setPlayerName1(p1);
    if (p2) setPlayerName2(p2);
  }, []);

  function newGame() {
    setPlayerName1("");
    setPlayerName2("");
    setBoard(Array(9).fill(""));
    setIsPlayerOneTurn(true);
    const p1 = window.prompt("Enter first player name:");
    const p2 = window.prompt("Enter second player name:");
    if (p1) setPlayerName1(p1);
    if (p2) setPlayerName2(p2);
    setPlayerScore1(0);
    setPlayerScore2(0);
  }
  function handleCellClick(index) {
    if (board[index]) return; // Don't overwrite if already marked
    const newBoard = [...board];
    newBoard[index] = isPlayerOneTurn ? "X" : "O";
    setBoard(newBoard);
    setIsPlayerOneTurn(!isPlayerOneTurn);

    setTimeout(() => {
      checkWinner(newBoard);
    }, 500);
  }

  function resetGame() {
    setBoard(Array(9).fill(""));
    setIsPlayerOneTurn(!isPlayerOneTurn);
  }

  function checkWinner(currentBoard) {
    for (let combination of winningCombinations) {
      const [a, b, c] = combination;
      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        if (currentBoard[a] === "X") {
          setPlayerScore1(playerScore1 + 1);
          alert(`${playerName1} wins!`);
        } else {
          setPlayerScore2(playerScore2 + 1);
          alert(`${playerName2} wins!`);
        }
        resetGame();
        return;
      }
    }
    if (currentBoard.every((cell) => cell)) {
      alert("It's a draw!");
      resetGame();
    }
  }

  return (
    <div>
      <div className="game-top"> Welcome to Tic Tac toe by vinod</div>
      <div className="game-score">
        <p>Score</p>
        <div className="scores">
          <p>
            {playerName1} X : {playerScore1}
          </p>
          <p>
            {playerName2} O : {playerScore2}
          </p>
        </div>
      </div>
      <div className="game-buttons">
        {board.map((cell, idx) => (
          <button
            className="btn"
            key={idx}
            onClick={() => handleCellClick(idx)}
            style={{
              color: cell === "X" ? "red" : cell === "O" ? "green" : "black",
            }}
          >
            {cell}
          </button>
        ))}
      </div>
      <div className="game-contrls">
        <button className="btn1" onClick={newGame}>
          New Game
        </button>
        <button className="btn1" onClick={resetGame}>
          Reset Game
        </button>{" "}
      </div>
    </div>
  );
}

export default Game;
