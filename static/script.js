class NexusApp {
    constructor() {
        this.initEventListeners();
        this.generateTransportGrid();
        this.generateAssignGrid();
        this.lastTransportResult = null;
        this.lastAssignResult = null;
    }

    initEventListeners() {
        // Event delegation for input changes to validate balance in real-time
        document.getElementById('transport-grid-container').addEventListener('input', (e) => {
            if (e.target.classList.contains('trans-supply') || e.target.classList.contains('trans-demand')) {
                this.validateTransportBalance();
            }
        });
    }

    // --- Transport Module ---
    
    generateTransportGrid(m = null, n = null) {
        if (!m) m = parseInt(document.getElementById('trans_m').value);
        if (!n) n = parseInt(document.getElementById('trans_n').value);
        
        let html = `<table><thead><tr><th>Origen / Destino</th>`;
        for (let j = 0; j < n; j++) {
            html += `<th><input type="text" value="Destino ${j+1}" class="trans-name-dest" data-col="${j}"></th>`;
        }
        html += `<th>Oferta</th></tr></thead><tbody>`;
        
        for (let i = 0; i < m; i++) {
            html += `<tr>`;
            html += `<th><input type="text" value="Origen ${i+1}" class="trans-name-org" data-row="${i}"></th>`;
            for (let j = 0; j < n; j++) {
                html += `<td><input type="number" min="0" value="0" class="trans-cost" data-row="${i}" data-col="${j}"></td>`;
            }
            html += `<td><input type="number" min="0" value="0" class="trans-supply" data-row="${i}"></td>`;
            html += `</tr>`;
        }
        
        html += `<tr><th>Demanda</th>`;
        for (let j = 0; j < n; j++) {
            html += `<td><input type="number" min="0" value="0" class="trans-demand" data-col="${j}"></td>`;
        }
        html += `<td>-</td></tr></tbody></table>`;
        
        document.getElementById('transport-grid-container').innerHTML = html;
        this.validateTransportBalance();
    }

    loadTransportBaseCase() {
        document.getElementById('trans_m').value = 3;
        document.getElementById('trans_n').value = 4;
        this.generateTransportGrid(3, 4);
        
        // Names
        const orgNames = ["Planta 1", "Planta 2", "Planta 3"];
        const destNames = ["Data Center 1", "Data Center 2", "Data Center 3", "Data Center 4"];
        
        document.querySelectorAll('.trans-name-org').forEach((el, i) => el.value = orgNames[i]);
        document.querySelectorAll('.trans-name-dest').forEach((el, i) => el.value = destNames[i]);
        
        // Supply
        const supplies = [250, 400, 350];
        document.querySelectorAll('.trans-supply').forEach((el, i) => el.value = supplies[i]);
        
        // Demand
        const demands = [200, 300, 250, 250];
        document.querySelectorAll('.trans-demand').forEach((el, i) => el.value = demands[i]);
        
        // Costs
        const costs = [
            [10, 20, 5, 11],
            [13, 9, 12, 8],
            [4, 15, 7, 9]
        ];
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 4; j++) {
                document.querySelector(`.trans-cost[data-row="${i}"][data-col="${j}"]`).value = costs[i][j];
            }
        }
        this.validateTransportBalance();
    }

    validateTransportBalance() {
        let totalSupply = 0;
        let totalDemand = 0;
        
        document.querySelectorAll('.trans-supply').forEach(el => totalSupply += parseFloat(el.value) || 0);
        document.querySelectorAll('.trans-demand').forEach(el => totalDemand += parseFloat(el.value) || 0);
        
        const statusEl = document.getElementById('transport-status');
        statusEl.style.display = 'flex';
        
        if (totalSupply === totalDemand && totalSupply > 0) {
            statusEl.className = 'status-bar status-balanced';
            statusEl.innerHTML = `<span>Problema Balanceado</span><span>Oferta: ${totalSupply} | Demanda: ${totalDemand}</span>`;
        } else {
            statusEl.className = 'status-bar status-unbalanced';
            statusEl.innerHTML = `<span>Problema Desbalanceado (Se añadirá ficticio)</span><span>Oferta: ${totalSupply} | Demanda: ${totalDemand}</span>`;
        }
    }

    async solveTransport() {
        const m = document.querySelectorAll('.trans-name-org').length;
        const n = document.querySelectorAll('.trans-name-dest').length;
        
        const costs = [];
        const supply = [];
        const demand = [];
        const names_supply = [];
        const names_demand = [];
        
        for (let i = 0; i < m; i++) {
            names_supply.push(document.querySelector(`.trans-name-org[data-row="${i}"]`).value);
            supply.push(parseFloat(document.querySelector(`.trans-supply[data-row="${i}"]`).value) || 0);
            const rowCosts = [];
            for (let j = 0; j < n; j++) {
                rowCosts.push(parseFloat(document.querySelector(`.trans-cost[data-row="${i}"][data-col="${j}"]`).value) || 0);
            }
            costs.push(rowCosts);
        }
        
        for (let j = 0; j < n; j++) {
            names_demand.push(document.querySelector(`.trans-name-dest[data-col="${j}"]`).value);
            demand.push(parseFloat(document.querySelector(`.trans-demand[data-col="${j}"]`).value) || 0);
        }
        
        const payload = { costs, supply, demand, names_supply, names_demand };
        
        try {
            const res = await fetch('/api/transport', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (data.success) {
                this.lastTransportResult = data;
                this.renderTransportResult(data);
            } else {
                alert("Error al resolver: " + data.error);
            }
        } catch (err) {
            alert("Error de conexión con el servidor.");
        }
    }

    renderTransportResult(data) {
        const container = document.getElementById('transport-results');
        const content = document.getElementById('transport-results-content');
        
        let html = `
            <div class="step-card">
                <div class="step-title">Balance y Asignación Óptima</div>
                <p>Costo Total Mínimo: <strong>$${data.total_cost.toFixed(2)}</strong></p>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Origen / Destino</th>
                                ${data.names_demand.map(n => `<th>${n}</th>`).join('')}
                                <th>Oferta Bal.</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        for (let i = 0; i < data.names_supply.length; i++) {
            html += `<tr><th>${data.names_supply[i]}</th>`;
            for (let j = 0; j < data.names_demand.length; j++) {
                const cell = data.allocation[i][j];
                const isAssigned = cell.allocated > 0;
                html += `<td class="${isAssigned ? 'assigned-cell' : ''}">
                    ${isAssigned ? cell.allocated : '-'}
                    <br><small style="color:var(--text-muted);">$${cell.cost}</small>
                </td>`;
            }
            html += `<th>${data.balanced_supply[i]}</th></tr>`;
        }
        
        html += `<tr><th>Demanda Bal.</th>`;
        data.balanced_demand.forEach(d => html += `<th>${d}</th>`);
        html += `<th>${data.balanced_demand.reduce((a, b) => a + b, 0)}</th></tr>`;
        
        html += `</tbody></table></div></div>`;
        content.innerHTML = html;
        container.style.display = 'block';
    }

    // --- Assignment Module ---
    
    generateAssignGrid(n = null) {
        if (!n) n = parseInt(document.getElementById('assign_n').value);
        
        let html = `<table><thead><tr><th>Ingeniero / Módulo</th>`;
        for (let j = 0; j < n; j++) {
            html += `<th><input type="text" value="Actividad ${String.fromCharCode(65+j)}" class="assn-name-col" data-col="${j}"></th>`;
        }
        html += `</tr></thead><tbody>`;
        
        for (let i = 0; i < n; i++) {
            html += `<tr>`;
            html += `<th><input type="text" value="Ingeniero ${i+1}" class="assn-name-row" data-row="${i}"></th>`;
            for (let j = 0; j < n; j++) {
                html += `<td><input type="number" min="0" value="0" class="assn-cost" data-row="${i}" data-col="${j}"></td>`;
            }
            html += `</tr>`;
        }
        html += `</tbody></table>`;
        
        document.getElementById('assign-grid-container').innerHTML = html;
    }

    loadAssignBaseCase() {
        document.getElementById('assign_n').value = 4;
        this.generateAssignGrid(4);
        
        const rowNames = ["Ingeniero 1 (I1)", "Ingeniero 2 (I2)", "Ingeniero 3 (I3)", "Ingeniero 4 (I4)"];
        const colNames = ["Módulo A (Finanzas)", "Módulo B (Seguridad)", "Módulo C (Proc.)", "Módulo D (API Gateway)"];
        
        document.querySelectorAll('.assn-name-row').forEach((el, i) => el.value = rowNames[i]);
        document.querySelectorAll('.assn-name-col').forEach((el, i) => el.value = colNames[i]);
        
        const costs = [
            [12, 9, 11, 8],
            [10, 14, 12, 11],
            [8, 11, 15, 9],
            [9, 10, 12, 13]
        ];
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                document.querySelector(`.assn-cost[data-row="${i}"][data-col="${j}"]`).value = costs[i][j];
            }
        }
    }

    async solveAssign() {
        const n = document.querySelectorAll('.assn-name-row').length;
        const matrix = [];
        const names_row = [];
        const names_col = [];
        
        for (let i = 0; i < n; i++) {
            names_row.push(document.querySelector(`.assn-name-row[data-row="${i}"]`).value);
            const rowCosts = [];
            for (let j = 0; j < n; j++) {
                if (i === 0) names_col.push(document.querySelector(`.assn-name-col[data-col="${j}"]`).value);
                rowCosts.push(parseFloat(document.querySelector(`.assn-cost[data-row="${i}"][data-col="${j}"]`).value) || 0);
            }
            matrix.push(rowCosts);
        }
        
        const payload = { matrix, names_row, names_col };
        
        try {
            const res = await fetch('/api/hungarian', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (data.success) {
                this.lastAssignResult = data;
                this.renderAssignResult(data);
            } else {
                alert("Error al resolver: " + data.error);
            }
        } catch (err) {
            alert("Error de conexión con el servidor.");
        }
    }

    renderAssignResult(data) {
        const container = document.getElementById('assign-results');
        const content = document.getElementById('assign-results-content');
        
        let html = '';
        data.steps.forEach((step, idx) => {
            html += `<div class="step-card">
                <div class="step-title">Paso ${idx + 1}: ${step.title}</div>
                <p>${step.description}</p>
                <div class="table-responsive">
                    ${this.renderMatrix(step.matrix, step.lines, step.assignments, data.names_row, data.names_col)}
                </div>
            </div>`;
        });
        
        content.innerHTML = html;
        container.style.display = 'block';
    }

    renderMatrix(matrix, lines, assignments, names_row, names_col) {
        let html = `<table><thead><tr><th></th>`;
        names_col.forEach(c => html += `<th>${c}</th>`);
        html += `</tr></thead><tbody>`;
        
        matrix.forEach((row, r) => {
            html += `<tr><th>${names_row[r]}</th>`;
            row.forEach((val, c) => {
                let cellClass = 'matrix-cell';
                let isAssigned = assignments && assignments.some(a => a.row === r && a.col === c);
                if (isAssigned) cellClass += ' assigned-cell';
                
                let lineClasses = [];
                if (lines) {
                    if (lines.some(l => l.type === 'row' && l.index === r)) lineClasses.push('line-horizontal');
                    if (lines.some(l => l.type === 'col' && l.index === c)) lineClasses.push('line-vertical');
                }
                
                html += `<td class="${cellClass}">
                    <div class="${lineClasses.join(' ')}">${val}</div>
                </td>`;
            });
            html += `</tr>`;
        });
        html += `</tbody></table>`;
        return html;
    }

    // --- Analysis & PDF ---
    
    async optimizeAndAnalyze() {
        const apiKey = document.getElementById('groq_api_key').value;
        if (!apiKey) {
            alert("Por favor, ingrese la clave de acceso al servidor.");
            return;
        }

        if (!this.lastTransportResult || !this.lastAssignResult) {
            alert("Debe resolver ambos problemas (Transporte y Asignación) antes de analizar.");
            return;
        }

        // Prepare prompt
        let transportDetails = this.lastTransportResult.names_supply.map((s, i) => {
            return " + " + s + ": " + this.lastTransportResult.allocation[i].map((a, j) => `${this.lastTransportResult.names_demand[j]}=${a.allocated}`).join(', ');
        }).join('\n');

        let assignDetails = this.lastAssignResult.assignments.map(a => {
            return ` + ${this.lastAssignResult.names_row[a.row]} -> ${this.lastAssignResult.names_col[a.col]}`;
        }).join('\n');

        const prompt = `
Contexto: Eres el Director de Operaciones de NexusCore Systems. Acabamos de procesar dos optimizaciones críticas usando algoritmos matemáticos.
Datos de Entrada:
- Logística: Costo Total Mínimo $${this.lastTransportResult.total_cost}. Asignación óptima de envíos:
${transportDetails}
- Talento: Costo Total Mínimo ${this.lastAssignResult.total_cost} días. Asignación óptima de tareas:
${assignDetails}

Instrucción MÁXIMA: Genera un informe EXACTAMENTE con los siguientes subtítulos literales (sin usar asteriscos de markdown como ** ). Usa esta misma estructura:

Informe de Optimización Operacional

Introducción
(Escribe una breve introducción aquí)

Optimización Logística
* Costo Total Mínimo: $${this.lastTransportResult.total_cost}
* Asignación óptima de envíos:
${transportDetails}

Interpretación del Impacto Operacional
(Interpreta el impacto del transporte)

Optimización de Talento
* Costo Total (Tiempo) Mínimo: ${this.lastAssignResult.total_cost} días
* Asignación óptima de tareas:
${assignDetails}

Evaluación del Balance de Carga de Trabajo
(Evalúa el balance aquí)

Identificación de Posibles Cuellos de Botella
(Lista los cuellos de botella)

Análisis de Riesgos Logísticos
(Lista los riesgos logísticos)

Conclusiones Estratégicas
(Escribe las conclusiones)

Recomendaciones
(Escribe las recomendaciones en forma de viñetas)
`;

        const btn = document.querySelector('button.action');
        btn.innerText = "Procesando Análisis...";
        btn.disabled = true;

        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ api_key: apiKey, prompt })
            });
            const data = await res.json();
            
            if (data.success) {
                document.getElementById('analysis-content').innerText = data.analysis;
                document.getElementById('analysis-results').style.display = 'block';
                document.getElementById('btn-export').style.display = 'inline-flex';
            } else {
                alert("Error en el análisis de datos: " + data.error);
            }
        } catch (err) {
            alert("Error de conexión al analizar.");
        } finally {
            btn.innerText = "Generar Análisis Estratégico";
            btn.disabled = false;
        }
    }

    exportPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let y = 20;

        // Membrete Corporativo
        doc.setFontSize(24);
        doc.setTextColor(14, 165, 233);
        doc.text("NEXUSCORE SYSTEMS", 105, y, { align: "center" });
        y += 8;
        
        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139);
        doc.text("Reporte Estratégico de Operaciones y Logística", 105, y, { align: "center" });
        y += 6;
        
        doc.setFontSize(10);
        doc.text("Generado Automáticamente por NexusCore Systems", 105, y, { align: "center" });
        y += 15;

        // Parte I: Tablas de Entradas y Soluciones de Transporte
        if (this.lastTransportResult) {
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text("1. Optimización Logística (Transporte)", 14, y);
            y += 8;
            
            const head = [["Origen / Destino", ...this.lastTransportResult.names_demand, "Oferta Bal."]];
            const body = [];
            for (let i = 0; i < this.lastTransportResult.names_supply.length; i++) {
                const row = [this.lastTransportResult.names_supply[i]];
                for (let j = 0; j < this.lastTransportResult.names_demand.length; j++) {
                    const cell = this.lastTransportResult.allocation[i][j];
                    row.push(`Costo: $${cell.cost}\nEnvío: ${cell.allocated}`);
                }
                row.push(this.lastTransportResult.balanced_supply[i]);
                body.push(row);
            }
            body.push(["Demanda Bal.", ...this.lastTransportResult.balanced_demand, this.lastTransportResult.balanced_demand.reduce((a,b)=>a+b,0)]);

            doc.autoTable({
                startY: y,
                head: head,
                body: body,
                theme: 'grid',
                styles: { fontSize: 9 },
                headStyles: { fillColor: [15, 23, 42] }
            });
            y = doc.lastAutoTable.finalY + 15;
        }

        // Parte II: Tablas y Asignaciones
        if (this.lastAssignResult) {
            if (y > 230) { doc.addPage(); y = 20; }
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text("2. Gestión de Talento (Asignación)", 14, y);
            y += 8;

            const head = [["Ingeniero / Actividad", ...this.lastAssignResult.names_col]];
            const body = [];
            const matrix = this.lastAssignResult.steps[0].matrix;
            for (let i = 0; i < this.lastAssignResult.names_row.length; i++) {
                const row = [this.lastAssignResult.names_row[i]];
                for (let j = 0; j < this.lastAssignResult.names_col.length; j++) {
                    const isAssigned = this.lastAssignResult.assignments.some(a => a.row === i && a.col === j);
                    row.push(matrix[i][j] + (isAssigned ? "\n[ASIGNADO]" : ""));
                }
                body.push(row);
            }

            doc.autoTable({
                startY: y,
                head: head,
                body: body,
                theme: 'grid',
                styles: { fontSize: 9 },
                headStyles: { fillColor: [15, 23, 42] },
                didParseCell: function(data) {
                    if (data.cell.text[0] && data.cell.text[0].includes("[ASIGNADO]")) {
                        data.cell.styles.fillColor = [220, 255, 220];
                        data.cell.styles.textColor = [16, 185, 129];
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            });
            y = doc.lastAutoTable.finalY + 15;
        }

        // Parte III: Informe Cualitativo de IA
        const analysisText = document.getElementById('analysis-content').innerText;
        if (analysisText) {
            doc.addPage();
            doc.setFontSize(16);
            doc.setTextColor(14, 165, 233);
            doc.text("3. Informe Estratégico de Operaciones (COO)", 14, 20);
            
            doc.autoTable({
                startY: 28,
                body: [[analysisText]],
                theme: 'plain',
                styles: { fontSize: 11, textColor: [30, 30, 30], cellPadding: 2, fontStyle: 'normal' },
            });
        }

        doc.save('NexusCore_Systems_Report.pdf');
    }
}

// Initialize App
const app = new NexusApp();
