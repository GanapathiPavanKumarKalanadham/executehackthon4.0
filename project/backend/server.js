const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const { PythonShell } = require('python-shell');
const app = express();
const port = 3001;

// Database connection
const pool = new Pool({
    connectionString: 'postgresql://user:password@localhost:5432/fdam_db',
  });

app.use(cors());
app.use(express.json());

// Function to call the Python script for fraud prediction
const predictFraud = (transactionDetails) => {
  return new Promise((resolve, reject) => {
    // Prepare the input data for the model
    const inputData = {
      transaction_amount: transactionDetails.transaction_amount || 0,
      transaction_date: transactionDetails.transaction_date || new Date().toISOString(),
      transaction_channel: transactionDetails.transaction_channel || 'unknown',
      transaction_payment_mode_anonymous: transactionDetails.transaction_payment_mode_anonymous || 0,
      payment_gateway_bank_anonymous: transactionDetails.payment_gateway_bank_anonymous || 0,
      payer_browser_anonymous: transactionDetails.payer_browser_anonymous || 0,
      payer_email_anonymous: transactionDetails.payer_email_anonymous || 'unknown',
      payee_ip_anonymous: transactionDetails.payee_ip_anonymous || 'UNKNOWN',
      payer_mobile_anonymous: transactionDetails.payer_mobile_anonymous || 'unknown',
    };

    const options = {
      mode: 'text',
      pythonOptions: ['-u'], // Unbuffered output
      scriptPath: __dirname,
      args: [JSON.stringify(inputData)],
    };

    PythonShell.run('predict.py', options, (err, results) => {
      if (err) {
        console.error('Error running Python script:', err);
        return reject(err);
      }
      try {
        const result = JSON.parse(results[0]);
        resolve(result);
      } catch (parseErr) {
        console.error('Error parsing Python script output:', parseErr);
        reject(parseErr);
      }
    });
  });
};


//database connection to mysql
const mysql = require('mysql');
const connection = mysql.createConnection({
    'host': 'localhost',
    'user': 'root',
    'password': 'Ganapathi@123',
    'database': 'hackathon'
});

//db success message
connection.connect((err) => {
    if (err) {
        console.log('Error connecting to Db');
        return;
    }
    console.log('db Connection established');
});
//store the data into mysql
app.post('/api/fraud-detection/realtime', async (req, res) => {
    const { transaction_id, transaction_amount, transaction_date, transaction_channel, transaction_payment_mode_anonymous, payment_gateway_bank_anonymous, payer_browser_anonymous, payer_email_anonymous, payee_ip_anonymous, payer_mobile_anonymous } = req.body;
    if (!transaction_id) {
        return res.status(400).json({ error: 'transaction_id is required' });
    }
    const transactionDetails = {
        transaction_amount,
        transaction_date,
        transaction_channel,
        transaction_payment_mode_anonymous,
        payment_gateway_bank_anonymous,
        payer_browser_anonymous,
        payer_email_anonymous,
        payee_ip_anonymous,
        payer_mobile_anonymous,
    };
    try {
        const ruleResult = ruleEngine(transactionDetails);
        let result;
        if (ruleResult) {
            result = { ...ruleResult, fraud_source: 'rule', fraud_score: null };
        } else {
            const modelResult = await predictFraud(transactionDetails);
            result = { ...modelResult, fraud_source: 'model' };
        }
        await pool.query(
            `INSERT INTO fraud_detection (transaction_id, is_fraud, fraud_source, fraud_reason, fraud_score, is_fraud_predicted)
       VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                transaction_id,
                result.is_fraud,
                result.fraud_source,
                result.fraud_reason,
                result.fraud_score,
                result.is_fraud,
            ]
        );
        const latency = Date.now() - startTime;
        console.log(`Real-time API latency: ${latency}ms`);
        res.json({
            transaction_id,
            is_fraud: result.is_fraud,
            fraud_source: result.fraud_source,
            fraud_reason: result.fraud_reason,
            fraud_score: result.fraud_score,
        });
    } catch (err) {
        console.error('Error in fraud detection:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
);
// Fraud Detection API: Real-Time
app.post('/api/fraud-detection/realtime', async (req, res) => {
    const startTime = Date.now();
    const { transaction_id, transaction_amount, transaction_date, transaction_channel, transaction_payment_mode_anonymous, payment_gateway_bank_anonymous, payer_browser_anonymous, payer_email_anonymous, payee_ip_anonymous, payer_mobile_anonymous } = req.body;

    if (!transaction_id) {
        return res.status(400).json({ error: 'transaction_id is required' });
    }

    const transactionDetails = {
        transaction_amount,
        transaction_date,
        transaction_channel,
        transaction_payment_mode_anonymous,
        payment_gateway_bank_anonymous,
        payer_browser_anonymous,
        payer_email_anonymous,
        payee_ip_anonymous,
        payer_mobile_anonymous,
    };

    try {
        const ruleResult = ruleEngine(transactionDetails);
        let result;
        if (ruleResult) {
            result = { ...ruleResult, fraud_source: 'rule', fraud_score: null };
        } else {
            const modelResult = await predictFraud(transactionDetails);
            result = { ...modelResult, fraud_source: 'model' };
        }

        await pool.query(
            `INSERT INTO fraud_detection (transaction_id, is_fraud, fraud_source, fraud_reason, fraud_score, is_fraud_predicted)
       VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                transaction_id,
                result.is_fraud,
                result.fraud_source,
                result.fraud_reason,
                result.fraud_score,
                result.is_fraud,
            ]
        );

        const latency = Date.now() - startTime;
        console.log(`Real-time API latency: ${latency}ms`);

        res.json({
            transaction_id,
            is_fraud: result.is_fraud,
            fraud_source: result.fraud_source,
            fraud_reason: result.fraud_reason,
            fraud_score: result.fraud_score,
        });
    } catch (err) {
        console.error('Error in fraud detection:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//dashboard data
app.get('/api/dashboard', async (req, res) => {
    try {
        const fraudCounts = await pool.query(
            `SELECT is_fraud, COUNT(*) FROM fraud_detection GROUP BY is_fraud`
        );
        const fraudForecast = await pool.query(
            `SELECT date, fraud_count FROM fraud_forecast ORDER BY date`
        );
        res.json({
            fraudCounts: fraudCounts.rows,
            fraudForecast: fraudForecast.rows,
        });
    } catch (err) {
        console.error('Error fetching dashboard data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
);


// Mock rule engine
const ruleEngine = (transactionDetails) => {
  if (transactionDetails.transaction_channel?.toLowerCase().includes('suspicious')) {
    return {
      is_fraud: true,
      fraud_reason: 'Suspicious keyword detected',
      fraud_source: 'rule',
    };
  }
  return null;
};

// Fraud Detection API: Real-Time
app.post('/api/fraud-detection/realtime', async (req, res) => {
  const startTime = Date.now();
  const { transaction_id, transaction_amount, transaction_date, transaction_channel, transaction_payment_mode_anonymous, payment_gateway_bank_anonymous, payer_browser_anonymous, payer_email_anonymous, payee_ip_anonymous, payer_mobile_anonymous } = req.body;

  if (!transaction_id) {
    return res.status(400).json({ error: 'transaction_id is required' });
  }

  const transactionDetails = {
    transaction_amount,
    transaction_date,
    transaction_channel,
    transaction_payment_mode_anonymous,
    payment_gateway_bank_anonymous,
    payer_browser_anonymous,
    payer_email_anonymous,
    payee_ip_anonymous,
    payer_mobile_anonymous,
  };

  try {
    const ruleResult = ruleEngine(transactionDetails);
    let result;
    if (ruleResult) {
      result = { ...ruleResult, fraud_source: 'rule', fraud_score: null };
    } else {
      const modelResult = await predictFraud(transactionDetails);
      result = { ...modelResult, fraud_source: 'model' };
    }

    await pool.query(
      `INSERT INTO fraud_detection (transaction_id, is_fraud, fraud_source, fraud_reason, fraud_score, is_fraud_predicted)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        transaction_id,
        result.is_fraud,
        result.fraud_source,
        result.fraud_reason,
        result.fraud_score,
        result.is_fraud,
      ]
    );

    const latency = Date.now() - startTime;
    console.log(`Real-time API latency: ${latency}ms`);

    res.json({
      transaction_id,
      is_fraud: result.is_fraud,
      fraud_source: result.fraud_source,
      fraud_reason: result.fraud_reason,
      fraud_score: result.fraud_score,
    });
  } catch (err) {
    console.error('Error in fraud detection:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Fraud Detection API: Batch
app.post('/api/fraud-detection/batch', async (req, res) => {
  const transactions = req.body;

  if (!Array.isArray(transactions)) {
    return res.status(400).json({ error: 'Input must be an array of transactions' });
  }

  try {
    const results = await Promise.all(
      transactions.map(async (transaction) => {
        const response = await fetch('http://localhost:3001/api/fraud-detection/realtime', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transaction),
        });
        return response.json();
      })
    );
    res.json(results);
  } catch (err) {
    console.error('Error in batch fraud detection:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fraud Reporting API
app.post('/api/fraud-reporting', async (req, res) => {
  const { transaction_id, reporting_entity_id, fraud_details } = req.body;

  if (!transaction_id || !reporting_entity_id || !fraud_details) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const reporting_acknowledged = true;
    const failure_code = reporting_acknowledged ? null : 1001;

    await pool.query(
      `INSERT INTO fraud_reporting (transaction_id, reporting_entity_id, fraud_details, reporting_acknowledged, failure_code, is_fraud_reported)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        transaction_id,
        reporting_entity_id,
        fraud_details,
        reporting_acknowledged,
        failure_code,
        true,
      ]
    );

    res.json({
      transaction_id,
      reporting_acknowledged,
      failure_code,
    });
  } catch (err) {
    console.error('Error in fraud reporting:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});