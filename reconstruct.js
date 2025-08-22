// reconstruct.js
// Usage: node reconstruct.js <jsonfile> [idxlist]
// idxlist is optional: comma-separated 1-based indices of points to use (size must be k)

const fs = require("fs");

// ----- base parser to BigInt (supports base 2..36) -----
function parseInBase(str, base) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  const map = new Map();
  for (let i = 0; i < chars.length; i++) map.set(chars[i], BigInt(i));

  let val = 0n;
  for (const cRaw of str.toLowerCase()) {
    const d = map.get(cRaw);
    if (d === undefined) throw new Error(`Bad digit '${cRaw}'`);
    if (d >= BigInt(base)) throw new Error(`Digit '${cRaw}' >= base ${base}`);
    val = val * BigInt(base) + d;
  }
  return val;
}

// ----- fraction arith over BigInt -----
function gcd(a, b) {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) [a, b] = [b, a % b];
  return a;
}
function normFrac(n, d) {
  if (d === 0n) throw new Error("Denominator zero");
  if (d < 0n) { n = -n; d = -d; }
  const g = gcd(n, d);
  return [n / g, d / g];
}
function addFrac([an, ad], [bn, bd]) {
  return normFrac(an * bd + bn * ad, ad * bd);
}
function mulFrac([an, ad], [bn, bd]) {
  return normFrac(an * bn, ad * bd);
}

// ----- Lagrange interpolation at x=0 -----
function lagrangeAtZero(points) {
  // points: Array<[BigInt x, BigInt y]>, length k
  let sum = [0n, 1n]; // fraction
  const k = points.length;
  for (let i = 0; i < k; i++) {
    const [xi, yi] = points[i];
    let basis = [1n, 1n];
    for (let j = 0; j < k; j++) {
      if (i === j) continue;
      const [xj] = points[j];
      basis = mulFrac(basis, [-xj, xi - xj]); // * (-xj)/(xi-xj)
    }
    sum = addFrac(sum, [yi * basis[0], basis[1]]);
  }
  const [num, den] = sum;
  if (num % den !== 0n) {
    throw new Error(`Result not integer: ${num}/${den}`);
  }
  return num / den;
}

// ----- main -----
function main() {
  const path = process.argv[2];
  if (!path) {
    console.error("Usage: node reconstruct.js <jsonfile> [idxlist]");
    process.exit(1);
  }
  const raw = fs.readFileSync(path, "utf8");
  const data = JSON.parse(raw);

  const k = Number(data.keys.k);
  // collect (x, y)
  const pts = [];
  for (const key of Object.keys(data)) {
    if (key === "keys") continue;
    const x = BigInt(key);
    const base = Number(data[key].base);
    const val = String(data[key].value);
    const y = parseInBase(val, base);
    pts.push([x, y]);
  }
  // sort by x
  pts.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));

  // optional subset selection
  let use;
  const idxlist = process.argv[3];
  if (idxlist) {
    const idx = idxlist.split(",").map(s => Number(s.trim()));
    if (idx.length !== k) {
      console.error(`idxlist must contain exactly k=${k} indices`);
      process.exit(1);
    }
    use = idx.map(i => {
      if (!(i >= 1 && i <= pts.length)) {
        console.error(`index out of range: ${i}`);
        process.exit(1);
      }
      return pts[i - 1];
    });
  } else {
    if (pts.length < k) {
      console.error(`Not enough points: have ${pts.length}, need k=${k}`);
      process.exit(1);
    }
    use = pts.slice(0, k);
  }

  const secret = lagrangeAtZero(use);
  console.log(secret.toString());
}

main();
