const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = 'mongodb://localhost:27017';
const DB_NAME = 'blackjack';
const COLLECTION_NAME = 'players';

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' })); // Allow frontend (React) on port 3000

// Helper functions
const createDeck = () => {
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    for (const suit of suits) {
        for (const value of values) {
            deck.push({ suit, value });
        }
    }
    return deck.sort(() => Math.random() - 0.5);
};

const drawCard = (deck) => deck.pop();

const calculateScore = (hand) => {
    let score = 0;
    let aces = 0;
    hand.forEach(card => {
        if (['K', 'Q', 'J'].includes(card.value)) score += 10;
        else if (card.value === 'A') {
            aces += 1;
            score += 11;
        } else score += parseInt(card.value);
    });
    while (score > 21 && aces) {
        score -= 10;
        aces -= 1;
    }
    return score;
};

// Connect to MongoDB
const client = new MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(async (err) => {
    if (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
    console.log('Connected to MongoDB');
    const db = client.db(DB_NAME);
    const playersCollection = db.collection(COLLECTION_NAME);

    // Endpoint to get or create player
    app.get('/api/start', async (req, res) => {
        try {
            let player = await playersCollection.findOne({});
            if (!player) {
                player = { money: 1000 };
                await playersCollection.insertOne(player);
            }
            console.log('Player money:', player.money);
            res.json({ money: player.money });
        } catch (error) {
            console.error('Error fetching player:', error);
            res.status(500).json({ message: 'Error fetching player' });
        }
    });

    // Endpoint to start the game
    app.post('/api/start-game', async (req, res) => {
        try {
            const { bet } = req.body;
            const player = await playersCollection.findOne({});
            if (bet > player.money) {
                return res.status(400).json({ message: 'Bet amount exceeds available money' });
            }
            const deck = createDeck();
            const playerHand = [drawCard(deck), drawCard(deck)];
            const dealerHand = [drawCard(deck), drawCard(deck)];
            player.money -= bet;
            await playersCollection.updateOne({}, { $set: { money: player.money } });
            res.json({
                deck,
                playerHand,
                dealerHand,
                playerScore: calculateScore(playerHand),
                dealerScore: calculateScore(dealerHand),
                money: player.money
            });
        } catch (error) {
            console.error('Error starting game:', error);
            res.status(500).json({ message: 'Error starting game' });
        }
    });

    app.post('/api/hit', (req, res) => {
        const { deck, playerHand } = req.body;
        playerHand.push(drawCard(deck));
        res.json({
            deck,
            playerHand,
            playerScore: calculateScore(playerHand)
        });
    });

    app.post('/api/dealer-turn', async (req, res) => {
        try {
            const { deck, dealerHand, playerScore, bet } = req.body;
            const player = await playersCollection.findOne({});
            while (calculateScore(dealerHand) < 17) {
                dealerHand.push(drawCard(deck));
            }
            const dealerScore = calculateScore(dealerHand);
            const playerWins = playerScore > dealerScore || dealerScore > 21;
            const dealerWins = dealerScore > playerScore && dealerScore <= 21;

            if (playerWins) {
                player.money += bet * 2;
            } else if (dealerWins) {
                player.money -= bet;
            }

            await playersCollection.updateOne({}, { $set: { money: player.money } });

            res.json({
                deck,
                dealerHand,
                dealerScore,
                money: player.money
            });
        } catch (error) {
            console.error('Error during dealer turn:', error);
            res.status(500).json({ message: 'Error during dealer turn' });
        }
    });

    // Start the server
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});