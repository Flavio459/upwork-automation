import sys

def check_eligibility(hours_est, rate_op, budget_client):
    # STEP 0: Absolute Budget Floor Check (US$ 400)
    if budget_client < 400:
        print("-" * 30)
        print(f"BUDGET:      ${budget_client:.2f}")
        print("FLOOR:       $400.00")
        print("-" * 30)
        print("RESULT: ❌ INELIGIBLE (Below Absolute Floor)")
        print("-" * 30)
        return False

    real_cost = hours_est * rate_op
    tolerance = budget_client * 1.12
    
    is_eligible = real_cost <= tolerance
    diff = real_cost - tolerance
    
    print("-" * 30)
    print(f"REAL COST:   ${real_cost:.2f}")
    print(f"MAX ALLOWED: ${tolerance:.2f} (1.12x Budget)")
    print("-" * 30)
    
    if is_eligible:
        print("RESULT: ✅ ELIGIBLE")
    else:
        print("RESULT: ❌ INELIGIBLE")
        print(f"EXCEEDS BY:  ${diff:.2f}")
    print("-" * 30)
    return is_eligible

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python check_eligibility.py <hours_est> <rate_op> <budget_client>")
        sys.exit(1)
        
    h = float(sys.argv[1])
    r = float(sys.argv[2])
    b = float(sys.argv[3])
    
    check_eligibility(h, r, b)
