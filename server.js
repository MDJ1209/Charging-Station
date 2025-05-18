const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('../public'));

// Mock payment verification
app.post('/verify-payment', (req, res) => {
    const { amount } = req.body;
    
    // Simulate payment verification
    setTimeout(() => {
        res.json({
            success: true,
            duration: amount === 5 ? 3600 : 7200 // 1 hour for ₹5, 2 hours for ₹15
        });
    }, 2000);
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 