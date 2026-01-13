import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# POSTGRES_URL should be provided in environment variables
DB_URL = os.environ.get('POSTGRES_URL') or os.environ.get('DATABASE_URL')
PORT = int(os.environ.get('PORT') or '5502')
