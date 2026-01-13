import json
import urllib.request
import urllib.error
import time
import os
import sys
import re

# ================= CONFIGURATION =================
# TODO: Please fill in your AI API details here
# Example for Volcengine / Doubao / OpenAI Compatible
API_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3" 
API_KEY = "YOUR_API_KEY_HERE"
MODEL_NAME = "ep-20250101010101-example" # Replace with your endpoint ID

# File paths
INPUT_FILE = "tweets_to_classify.txt"
OUTPUT_FILE = "classification_results.json"
# =================================================

def get_tweet_data(tweet_id):
    """
    Fetch tweet data using vxtwitter API (public).
    """
    url = f"https://api.vxtwitter.com/Twitter/status/{tweet_id}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read())
            return data
    except Exception as e:
        print(f"Error fetching tweet {tweet_id}: {e}")
        return None

def classify_tweet(tweet_data):
    """
    Send tweet content to AI for classification.
    """
    if not tweet_data:
        return "Error: No Data"
        
    text = tweet_data.get('text', '')
    media_urls = tweet_data.get('media_urls', [])
    
    # Simple prompt
    messages = [
        {
            "role": "system", 
            "content": "You are a social media content classifier. Classify the following tweet into one of these categories: 'Photography', 'Art', 'Tech', 'News', 'Other'. Return ONLY the category name."
        },
        {
            "role": "user",
            "content": f"Tweet Content: {text}\nAttached Images: {len(media_urls)}\n\nClassify this tweet."
        }
    ]
    
    # API Request payload
    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "temperature": 0.1
    }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }

    req = urllib.request.Request(
        f"{API_BASE_URL}/chat/completions",
        data=json.dumps(payload).encode('utf-8'),
        headers=headers,
        method="POST"
    )
    
    try:
        if API_KEY == "YOUR_API_KEY_HERE":
            return "Skipped (Missing API Key)"
            
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read())
            category = result['choices'][0]['message']['content'].strip()
            return category
    except Exception as e:
        print(f"Error calling AI API: {e}")
        return f"Error: {str(e)}"

def extract_tweet_id(url):
    """
    Extract tweet ID from URL provided in various formats.
    """
    # Remove query string
    url = url.split('?')[0]
    # Handle standard format with regex to ignore trailing text
    match = re.search(r'status/(\d+)', url)
    if match:
        return match.group(1)
    
    # Handle direct numeric ID input
    if url.strip().isdigit():
        return url.strip()
        
    return None

def main():
    print(f"--- Starting Tweet Classification ---")
    
    # 1. Read input URLs
    if not os.path.exists(INPUT_FILE):
        print(f"Input file '{INPUT_FILE}' not found. Creating a sample file...")
        with open(INPUT_FILE, 'w') as f:
            f.write("https://x.com/user/status/123456789 (Sample)\n")
        print(f"Please add your tweet URLs to '{INPUT_FILE}' and run again.")
        return

    with open(INPUT_FILE, 'r') as f:
        urls = [line.strip() for line in f if line.strip()]

    print(f"Found {len(urls)} tweets to process.")
    
    results = []
    
    # 2. Process each tweet
    for i, url in enumerate(urls):
        print(f"Processing [{i+1}/{len(urls)}]: {url}")
        
        tweet_id = extract_tweet_id(url)
        if not tweet_id:
            print("  -> Invalid URL format")
            continue
            
        # Fetch Data
        data = get_tweet_data(tweet_id)
        if not data:
            print("  -> Failed to fetch data")
            results.append({"url": url, "category": "Fetch Error"})
            continue
            
        # Classify
        category = classify_tweet(data)
        print(f"  -> Category: {category}")
        
        results.append({
            "url": url,
            "tweet_id": tweet_id,
            "text": data.get('text', '')[:50] + "...",
            "category": category
        })
        
        # Simple rate limiting
        time.sleep(1)

    # 3. Save results
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
        
    print(f"--- Done. Results saved to {OUTPUT_FILE} ---")

if __name__ == "__main__":
    main()
