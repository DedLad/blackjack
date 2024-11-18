const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/blackjack', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    username: String,
    money: { type: Number, default: 1000 }
});

const User = mongoose.model('User', userSchema);

// Utility function to draw a card
const drawCard = () => Math.floor(Math.random() * 11) + 1; // Random card between 1 and 11

// Start game endpoint
app.post('/api/start', async (req, res) => {
    const { username } = req.body;
    try {
        let user = await User.findOne({ username });
        if (!user) {
            user = new User({ username });
            await user.save();
        }

        if (user.money <= 0) {
            user.money = 700; // Reset money if zero
            await user.save();
        }

        res.json({ money: user.money });
    } catch (error) {
        console.error('Error starting game:', error);
        res.status(500).json({ error: 'Failed to start game' });
    }
});

// Hit endpoint to draw a card for the player
app.post('/api/hit', (req, res) => {
    const newCard = drawCard();
    res.json({ newCard });
});

// Stand endpoint to finalize the game outcome
app.post('/api/stand', async (req, res) => {
    const { username, playerTotal, dealerTotal, result, wager } = req.body;

    try {
        const user = await User.findOne({ username });
        let finalResult = result;

        if (!finalResult) {
            if (playerTotal > 21) {
                finalResult = 'lose'; // Player busts if over 21
            } else if (dealerTotal > 21 || (playerTotal <= 21 && playerTotal > dealerTotal)) {
                finalResult = 'win';
            } else if (playerTotal === dealerTotal) {
                finalResult = 'draw';
            } else {
                finalResult = 'lose';
            }
        }

        // Update money based on the game result
        if (finalResult === 'win') {
            user.money += wager;
        } else if (finalResult === 'lose') {
            user.money -= wager; //wager value retrieved from the frontend and used
        }
        await user.save();

        res.json({ result: finalResult, money: user.money });
    } catch (error) {
        console.error('Error finalizing game:', error);
        res.status(500).json({ error: 'Failed to finalize game' });
    }
});

app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});