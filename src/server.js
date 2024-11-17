const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

mongoose.connect('mongodb://localhost:27017/blackjack', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    username: String,
    money: { type: Number, default: 1000 },
    wager: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);

const drawCard = () => Math.floor(Math.random() * 11) + 1;

app.post('/api/start', async (req, res) => {
    const { username } = req.body;
    try {
        let user = await User.findOne({ username });
        if (!user) {
            user = new User({ username });
            await user.save();
        }

        if (user.money <= 0) {
            user.money = 700;
            await user.save();
        }

        res.json({ money: user.money, wager: user.wager });
    } catch (error) {
        console.error('Error starting game:', error);
        res.status(500).json({ error: 'Failed to start game' });
    }
});

app.post('/api/hit', (req, res) => {
    const newCard = drawCard();
    res.json({ newCard });
});

app.post('/api/stand', async (req, res) => {
    const { username, playerTotal, dealerTotal, result, wager } = req.body;

    try {
        const user = await User.findOne({ username });
        let finalResult = result;

        if (!finalResult) {
            if (playerTotal > 21) {
                finalResult = 'lose';
            } else if (dealerTotal > 21 || (playerTotal <= 21 && playerTotal > dealerTotal)) {
                finalResult = 'win';
            } else if (playerTotal === dealerTotal) {
                finalResult = 'draw';
            } else {
                finalResult = 'lose';
            }
        }

        if (finalResult === 'win') {
            user.money += wager;
        } else if (finalResult === 'lose') {
            user.money -= wager;
        }
        await user.save();

        res.json({ result: finalResult, money: user.money });
    } catch (error) {
        console.error('Error finalizing game:', error);
        res.status(500).json({ error: 'Failed to finalize game' });
    }
});

app.post('/api/setWager', async (req, res) => {
    const { username, wager } = req.body;

    try {
        const user = await User.findOne({ username });
        if (user.money < wager) {
            return res.status(400).json({ error: 'Not enough money for the wager' });
        }

        user.wager = wager;
        await user.save();

        res.json({ wager: user.wager });
    } catch (error) {
        console.error('Error setting wager:', error);
        res.status(500).json({ error: 'Failed to set wager' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
