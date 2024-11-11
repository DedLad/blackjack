import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const App = () => {
    const [deck, setDeck] = useState([]);
    const [playerHand, setPlayerHand] = useState([]);
    const [dealerHand, setDealerHand] = useState([]);
    const [playerScore, setPlayerScore] = useState(0);
    const [dealerScore, setDealerScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState('');
    const [money, setMoney] = useState(0);
    const [bet, setBet] = useState(0);
    const [betPlaced, setBetPlaced] = useState(false);
    const [showHome, setShowHome] = useState(true);

    useEffect(() => {
        const fetchMoney = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/start');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log('Fetched money:', data.money);
                setMoney(data.money);
            } catch (error) {
                console.error("Error fetching money:", error);
            }
        };
        fetchMoney();
    }, []);

    const startGame = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5000/api/start-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ bet }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setDeck(data.deck);
            setPlayerHand(data.playerHand);
            setDealerHand(data.dealerHand);
            setPlayerScore(data.playerScore);
            setDealerScore(data.dealerScore);
            setGameOver(false);
            setMessage('');
            setBetPlaced(true);
            setMoney(data.money);
        } catch (error) {
            console.error("Error starting game:", error);
        }
    }, [bet]);

    const hit = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/hit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ deck, playerHand }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setDeck(data.deck);
            setPlayerHand(data.playerHand);
            setPlayerScore(data.playerScore);

            if (data.playerScore > 21) {
                setGameOver(true);
                setMessage('You bust! Dealer wins.');
            }
        } catch (error) {
            console.error("Error hitting:", error);
        }
    };

    const stand = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/dealer-turn', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ deck, dealerHand, playerScore, bet }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setDeck(data.deck);
            setDealerHand(data.dealerHand);
            setDealerScore(data.dealerScore);

            const playerWins = playerScore > dealerScore || dealerScore > 21;
            const dealerWins = dealerScore > playerScore && dealerScore <= 21;

            if (playerWins) {
                setMessage('You win!');
                setMoney(data.money);
            } else if (dealerWins) {
                setMessage('Dealer wins!');
                setMoney(data.money);
            } else {
                setMessage('It\'s a tie!');
            }
            setGameOver(true);
        } catch (error) {
            console.error("Error standing:", error);
        }
    };

    const placeBet = (amount) => {
        if (amount > money) {
            setMessage('Bet amount exceeds available money');
            return;
        }
        setBet(amount);
        startGame();
    };

    return (
        <div className="App">
            {showHome ? (
                <div>
                    <h1>Welcome to Blackjack</h1>
                    <button onClick={() => setShowHome(false)}>Start</button>
                </div>
            ) : (
                <div>
                    <h1>Blackjack Game</h1>
                    <div className="money">Money: ${money}</div>
                    {!betPlaced ? (
                        <div>
                            <h2>Place your bet</h2>
                            <input type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} />
                            <button onClick={() => placeBet(bet)}>Place Bet</button>
                            {message && <p className="error">{message}</p>}
                        </div>
                    ) : (
                        <div>
                            <div>
                                <h2>Player's Hand</h2>
                                <div className="hand">{playerHand.map((card, index) => <span key={index} className="card">{card.value} of {card.suit}</span>)}</div>
                                <h3>Score: {playerScore}</h3>
                            </div>
                            <div>
                                <h2>Dealer's Hand</h2>
                                <div className="hand">{dealerHand.map((card, index) => <span key={index} className="card">{card.value} of {card.suit}</span>)}</div>
                                {gameOver && <h3>Score: {dealerScore}</h3>}
                            </div>
                            {!gameOver ? (
                                <>
                                    <button onClick={hit}>Hit</button>
                                    <button onClick={stand}>Stand</button>
                                </>
                            ) : (
                                <div>
                                    <h2>{message}</h2>
                                    <button onClick={() => setBetPlaced(false)}>Play Again</button>
                                    <button onClick={() => setShowHome(true)}>Return to Home</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default App;