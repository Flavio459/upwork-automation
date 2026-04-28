from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/latest-news', methods=['GET'])
def latest_news():
    # Simulating aggregated news snippets
    news = [
        {"source": "Bloomberg", "headline": "Fed signals potential rate freeze", "sentiment": "Neutral"},
        {"source": "Reuters", "headline": "Nvidia surpasses market cap expectations", "sentiment": "Positive"},
        {"source": "WSJ", "headline": "Oil prices stabilize after inventory surge", "sentiment": "Neutral"}
    ]
    return jsonify({"status": "success", "data": news})

if __name__ == '__main__':
    # Running on port 5001
    print("Financial News Mock Agent running on http://localhost:5001")
    app.run(port=5001)
