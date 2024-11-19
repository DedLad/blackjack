import React from "react";
import './rules.css'; // Import the CSS file for rules

const BlackjackRules = () => {
  return (
    <div className="rules-container">
      <h1 className="rules-header">Blackjack Rules</h1>
      <p className="rules-paragraph">
        Blackjack, also known as 21, is a popular casino game. The goal is to
        have a hand value closer to 21 than the dealer's hand without exceeding 21.
      </p>
      <h2 className="rules-subHeader">Basic Rules:</h2>
      <ul className="rules-list">
        <li>All face cards (King, Queen, Jack) are worth 10 points.</li>
        <li>Aces can be worth 1 or 11 points, depending on the hand.</li>
        <li>Number cards are worth their face value.</li>
        <li>
          Players are dealt two cards at the start, and the dealer receives one
          face-up card and one face-down card.
        </li>
        <li>Players can choose to "Hit" (draw a card) or "Stand" (keep their current hand).</li>
        <li>If a hand exceeds 21, it’s a "Bust," and the player loses.</li>
        <li>If the player’s hand equals the dealer’s, it’s a "Push" (tie).</li>
        <li>
          A natural "Blackjack" (Ace + 10-point card) beats all other hands.
        </li>
      </ul>
      <h2 className="rules-subHeader">Wager:</h2>
      <ol className="rules-list">
        <li>
        Before the dealer deals any cards, each player places their bet in the designated betting area on the table.
        </li>
        <li>
        If the player's hand wins against the dealer's hand, their wager is returned along with their winnings, increasing their total balance.</li>
        <li>If the player's hand loses, the wager is forfeited to the dealer.</li>
      </ol>
      <h2 className="rules-subHeader">Winning Conditions:</h2>
      <ol className="rules-list">
        <li>
          Get a hand value of 21 or less that is closer to 21 than the dealer's.
        </li>
        <li>Force the dealer to bust by having a higher hand value.</li>
      </ol>
    </div>
  );
};

export default BlackjackRules;