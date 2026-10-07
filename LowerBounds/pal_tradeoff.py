"""Explicit one-tape Turing machines for PALINDROMES with a k-bit buffer.

Builds the full transition table (so the state count is honest), checks the
machine on every binary string up to a given length, and reports the
worst-case running time next to n^2 / log2(q).

Tape alphabet: '0', '1', 'X' (consumed), 'B' (blank). Input in cells 1..n,
head starts on cell 1.
"""
import itertools
import math
import sys


def is_pal(s):
    return s == s[::-1]


def build(k):
    delta = {}  # (state, symbol) -> (new_state, write, move)
    states = set()
    bufs = ["".join(p) for c in range(k + 1) for p in itertools.product("01", repeat=c)]

    def halt(cond):
        return "ACC" if cond else "REJ"

    for buf in bufs:
        if len(buf) < k:
            st = ("READ", buf)
            states.add(st)
            for s in "01":
                nb = buf + s
                nxt = ("READ", nb) if len(nb) < k else ("RIGHT", nb)
                delta[(st, s)] = (nxt, "X", +1)
            for s in "XB":
                delta[(st, s)] = (halt(is_pal(buf)), s, 0)
        else:
            st = ("RIGHT", buf)
            states.add(st)
            for s in "01":
                delta[(st, s)] = (st, s, +1)
            for s in "XB":
                delta[(st, s)] = (("CMP", buf, 0), s, -1)
            for i in range(k):
                st = ("CMP", buf, i)
                states.add(st)
                for s in "01":
                    if s != buf[i]:
                        delta[(st, s)] = ("REJ", s, 0)
                    else:
                        nxt = ("CMP", buf, i + 1) if i + 1 < k else "LEFT"
                        delta[(st, s)] = (nxt, "X", -1)
                delta[(st, "X")] = (halt(is_pal(buf[i:])), "X", 0)
    states.add("LEFT")
    for s in "01":
        delta[("LEFT", s)] = ("LEFT", s, -1)
    for s in "XB":
        delta[("LEFT", s)] = (("READ", ""), s, +1)
    states |= {"ACC", "REJ"}
    return delta, len(states)


def run(delta, w):
    tape = {i + 1: c for i, c in enumerate(w)}
    pos, st, steps = 1, ("READ", ""), 0
    while st not in ("ACC", "REJ"):
        sym = tape.get(pos, "B")
        st, wr, mv = delta[(st, sym)]
        tape[pos] = wr
        pos += mv
        steps += 1
    return st == "ACC", steps


def main(max_n=16, ks=(1, 2, 3, 4, 6)):
    print(f"{'k':>2} {'states q':>9} {'n':>3} {'worst time':>10} {'n^2/log2 q':>11} {'ratio':>6}")
    for k in ks:
        delta, q = build(k)
        for n in range(1, max_n + 1):
            worst = 0
            for t in itertools.product("01", repeat=n):
                w = "".join(t)
                acc, steps = run(delta, w)
                assert acc == is_pal(w), (k, w)
                worst = max(worst, steps)
            if n == max_n:
                ref = n * n / math.log2(q)
                print(f"{k:>2} {q:>9} {n:>3} {worst:>10} {ref:>11.1f} {worst / ref:>6.2f}")
    print(f"All machines correct on every string of length <= {max_n}.")


if __name__ == "__main__":
    main(int(sys.argv[1]) if len(sys.argv) > 1 else 16)
