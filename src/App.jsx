import { useState, useEffect, useRef } from 'react';
import Controller from './Components/Controller';
import { BiPause } from 'react-icons/bi';
import { FaPause, FaPlay } from 'react-icons/fa';

const App = () => {
  const [level, setLevel] = useState('Medium');
  const [score, setScore] = useState(0);
  const [highestScore, setHighestScore] = useState(0); // Initialize highest score state
  const [snakeBlock, setSnakeBlock] = useState(5);
  const [boxSize, setBoxSize] = useState(368);
  const [gameBaseNumber, setBaseNumber] = useState(8);
  const mediumBase = Math.floor((boxSize / 2) / gameBaseNumber) * gameBaseNumber;

  const [foodPosition, setFoodPosition] = useState({
    x: Math.floor(Math.random() * (boxSize / gameBaseNumber)) * gameBaseNumber,
    y: Math.floor(Math.random() * (boxSize / gameBaseNumber)) * gameBaseNumber
  });

  const generateArray = (num) => {
    if (num < 1) return [];
    return Array.from({ length: num }, (_, index) => index + 1);
  };

  const [snake, setSnake] = useState(generateArray(snakeBlock).map(block => {
    return { x: -(block - 1) * gameBaseNumber + mediumBase, y: mediumBase };
  }));

  const [direction, setDirection] = useState('RIGHT');
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // New state for pause functionality
  const containerRef = useRef(null);

  useEffect(() => {
    const savedHighestScore = localStorage.getItem('highestScore');
    if (savedHighestScore) {
      setHighestScore(Number(savedHighestScore));
    }
  }, []);

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

  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return; // Respect paused state

    const interval = setInterval(() => {
      setSnake(prevSnake => {
        const newSnake = prevSnake.map(segment => ({ ...segment }));
        const head = { ...newSnake[0] };

        switch (direction) {
          case 'RIGHT':
            head.x += gameBaseNumber;
            break;
          case 'LEFT':
            head.x -= gameBaseNumber;
            break;
          case 'UP':
            head.y -= gameBaseNumber;
            break;
          case 'DOWN':
            head.y += gameBaseNumber;
            break;
          default:
            break;
        }

        if (head.x < 0 || head.x >= containerSize.width || head.y < 0 || head.y >= containerSize.height) {
          setGameOver(true);
          setShowModal(true);
          return prevSnake;
        }

        if (head.x < 0) head.x = containerSize.width - gameBaseNumber;
        if (head.x >= containerSize.width) head.x = 0;
        if (head.y < 0) head.y = containerSize.height - gameBaseNumber;
        if (head.y >= containerSize.height) head.y = 0;

        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          setShowModal(true);
          return prevSnake;
        }

        newSnake.unshift(head);

        if (head.x === foodPosition.x && head.y === foodPosition.y) {
          setFoodPosition({
            x: Math.floor(Math.random() * containerSize.width / gameBaseNumber) * gameBaseNumber,
            y: Math.floor(Math.random() * containerSize.height / gameBaseNumber) * gameBaseNumber
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
  }, [direction, containerSize, foodPosition, gameStarted, gameOver, highestScore, level, isPaused]); // Include isPaused

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

  useEffect(() => {
    const handleKeyDown = (event) => {
      console.log(event.key);

      if (event.key === 'Enter') {
        if (showModal === true) {
          handleRestart();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showModal]);

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

  const handleStart = () => {
    setGameStarted(true);
    setGameOver(false);
    setShowModal(false);
    setScore(0);
  };

  const handleRestart = () => {
    setGameStarted(true);
    setGameOver(false);
    setShowModal(false);
    setSnake(generateArray(snakeBlock).map(block => {
      return { x: -(block - 1) * gameBaseNumber + 160, y: 192 };
    }));
    setFoodPosition({
      x: Math.floor(Math.random() * (boxSize / gameBaseNumber)) * gameBaseNumber,
      y: Math.floor(Math.random() * (boxSize / gameBaseNumber)) * gameBaseNumber
    });
    setDirection('RIGHT');
    setScore(0);
  };



  return (
    <div className="flex flex-col justify-center items-center relative">

      <div className='flex gap-3 pt-4 text-base' style={{ width: `${boxSize}px` }}>
        <p className='bg-gray-700 text-white w-max px-2 py-1 font-medium rounded-sm'>Score: {score}</p>
        <p className='bg-gray-700 text-white w-max px-2 py-1  font-medium rounded-sm'>Highest Score: {highestScore}</p>

        {(!gameStarted || showModal) ? (
          <select value={level} onChange={(e) => setLevel(e.target.value)} className='bg-gray-700 text-white w-max px-2 py-1 font-medium rounded-sm ' id="">
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
        style={{ width: `${boxSize}px`, height: `${boxSize}px` }}
      >
        {snake.map((segment, index) => (
          <div
            key={index}
            className="absolute bg-gray-700 rounded-full"
            style={{
              left: `${segment.x}px`,
              top: `${segment.y}px`,
              width: `${gameBaseNumber}px`,
              height: `${gameBaseNumber}px`,
            }}
          ></div>
        ))}

        <div
          className="absolute bg-red-500 rounded-full"
          style={{
            left: `${foodPosition.x}px`,
            top: `${foodPosition.y}px`,
            width: `${gameBaseNumber}px`,
            height: `${gameBaseNumber}px`,
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
            <p className='text-base  mt-4'>Or press "Enter" ot restart.</p>
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
