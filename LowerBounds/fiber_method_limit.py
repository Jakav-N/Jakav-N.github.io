"""Limits of the fiber-counting method for block rigidity.

The single-J counting method certifies that f is not (r, s)-decomposable with dependency pattern S
only if some set J of outputs has min-entropy > r bits over the inputs C_J that no S_j (j in J) touches.
That min-entropy is at most n * min(|J|, |C_J|). So with rho = floor(r/n), the method FAILS on pattern S,
for every function f whatsoever, as soon as S is "rho-covering":

    every rho+1 of the sets S_j together cover all but at most rho of the k input blocks.

This script computes, for small k and rho, the smallest s for which a random pattern of s-subsets is
rho-covering (checked exhaustively over all (rho+1)-subsets J), and compares it with
  * the Cauchy lower bound: the method succeeds for an explicit linear f whenever (rho+1)(s+1) <= k
  * the union-bound estimate s >= (2k/(rho+1)) ln(e k/(rho+1))
  * the trivial decomposition, which always exists at s = k - rho.
"""
import itertools
import math
import random


def is_covering(k, S, rho):
    full = (1 << k) - 1
    for J in itertools.combinations(range(k), rho + 1):
        W = 0
        for j in J:
            W |= S[j]
        if bin(full & ~W).count("1") > rho:
            return False
    return True


def random_pattern(k, s, rng):
    return [sum(1 << i for i in rng.sample(range(k), s)) for _ in range(k)]


def smallest_covering_s(k, rho, rng, tries=30):
    for s in range(1, k + 1):
        if any(is_covering(k, random_pattern(k, s, rng), rho) for _ in range(tries)):
            return s
    return k


def main():
    rng = random.Random(1)
    print(f"{'k':>3} {'rho':>3} | {'Cauchy: method works up to s':>28} | {'random pattern defeats method at s':>34} | "
          f"{'union-bound estimate':>20} | {'trivial decomposition s':>23}")
    for k in (12, 16, 20, 24):
        for rho in (1, 2, 3):
            cauchy = k // (rho + 1) - 1
            found = smallest_covering_s(k, rho, rng)
            est = 2 * k / (rho + 1) * math.log(math.e * k / (rho + 1))
            print(f"{k:>3} {rho:>3} | {cauchy:>28} | {found:>34} | {est:>20.1f} | {k - rho:>23}")


if __name__ == "__main__":
    main()
