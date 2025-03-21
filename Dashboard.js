import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField } from '@mui/material';
import { useTable } from 'react-table';
import './Dashboard.css';

function Dashboard() {
  const [fraudData, setFraudData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [ruleConfig, setRuleConfig] = useState({});
  const [newRule, setNewRule] = useState({ condition: '', action: '' });

  // Fetch data on component mount
  useEffect(() => {
    fetch('http://localhost:3001/api/fraud-detection/history')
      .then(response => response.json())
      .then(data => setHistoryData(data))
      .catch(error => console.error('Error fetching history:', error));

    fetch('http://localhost:3001/api/rule-engine/config')
      .then(response => response.json())
      .then(data => setRuleConfig(data))
      .catch(error => console.error('Error fetching rules:', error));
  }, []);

  // Bar Graph Data: Fraud vs Non-Fraud Counts
  const fraudCounts = historyData.reduce((acc, item) => {
    acc[item.is_fraud ? 'Fraud' : 'Non-Fraud'] = (acc[item.is_fraud ? 'Fraud' : 'Non-Fraud'] || 0) + 1;
    return acc;
  }, {});

  const barData = {
    labels: ['Fraud', 'Non-Fraud'],
    datasets: [{
      label: 'Transaction Count',
      data: [fraudCounts['Fraud'] || 0, fraudCounts['Non-Fraud'] || 0],
      backgroundColor: ['#ff6384', '#36a2eb'],
    }],
  };

  // Line Chart Data: Fraud Forecasting (Mock Data)
  const forecastData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Fraud Forecast',
      data: [5, 10, 7, 15], // Replace with real forecasting model output
      fill: false,
      borderColor: '#ff6384',
    }],
  };

  // Table Columns for History
  const columns = [
    { Header: 'Transaction ID', accessor: 'transaction_id' },
    { Header: 'Is Fraud', accessor: 'is_fraud', Cell: ({ value }) => (value ? 'Yes' : 'No') },
    { Header: 'Fraud Source', accessor: 'fraud_source' },
    { Header: 'Fraud Reason', accessor: 'fraud_reason' },
    { Header: 'Fraud Score', accessor: 'fraud_score' },
  ];

  const tableInstance = useTable({ columns, data: historyData });
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  // Handle adding a new rule
  const handleAddRule = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/rule-engine/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule),
      });
      const updatedConfig = await response.json();
      setRuleConfig(updatedConfig);
      setNewRule({ condition: '', action: '' });
    } catch (err) {
      console.error('Error adding rule:', err);
    }
  };

  return (
    <div className="dashboard">
      <h1>Fraud Detection Dashboard</h1>

      <div className="charts">
        <div className="chart">
          <h2>Fraud Detected Bar Graph</h2>
          <Bar data={barData} options={{ responsive: true }} />
        </div>
        <div className="chart">
          <h2>Fraud Forecasting</h2>
          <Line data={forecastData} options={{ responsive: true }} />
        </div>
      </div>

      <div className="history">
        <h2>History of Predicted Transactions</h2>
        <TableContainer component={Paper}>
          <Table {...getTableProps()}>
            <TableHead>
              {headerGroups.map(headerGroup => (
                <TableRow {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <TableCell {...column.getHeaderProps()}>{column.render('Header')}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody {...getTableBodyProps()}>
              {rows.map(row => {
                prepareRow(row);
                return (
                  <TableRow {...row.getRowProps()}>
                    {row.cells.map(cell => (
                      <TableCell {...cell.getCellProps()}>{cell.render('Cell')}</TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <div className="rule-engine">
        <h2>Rule Engine Configuration</h2>
        <pre>{JSON.stringify(ruleConfig, null, 2)}</pre>
        <h3>Add New Rule</h3>
        <form onSubmit={handleAddRule}>
          <TextField
            label="Condition"
            placeholder="e.g., transaction_amount > 10000"
            value={newRule.condition}
            onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
            variant="outlined"
            margin="normal"
          />
          <TextField
            label="Action"
            placeholder="e.g., flag as fraud"
            value={newRule.action}
            onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
            variant="outlined"
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary">Add Rule</Button>
        </form>
      </div>
    </div>
  );
}

export default Dashboard;