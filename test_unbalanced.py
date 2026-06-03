from algorithms.transport import TransportAlgorithm

def test_unbalanced_transport():
    costs = [
        [10, 20],
        [13, 9],
        [4, 15]
    ]
    supply = [250, 400, 350] # total 1000
    demand = [200, 300] # total 500
    names_supply = ["P1", "P2", "P3"]
    names_demand = ["D1", "D2"]
    
    algo = TransportAlgorithm(costs, supply, demand, names_supply, names_demand)
    res = algo.solve()
    print("Unbalanced Transport Result:")
    print("Success:", res['success'])
    print("Balanced:", res['balanced'])
    print("Demand total after balance:", sum(res['balanced_demand']))
    print("Names Demand:", res['names_demand'])
    print("-" * 20)

if __name__ == "__main__":
    test_unbalanced_transport()
