from algorithms.transport import TransportAlgorithm
from algorithms.hungarian import HungarianAlgorithm

def test_transport():
    costs = [
        [10, 20, 5, 11],
        [13, 9, 12, 8],
        [4, 15, 7, 9]
    ]
    supply = [250, 400, 350]
    demand = [200, 300, 250, 250]
    names_supply = ["Planta 1", "Planta 2", "Planta 3"]
    names_demand = ["Data Center 1", "Data Center 2", "Data Center 3", "Data Center 4"]
    
    algo = TransportAlgorithm(costs, supply, demand, names_supply, names_demand)
    res = algo.solve()
    print("Transport Result:")
    print("Success:", res['success'])
    print("Total Cost:", res['total_cost'])
    print("Balanced:", res['balanced'])
    print("-" * 20)

def test_hungarian():
    matrix = [
        [12, 9, 11, 8],
        [10, 14, 12, 11],
        [8, 11, 15, 9],
        [9, 10, 12, 13]
    ]
    algo = HungarianAlgorithm(matrix)
    res = algo.solve()
    print("Hungarian Result:")
    print("Total Cost:", res['total_cost'])
    print("Steps Count:", len(res['steps']))
    print("-" * 20)

if __name__ == "__main__":
    test_transport()
    test_hungarian()
