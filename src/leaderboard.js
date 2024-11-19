
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Leaderboard.css';


const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        // Fetch leaderboard data from the backend
        axios.get('http://localhost:5000/api/leaderboard')
            .then(response => {
                setLeaderboard(response.data.leaderboard);
            })
            .catch(error => {
                console.error('Error fetching leaderboard:', error);
            });
    }, []);

    return (
        <div className="leaderboard-container">
            <h2>Leaderboard</h2>
            <table className="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Username</th>
                        <th>Money</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboard.map((user, index) => (
                        <tr key={user._id}>
                            <td>{index + 1}</td>
                            <td>{user.username}</td>
                            <td>${user.money}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Leaderboard;
