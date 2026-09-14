# ADR-007: Isolate optional AI behind an adapter

**Status:** Accepted  
**Decision:** Use an AI adapter only for natural-language match explanations and weekly-report summaries. Match Score remains deterministic domain logic.  
**Consequences:** Provider swaps, prompt controls, redaction, timeouts, and retries are contained. On AI failure, return score/skill breakdown or raw report without generated text.

