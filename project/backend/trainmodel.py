import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
import joblib

# Load the dataset
# Replace 'dataset.csv' with the path to your dataset file
data = pd.read_csv('transactions_train.csv')

# Simulate fraud data (since all is_fraud = 0 in the sample)
# Mark transactions with amount > 20000 or specific patterns as fraudulent
data['is_fraud'] = np.where(
    (data['transaction_amount'] > 20000) | 
    (data['transaction_channel'].str.lower() == 'w') & (data['transaction_amount'] > 1000),
    1, 0
)

# Preprocessing
# Handle missing values
data['payee_ip_anonymous'] = data['payee_ip_anonymous'].fillna('UNKNOWN')

# Feature engineering: Extract hour from transaction_date
data['transaction_hour'] = pd.to_datetime(data['transaction_date']).dt.hour

# Drop irrelevant columns
data = data.drop(columns=['transaction_date', 'transaction_id_anonymous', 'payee_id_anonymous'])

# Encode categorical variables
label_encoders = {}
categorical_columns = [
    'transaction_channel', 'payer_email_anonymous', 'payee_ip_anonymous', 
    'payer_mobile_anonymous'
]

for col in categorical_columns:
    le = LabelEncoder()
    data[col] = le.fit_transform(data[col].astype(str))
    label_encoders[col] = le

# Save label encoders for later use
joblib.dump(label_encoders, 'label_encoders.joblib')

# Define features and target
X = data.drop(columns=['is_fraud'])
y = data['is_fraud']

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the model
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

# Evaluate the model
y_pred = model.predict(X_test)
print("Classification Report:")
print(classification_report(y_test, y_pred))

# Save the model
joblib.dump(model, 'fraud_detection_model.joblib')