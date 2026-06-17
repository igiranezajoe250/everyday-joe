# Everyday Protocol Strategy

This note sets the tone for how open commerce, knowledge, agent, and payment
protocols should fit into Everyday. The product remains simple: Marketplace,
Wallet, and Plan are the visible surfaces; Bounty is the intelligence layer.
Protocols should make those surfaces more interoperable without becoming visible
complexity for the user.

## Product Stance

Everyday should feel like one trusted daily-life app, not a protocol showcase.
Protocols sit behind the experience. Users should see clear actions: find,
book, save, pay, borrow, plan. Operators should see clear work: list, accept,
fulfill, settle. Agents should use standards quietly in the background.

When in doubt, hide protocol detail behind plain Everyday language.

## Where Each Protocol Sits

### UCP: Marketplace Commerce Layer

UCP belongs in Marketplace.

Use it to describe goods, services, operators, availability, required fields,
quotes, checkout requirements, fulfillment, cancellations, and support. For
Everyday, UCP is the structured language that lets Bounty or external agents
understand what can be bought, booked, requested, or fulfilled.

User-facing language: Marketplace, service, quote, booking, checkout.

### OKF: Knowledge and Trust Layer

Open Knowledge Format belongs across Plan, Marketplace, and Bounty.

Use it to store curated, trusted context: service rules, operator policies,
Irembo-style workflows, Typless-style form instructions, wallet rules, user
plans, and operational playbooks. OKF should become the portable knowledge base
that agents can read without guessing.

User-facing language: saved knowledge, instructions, profile, policy, context.

### A2A: Agent Collaboration Layer

Agent2Agent belongs behind Bounty.

Use it when Bounty needs to coordinate with specialized agents: marketplace
agents, operator agents, payment agents, plan agents, support agents, or
external service agents. A2A should not create a new screen. It is the private
coordination layer that helps Bounty complete tasks across systems.

User-facing language: Bounty is working on it, checking options, confirming.

### x402: Payment Access Layer

x402 belongs under Wallet and paid service/API access.

Use it for programmable payments where an agent, service, or API requires
payment before access. Wallet stays the user-facing cart and payment surface.
x402 is the rail underneath for machine-readable payment requests, especially
for agent-to-agent or external-service transactions.

User-facing language: pay, wallet, cart, receipt, settle.

## Everyday Flow

Marketplace finds and structures the offer through UCP.
OKF explains the rules and trusted context.
Bounty coordinates the work through A2A.
Wallet pays or settles through ordinary payment flows, with x402 available where
web-native or agent-native payment is needed.

Simple version:

Find it in Marketplace. Understand it through trusted knowledge. Coordinate it
with Bounty. Pay for it with Wallet.

## Next Session Starting Point

Start with one practical integration path:

1. Define an internal Marketplace service schema that can later map to UCP.
2. Define an OKF-style knowledge bundle for one service category, such as
   Mobility or Government services.
3. Define Bounty's internal agent handoff contract, keeping it A2A-ready.
4. Define Wallet's payment request object, keeping it x402-ready.

Do not expose these protocol names in the main UI unless the user is in a
developer/operator settings context.
