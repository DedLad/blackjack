import React, { useState } from 'react';

const WagerInput = ({ money, onWagerSet }) => {
  const [wager, setWager] = useState(0);

  const handleSetWager = () => {
    if (wager > 0 && wager <= money) {
      onWagerSet(wager);
    } else {
      alert('Invalid wager amount. Please enter an amount within your available money.');
    }
  };

  return (
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
  );
};

export default WagerInput;