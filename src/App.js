import React, { useState } from 'react';
import './App.css';

// Utility function to draw a random card from the deck
const drawCard = () => {
  const cardSuits = ['H', 'D', 'C', 'S']; // Hearts, Diamonds, Clubs, Spades
  const cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const suit = cardSuits[Math.floor(Math.random() * cardSuits.length)];
  const value = cardValues[Math.floor(Math.random() * cardValues.length)];
  return value + suit;
};

function App() {
  const [username, setUsername] = useState('');
  const [money, setMoney] = useState(0);
  const [playerHand, setPlayerHand] = useState([]);
  const [playerTotal, setPlayerTotal] = useState(0);
  const [dealerHand, setDealerHand] = useState([]);
  const [dealerTotal, setDealerTotal] = useState(0);
  const [gameResult, setGameResult] = useState(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showModal, setShowModal] = useState(false); // For modal control
  const [wager, setWager] = useState(0); // New state for wager

  // Start the game and fetch user's money
  const handleStart = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      setMoney(data.money);

      const initialPlayerHand = [drawCard(), drawCard()];
      const initialDealerHand = [drawCard()];
      setPlayerHand(initialPlayerHand);
      setPlayerTotal(calculateTotal(initialPlayerHand));
      setDealerHand(initialDealerHand);
      setDealerTotal(calculateTotal(initialDealerHand));

      setIsGameStarted(true);
      setGameResult(null); // Reset game result
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Error starting game');
    }
  };

  // Calculate total score for the hand
  const calculateTotal = (hand) => {
    let total = 0;
    let aces = 1;//made test change here 
    hand.forEach(card => {
      const value = card.slice(0, -1); // Get value part (e.g., '10', 'J', 'A')
      if (value === 'A') {
        total += 11;
        aces++;
      } else if (['J', 'Q', 'K'].includes(value)) {
        total += 10;
      } else {
        total += parseInt(value);
      }
    });

    // Adjust for aces (if total > 21, subtract 10 for each ace)
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
    return total;
  };

  // Handle player hitting for a new card
  const handleHit = async () => {
    try {
      const newCard = drawCard();
      const newPlayerHand = [...playerHand, newCard];
      const newPlayerTotal = calculateTotal(newPlayerHand);
      setPlayerHand(newPlayerHand);
      setPlayerTotal(newPlayerTotal);

      if (newPlayerTotal > 21) {
        setGameResult('lose');
        await updateMoneyOnResult('lose');
        setShowModal(true); // Show modal when player busts
      }
    } catch (error) {
      console.error('Error hitting:', error);
    }
  };

  // Handle player standing to end the game
  const handleStand = async () => {
    let dealerHandCopy = [...dealerHand];
    let dealerTotalCopy = dealerTotal;

    // Dealer logic to keep drawing cards until total is 17 or higher
    while (dealerTotalCopy < 17) {
      const newCard = drawCard();
      dealerHandCopy.push(newCard);
      dealerTotalCopy = calculateTotal(dealerHandCopy);
      setDealerHand(dealerHandCopy);
      setDealerTotal(dealerTotalCopy);
    }

    // Determine game result
    const result = playerTotal > 21 ? 'lose' :
      dealerTotalCopy > 21 ? 'win' :
      playerTotal > dealerTotalCopy ? 'win' :
      playerTotal === dealerTotalCopy ? 'draw' : 'lose';

    setGameResult(result);
    await updateMoneyOnResult(result);
    setShowModal(true); // Show modal when game ends
  };

  // Update money based on game result
  const updateMoneyOnResult = async (result) => {
    let updatedMoney = money;
    
    if (result === 'win') {
      updatedMoney += wager;
    } else if (result === 'lose') {
      updatedMoney -= wager;
    }
  
    try {
      const response = await fetch('http://localhost:5000/api/stand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, playerTotal, dealerTotal, result }),
      });
      
      const data = await response.json();
      // Ensure the backend response contains the correct updated money
      setMoney(data.money); // Update money after receiving the response
    } catch (error) {
      console.error('Error updating money:', error);
    }
  };

  // Handle restarting the game or going back to the main menu
  const handleRestart = () => {
    setIsGameStarted(false);
    setGameResult(null);
    setPlayerHand([]);
    setPlayerTotal(0);
    setDealerHand([drawCard()]);
    setDealerTotal(0);
    setShowModal(false); // Close the modal
    setWager(0); // Reset wager after game restart
  };

  const handleMainMenu = () => {
    setIsGameStarted(false);
    setGameResult(null);
    setShowModal(false); // Close the modal
  };

  // Wager increase and decrease handlers
  const increaseWager = () => {
    if (wager < money) {
      setWager(wager + 50); // Increase wager by 50, but not beyond money
    }
  };

  const decreaseWager = () => {
    if (wager > 0) {
      setWager(wager - 50); // Decrease wager by 50, but not below 0
    }
  };

  return (
    <div className="App">
      <h1>Welcome to Blackjack!</h1>

      {!isGameStarted && (
        <div className="start-screen">
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleStart}>Start Game</button>
        </div>
      )}

      {isGameStarted && (
        <>
          <h2 className="money">Money: ${money}</h2>

          {/* Wager Control */}
          <div className="wager-control">
            <h3>Wager: ${wager}</h3>
            <button onClick={decreaseWager} disabled={wager === 0}>-</button>
            <button onClick={increaseWager} disabled={wager === money}>+</button>
          </div>

          {/* Dealer Hand */}
          <div className="hand-container dealer">
            <h3>Dealer Hand Total: {dealerTotal}</h3>
          </div>

          {/* Player Hand */}
          <div className="hand-container player">
            <h3>Player Hand Total: {playerTotal}</h3>
            <div className="hand player-hand">
              {playerHand.map((card, index) => {
                const cardValue = card.slice(0, -1); // Get the value part (e.g., '10', 'J', 'A')
                const cardSuit = card.slice(-1); // Get the suit part (e.g., 'C', 'D', 'H', 'S')

                const cardImageURL = cardValue === '10'
                  ? `https://deckofcardsapi.com/static/img/0${cardSuit}.png`
                  : `https://deckofcardsapi.com/static/img/${cardValue}${cardSuit}.png`;

                return (
                  <div key={index} className="card animated-card">
                    <img src={cardImageURL} alt={`card ${card}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Game Action Buttons */}
          <div className="action-buttons">
            <button onClick={handleHit} disabled={gameResult !== null}>Hit</button>
            <button onClick={handleStand} disabled={gameResult !== null}>Stand</button>
          </div>

          {gameResult && (
            <div className="game-result">
              <h2 className="result">Result: You {gameResult}!</h2>
            </div>
          )}
        </>
      )}

      {/* Modal for New Round or Main Menu */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3 className='GameOver'>Game Over</h3>
            <p className = 'GameOver'>You {gameResult === 'win' ? 'won!' : gameResult === 'lose' ? 'lost!' : 'tied!'}</p>
            <button onClick={handleRestart}>New Game</button>
            <button onClick={handleMainMenu}>Main Menu</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
