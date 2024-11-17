import React from "react";

const BlackjackRules = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Blackjack Rules</h1>
      <p style={styles.paragraph}>
        Blackjack, also known as 21, is a popular casino game. The goal is to
        have a hand value closer to 21 than the dealer's hand without exceeding 21.
      </p>
      <h2 style={styles.subHeader}>Basic Rules:</h2>
      <ul style={styles.list}>
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
      <h2 style={styles.subHeader}>Winning Conditions:</h2>
      <ol style={styles.list}>
        <li>
          Get a hand value of 21 or less that is closer to 21 than the dealer's.
        </li>
        <li>Force the dealer to bust by having a higher hand value.</li>
      </ol>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    maxWidth: "800px",
    margin: "auto",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    color: "black",
  },
  header: {
    textAlign: "center",
    color: "#2c3e50",
  },
  subHeader: {
    color: "#34495e",
  },
  paragraph: {
    lineHeight: "1.6",
  },
  list: {
    lineHeight: "1.8",
    paddingLeft: "20px",
  },
};

export default BlackjackRules;