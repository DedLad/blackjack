import React, { useState } from 'react';
import './App.css';
import BlackjackRules from './rules'; // Import the rules component

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
  const [wager, setWager] = useState(0); //wager state, was thinking off adding a default state but some issue
  const [playerHand, setPlayerHand] = useState([]);
  const [playerTotal, setPlayerTotal] = useState(0);
  const [dealerHand, setDealerHand] = useState([]);
  const [dealerTotal, setDealerTotal] = useState(0);
  const [gameResult, setGameResult] = useState(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isWagerSet, setIsWagerSet] = useState(false); // Wager status state
  const [showModal, setShowModal] = useState(false); // For modal control
  const [showRules, setShowRules] = useState(false); // Toggle for showing rules

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
      setIsGameStarted(true);
      setGameResult(null); 
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Error starting game');
    }
  };

  // Wager amount field validation and setting the wager
  const handleSetWager = () => {
    if (wager > 0 && wager <= money) {
      const initialPlayerHand = [drawCard(), drawCard()];
      const initialDealerHand = [drawCard()];
      setPlayerHand(initialPlayerHand);
      setPlayerTotal(calculateTotal(initialPlayerHand));
      setDealerHand(initialDealerHand);
      setDealerTotal(calculateTotal(initialDealerHand));
      setIsWagerSet(true);
    } else {
      alert('Invalid wager amount. Please enter an amount within your available money.');
    }
  };

  // Calculate total score for the hand
  const calculateTotal = (hand) => {
    let total = 0;
    let aces = 0;
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
        setTimeout(() => {
          setShowModal(true); // 1.5 secs time delay
        }, 500);
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
    setShowModal(true); // Show the modal when the game ends
  };

  // Update money based on game result
  const updateMoneyOnResult = async (result) => {
    try {
      const response = await fetch('http://localhost:5000/api/stand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, playerTotal, dealerTotal, result, wager }),
      });
      const data = await response.json();
      setMoney(data.money);
    } catch (error) {
      console.error('Error updating money:', error);
    }
  };

  // Handle restarting the game or going back to the main menu
  const handleRestart = () => {
    setIsGameStarted(false);
    setIsWagerSet(false);
    setGameResult(null);
    setPlayerHand([]);
    setPlayerTotal(0);
    setDealerHand([drawCard()]);
    setDealerTotal(0);
    setShowModal(false); // Close the modal
  };

  const handleMainMenu = () => {
    setIsGameStarted(false);
    setIsWagerSet(false);
    setGameResult(null);
    setShowModal(false); // Close the modal
  };

  return (
    <div className="App">
      <h1>Welcome to Blackjack!</h1>

      {!isGameStarted && !showRules && (
        <div className="start-screen">
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleStart}>Start Game</button>
          <button onClick={() => setShowRules(true)}>Show Rules</button>
        </div>
      )}

      {isGameStarted && !isWagerSet && (
        <div className="wager-screen">
          <h2 className="money">Money: ${money}</h2>
          <input
            type="number"
            placeholder="Enter wager amount"
            value={wager}
            onChange={(e) => setWager(parseInt(e.target.value))}
          />
          <button onClick={handleSetWager}>Set Wager</button>
        </div>
      )}

      {isGameStarted && isWagerSet && (
        <>
          <h2 className="money">Money: ${money}</h2>

          {/* Dealer Hand */}
          <div className="hand-container dealer">
            <h3>Dealer Hand Total: {dealerTotal}</h3>
          </div>

          {/* Player Hand */}
          <div className="hand-container player">
            <h3>Player Hand Total: {playerTotal}</h3>
            <div className="hand player-hand">
              {playerHand.map((card, index) => (
                <div key={index} className="card animated-card">
                  <img
                    src={`https://deckofcardsapi.com/static/img/${card[0] === '1' && card[1] === '0' ? '0' + card.slice(2) : card}.png`}
                    alt="card"
                  />
                </div>
              ))}
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
            <p className='GameOver'>You {gameResult === 'win' ? 'won!' : gameResult === 'lose' ? 'lost!' : 'tied!'}</p>
            <button onClick={handleRestart}>New Game</button>
            <button onClick={handleMainMenu}>Main Menu</button>
          </div>
        </div>
      )}

      {/* Rules Screen */}
      {showRules && (
        <div className="rules-screen">
          <BlackjackRules />
          <button onClick={() => setShowRules(false)}>Back to Main Menu</button>
        </div>
      )}
    </div>
  );
}

export default App;