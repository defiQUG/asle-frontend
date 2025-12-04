// Contract ABIs and addresses
export const DIAMOND_ADDRESS = process.env.NEXT_PUBLIC_DIAMOND_ADDRESS || "";

// Placeholder ABI - in production, these would be generated from contract artifacts
export const DIAMOND_ABI = [
  {
    inputs: [],
    name: "facets",
    outputs: [
      {
        components: [
          { internalType: "address", name: "facetAddress", type: "address" },
          { internalType: "bytes4[]", name: "functionSelectors", type: "bytes4[]" },
        ],
        internalType: "struct IDiamond.Facet[]",
        name: "facets_",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const LIQUIDITY_FACET_ABI = [
  {
    inputs: [
      { internalType: "address", name: "baseToken", type: "address" },
      { internalType: "address", name: "quoteToken", type: "address" },
      { internalType: "uint256", name: "initialBaseReserve", type: "uint256" },
      { internalType: "uint256", name: "initialQuoteReserve", type: "uint256" },
      { internalType: "uint256", name: "virtualBaseReserve", type: "uint256" },
      { internalType: "uint256", name: "virtualQuoteReserve", type: "uint256" },
      { internalType: "uint256", name: "k", type: "uint256" },
      { internalType: "uint256", name: "oraclePrice", type: "uint256" },
    ],
    name: "createPool",
    outputs: [{ internalType: "uint256", name: "poolId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "poolId", type: "uint256" },
      { internalType: "uint256", name: "baseAmount", type: "uint256" },
      { internalType: "uint256", name: "quoteAmount", type: "uint256" },
    ],
    name: "addLiquidity",
    outputs: [{ internalType: "uint256", name: "lpShares", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "poolId", type: "uint256" }],
    name: "getPool",
    outputs: [
      {
        components: [
          { internalType: "address", name: "baseToken", type: "address" },
          { internalType: "address", name: "quoteToken", type: "address" },
          { internalType: "uint256", name: "baseReserve", type: "uint256" },
          { internalType: "uint256", name: "quoteReserve", type: "uint256" },
          { internalType: "uint256", name: "virtualBaseReserve", type: "uint256" },
          { internalType: "uint256", name: "virtualQuoteReserve", type: "uint256" },
          { internalType: "uint256", name: "k", type: "uint256" },
          { internalType: "uint256", name: "oraclePrice", type: "uint256" },
          { internalType: "bool", name: "active", type: "bool" },
        ],
        internalType: "struct ILiquidityFacet.Pool",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const VAULT_FACET_ABI = [
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "bool", name: "isMultiAsset", type: "bool" },
    ],
    name: "createVault",
    outputs: [{ internalType: "uint256", name: "vaultId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "vaultId", type: "uint256" }],
    name: "getVault",
    outputs: [
      {
        components: [
          { internalType: "address", name: "asset", type: "address" },
          { internalType: "uint256", name: "totalAssets", type: "uint256" },
          { internalType: "uint256", name: "totalSupply", type: "uint256" },
          { internalType: "bool", name: "isMultiAsset", type: "bool" },
          { internalType: "bool", name: "active", type: "bool" },
        ],
        internalType: "struct IVaultFacet.Vault",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "vaultId", type: "uint256" },
      { internalType: "uint256", name: "assets", type: "uint256" },
      { internalType: "address", name: "receiver", type: "address" },
    ],
    name: "deposit",
    outputs: [{ internalType: "uint256", name: "shares", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "vaultId", type: "uint256" },
      { internalType: "uint256", name: "shares", type: "uint256" },
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    name: "withdraw",
    outputs: [{ internalType: "uint256", name: "assets", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const GOVERNANCE_FACET_ABI = [
  {
    inputs: [
      { internalType: "uint8", name: "proposalType", type: "uint8" },
      { internalType: "string", name: "description", type: "string" },
      { internalType: "bytes", name: "data", type: "bytes" },
      { internalType: "uint256", name: "votingPeriod", type: "uint256" },
    ],
    name: "createProposal",
    outputs: [{ internalType: "uint256", name: "proposalId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "proposalId", type: "uint256" },
      { internalType: "bool", name: "support", type: "bool" },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "proposalId", type: "uint256" }],
    name: "executeProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "proposalId", type: "uint256" }],
    name: "getProposal",
    outputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "uint8", name: "proposalType", type: "uint8" },
      { internalType: "uint8", name: "status", type: "uint8" },
      { internalType: "address", name: "proposer", type: "address" },
      { internalType: "uint256", name: "forVotes", type: "uint256" },
      { internalType: "uint256", name: "againstVotes", type: "uint256" },
      { internalType: "uint256", name: "startTime", type: "uint256" },
      { internalType: "uint256", name: "endTime", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

