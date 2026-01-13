FROM python:3.9-slim

WORKDIR /app

# Install dependencies
RUN pip install --no-cache-dir psycopg2-binary python-dotenv

# Copy app code
COPY server.py .
COPY server.py .
COPY server ./server
COPY .env .

# Expose port
EXPOSE 5500

# Run server
CMD ["python", "-u", "server.py"]
