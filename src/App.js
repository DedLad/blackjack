import React, { useState } from "react";
import BlackjackRules from "./rules";

import "./App.css";

// Utility function to draw a random card
const drawCard = () => {
  const cardSuits = ["H", "D", "C", "S"]; // Hearts, Diamonds, Clubs, Spades
  const cardValues = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  const suit = cardSuits[Math.floor(Math.random() * cardSuits.length)];
  const value = cardValues[Math.floor(Math.random() * cardValues.length)];
  return value + suit;
};

function App() {
  const [username, setUsername] = useState("");
  const [money, setMoney] = useState(0);
  const [playerHand, setPlayerHand] = useState([]);
  const [playerTotal, setPlayerTotal] = useState(0);
  const [dealerHand, setDealerHand] = useState([]);
  const [dealerTotal, setDealerTotal] = useState(0);
  const [gameResult, setGameResult] = useState(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showModal, setShowModal] = useState(false); // Modal for game result
  const [showRules, setShowRules] = useState(false); // Toggle for rules

  // Show rules page
  const handleShowRules = () => {
    setShowRules(true);
  };

  // Return to the game
  const handleReturnToGame = () => {
    setShowRules(false);
  };

  // Rest of the game logic remains the same
  const handleStart = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      setGameResult(null);
    } catch (error) {
      console.error("Error starting game:", error);
      alert("Error starting game");
    }
  };

  const calculateTotal = (hand) => {
    let total = 0;
    let aces = 0;
    hand.forEach((card) => {
      const value = card.slice(0, -1); // Get value part (e.g., '10', 'J', 'A')
      if (value === "A") {
        total += 11;
        aces++;
      } else if (["J", "Q", "K"].includes(value)) {
        total += 10;
      } else {
        total += parseInt(value);
      }
    });

    // Adjust for aces
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
    return total;
  };

  return (
    <div className="App">
      <h1>Welcome to Blackjack!</h1>

      {/* Toggle Between Game and Rules */}
      {!isGameStarted && !showRules && (
        <>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleStart}>Start Game</button>
          <button onClick={handleShowRules}>View Rules</button>
        </>
      )}

      {showRules && (
        <div className="rules-page">
          <BlackjackRules />
          <button onClick={handleReturnToGame}>Back to Game</button>
        </div>
      )}

      {/* Render Game Only When Started */}
      {isGameStarted && !showRules && (
        <div>
          <h2>Money: ${money}</h2>
          {/* Game logic here */}
        </div>
      )}
    </div>
  );
}

export default App;