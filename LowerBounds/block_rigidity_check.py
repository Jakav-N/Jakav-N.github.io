"""Brute-force check of the counting lemma for linear block rigidity (blocks of size n = 1, field GF(2)).

Setting: f(x) = A x over GF(2), x in GF(2)^k. A "local decomposition on X" assigns each output j a set
S_j of at most s input coordinates and requires (A x)_j to be a function of x restricted to S_j, for all x in X.

Lemma: for any such X and any set J of outputs, with W = union of S_j (j in J) and C = complement of W,
    |X| <= 2^(k - rank A[J, C]).
This script finds, for random A and every choice of the S_j, the LARGEST valid X (maximum independent set in
the conflict graph) and checks it against the best bound given by the lemma.
"""
import itertools
import random
import sys


def rank_gf2(rows):
    rows = [r for r in rows]
    rank = 0
    for bit in range(64):
        piv = next((i for i in range(rank, len(rows)) if rows[i] >> bit & 1), None)
        if piv is None:
            continue
        rows[rank], rows[piv] = rows[piv], rows[rank]
        for i in range(len(rows)):
            if i != rank and rows[i] >> bit & 1:
                rows[i] ^= rows[rank]
        rank += 1
    return rank


def dot(a, x):
    return bin(a & x).count("1") & 1


def max_independent(nv, adj):
    best = 0

    def rec(cand, size):
        nonlocal best
        if size + bin(cand).count("1") <= best:
            return
        if cand == 0:
            best = max(best, size)
            return
        v = (cand & -cand).bit_length() - 1
        rec(cand & ~adj[v] & ~(1 << v), size + 1)
        rec(cand & ~(1 << v), size)

    rec((1 << nv) - 1, 0)
    return best


def check(k, s, trials, rng):
    tight = 0
    for _ in range(trials):
        A = [rng.randrange(1 << k) for _ in range(k)]  # row j as bitmask over inputs
        subsets = [m for m in range(1 << k) if bin(m).count("1") <= s]
        for S in itertools.product(subsets, repeat=k):
            nv = 1 << k
            adj = [0] * nv
            for x in range(nv):
                for y in range(x + 1, nv):
                    for j in range(k):
                        if (x ^ y) & S[j] == 0 and dot(A[j], x) != dot(A[j], y):
                            adj[x] |= 1 << y
                            adj[y] |= 1 << x
                            break
            best_x = max_independent(nv, adj)
            bound = nv
            for J in range(1, 1 << k):
                W = 0
                rows = []
                for j in range(k):
                    if J >> j & 1:
                        W |= S[j]
                C = ((1 << k) - 1) & ~W
                rows = [A[j] & C for j in range(k) if J >> j & 1]
                bound = min(bound, 1 << (k - rank_gf2(rows)))
            assert best_x <= bound, (A, S, best_x, bound)
            tight += best_x == bound
    return tight


if __name__ == "__main__":
    rng = random.Random(0)
    for k, s, trials in ((3, 1, 40), (4, 1, 6), (4, 2, 1)):
        n_cases = trials * (sum(1 for m in range(1 << k) if bin(m).count('1') <= s)) ** k
        t = check(k, s, trials, rng)
        print(f"k={k} s={s}: lemma held in all {n_cases} (A, S) cases; bound exactly tight in {t}")
