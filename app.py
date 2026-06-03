from flask import Flask, render_template, request, jsonify
from algorithms.transport import TransportAlgorithm
from algorithms.hungarian import HungarianAlgorithm
import groq

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/transport', methods=['POST'])
def solve_transport():
    data = request.json
    costs = data.get('costs')
    supply = data.get('supply')
    demand = data.get('demand')
    names_supply = data.get('names_supply')
    names_demand = data.get('names_demand')
    
    try:
        algo = TransportAlgorithm(costs, supply, demand, names_supply, names_demand)
        result = algo.solve()
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/hungarian', methods=['POST'])
def solve_hungarian():
    data = request.json
    matrix = data.get('matrix')
    names_row = data.get('names_row')
    names_col = data.get('names_col')
    
    try:
        algo = HungarianAlgorithm(matrix)
        result = algo.solve()
        result["names_row"] = names_row
        result["names_col"] = names_col
        result["success"] = True
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/analyze', methods=['POST'])
def analyze_with_groq():
    data = request.json
    api_key = data.get('api_key')
    prompt = data.get('prompt')
    
    if not api_key:
        return jsonify({"success": False, "error": "Clave de acceso no proporcionada."})
        
    try:
        client = groq.Groq(api_key=api_key)
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "Eres el Director de Operaciones (COO) de NexusCore Systems. Debes interpretar el impacto operacional de la configuración de datos, analizar cuellos de botella, riesgos logísticos y balances de carga de trabajo de manera formal y estratégica. Tus respuestas deben ser detalladas y bien estructuradas, listas para un informe gerencial."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",
        )
        response_text = chat_completion.choices[0].message.content
        return jsonify({"success": True, "analysis": response_text})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
