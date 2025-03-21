-- fraud_detection table
CREATE TABLE fraud_detection (
  id SERIAL PRIMARY KEY,
  transaction_id VARCHAR(255) NOT NULL,
  is_fraud BOOLEAN NOT NULL,
  fraud_source VARCHAR(50),
  fraud_reason TEXT,
  fraud_score FLOAT,
  is_fraud_predicted BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- fraud_reporting table
CREATE TABLE fraud_reporting (
  id SERIAL PRIMARY KEY,
  transaction_id VARCHAR(255) NOT NULL,
  reporting_entity_id VARCHAR(255) NOT NULL,
  fraud_details TEXT,
  reporting_acknowledged BOOLEAN NOT NULL,
  failure_code INT,
  is_fraud_reported BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);