import numpy as np
from scipy.sparse import csr_matrix
from scipy.sparse.csgraph import maximum_bipartite_matching
from scipy.optimize import linear_sum_assignment

class HungarianAlgorithm:
    def __init__(self, cost_matrix):
        self.original_matrix = np.array(cost_matrix, dtype=float)
        self.n = self.original_matrix.shape[0]
        self.steps = []
        
    def solve(self):
        matrix = self.original_matrix.copy()
        self._add_step("Matriz Inicial", matrix, "Matriz de costos original.")
        
        # Step 1: Row reduction
        row_mins = matrix.min(axis=1)
        matrix = matrix - row_mins[:, np.newaxis]
        self._add_step("Reducción de Filas", matrix, "Se restó el mínimo de cada fila a todos los elementos de esa fila.")
        
        # Step 2: Column reduction
        col_mins = matrix.min(axis=0)
        matrix = matrix - col_mins
        self._add_step("Reducción de Columnas", matrix, "Se restó el mínimo de cada columna a todos los elementos de esa columna.")
        
        # Step 3 & 4 loop
        max_iter = 100
        iteration = 0
        while iteration < max_iter:
            iteration += 1
            lines = self._get_min_lines(matrix)
            if len(lines) >= self.n:
                self._add_step("Cobertura de Ceros", matrix, f"Se cubrieron todos los ceros con {len(lines)} líneas. Como el número de líneas es igual al tamaño de la matriz, se ha alcanzado la solución óptima.", lines=lines)
                break
            
            self._add_step("Cobertura de Ceros", matrix, f"Se cubrieron todos los ceros con {len(lines)} líneas. Como el número de líneas ({len(lines)}) es menor que {self.n}, la matriz no es óptima y se debe ajustar.", lines=lines)
            
            # Adjust matrix
            matrix = self._adjust_matrix(matrix, lines)
            self._add_step("Ajuste de Matriz", matrix, "Se restó el menor valor no cubierto a los no cubiertos y se sumó a las intersecciones de las líneas.")
            
        # Final assignment
        assignments = self._get_assignments(matrix)
        total_cost = sum(self.original_matrix[r['row'], r['col']] for r in assignments)
        self._add_step("Asignación Final", matrix, f"Asignación óptima encontrada. Costo Total: {total_cost}", assignments=assignments)
        
        return {
            "steps": self.steps,
            "assignments": assignments,
            "total_cost": float(total_cost)
        }
        
    def _add_step(self, title, matrix, description, lines=None, assignments=None):
        self.steps.append({
            "title": title,
            "matrix": matrix.tolist(),
            "description": description,
            "lines": lines or [],
            "assignments": assignments or []
        })

    def _get_min_lines(self, matrix):
        n = matrix.shape[0]
        graph = (matrix == 0).astype(int)
        matching = maximum_bipartite_matching(csr_matrix(graph))
        
        unmatched_rows = [i for i in range(n) if matching[i] == -1]
        visited_rows = set(unmatched_rows)
        visited_cols = set()
        
        queue = list(unmatched_rows)
        while queue:
            r = queue.pop(0)
            for c in range(n):
                if matrix[r, c] == 0 and c not in visited_cols:
                    visited_cols.add(c)
                    matching_row = np.where(matching == c)[0]
                    if len(matching_row) > 0:
                        mr = matching_row[0]
                        if mr not in visited_rows:
                            visited_rows.add(mr)
                            queue.append(mr)
                            
        row_lines = [r for r in range(n) if r not in visited_rows]
        col_lines = list(visited_cols)
        
        lines = []
        for r in row_lines:
            lines.append({"type": "row", "index": int(r)})
        for c in col_lines:
            lines.append({"type": "col", "index": int(c)})
            
        return lines
        
    def _adjust_matrix(self, matrix, lines):
        n = matrix.shape[0]
        covered_rows = {l["index"] for l in lines if l["type"] == "row"}
        covered_cols = {l["index"] for l in lines if l["type"] == "col"}
        
        min_uncovered = float('inf')
        for i in range(n):
            if i not in covered_rows:
                for j in range(n):
                    if j not in covered_cols:
                        if matrix[i, j] < min_uncovered:
                            min_uncovered = matrix[i, j]
                            
        new_matrix = matrix.copy()
        for i in range(n):
            for j in range(n):
                if i not in covered_rows and j not in covered_cols:
                    new_matrix[i, j] -= min_uncovered
                elif i in covered_rows and j in covered_cols:
                    new_matrix[i, j] += min_uncovered
                    
        return new_matrix
        
    def _get_assignments(self, matrix):
        row_ind, col_ind = linear_sum_assignment(matrix)
        return [{"row": int(r), "col": int(c)} for r, c in zip(row_ind, col_ind)]
