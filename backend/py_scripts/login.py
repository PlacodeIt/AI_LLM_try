import logging
from telethon.sync import TelegramClient
from telethon.sessions import SQLiteSession  # Store sessions in SQLite
import sys
import os


logging.basicConfig(level=logging.DEBUG)

# when click on start
action = sys.argv[1]
api_id = sys.argv[2]
api_hash = sys.argv[3]

# session file path
session_file_path = os.path.join(os.path.dirname(__file__), 'teleSession')


if action == '--login':
    if os.path.exists(f'{session_file_path}.session'):
        print("Session file exists. Redirect to dashboard.")
        sys.exit(0)
    else:
        print("No existing session found, starting a new session.")
        print("Phone number with country code (+123...)")

elif action == '--phone':
    phone = sys.argv[4]
    client = TelegramClient(SQLiteSession(session_file_path), api_id, api_hash)

    try:
        client.connect()
        if not client.is_user_authorized():
            result = client.send_code_request(phone)
            phone_code_hash = result.phone_code_hash
            print(f"Login code sent to your phone.\nphone_code_hash={phone_code_hash}")
    except Exception as e:
        print(f"Error during phone number submission: {e}")
        sys.exit(1)
    finally:
        client.disconnect()
# login code and phone code confirmation
elif action == '--code':
    phone = sys.argv[4]
    login_code = sys.argv[5]
    phone_code_hash = sys.argv[6]

    client = TelegramClient(SQLiteSession(session_file_path), api_id, api_hash)

    try:
        client.connect()
        client.sign_in(phone, login_code, phone_code_hash=phone_code_hash)
        print(f"Logged in successfully! Session saved at {session_file_path}.session")
        print(f"save_credentials") #credentials and session file at py_scripts
    except Exception as e:
        print(f"Error during login code submission: {e}")
    finally:
        client.disconnect()
