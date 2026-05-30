# BodyFix AI Copilot MVP Principles

Part 7A creates a safe, controllable AI copilot for Gavin. It is not an automated operations system and it must never take over client communication, booking, pricing, payment, or conversion decisions.

## Highest Principles

1. AI can only read data, organize data, generate suggestions, and generate drafts.
2. AI must not automatically send LINE / IG messages.
3. AI must not automatically change bookings.
4. AI must not automatically request payment.
5. AI must not automatically change prices.
6. AI must not automatically convert a lead into an official client.
7. AI must not automatically delete data.
8. AI must not make medical diagnoses.
9. AI must not promise outcomes or therapeutic effects.
10. All official actions must be confirmed by Gavin.
11. Location Demand Activation V1 is analysis-only and must not generate invitation drafts.
12. All AI-generated text must be labeled as draft content and must not be treated as an official message.
13. If AI output references body condition, it must use BodyFix safe language: body-state organization, tension distribution, mobility, movement quality, and returning to a more stable, resilient, elastic system.
14. AI must not use medical diagnosis, treatment, rehabilitation, guaranteed improvement, or similar wording.

## Permission Levels

| Level | Allowed | Examples |
| --- | --- | --- |
| Read | AI can read business data through admin-only server routes. | Clients, service records, follow-ups, plan candidates, location demand dashboards, Part 4 services and business rules. |
| Suggest | AI can generate recommendations for Gavin to review. | Client summaries, next service direction, plan fit, today follow-up priority, location demand analysis. |
| Draft | AI can generate clearly labeled drafts. | Offer message drafts, follow-up drafts, internal summary drafts. |
| Write | Forbidden for official business data. | AI routes must not update client, booking, pricing, offer, or formal status tables. |
| Send | Forbidden. | AI must not send LINE / IG / SMS / email. |
| Commit | Forbidden. | AI must not apply a draft as an official state or decision. |

## Location Demand Boundary

Location Demand Analysis Only may summarize city, zone, area, block, and lead signals. It must not create invitation copy, private-message drafts, automatic outreach tasks, payment requests, deposit requests, or promises that BodyFix will open a session.

## Program References

Part 7A implementation files should reference this document whenever AI safety, route boundaries, or UI draft labels are discussed. The AI copilot routes and UI are expected to keep every generated output review-only until Gavin confirms an official action outside the AI system.
