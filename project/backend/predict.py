import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
from imblearn.over_sampling import SMOTE
import xgboost as xgb
import joblib
import mysql.connector
from mysql.connector import Error
import json
import sys
from datetime import datetime

# ====================== MySQL Configuration ======================
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Ganapathi@123',
    'database': 'hackathon'
}

def create_db_connection():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

# ====================== Training Pipeline ======================
def train_model():
    # Load dataset
    data = pd.read_csv('transactions_train.csv')
    
    # Use actual reported fraud labels
    y = data['is_fraud_reported']
    X = data.drop(columns=['is_fraud_reported', 'transaction_date', 'transaction_id_anonymous'])

    # Feature engineering
    X['transaction_hour'] = pd.to_datetime(data['transaction_date']).dt.hour
    X['transaction_day'] = pd.to_datetime(data['transaction_date']).dt.dayofweek
    
    # Define preprocessing
    categorical_features = ['transaction_channel', 'payer_email_anonymous', 
                           'payee_ip_anonymous', 'payer_mobile_anonymous']
    numeric_features = ['transaction_amount', 'transaction_hour', 'transaction_day']

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])

    # Build pipeline with SMOTE and XGBoost
    model = Pipeline([
        ('preprocessor', preprocessor),
        ('smote', SMOTE(random_state=42)),
        ('classifier', xgb.XGBClassifier(
            objective='binary:logistic',
            scale_pos_weight=15,
            n_estimators=200,
            max_depth=5,
            learning_rate=0.1,
            subsample=0.8,
            random_state=42
        ))
    ])

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train model
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    print("Classification Report:")
    print(classification_report(y_test, y_pred))

    # Save model
    joblib.dump(model, 'fraud_model.xgb')

# ====================== Prediction System ======================
class FraudDetector:
    def _init_(self):
        self.model = joblib.load('fraud_model.xgb')
        self.rules = [
            {
                'condition': lambda x: x['transaction_amount'] > 20000,
                'reason': 'Amount exceeds 20,000 threshold'
            },
            {
                'condition': lambda x: x['transaction_channel'].lower() == 'w' and x['transaction_amount'] > 1000,
                'reason': 'High amount via channel W'
            }
        ]

    def apply_rules(self, transaction):
        for rule in self.rules:
            if rule['condition'](transaction):
                return True, rule['reason']
        return False, ''

    def preprocess(self, transaction):
        df = pd.DataFrame([transaction])
        df['transaction_hour'] = pd.to_datetime(df['transaction_date']).dt.hour
        df['transaction_day'] = pd.to_datetime(df['transaction_date']).dt.dayofweek
        return df.drop(columns=['transaction_date', 'transaction_id_anonymous'])

    def predict(self, transaction):
        # Apply rules first
        is_fraud_rule, reason = self.apply_rules(transaction)
        if is_fraud_rule:
            return {
                'transaction_id': transaction['transaction_id_anonymous'],
                'is_fraud': True,
                'fraud_source': 'rule',
                'fraud_reason': reason,
                'fraud_score': 1.0
            }

        # Model prediction
        processed = self.preprocess(transaction)
        proba = self.model.predict_proba(processed)[0][1]
        prediction = self.model.predict(processed)[0]

        return {
            'transaction_id': transaction['transaction_id_anonymous'],
            'is_fraud': bool(prediction),
            'fraud_source': 'model',
            'fraud_reason': f"Model score: {proba:.2f}",
            'fraud_score': float(proba)
        }

    def log_to_db(self, result):
        conn = create_db_connection()
        if conn:
            try:
                cursor = conn.cursor()
                query = """
                INSERT INTO fraud_detection 
                (transaction_id, is_fraud_predicted, fraud_source, fraud_reason, fraud_score, timestamp)
                VALUES (%s, %s, %s, %s, %s, %s)
                """
                values = (
                    result['transaction_id'],
                    result['is_fraud'],
                    result['fraud_source'],
                    result['fraud_reason'],
                    result['fraud_score'],
                    datetime.now()
                )
                cursor.execute(query, values)
                conn.commit()
            except Error as e:
                print(f"Database error: {e}")
            finally:
                conn.close()

# ====================== Main Execution ======================
if __name__ == "_main_":
    if sys.argv[1] == 'train':
        train_model()
    else:
        detector = FraudDetector()
        input_data = json.loads(sys.argv[1])
        result = detector.predict(input_data)
        detector.log_to_db(result)
        print(json.dumps(result))