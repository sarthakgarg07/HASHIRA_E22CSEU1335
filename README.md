# Hashira - Shamir's Secret Sharing Reconstruction Tool

A Node.js implementation for reconstructing secrets from Shamir's Secret Sharing scheme using Lagrange interpolation.

## Overview

This tool implements the reconstruction phase of Shamir's Secret Sharing, allowing you to recover a secret value from a set of share points. It uses Lagrange interpolation to compute the secret at x=0 from k or more share points.

## Features

- **BigInt Support**: Handles large numbers without precision loss
- **Multi-base Parsing**: Supports parsing values in bases 2-36
- **Flexible Input**: Accepts JSON files with share data
- **Optional Point Selection**: Can specify which specific points to use for reconstruction
- **Fraction Arithmetic**: Uses exact fraction arithmetic for precise calculations

## Requirements

- Node.js (version 12 or higher recommended for BigInt support)

## Installation

No additional dependencies required - this tool uses only Node.js built-in modules.

```bash
# Clone or download the project
# No npm install needed
```

## Usage

### Basic Usage

```bash
node reconstruct.js <jsonfile>
```

### With Point Selection

```bash
node reconstruct.js <jsonfile> <idxlist>
```

Where:
- `<jsonfile>` is the path to your JSON file containing share data
- `<idxlist>` is an optional comma-separated list of 1-based indices (must contain exactly k points)

### Example

```bash
# Reconstruct using first k points
node reconstruct.js testcase.json

# Reconstruct using specific points (indices 1, 3, 5, 7, 9, 10, 2)
node reconstruct.js testcase.json "1,3,5,7,9,10,2"
```

## Input Format

The JSON file should contain:

```json
{
  "keys": {
    "n": 10,        // Total number of shares
    "k": 7          // Minimum shares needed for reconstruction
  },
  "1": {
    "base": "6",    // Base of the value (2-36)
    "value": "13444211440455345511"
  },
  "2": {
    "base": "15",
    "value": "aed7015a346d63"
  }
  // ... more shares
}
```

### Field Descriptions

- **keys.n**: Total number of shares generated
- **keys.k**: Minimum number of shares required for reconstruction
- **Share indices**: 1-based numbering of shares
- **base**: Base of the value (supports 2-36, case-insensitive)
- **value**: The share value in the specified base

## How It Works

1. **Parsing**: Converts share values from their specified base to BigInt
2. **Point Collection**: Gathers (x, y) coordinate pairs from the shares
3. **Lagrange Interpolation**: Computes the polynomial value at x=0 using Lagrange basis polynomials
4. **Secret Recovery**: Returns the reconstructed secret value

### Mathematical Background

The tool uses Lagrange interpolation to reconstruct the original polynomial f(x) from k points:

```
f(0) = Σ(yi * Li(0))
```

Where Li(x) are the Lagrange basis polynomials:

```
Li(x) = Π((x - xj) / (xi - xj)) for j ≠ i
```

## Error Handling

The tool provides clear error messages for:
- Insufficient points (less than k)
- Invalid base specifications
- Non-integer results
- Out-of-range indices
- Malformed JSON input

## Example Output

```bash
$ node reconstruct.js testcase.json
12345678901234567890
```

## Use Cases

- **Cryptographic Applications**: Reconstructing shared secrets
- **Digital Signatures**: Recovering private keys from distributed shares
- **Secure Storage**: Reconstructing sensitive data from multiple locations
- **Threshold Cryptography**: Implementing (k,n) threshold schemes

## Security Notes

- Ensure your JSON input file is secure and not accessible to unauthorized parties
- The reconstruction process reveals the secret - use in secure environments
- Consider the security implications of storing share data

## Limitations

- Requires exactly k shares for reconstruction (no error correction)
- Input values must be integers
- Base parsing supports up to base 36 (0-9, a-z)
