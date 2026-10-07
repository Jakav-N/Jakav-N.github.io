"""How much do exact answers beat the single-J fiber method? (blocks of 1 bit, k <= 5)

For a function f: {0,1}^k -> {0,1}^k and a dependency pattern S (output j may only look at inputs S_j),
let M(f, S) be the size of the largest input set X on which every output j is a function of x_{S_j}.
Block rigidity is about M being small: hint size r is forced to be at least k - log2 M(f, S).

The fiber method bound is min over output sets J of 2^|W_J| * (largest level set of f_J over the untouched
inputs C_J, maximised over fixings of x_{W_J}). We report how often the exact M is strictly smaller ("global
slack") and the average slack in bits, for linear and nonlinear families.
"""
import itertools
import math
import random

from block_rigidity_check import max_independent


def exact_M(k, f, S):
    nv = 1 << k
    adj = [0] * nv
    for x in range(nv):
        fx = f[x]
        for y in range(x + 1, nv):
            fy = f[y]
            for j in range(k):
                if (x ^ y) & S[j] == 0 and (fx >> j & 1) != (fy >> j & 1):
                    adj[x] |= 1 << y
                    adj[y] |= 1 << x
                    break
    return max_independent(nv, adj)


def fiber_bound(k, f, S):
    full = (1 << k) - 1
    best = 1 << k
    for J in range(1, 1 << k):
        W = 0
        for j in range(k):
            if J >> j & 1:
                W |= S[j]
        C = full & ~W
        cbits = [i for i in range(k) if C >> i & 1]
        wbits = [i for i in range(k) if W >> i & 1]
        worst = 0
        for wv in range(1 << len(wbits)):
            base = sum(((wv >> t) & 1) << b for t, b in enumerate(wbits))
            counts = {}
            for cv in range(1 << len(cbits)):
                x = base | sum(((cv >> t) & 1) << b for t, b in enumerate(cbits))
                key = f[x] & J
                counts[key] = counts.get(key, 0) + 1
            worst = max(worst, max(counts.values()))
        best = min(best, (1 << len(wbits)) * worst)
    return best


def families(k, rng):
    def linear():
        A = [rng.randrange(1 << k) for _ in range(k)]
        return [sum((bin(A[j] & x).count("1") & 1) << j for j in range(k)) for x in range(1 << k)]

    def random_fn():
        return [rng.randrange(1 << k) for _ in range(1 << k)]

    def random_perm():
        p = list(range(1 << k))
        rng.shuffle(p)
        return p

    def quadratic():
        # y_j = x_{j+1} x_{j+2} + x_{j+3} (indices mod k): a simple explicit nonlinear map
        out = []
        for x in range(1 << k):
            b = [(x >> i) & 1 for i in range(k)]
            out.append(sum(((b[(j + 1) % k] & b[(j + 2) % k]) ^ b[(j + 3) % k]) << j for j in range(k)))
        return out

    return {"random linear": linear, "random function": random_fn, "random permutation": random_perm,
            "quadratic (explicit)": quadratic}


def main(k=4, s=1, n_funcs=8, n_patterns=60, seed=3):
    rng = random.Random(seed)
    subsets = [m for m in range(1 << k) if bin(m).count("1") == s]
    print(f"k={k}, s={s}: exact max |X| vs single-J fiber bound")
    for name, make in families(k, rng).items():
        cases = strict = 0
        slack_bits = 0.0
        for _ in range(n_funcs):
            f = make()
            for _ in range(n_patterns):
                S = [rng.choice(subsets) for _ in range(k)]
                m, b = exact_M(k, f, S), fiber_bound(k, f, S)
                assert m <= b
                cases += 1
                if m < b:
                    strict += 1
                    slack_bits += math.log2(b / m)
        print(f"  {name:22} slack in {strict:4}/{cases} cases, mean slack {slack_bits / cases:.3f} bits")


if __name__ == "__main__":
    main(4, 1)
    main(5, 1, n_funcs=4, n_patterns=25)
    main(5, 2, n_funcs=3, n_patterns=20)
