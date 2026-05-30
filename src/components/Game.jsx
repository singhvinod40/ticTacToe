import "./Game.css";
import React, { useEffect, useState } from "react";
import { database } from "../firebase/firebaseConfig";
import { ref, set, onValue, update, remove, get } from "firebase/database";

function Game() {
  const [gameState, setGameState] = useState("lobby"); // lobby, game, waiting
  const [playerName, setPlayerName] = useState("");
  const [playerRole, setPlayerRole] = useState(null); // "player1" or "player2"
  const [roomCode, setRoomCode] = useState("");
  const [inputRoomCode, setInputRoomCode] = useState("");
  const [board, setBoard] = useState(Array(9).fill(""));
  const [currentTurn, setCurrentTurn] = useState("X");
  const [playerScore1, setPlayerScore1] = useState(0);
  const [playerScore2, setPlayerScore2] = useState(0);
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [gameMessage, setGameMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);

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

  // Generate random room code
  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Create new game
  const createGame = () => {
    if (!playerName.trim()) {
      alert("Please enter your name");
      return;
    }
    const code = generateRoomCode();
    setRoomCode(code);
    setPlayerRole("player1");
    setPlayer1Name(playerName);
    setGameState("waiting");

    // Create game in Firebase
    const gameRef = ref(database, `games/${code}`);
    set(gameRef, {
      player1: playerName,
      player2: null,
      board: Array(9).fill(""),
      turn: "X",
      score1: 0,
      score2: 0,
      gameStatus: "waiting", // waiting, active, finished
      createdAt: new Date().getTime(),
    });

    setIsConnected(true);
  };

  // Join existing game
  const joinGame = () => {
    if (!playerName.trim()) {
      alert("Please enter your name");
      return;
    }
    if (!inputRoomCode.trim()) {
      alert("Please enter room code");
      return;
    }

    const code = inputRoomCode.toUpperCase();
    const gameRef = ref(database, `games/${code}`);

    // Use get() for a one-time read
    get(gameRef)
      .then((snapshot) => {
        if (!snapshot.exists()) {
          alert("Game room not found");
          return;
        }

        const data = snapshot.val();
        if (data.player2) {
          alert("Game is already full");
          return;
        }

        setRoomCode(code);
        setPlayerRole("player2");
        setPlayer1Name(data.player1);
        setPlayer2Name(playerName);

        // Update Firebase with player2
        update(gameRef, {
          player2: playerName,
          gameStatus: "active",
        });

        setGameState("game");
        setIsConnected(true);
      })
      .catch((error) => {
        alert("Error connecting to game: " + error.message);
      });
  };

  // Listen to game updates from Firebase
  useEffect(() => {
    if (!roomCode || gameState === "lobby") return;

    const gameRef = ref(database, `games/${roomCode}`);
    const unsubscribe = onValue(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setBoard(data.board);
        setCurrentTurn(data.turn);
        setPlayerScore1(data.score1);
        setPlayerScore2(data.score2);
        setPlayer1Name(data.player1);
        setPlayer2Name(data.player2);

        if (data.gameStatus === "active") {
          setGameState("game");
        }

        // Check for winner
        if (data.gameStatus === "finished") {
          setGameMessage(data.winner ? `${data.winner} wins!` : "Draw!");
        }
      }
    });

    return () => unsubscribe();
  }, [roomCode, gameState]);

  // Handle cell click
  const handleCellClick = (index) => {
    if (gameState !== "game" || !isConnected) return;
    if (board[index]) return; // Cell already occupied
    if (currentTurn !== (playerRole === "player1" ? "X" : "O")) {
      setGameMessage("Not your turn!");
      return;
    }

    const newBoard = [...board];
    newBoard[index] = currentTurn;

    // Check winner
    let winner = checkWinner(newBoard);

    if (winner) {
      const newScore1 = winner === "X" ? playerScore1 + 1 : playerScore1;
      const newScore2 = winner === "O" ? playerScore2 + 1 : playerScore2;

      const gameRef = ref(database, `games/${roomCode}`);
      update(gameRef, {
        board: newBoard,
        turn: currentTurn === "X" ? "O" : "X",
        score1: newScore1,
        score2: newScore2,
        gameStatus: "finished",
        winner: winner === "X" ? player1Name : player2Name,
      });

      setGameMessage(`${winner === "X" ? player1Name : player2Name} wins! 🎉`);
      setTimeout(() => resetGameBoard(), 2000);
    } else if (newBoard.every((cell) => cell)) {
      const gameRef = ref(database, `games/${roomCode}`);
      update(gameRef, {
        board: newBoard,
        gameStatus: "finished",
        winner: null,
      });
      setGameMessage("It's a Draw!");
      setTimeout(() => resetGameBoard(), 2000);
    } else {
      const gameRef = ref(database, `games/${roomCode}`);
      update(gameRef, {
        board: newBoard,
        turn: currentTurn === "X" ? "O" : "X",
      });
    }
  };

  const checkWinner = (currentBoard) => {
    for (let combination of winningCombinations) {
      const [a, b, c] = combination;
      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        return currentBoard[a];
      }
    }
    return null;
  };

  const resetGameBoard = () => {
    const gameRef = ref(database, `games/${roomCode}`);
    update(gameRef, {
      board: Array(9).fill(""),
      turn: "X",
      gameStatus: "active",
      winner: null,
    });
    setGameMessage("");
  };

  const leaveGame = () => {
    if (roomCode) {
      const gameRef = ref(database, `games/${roomCode}`);
      remove(gameRef);
    }
    setGameState("lobby");
    setRoomCode("");
    setPlayerName("");
    setInputRoomCode("");
    setIsConnected(false);
    setGameMessage("");
  };

  // Render Lobby
  if (gameState === "lobby") {
    return (
      <div className="game-container">
        <div className="game-top">Welcome to Multiplayer Tic Tac Toe</div>
        <div className="lobby">
          <div className="lobby-section">
            <h2>Enter Your Name</h2>
            <input
              type="text"
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") createGame();
              }}
            />
            <button className="btn1" onClick={createGame}>
              Create Game
            </button>
          </div>

          <div className="lobby-divider">OR</div>

          <div className="lobby-section">
            <h2>Join Game</h2>
            <input
              type="text"
              placeholder="Room Code"
              value={inputRoomCode}
              onChange={(e) => setInputRoomCode(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") joinGame();
              }}
            />
            <button className="btn1" onClick={joinGame}>
              Join Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Waiting for player
  if (gameState === "waiting") {
    return (
      <div className="game-container">
        <div className="game-top">Waiting for Player 2...</div>
        <div className="game-code-display">
          <p>Share this code with your friend:</p>
          <div className="code-box">{roomCode}</div>
          <button className="btn1" onClick={() => navigator.clipboard.writeText(roomCode)}>
            Copy Code
          </button>
        </div>
        <button className="btn1 cancel" onClick={leaveGame}>
          Cancel
        </button>
      </div>
    );
  }

  // Render Game
  if (gameState === "game") {
    const mySymbol = playerRole === "player1" ? "X" : "O";
    const isMyTurn = currentTurn === mySymbol;

    return (
      <div className="game-container">
        <div className="game-top">Multiplayer Tic Tac Toe</div>
        <div className="game-code-display">
          <p>Room Code: <strong>{roomCode}</strong></p>
        </div>

        <div className="game-score">
          <p>Score</p>
          <div className="scores">
            <p className={currentTurn === "X" ? "active" : ""}>
              {player1Name} (X) : {playerScore1}
            </p>
            <p className={currentTurn === "O" ? "active" : ""}>
              {player2Name} (O) : {playerScore2}
            </p>
          </div>
        </div>

        <div className="turn-indicator">
          {isMyTurn ? (
            <span className="your-turn">🎮 Your Turn!</span>
          ) : (
            <span className="waiting-turn">⏳ Waiting for opponent...</span>
          )}
        </div>

        {gameMessage && (
          <div className="game-message">{gameMessage}</div>
        )}

        <div className="game-buttons">
          {board.map((cell, idx) => (
            <button
              className="btn"
              key={idx}
              onClick={() => handleCellClick(idx)}
              disabled={!isMyTurn || gameMessage}
              style={{
                color: cell === "X" ? "red" : cell === "O" ? "green" : "black",
                cursor: isMyTurn && !gameMessage ? "pointer" : "not-allowed",
                opacity: isMyTurn && !gameMessage ? 1 : 0.7,
              }}
            >
              {cell}
            </button>
          ))}
        </div>

        <div className="game-contrls">
          <button className="btn1" onClick={leaveGame}>
            Leave Game
          </button>
        </div>
      </div>
    );
  }
}

export default Game;
