import os
import pandas as pd
import torch
from pymongo import MongoClient
from sklearn.metrics import accuracy_score, classification_report
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification, Trainer, TrainingArguments
from transformers import TextClassificationPipeline
from torch.utils.data import Dataset, DataLoader
from langdetect import detect, LangDetectException

# step 1: load the data from mongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client.telegram_data


train_data_cursor = db.diverse_telegram_data_train.find()
train_data = pd.DataFrame(list(train_data_cursor))

test_data_cursor = db.diverse_telegram_data_test.find()
test_data = pd.DataFrame(list(test_data_cursor))

# ensure 'message_text' column contains only text
train_data['message_text'] = train_data['message_text'].astype(str)
test_data['message_text'] = test_data['message_text'].astype(str)

# ensure 'label' is not empty
train_data = train_data.dropna(subset=['label', 'message_text'])
test_data = test_data.dropna(subset=['label', 'message_text'])

# step 2: filter messages to include only english texts
def filter_english(df):
    english_texts = []

    for index, row in df.iterrows(): # returns the row index number and the text
        try:
            lang = detect(row['message_text'])
            if lang == 'en':
                english_texts.append(row)
        except LangDetectException:
            continue
    return pd.DataFrame(english_texts)

# apply the changes to training and test data
train_data = filter_english(train_data)
test_data = filter_english(test_data)

# check datasets size
print(f"Training data size: {train_data.shape}")
print(f"Test data size: {test_data.shape}")

# reduce dataset size for testing
train_data = train_data.sample(n=500, random_state=42).reset_index(drop=True)
test_data = test_data.sample(n=200, random_state=42).reset_index(drop=True)

# Step 3: Preprocess and prepare the dataset for DistilBERT
class TelegramDataset(Dataset):
    # constructor
    def __init__(self, texts, labels, tokenizer, max_len):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_len = max_len

    # returns the total number of samples in the dataset
    def __len__(self):
        return len(self.texts)
    
    # retrieves the specific data sample and its label for a given index
    def __getitem__(self, idx):
        text = str(self.texts[idx])
        label = self.labels[idx]
        encoding = self.tokenizer.encode_plus(
            text,
            add_special_tokens=True,
            max_length=self.max_len,
            return_token_type_ids=False,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt'
        )

        # return the tokenized input, attention mask, and label as a dictionary
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.tensor(label, dtype=torch.long) # תווית של כל הודעה
        }

# Step 4: Set up DistilBERT tokenizer and model, load if model exists
MODEL_NAME = 'distilbert-base-uncased'
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Gets the directory of the current file
MODEL_PATH = os.path.join(BASE_DIR, 'saved_model')
MAX_LEN = 64

print("Model path:", MODEL_PATH)  # Log model path

if os.path.exists(MODEL_PATH):
    print("Loading saved model...")
    tokenizer = DistilBertTokenizer.from_pretrained(MODEL_PATH)
    model = DistilBertForSequenceClassification.from_pretrained(MODEL_PATH)
else:
    print("Initializing new model...")
    tokenizer = DistilBertTokenizer.from_pretrained(MODEL_NAME)
    model = DistilBertForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=2)

# Step 5: Prepare the datasets
train_dataset = TelegramDataset(
    texts=train_data['message_text'].values,
    labels=train_data['label'].values,
    tokenizer=tokenizer,
    max_len=MAX_LEN
)

test_dataset = TelegramDataset(
    texts=test_data['message_text'].values,
    labels=test_data['label'].values,
    tokenizer=tokenizer,
    max_len=MAX_LEN
)

# Step 6: Train the model if not already trained
if not os.path.exists(MODEL_PATH):
    # Set up training arguments with reduced settings for faster training
    training_args = TrainingArguments(
        output_dir='./results',
        evaluation_strategy='no',
        per_device_train_batch_size=16,
        per_device_eval_batch_size=16,
        num_train_epochs=1,
        weight_decay=0.01,
        logging_dir='./logs',
        logging_steps=10,
        fp16=True
    )

    # Train the model using Trainer API
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset
    )

    trainer.train()

    # Save the trained model and tokenizer
    print("Saving model...")
    model.save_pretrained(MODEL_PATH)
    tokenizer.save_pretrained(MODEL_PATH)

# Step 7: Evaluate the model on test data using DataLoader
# # The DataLoader will use the __getitem__ method to retrieve each sample
test_loader = DataLoader(test_dataset, batch_size=16)

device = torch.device('cuda') if torch.cuda.is_available() else torch.device('cpu')
model.to(device)
model.eval()

all_preds = []
all_labels = []

with torch.no_grad():
    for batch in test_loader:
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        labels = batch['labels'].to(device)

        outputs = model(input_ids, attention_mask=attention_mask)
        logits = outputs.logits
        preds = torch.argmax(logits, dim=1)

        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())

test_accuracy = accuracy_score(all_labels, all_preds)
test_report = classification_report(all_labels, all_preds)

print(f'Test Accuracy: {test_accuracy}')
print('Test Classification Report:')
print(test_report)

# Step 8: Predict if multiple new messages are antisemitic
# Load new messages from MongoDB collection
new_messages_cursor = db.fetch_data.find()
new_messages = [doc['message_text'] for doc in new_messages_cursor]

# Tokenize and predict for multiple messages
# pt = PyTorch
encoded_inputs = tokenizer(new_messages, padding=True, truncation=True, max_length=MAX_LEN, return_tensors='pt')

# Move tensors to GPU if available
encoded_inputs = {key: value.to(device) for key, value in encoded_inputs.items()}

# Get predictions
with torch.no_grad():
    outputs = model(**encoded_inputs)
    logits = outputs.logits
    predictions = torch.argmax(logits, dim=1)

# Print the predictions for each message
for i, message in enumerate(new_messages):
    label = predictions[i].item()
    result = "antisemitic" if label == 1 else "not antisemitic"
    print(f"Message: '{message}' is {result}.")
