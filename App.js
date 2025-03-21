// import React, { useState, useEffect } from 'react';
// import gsap from 'gsap';
// import './App.css';

// function App() {
//   const [transactionDetails, setTransactionDetails] = useState({
//     transaction_id: '',
//     transaction_amount: '',
//     transaction_date: '',
//     transaction_channel: '',
//     transaction_payment_mode_anonymous: '',
//     payment_gateway_bank_anonymous: '',
//     payer_browser_anonymous: '',
//     payer_email_anonymous: '',
//     payee_ip_anonymous: '',
//     payer_mobile_anonymous: '',
//   });
//   const [result, setResult] = useState(null);
//   const [reportDetails, setReportDetails] = useState({
//     transaction_id: '',
//     reporting_entity_id: '',
//     fraud_details: '',
//   });
//   const [reportResult, setReportResult] = useState(null);

//   useEffect(() => {
//     if (result) {
//       gsap.fromTo(
//         '.result-box',
//         { scale: 0, opacity: 0 },
//         { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
//       );
//       if (result.is_fraud) {
//         gsap.to('.result-box', {
//           boxShadow: '0 0 20px red',
//           repeat: -1,
//           yoyo: true,
//           duration: 0.5,
//         });
//       }
//     }
//   }, [result]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setTransactionDetails((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFraudDetection = async () => {
//     try {
//       const response = await fetch('http://localhost:3001/api/fraud-detection/realtime', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(transactionDetails),
//       });
//       const data = await response.json();
//       setResult(data);
//     } catch (err) {
//       console.error('Error in fraud detection:', err);
//       setResult({ error: 'Failed to detect fraud' });
//     }
//   };

//   const handleFraudReporting = async () => {
//     try {
//       const response = await fetch('http://localhost:3001/api/fraud-reporting', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(reportDetails),
//       });
//       const data = await response.json();
//       setReportResult(data);
//     } catch (err) {
//       console.error('Error in fraud reporting:', err);
//       setReportResult({ error: 'Failed to report fraud' });
//     }
//   };

//   return (
//     <div className="App">
//       <header className="App-header">
//         <h1>Fraud Detection, Alert, and Monitoring System</h1>

//         <div className="section">
//           <h2>Real-Time Fraud Detection</h2>
//           <input
//             type="text"
//             name="transaction_id"
//             placeholder="Transaction ID"
//             value={transactionDetails.transaction_id}
//             onChange={handleInputChange}
//           />
//           <input
//             type="number"
//             name="transaction_amount"
//             placeholder="Transaction Amount"
//             value={transactionDetails.transaction_amount}
//             onChange={handleInputChange}
//           />
//           <input
//             type="datetime-local"
//             name="transaction_date"
//             placeholder="Transaction Date"
//             value={transactionDetails.transaction_date}
//             onChange={handleInputChange}
//           />
//           <input
//             type="text"
//             name="transaction_channel"
//             placeholder="Transaction Channel (e.g., mobile, w)"
//             value={transactionDetails.transaction_channel}
//             onChange={handleInputChange}
//           />
//           <input
//             type="number"
//             name="transaction_payment_mode_anonymous"
//             placeholder="Payment Mode (e.g., 10)"
//             value={transactionDetails.transaction_payment_mode_anonymous}
//             onChange={handleInputChange}
//           />
//           <input
//             type="number"
//             name="payment_gateway_bank_anonymous"
//             placeholder="Payment Gateway Bank (e.g., 6)"
//             value={transactionDetails.payment_gateway_bank_anonymous}
//             onChange={handleInputChange}
//           />
//           <input
//             type="number"
//             name="payer_browser_anonymous"
//             placeholder="Payer Browser (e.g., 2993)"
//             value={transactionDetails.payer_browser_anonymous}
//             onChange={handleInputChange}
//           />
//           <input
//             type="text"
//             name="payer_email_anonymous"
//             placeholder="Payer Email (e.g., ed340a2d...)"
//             value={transactionDetails.payer_email_anonymous}
//             onChange={handleInputChange}
//           />
//           <input
//             type="text"
//             name="payee_ip_anonymous"
//             placeholder="Payee IP (e.g., 773220d2...)"
//             value={transactionDetails.payee_ip_anonymous}
//             onChange={handleInputChange}
//           />
//           <input
//             type="text"
//             name="payer_mobile_anonymous"
//             placeholder="Payer Mobile (e.g., XXXXX180.0)"
//             value={transactionDetails.payer_mobile_anonymous}
//             onChange={handleInputChange}
//           />
//           <button onClick={handleFraudDetection}>Check Fraud</button>
//           {result && (
//             <div className="result-box">
//               <h3>Result</h3>
//               {result.error ? (
//                 <p>Error: {result.error}</p>
//               ) : (
//                 <>
//                   <p>Transaction ID: {result.transaction_id}</p>
//                   <p>Is Fraud: {result.is_fraud ? 'Yes' : 'No'}</p>
//                   <p>Fraud Source: {result.fraud_source}</p>
//                   <p>Fraud Reason: {result.fraud_reason}</p>
//                   {result.fraud_score && <p>Fraud Score: {result.fraud_score}</p>}
//                 </>
//               )}
//             </div>
//           )}
//         </div>

//         <div className="section">
//           <h2>Fraud Reporting</h2>
//           <input
//             type="text"
//             placeholder="Transaction ID"
//             value={reportDetails.transaction_id}
//             onChange={(e) =>
//               setReportDetails({ ...reportDetails, transaction_id: e.target.value })
//             }
//           />
//           <input
//             type="text"
//             placeholder="Reporting Entity ID"
//             value={reportDetails.reporting_entity_id}
//             onChange={(e) =>
//               setReportDetails({ ...reportDetails, reporting_entity_id: e.target.value })
//             }
//           />
//           <input
//             type="text"
//             placeholder="Fraud Details"
//             value={reportDetails.fraud_details}
//             onChange={(e) =>
//               setReportDetails({ ...reportDetails, fraud_details: e.target.value })
//             }
//           />
//           <button onClick={handleFraudReporting}>Report Fraud</button>
//           {reportResult && (
//             <div className="result-box">
//               <h3>Reporting Result</h3>
//               {reportResult.error ? (
//                 <p>Error: {reportResult.error}</p>
//               ) : (
//                 <>
//                   <p>Transaction ID: {reportResult.transaction_id}</p>
//                   <p>Acknowledged: {reportResult.reporting_acknowledged ? 'Yes' : 'No'}</p>
//                   {reportResult.failure_code && <p>Failure Code: {reportResult.failure_code}</p>}
//                 </>
//               )}
//             </div>
//           )}
//         </div>
//       </header>
//     </div>
//   );
// }

// export default App;


import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import './App.css';
import Dashboard from './Dashboard';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';

function App() {
  const [transactionDetails, setTransactionDetails] = useState({
    transaction_id: '',
    transaction_amount: '',
    transaction_date: '',
    transaction_channel: '',
    transaction_payment_mode_anonymous: '',
    payment_gateway_bank_anonymous: '',
    payer_browser_anonymous: '',
    payer_email_anonymous: '',
    payee_ip_anonymous: '',
    payer_mobile_anonymous: '',
  });
  const [result, setResult] = useState(null);
  const [reportDetails, setReportDetails] = useState({
    transaction_id: '',
    reporting_entity_id: '',
    fraud_details: '',
  });
  const [reportResult, setReportResult] = useState(null);

  useEffect(() => {
    if (result) {
      gsap.fromTo(
        '.result-box',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
      if (result.is_fraud) {
        gsap.to('.result-box', {
          boxShadow: '0 0 20px red',
          repeat: -1,
          yoyo: true,
          duration: 0.5,
        });
      }
    }
  }, [result]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTransactionDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleFraudDetection = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/fraud-detection/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionDetails),
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error in fraud detection:', err);
      setResult({ error: 'Failed to detect fraud' });
    }
  };

  const handleFraudReporting = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/fraud-reporting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportDetails),
      });
      const data = await response.json();
      setReportResult(data);
    } catch (err) {
      console.error('Error in fraud reporting:', err);
      setReportResult({ error: 'Failed to report fraud' });
    }
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Fraud Detection, Alert, and Monitoring System</h1>
          <nav>
            <Link to="/">Home</Link> | <Link to="/dashboard">Dashboard</Link>
          </nav>
          <Routes>
            <Route path="/" element={
              <>
                <div className="section">
                  <h2>Real-Time Fraud Detection</h2>
                  <input
                    type="text"
                    name="transaction_id"
                    placeholder="Transaction ID"
                    value={transactionDetails.transaction_id}
                    onChange={handleInputChange}
                  />
                  <input
                    type="number"
                    name="transaction_amount"
                    placeholder="Transaction Amount"
                    value={transactionDetails.transaction_amount}
                    onChange={handleInputChange}
                  />
                  <input
                    type="datetime-local"
                    name="transaction_date"
                    placeholder="Transaction Date"
                    value={transactionDetails.transaction_date}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    name="transaction_channel"
                    placeholder="Transaction Channel (e.g., mobile, w)"
                    value={transactionDetails.transaction_channel}
                    onChange={handleInputChange}
                  />
                  <input
                    type="number"
                    name="transaction_payment_mode_anonymous"
                    placeholder="Payment Mode (e.g., 10)"
                    value={transactionDetails.transaction_payment_mode_anonymous}
                    onChange={handleInputChange}
                  />
                  <input
                    type="number"
                    name="payment_gateway_bank_anonymous"
                    placeholder="Payment Gateway Bank (e.g., 6)"
                    value={transactionDetails.payment_gateway_bank_anonymous}
                    onChange={handleInputChange}
                  />
                  <input
                    type="number"
                    name="payer_browser_anonymous"
                    placeholder="Payer Browser (e.g., 2993)"
                    value={transactionDetails.payer_browser_anonymous}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    name="payer_email_anonymous"
                    placeholder="Payer Email (e.g., ed340a2d...)"
                    value={transactionDetails.payer_email_anonymous}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    name="payee_ip_anonymous"
                    placeholder="Payee IP (e.g., 773220d2...)"
                    value={transactionDetails.payee_ip_anonymous}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    name="payer_mobile_anonymous"
                    placeholder="Payer Mobile (e.g., XXXXX180.0)"
                    value={transactionDetails.payer_mobile_anonymous}
                    onChange={handleInputChange}
                  />
                  <button onClick={handleFraudDetection}>Check Fraud</button>
                  {result && (
                    <div className="result-box">
                      <h3>Result</h3>
                      {result.error ? (
                        <p>Error: {result.error}</p>
                      ) : (
                        <>
                          <p>Transaction ID: {result.transaction_id}</p>
                          <p>Is Fraud: {result.is_fraud ? 'Yes' : 'No'}</p>
                          <p>Fraud Source: {result.fraud_source}</p>
                          <p>Fraud Reason: {result.fraud_reason}</p>
                          {result.fraud_score && <p>Fraud Score: {result.fraud_score}</p>}
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="section">
                  <h2>Fraud Reporting</h2>
                  <input
                    type="text"
                    placeholder="Transaction ID"
                    value={reportDetails.transaction_id}
                    onChange={(e) =>
                      setReportDetails({ ...reportDetails, transaction_id: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Reporting Entity ID"
                    value={reportDetails.reporting_entity_id}
                    onChange={(e) =>
                      setReportDetails({ ...reportDetails, reporting_entity_id: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Fraud Details"
                    value={reportDetails.fraud_details}
                    onChange={(e) =>
                      setReportDetails({ ...reportDetails, fraud_details: e.target.value })
                    }
                  />
                  <button onClick={handleFraudReporting}>Report Fraud</button>
                  {reportResult && (
                    <div className="result-box">
                      <h3>Reporting Result</h3>
                      {reportResult.error ? (
                        <p>Error: {reportResult.error}</p>
                      ) : (
                        <>
                          <p>Transaction ID: {reportResult.transaction_id}</p>
                          <p>Acknowledged: {reportResult.reporting_acknowledged ? 'Yes' : 'No'}</p>
                          {reportResult.failure_code && <p>Failure Code: {reportResult.failure_code}</p>}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            } />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;