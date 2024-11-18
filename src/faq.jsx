import React from "react";
const FAQ = () => {
  return (
    <div className="rules-container">
      <h1 className="rules-header">Frequently Asked Questions (FAQs)</h1>
      <h2 className="rules-subHeader">General Questions:</h2>
      <ul className="rules-list">
        <li>
          <strong>Q: What happens if my money reaches zero?</strong>
          <p>A: Your balance will automatically reset to $100 lower than your intial balance so you can continue playing.</p>
        </li>
        <li>
          <strong>Q: How do I play Blackjack?</strong>
          <p>A: The goal is to beat the dealer by getting a hand value closer to 21 without exceeding it. You can "Hit" to draw cards or "Stand" to hold your total.</p>
        </li>
        <li>
          <strong>Q: What does "Push" mean?</strong>
          <p>A: A "Push" occurs when your hand value equals the dealer's. In this case, your wager is returned.</p>
        </li>
        <li>
          <strong>Q: How are we rendering the cards</strong>
          <p>A: We are using an API called deckofcards to render the cards for.</p>
        </li>
      </ul>
      <h2 className="rules-subHeader">Gameplay Questions:</h2>
      <ul className="rules-list">
        <li>
          <strong>Q: Can I split my hand?</strong>
          <p>A: Currently, the game does not support splitting hands, but this feature may be added in the future.</p>
        </li>
        <li>
          <strong>Q: Is the dealer required to hit at a specific value?</strong>
          <p>A: Yes, the dealer must hit until their hand value is 17 or higher.</p>
        </li>
        <li>
          <strong>Q: "How do I set a wager?"</strong>
          <p>A:After starting the game, you’ll be prompted to set a wager. Enter the amount you want to bet, and the game will deal your initial hand. </p>
        </li>
      </ul>
    </div>
    
  );
};

export default FAQ;
