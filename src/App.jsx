import { useState, useEffect, useRef } from 'react';
import Controller from './Components/Controller';
import { BiPause } from 'react-icons/bi';
import { FaPause, FaPlay } from 'react-icons/fa';

const App = () => {
  const [level, setLevel] = useState('Medium'); // Game difficulty level
  const [score, setScore] = useState(0); // Current score
  const [highestScore, setHighestScore] = useState(0); // Highest score state
  const [snakeLength, setSnakeLength] = useState(5); // Initial snake length
  const [boardSize, setBoardSize] = useState(368); // Board size in pixels
  const [gridSize, setGridSize] = useState(8); // Grid size for the board
  const centerGrid = Math.floor((boardSize / 2) / gridSize) * gridSize; // Center position for the grid

  // Initial food position
  const [foodPosition, setFoodPosition] = useState({
    x: Math.floor(Math.random() * (boardSize / gridSize)) * gridSize,
    y: Math.floor(Math.random() * (boardSize / gridSize)) * gridSize
  });

  // Function to generate an array of specified length
  const generateArray = (num) => {
    if (num < 1) return [];
    return Array.from({ length: num }, (_, index) => index + 1);
  };

  // Initial snake position
  const [snake, setSnake] = useState(generateArray(snakeLength).map(block => {
    return { x: -(block - 1) * gridSize + centerGrid, y: centerGrid };
  }));

  const [direction, setDirection] = useState('RIGHT'); // Initial snake direction
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 }); // Container size for the game
  const [gameOver, setGameOver] = useState(false); // Game over state
  const [showModal, setShowModal] = useState(false); // Show modal on game over
  const [gameStarted, setGameStarted] = useState(false); // Game start state
  const [isPaused, setIsPaused] = useState(false); // Pause state
  const containerRef = useRef(null); // Reference to the game container

  // Load highest score from local storage on component mount
  useEffect(() => {
    const savedHighestScore = localStorage.getItem('highestScore');
    if (savedHighestScore) {
      setHighestScore(Number(savedHighestScore));
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      handleResize();
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return; // Respect paused state

    const interval = setInterval(() => {
      setSnake(prevSnake => {
        const newSnake = prevSnake.map(segment => ({ ...segment }));
        const head = { ...newSnake[0] };

        // Move snake head based on direction
        switch (direction) {
          case 'RIGHT':
            head.x += gridSize;
            break;
          case 'LEFT':
            head.x -= gridSize;
            break;
          case 'UP':
            head.y -= gridSize;
            break;
          case 'DOWN':
            head.y += gridSize;
            break;
          default:
            break;
        }

        // Check for collisions with walls
        if (head.x < 0 || head.x >= containerSize.width || head.y < 0 || head.y >= containerSize.height) {
          setGameOver(true);
          setShowModal(true);
          return prevSnake;
        }

        // Wrap snake around the edges
        if (head.x < 0) head.x = containerSize.width - gridSize;
        if (head.x >= containerSize.width) head.x = 0;
        if (head.y < 0) head.y = containerSize.height - gridSize;
        if (head.y >= containerSize.height) head.y = 0;

        // Check for collisions with itself
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          setShowModal(true);
          return prevSnake;
        }

        newSnake.unshift(head);

        // Check if snake eats the food
        if (head.x === foodPosition.x && head.y === foodPosition.y) {
          setFoodPosition({
            x: Math.floor(Math.random() * containerSize.width / gridSize) * gridSize,
            y: Math.floor(Math.random() * containerSize.height / gridSize) * gridSize
          });
          setScore(prevScore => {
            const newScore = prevScore + (10 * (level === 'Easy' ? 1 : level === 'Medium' ? 2 : 3));
            if (newScore > highestScore) {
              setHighestScore(newScore);
              localStorage.setItem('highestScore', newScore);
            }
            return newScore;
          });
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, level === 'Easy' ? 200 : level === 'Medium' ? 100 : 50);

    return () => clearInterval(interval);
  }, [direction, containerSize, foodPosition, gameStarted, gameOver, highestScore, level, isPaused]);

  // Handle key presses for controlling the snake and pause functionality
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!gameStarted || gameOver) return;
      switch (event.key) {
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case ' ':
          setIsPaused(prevState => !prevState); // Toggle pause state
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [direction, gameStarted, gameOver]);

  // Restart game on "Enter" key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && showModal) {
        handleRestart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showModal]);

  // Pause the game if the browser tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && gameStarted && !gameOver) {
        setIsPaused(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [gameStarted, gameOver]);

  // Start the game
  const handleStart = () => {
    setGameStarted(true);
    setGameOver(false);
    setShowModal(false);
    setScore(0);
  };

  // Restart the game
  const handleRestart = () => {
    setGameStarted(true);
    setGameOver(false);
    setShowModal(false);
    setSnake(generateArray(snakeLength).map(block => {
      return { x: -(block - 1) * gridSize + 160, y: 192 };
    }));
    setFoodPosition({
      x: Math.floor(Math.random() * (boardSize / gridSize)) * gridSize,
      y: Math.floor(Math.random() * (boardSize / gridSize)) * gridSize
    });
    setDirection('RIGHT');
    setScore(0);
  };

  return (
    <div className="flex flex-col justify-center items-center relative">
      <div className='flex gap-3 pt-4 text-base' style={{ width: `${boardSize}px` }}>
        <p className='bg-gray-700 text-white w-max px-2 py-1 font-medium rounded-sm'>Score: {score}</p>
        <p className='bg-gray-700 text-white w-max px-2 py-1 font-medium rounded-sm'>Highest Score: {highestScore}</p>

        {(!gameStarted || showModal) ? (
          <select value={level} onChange={(e) => setLevel(e.target.value)} className='bg-gray-700 text-white w-max px-2 py-1 font-medium rounded-sm'>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        ) : <button onKeyDown={(e) => e.preventDefault()} onClick={() => setIsPaused(prev => !prev)} className='px-4 py-2 bg-gray-700 text-white rounded w-12 mx-auto'>{isPaused ? <FaPlay /> : <FaPause />}</button>}
      </div>
      <h2 className='text-base font-bold'>{level}</h2>
      <div
        ref={containerRef}
        className="relative bg-gray-200 border border-black"
        style={{ width: `${boardSize}px`, height: `${boardSize}px` }}
      >
        {snake.map((segment, index) => (
          <div
            key={index}
            className="absolute bg-gray-700 rounded-full"
            style={{
              left: `${segment.x}px`,
              top: `${segment.y}px`,
              width: `${gridSize}px`,
              height: `${gridSize}px`,
            }}
          ></div>
        ))}

        <div
          className="absolute bg-red-500 rounded-full"
          style={{
            left: `${foodPosition.x}px`,
            top: `${foodPosition.y}px`,
            width: `${gridSize}px`,
            height: `${gridSize}px`,
          }}
        ></div>

        {showModal && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50 text-white text-xl">
            <div>Game Over</div>
            <button
              className="mt-4 px-4 py-2 bg-gray-700 rounded"
              onClick={handleRestart}
            >
              Restart
            </button>
            <p className='text-base mt-4'>Or press "Enter" to restart.</p>
          </div>
        )}
        {isPaused && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50 text-white text-xl">
            <p>Paused.</p>
            <div className='text-base text-center'>{`Press "Space" or click "Continue Button" to continue`}</div>
          </div>
        )}

        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 text-white text-xl">
            <button
              className="px-4 py-2 bg-gray-700 rounded"
              onClick={handleStart}
            >
              Start Game
            </button>
          </div>
        )}
      </div>
      <Controller />
    </div>
  );
};

export default App;
