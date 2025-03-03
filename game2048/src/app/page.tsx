'use client';

import { useEffect, useState, useCallback } from 'react';

export default function Home() {
  const [board, setBoard] = useState<number[][]>([[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]);
  const [score, setScore] = useState(0);
  const [previousScore, setPreviousScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [username, setUsername] = useState('');
  const [topScores, setTopScores] = useState<Array<{ username: string; score: number }>>([]);

  const fetchTopScores = useCallback(async () => {
    try {
      const response = await fetch('/api/scores');
      const data = await response.json();
      setTopScores(data);
    } catch (error) {
      console.error('Failed to fetch scores:', error);
    }
  }, []);

  const saveScore = async () => {
    if (!username) return;
    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          score,
        }),
      });
      await fetchTopScores();
      setShowNameInput(false);
      setUsername('');
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  useEffect(() => {
    fetchTopScores();
  }, [fetchTopScores]);

  const generateNewTile = useCallback((currentBoard: number[][]) => {
    const emptyCells: [number, number][] = [];
    currentBoard.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell === 0) emptyCells.push([i, j]);
      });
    });

    if (emptyCells.length === 0) return currentBoard;

    const [newRow, newCol] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newValue = Math.random() < 0.9 ? 2 : 4;
    
    const newBoard = currentBoard.map(row => [...row]);
    newBoard[newRow][newCol] = newValue;
    return newBoard;
  }, []);

  const initializeGame = useCallback(() => {
    let newBoard = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    newBoard = generateNewTile(newBoard);
    newBoard = generateNewTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setWon(false);
  }, [generateNewTile]);

  const compress = (line: number[]): [number[], number] => {
    const nonZero = line.filter(cell => cell !== 0);
    let score = 0;
    
    for (let i = 0; i < nonZero.length - 1; i++) {
      if (nonZero[i] === nonZero[i + 1]) {
        nonZero[i] *= 2;
        score += nonZero[i];
        nonZero.splice(i + 1, 1);
      }
    }
    
    while (nonZero.length < 4) nonZero.push(0);
    return [nonZero, score];
  };

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver || won) return;

    let newBoard = board.map(row => [...row]);
    let moved = false;
    let newScore = 0;

    const rotate = (board: number[][]): number[][] => {
      return board[0].map((_, i) => board.map(row => row[i]).reverse());
    };

    if (direction === 'up') newBoard = rotate(rotate(rotate(newBoard)));
    if (direction === 'right') newBoard = rotate(rotate(newBoard));
    if (direction === 'down') newBoard = rotate(newBoard);

    newBoard = newBoard.map(row => {
      const [newRow, score] = compress(row);
      newScore += score;
      const changed = row.some((val, i) => val !== newRow[i]);
      if (changed) moved = true;
      return newRow;
    });

    if (direction === 'up') newBoard = rotate(newBoard);
    if (direction === 'right') newBoard = rotate(rotate(newBoard));
    if (direction === 'down') newBoard = rotate(rotate(rotate(newBoard)));

    if (moved) {
      setPreviousScore(score);
      setScore(prev => prev + newScore);
      newBoard = generateNewTile(newBoard);
      setBoard(newBoard);

      if (newBoard.some(row => row.some(cell => cell === 2048))) {
        setWon(true);
      }

      const isGameOver = checkGameOver(newBoard);
      if (isGameOver) {
        setGameOver(true);
      }
    }
  }, [board, gameOver, won, generateNewTile, score]);

  const checkGameOver = (currentBoard: number[][]) => {
    if (currentBoard.some(row => row.some(cell => cell === 0))) return false;

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const current = currentBoard[i][j];
        if (
          (i < 3 && current === currentBoard[i + 1][j]) ||
          (j < 3 && current === currentBoard[i][j + 1])
        ) {
          return false;
        }
      }
    }
    return true;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': move('up'); break;
        case 'ArrowDown': move('down'); break;
        case 'ArrowLeft': move('left'); break;
        case 'ArrowRight': move('right'); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    if (gameOver || won) {
      setShowNameInput(true);
    }
  }, [gameOver, won]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="score-board">
          SCORE : {score}
        </div>

        <div className="game-board">
          {board.map((row, i) => 
            row.map((cell, j) => (
              <div 
                key={`${i}-${j}`} 
                className={`cell ${cell !== 0 ? `tile-${cell} animate-pop` : 'bg-gray-200'}`}
              >
                {cell !== 0 && cell}
              </div>
            ))
          )}
        </div>

        <div className="ranking-board">
          <h2 className="ranking-title">ランキングボード</h2>
          <div className="ranking-list">
            {topScores.slice(0, 3).map((score, index) => (
              <div key={index} className="ranking-item">
                <span>{index + 1}位 {score.username}</span>
                <span>{score.score}</span>
              </div>
            ))}
          </div>
        </div>

        {showNameInput && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="text-2xl font-bold mb-4">
                {won ? "Congratulations!" : "Game Over!"}
              </h2>
              <p className="mb-4">Your score: {score}</p>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-2 border rounded mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowNameInput(false);
                    initializeGame();
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Skip
                </button>
                <button
                  onClick={async () => {
                    await saveScore();
                    initializeGame();
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save Score
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
