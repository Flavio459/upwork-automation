import os
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/get-tasks', methods=['GET'])
def get_tasks():
    # Simulating a Todoist response with critical tasks
    tasks = [
        {"id": 1, "task": "Finalizar revisão do aditivo CO-2026-002", "priority": "High"},
        {"id": 2, "task": "Enviar email para suporte do OpenClaw", "priority": "Medium"},
        {"id": 3, "task": "Revisar logs do Mac Mini", "priority": "Low"}
    ]
    return jsonify({"status": "success", "data": tasks})

if __name__ == '__main__':
    # Running on port 5000 as assumed in the plan
    print("Todoist Mock Agent running on http://localhost:5000")
    app.run(port=5000)
