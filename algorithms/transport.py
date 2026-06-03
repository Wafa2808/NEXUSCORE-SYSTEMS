import numpy as np
from scipy.optimize import linprog

class TransportAlgorithm:
    def __init__(self, costs, supply, demand, names_supply=None, names_demand=None):
        self.costs = np.array(costs, dtype=float)
        self.supply = np.array(supply, dtype=float)
        self.demand = np.array(demand, dtype=float)
        self.names_supply = names_supply or [f"Origen {i+1}" for i in range(len(supply))]
        self.names_demand = names_demand or [f"Destino {i+1}" for i in range(len(demand))]
        
    def solve(self):
        total_supply = np.sum(self.supply)
        total_demand = np.sum(self.demand)
        
        balanced_costs = self.costs.copy()
        balanced_supply = self.supply.copy()
        balanced_demand = self.demand.copy()
        names_supp = self.names_supply.copy()
        names_dem = self.names_demand.copy()
        
        if total_supply > total_demand:
            dummy_demand = total_supply - total_demand
            balanced_demand = np.append(balanced_demand, dummy_demand)
            balanced_costs = np.hstack((balanced_costs, np.zeros((balanced_costs.shape[0], 1))))
            names_dem.append("Ficticio (Destino)")
        elif total_demand > total_supply:
            dummy_supply = total_demand - total_supply
            balanced_supply = np.append(balanced_supply, dummy_supply)
            balanced_costs = np.vstack((balanced_costs, np.zeros((1, balanced_costs.shape[1]))))
            names_supp.append("Ficticio (Origen)")
            
        m, n = balanced_costs.shape
        c = balanced_costs.flatten()
        
        A_eq = np.zeros((m + n, m * n))
        b_eq = np.zeros(m + n)
        
        for i in range(m):
            for j in range(n):
                A_eq[i, i * n + j] = 1
            b_eq[i] = balanced_supply[i]
            
        for j in range(n):
            for i in range(m):
                A_eq[m + j, i * n + j] = 1
            b_eq[m + j] = balanced_demand[j]
            
        A_eq = A_eq[:-1]
        b_eq = b_eq[:-1]
        
        res = linprog(c, A_eq=A_eq, b_eq=b_eq, bounds=(0, None), method='highs')
        
        allocation_matrix = []
        if res.success:
            allocation = np.round(res.x).reshape((m, n))
            total_cost = float(np.sum(allocation * balanced_costs))
            for i in range(m):
                row = []
                for j in range(n):
                    row.append({
                        "cost": float(balanced_costs[i, j]),
                        "allocated": float(allocation[i, j])
                    })
                allocation_matrix.append(row)
                
            return {
                "success": True,
                "balanced_supply": balanced_supply.tolist(),
                "balanced_demand": balanced_demand.tolist(),
                "names_supply": names_supp,
                "names_demand": names_dem,
                "allocation": allocation_matrix,
                "total_cost": total_cost,
                "balanced": bool(total_supply == total_demand),
                "initial_supply_total": float(total_supply),
                "initial_demand_total": float(total_demand)
            }
        else:
            return {"success": False, "error": "No se encontró solución."}
