# InternHub Worker

No worker process is implemented. Optional AI job creation and polling return `503`, and the web application does not expose AI controls. Deadline notifications and document cleanup currently run in the API's scheduled maintenance service.

Before enabling optional AI, implement authorized source reads, bounded retries, lease recovery, cancellation, and explicit failure states. Verify provider interruption and worker failure independently of the core internship workflow. Matching remains deterministic; generated content is advisory only.
