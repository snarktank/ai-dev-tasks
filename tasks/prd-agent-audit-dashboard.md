# Product Requirements Document: Agent Audit Dashboard (MVP)

## Introduction/Overview

The Agent Audit Dashboard is a real-time monitoring platform that provides transparency into AI crypto agent actions on blockchain networks. The MVP focuses on serving **DeFi Power Users** who manage 5-20 AI trading agents across protocols and need to verify that agents aren't making unauthorized trades or behaving abnormally.

**Problem:** DeFi power users currently have no centralized way to monitor all their agents' activities in real-time, making it difficult to quickly spot unauthorized trades, compromised wallets, or agents deviating from their intended strategy.

**Solution:** A live activity feed that aggregates blockchain transactions from connected AI agents, displays them in a human-readable format, and verifies their authenticity against the blockchain.

---

## Goals

1. **Aggregate agent activities** - Provide a unified dashboard showing all on-chain transactions from a user's AI agents across Ethereum and connected protocols
2. **Enable transaction verification** - Display cryptographic proof that transactions are real and match agent declarations
3. **Reduce monitoring overhead** - Allow users to quickly scan agent activity without manually checking block explorers or multiple dashboards
4. **Build foundation for expansion** - Create core infrastructure (data collection, verification, storage) that enables future features (anomaly detection, compliance reports, etc.)

---

## User Stories

### Story 1: Initial Setup
**As a** DeFi power user with 5 AI agents
**I want to** quickly add my agents to the dashboard without manual configuration
**So that** I can start monitoring all their activities in one place

**Acceptance Criteria:**
- User connects wallet
- Dashboard auto-detects agents in wallet or connected addresses
- User can add agents manually via contract address
- Setup takes <5 minutes

### Story 2: Daily Monitoring
**As a** DeFi power user
**I want to** see a live feed of all my agents' recent transactions
**So that** I can quickly spot unusual activity without opening block explorers

**Acceptance Criteria:**
- Activity feed updates in real-time (within 30 seconds of blockchain confirmation)
- Each entry shows: agent name, action type, assets, amount, timestamp, verification status
- I can filter by: agent, asset type, time range
- I can click any transaction to see detailed breakdown

### Story 3: Verify Agent Authenticity
**As a** DeFi power user
**I want to** confirm that transaction events actually came from my agent
**So that** I can trust the dashboard isn't showing fabricated or spoofed activities

**Acceptance Criteria:**
- Each transaction shows verification status (✓ Verified on-chain, ⚠ Pending, ✗ Unverified)
- Verified transactions link to blockchain proof
- User can click verification badge to see cryptographic proof details
- At least 90% of recent transactions are verified within 2 minutes of confirmation

### Story 4: Multi-Agent Overview
**As a** DeFi power user with multiple agents
**I want to** see a summary view of all my agents' current status
**So that** I can quickly assess overall portfolio health

**Acceptance Criteria:**
- Dashboard shows list of all connected agents
- For each agent: number of active positions, total value, recent activity timestamp, verification status
- User can see which agents are active vs idle
- Summary updates in real-time

---

## Functional Requirements

### Core Activity Feed
1. Dashboard must display a chronological feed of recent transactions from all connected agents, newest first
2. System must support transaction types: swaps, transfers, staking, LP operations, governance votes, bridge transactions
3. Each feed entry must display: agent identifier, action description, token amounts, protocol/contract, timestamp, verification status
4. System must update feed within 30 seconds of transaction confirmation on blockchain
5. Users must be able to filter feed by: specific agent, asset, protocol, date range, verification status
6. Each feed entry must be clickable to show detailed transaction breakdown (inputs, outputs, gas, slippage, MEV exposure)

### Agent Management
7. Dashboard must auto-detect agents associated with user's connected wallet(s)
8. Users must be able to manually add agents by contract address
9. Users must be able to label/rename agents for personal organization
10. Dashboard must display list of all connected agents with current status (active/paused/error)
11. Users must be able to remove agents from their dashboard

### Transaction Verification
12. System must verify each transaction against blockchain state using on-chain event logs
13. Each transaction must display one of three verification statuses:
    - ✓ Verified: Transaction confirmed on-chain and matches expected behavior
    - ⚠ Pending: Transaction pending confirmation or verification check in progress
    - ✗ Unverified: Transaction unconfirmed or verification failed
14. Users must be able to view verification proof details (link to transaction, contract events, signature validation)
15. System must reach 90%+ verification rate for transactions from agents that support standard event emissions

### Data Integration (MVP Phase 1 - Single Blockchain)
16. System must use The Graph subgraphs to fetch Ethereum transaction data for supported protocols (Uniswap, Aave, Curve, etc.)
17. System must support both agent types:
    - **Passive integration:** Agents with standard event emissions that can be indexed without configuration
    - **Active integration:** Agents that implement optional webhook to report off-chain actions
18. System must aggregate and deduplicate data from The Graph to avoid duplicate entries
19. System must cache transaction history locally (minimum 7 days, target 30 days)

### User Authentication & Data Security
20. Users must authenticate via wallet connection (MetaMask, WalletConnect, Coinbase Wallet support required)
21. Dashboard must not have custody of user funds
22. User data must be scoped to wallet address - users can only see agents associated with their connected wallet(s)
23. Dashboard must not require API keys or private keys from users

---

## Non-Goals (Out of Scope)

The following features are **not** included in this MVP and will be considered for Phase 2+:

- **Anomaly detection** - Flagging unusual behavior patterns (deferred to Phase 2)
- **Reputation scoring** - Agent trustworthiness scores (deferred to Phase 2)
- **TEE/ZK verification** - Trusted Execution Environment attestation or zero-knowledge proofs (deferred to Phase 2)
- **Compliance reporting** - PDF reports with regulatory audit trails (deferred to Phase 2+)
- **Multi-chain support** - Only Ethereum in MVP (Arbitrum, Solana, etc. in Phase 2+)
- **Custom anomaly rules** - User-defined behavior rules and alerting (deferred to Phase 2)
- **Insurance integrations** - Connecting to insurance protocols (deferred to Phase 3+)
- **Verification node network** - Decentralized verifiers (deferred to Phase 3+)
- **White-label offering** - Custom branding for institutions (deferred to Phase 3+)

---

## Design Considerations

### UI/UX Layout (Reference)
- **Top navigation:** Logo, user wallet display, settings
- **Left sidebar:** Agent list with status indicators
- **Main feed area:** Chronological activity feed with filters
- **Right panel:** Quick stats (total portfolio value, active agents count, verification rate)
- **Detail view:** Click transaction to expand full breakdown

### Visual Design
- Use green checkmarks (✓) for verified transactions
- Use yellow warning (⚠) for pending verification
- Use red X (✗) or muted styling for unverified transactions
- Display agent names/icons in feed for clarity with multiple agents
- Use consistent styling with Web3 conventions (familiar to crypto users)

### Mobile Responsiveness
- Dashboard should be usable on tablets
- Mobile version can defer detail views to full screen expansion
- Core feed should be readable on mobile

---

## Technical Considerations

### Data Sources & Integrations
- **The Graph:** Primary data source for Ethereum transactions from Uniswap, Aave, Curve, and other supported protocols
- **Dune Analytics:** Fallback/supplementary queries for complex multi-step transactions
- **Direct RPC calls:** For verification of transaction status and confirmation numbers
- **Webhook endpoint:** Optional integration point for agents to report off-chain actions (receives action logs, stores with user authentication)

### Architecture Notes
- **Frontend:** Next.js 14 with React + TypeScript (as specified in full spec)
- **Backend:** API to aggregate data from The Graph, handle verification logic, manage user sessions
- **Storage:** PostgreSQL for transaction cache (7-30 days), user preferences
- **Real-time updates:** WebSocket or Server-Sent Events for live feed updates

### Known Constraints
- The Graph indexing may lag 1-5 minutes behind real-time (acceptable for MVP)
- Supported protocols limited to those with existing subgraphs (Uniswap, Aave, Curve, Balancer)
- Agents must either emit standard contract events OR implement webhook for verification
- Storage costs grow with more agents - need to define data retention policy

### Dependencies
- The Graph API access (free tier available for MVP)
- Wallet connection libraries (Wagmi, Viem - established libraries)
- Web3 event parsing (ethers.js or web3.js)

---

## Success Metrics

### Product Metrics
1. **Agents monitored in MVP:** 50+ unique agents tracked by end of Phase 1
2. **Transaction verification rate:** 85%+ of transactions from participating agents verified within 2 minutes
3. **Dashboard load time:** < 3 seconds for initial load, < 500ms for feed refresh
4. **Feed freshness:** Updates within 30 seconds of blockchain confirmation
5. **User onboarding:** 80%+ of new users can add agents and view feed without support

### Business Metrics
1. **Beta user adoption:** 10+ active beta testers (target at week 4)
2. **User retention:** 70%+ of beta users return in following week
3. **Feedback score:** NPS >50 from beta users
4. **Time to value:** Users can connect wallet and see meaningful activity within 5 minutes

### Quality Metrics
1. **System uptime:** 99%+ availability (excluding planned maintenance)
2. **Data accuracy:** < 0.1% discrepancy between dashboard and blockchain data
3. **Bug report rate:** < 2 critical bugs per week during beta

---

## Open Questions

1. **Wallet Scope:** Should the dashboard automatically detect agents from all addresses a user has ever interacted with, or only from wallets they actively control? (Impacts feature scope)
2. **Inactive Agent Handling:** How long should we keep displaying agents that haven't had activity? Should there be an archival mechanism?
3. **Off-chain Action Logging:** For the active integration webhook, what metadata should agents be required to provide? (Just transaction hash, or also strategy rationale?)
4. **Protocol Coverage:** Should we prioritize only the top 5 DEXes (Uniswap, Aave, Curve, Balancer, Compound) or try to support 15+? (Affects development timeline)
5. **Historical Data:** Should MVP support viewing transaction history beyond 7 days, or is 7-day window sufficient for users?

---

## Acceptance Criteria for MVP Completion

The MVP will be considered complete when:
- [ ] Users can connect wallet and add agents (manual + auto-detect)
- [ ] Activity feed displays recent transactions from Ethereum agents in real-time
- [ ] All transactions show blockchain verification status
- [ ] Feed updates within 30 seconds of confirmation
- [ ] At least 3 supported protocols fully working (Uniswap, Aave, Curve)
- [ ] 10+ beta testers actively using dashboard
- [ ] Zero critical security issues in security audit
- [ ] 85%+ transaction verification rate achieved
- [ ] Mobile-responsive interface working
