from telethon.sync import TelegramClient
from telethon.tl.functions.contacts import SearchRequest
from pymongo import MongoClient
import os
import json
import sys
import re
from datetime import datetime, timezone

# Fix encoding prblm
if os.name == 'nt':
    import ctypes
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# user dialog
user_channel_word = sys.argv[1]
user_msg_word = sys.argv[2]
collection_name = "fetch_data"  

# limit
try:
    user_limit = int(sys.argv[3])  # Allow user to input the limit
    if user_limit < 50 or user_limit > 1800:
        raise ValueError
except (IndexError, ValueError):
    print("No valid message limit provided. Defaulting to 50.")
    user_limit = 50

session_file = os.path.join(os.path.dirname(__file__), 'teleSession.session')
credentials_file_path = os.path.join(os.path.dirname(__file__), 'api_credentials.json')

# credentials
try:
    with open(credentials_file_path, 'r') as credentials_file:
        credentials = json.load(credentials_file)
        api_id = credentials["api_id"]
        api_hash = credentials["api_hash"]
except FileNotFoundError:
    print(f"Error: {credentials_file_path} not found. Ensure login is done and credentials are saved.")
    sys.exit(1)

# MongoDB setup
mongo_client = MongoClient('mongodb://localhost:27017/')
db = mongo_client['telegram_data']
collection = db['fetch_data']

# duplications Check
def is_duplicate(message_id, chat_id):
    return collection.find_one({"message_id": message_id, "chat_id": chat_id}) is not None

# save message in db
def save_message(chat, message, channel_word, msg_word):
    if not is_duplicate(message.id, chat.id):
        collection.insert_one({
            'chat_name': chat.title,
            'chat_id': chat.id,
            'message_id': message.id,
            'message_text': message.message,
            'user_id': message.from_id.user_id if message.from_id else None,
            'date': message.date,
            'fetch_time': datetime.now(timezone.utc), 
            'search_channel_term': channel_word,
            'search_message_term': msg_word
        })
        print(f"Stored message ID {message.id} from chat '{chat.title}' sent by user {message.from_id.user_id if message.from_id else 'Unknown'}.")

# function to check if a message is English
def is_english_text(text):
    return bool(re.match(r'^[\x00-\x7F]+$', text))

# Use session file
try:
    with TelegramClient(session_file, api_id, api_hash) as client:
        print("[SERVER] Connected to Telegram.")

        # Search for channels 
        print(f"[SERVER] Searching for channels containing '{user_channel_word}' in their name...")
        result = client(SearchRequest(q=user_channel_word, limit=50))

        # Filter chats
        chats = [chat for chat in result.chats if chat.megagroup or chat.broadcast or chat.gigagroup]
        print(f"[SERVER] Found {len(chats)} chats. Fetching messages...")

        total_messages_fetched = 0

        # fetch messages with search term in chats
        for chat in chats:
            messages = client.get_messages(chat, search=user_msg_word, limit=user_limit if user_limit <= 190 else 190)
            for message in messages:
                if message.message and is_english_text(message.message):  # save only ENG msgs
                    save_message(chat, message, user_channel_word, user_msg_word)
                    total_messages_fetched += 1

        print(f"[SERVER] Total messages fetched: {total_messages_fetched}")
        print(f"[SERVER] Total chats processed: {len(chats)}")

except Exception as e:
    if "A wait of" in str(e):
        wait_time = int(str(e).split(" ")[3])
        error_message = f"[SERVER] Error: Rate-limited by Telegram. You need to wait for {wait_time} seconds."
        sys.stdout.write(json.dumps({"error": error_message}))
    else:
        print(f"[SERVER] An unexpected error occurred: {e}")
    sys.exit(1)

# return success and total number of messages/chats
print(json.dumps({"success": f"Messages fetched successfully!"}))
sys.exit(0)
