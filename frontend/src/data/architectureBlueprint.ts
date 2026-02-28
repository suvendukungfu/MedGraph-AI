import type { BlueprintSection } from '../types/architecture'

export const architectureBlueprintSections: BlueprintSection[] = [
  {
    id: 1,
    title: 'Updated System Architecture',
    summary:
      'Monolithic modular architecture with strict boundaries, async workers for heavy tasks, and WebSockets for real-time patient/caretaker updates.',
    blocks: [
      {
        title: 'Layered Diagram (Textual)',
        items: [
          'Presentation: React role dashboards + route guards + websocket client.',
          'API: FastAPI routers, request validation, RBAC dependencies, idempotency checks.',
          'Application: use-case orchestration for adherence, alerts, OCR ingestion, scheduling.',
          'Domain: entities, aggregates, policy services, risk scoring strategies, graph interaction engine.',
          'Infrastructure: PostgreSQL, Redis cache, Celery workers, object storage, provider adapters.',
        ],
      },
      {
        title: 'Sync vs Async Split',
        items: [
          'Synchronous: auth, dashboard reads, lightweight interaction checks, medication CRUD.',
          'Asynchronous: OCR extraction, schedule optimization for large payloads, escalations, email/SMS fan-out.',
          'WebSockets: adherence status stream, escalation state changes, emergency event updates.',
        ],
      },
      {
        title: 'Design Tradeoffs',
        items: [
          'No microservices: team size and hackathon timeline favor one deployable with module boundaries.',
          'No event-streaming platform: Celery + Postgres outbox gives enough reliability without Kafka overhead.',
          'No heavy infra: Docker Compose (API + worker + DB + Redis) is faster to operate and demo.',
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'Database Schema Evolution',
    summary:
      'Normalized clinical core, selective denormalized read models for dashboards, strict indexing, and PII separation.',
    blocks: [
      {
        title: 'Schema & Relationships',
        items: [
          'users(doctor, patient, caretaker, admin) linked through care_team_memberships.',
          'medication_plans -> medication_plan_items -> alarm_schedules (1:N:N).',
          'adherence_logs, escalation_logs, emergency_events use patient_id + created_at indexes.',
          'ocr_uploads store metadata + object URI; extracted tokens saved in ocr_extractions.',
          'pharmacy_cache stores geohash buckets for fast nearby lookup reuse.',
        ],
      },
      {
        title: 'Index & Time-Series Strategy',
        items: [
          'Composite indexes: (patient_id, scheduled_for), (patient_id, created_at desc), (status, created_at).',
          'Partition monthly: adherence_logs, escalation_logs, emergency_events for write-heavy growth.',
          'Retention policy: raw OCR binaries and old telemetry archived to object storage.',
        ],
      },
      {
        title: 'PII Strategy',
        items: [
          'PII fields in separate columns with field-level encryption (name, phone, email).',
          'Operational analytics tables store pseudonymous patient_public_id only.',
          'Audit tables are append-only and immutable.',
        ],
      },
    ],
    codeBlocks: [
      {
        title: 'SQL-like Core Tables',
        language: 'sql',
        content: `CREATE TABLE users (
  id UUID PRIMARY KEY,
  public_id TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','doctor','patient','caretaker')),
  email_encrypted BYTEA,
  phone_encrypted BYTEA,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE medication_plan_items (
  id UUID PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES medication_plans(id),
  drug_name TEXT NOT NULL,
  frequency_per_day INT NOT NULL CHECK (frequency_per_day BETWEEN 1 AND 6),
  dosage_text TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE adherence_logs (
  id BIGSERIAL PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES users(id),
  plan_item_id UUID NOT NULL REFERENCES medication_plan_items(id),
  scheduled_for TIMESTAMPTZ NOT NULL,
  taken_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('taken','missed','late')),
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_adherence_patient_time ON adherence_logs(patient_id, scheduled_for DESC);`,
      },
    ],
  },
  {
    id: 3,
    title: 'New Domain Models (DDD Style)',
    summary:
      'Clear aggregate roots for plans, adherence, and emergency events with policy services for escalation and scoring.',
    blocks: [
      {
        title: 'Entities & Aggregates',
        items: [
          'Aggregate: MedicationPlan {items, alarmSchedules, version}.',
          'Aggregate: AdherenceCase {patient, rolling_miss_count, risk_band, latest_events}.',
          'Aggregate: EmergencyCase {trigger, escalation_state, notifications_sent}.',
          'Entity: OcrUpload with quality score and validation state.',
        ],
      },
      {
        title: 'Value Objects',
        items: [
          'DoseWindow(start_at, end_at, grace_minutes).',
          'RiskScore(value, band, dominant_driver).',
          'GeoPoint(lat, lng, accuracy_meters).',
        ],
      },
      {
        title: 'Services',
        items: [
          'Domain service: AdherencePolicyService computes missed-dose and grace-period outcomes.',
          'Domain service: EscalationPolicyService decides next actor and retry timeline.',
          'Application service: CareWorkflowService orchestrates repositories + workers + notifications.',
          'Graph engine is domain service dependency for conflict-aware adherence recalibration.',
        ],
      },
    ],
  },
  {
    id: 4,
    title: 'Role-Based Access Control Strategy',
    summary:
      'JWT-based RBAC with route-level gates and domain-level policy checks for patient safety and tenancy isolation.',
    blocks: [
      {
        title: 'JWT Claims',
        items: [
          'sub, role, tenant_id, user_public_id, permissions_version, exp, iat.',
          'Short-lived access token + rotating refresh token with jti revocation list in Redis.',
        ],
      },
      {
        title: 'Authorization Enforcement',
        items: [
          'FastAPI dependency checks role and tenant membership at route entry.',
          'Domain policy checks ownership: doctor can access assigned patients only; caretaker assigned cases only.',
          'Audit log on all denied access attempts for abuse detection.',
        ],
      },
      {
        title: 'RBAC Choice Rationale',
        items: [
          'RBAC is deterministic and easy to reason about under hackathon time constraints.',
          'Hybrid ABAC can be layered later for contextual rules (time, clinic, emergency override).',
        ],
      },
    ],
    tables: [
      {
        title: 'Permission Matrix',
        columns: ['Capability', 'Admin', 'Doctor', 'Patient', 'Caretaker'],
        rows: [
          ['View all tenants', 'Yes', 'No', 'No', 'No'],
          ['Manage own profile', 'Yes', 'Yes', 'Yes', 'Yes'],
          ['Create medication plan', 'No', 'Yes', 'No', 'No'],
          ['Log adherence event', 'No', 'No', 'Yes', 'Yes'],
          ['Receive escalation alert', 'Yes', 'Yes', 'No', 'Yes'],
          ['Trigger emergency broadcast', 'Yes', 'Yes', 'Yes', 'Yes'],
        ],
      },
    ],
  },
  {
    id: 5,
    title: 'Medication Adherence Monitoring Logic',
    summary:
      'Window-based detection engine with grace rules, idempotent event ingestion, and rolling risk recalibration.',
    blocks: [
      {
        title: 'Detection Rules',
        items: [
          'Dose is on-time if confirmation in [scheduled_at - early_window, scheduled_at + grace_window].',
          'Late if confirmed after grace but before hard cutoff; missed otherwise.',
          'Consecutive misses and weighted misses both tracked for policy triggers.',
          'Risk score recalibration combines adherence trend + drug interaction severity.',
        ],
      },
      {
        title: 'Idempotency',
        items: [
          'Client submits idempotency_key per adherence action.',
          'Server stores key hash + response snapshot with TTL to prevent duplicate processing.',
        ],
      },
    ],
    codeBlocks: [
      {
        title: 'Detection Engine Pseudocode',
        language: 'text',
        content: `for each due_alarm in schedule_window(now - 10m, now + 10m):
  event = adherence_event_repo.find_by_alarm(due_alarm.id)
  if event exists:
    classify(event.timestamp, due_alarm.scheduled_at, grace_minutes)
  else if now > due_alarm.scheduled_at + grace_minutes:
    mark_missed(due_alarm)

update_patient_streaks(patient_id)
risk = risk_strategy.compute(base_graph_risk, adherence_trend)
if escalation_policy.should_trigger(risk, streaks):
  enqueue_escalation(patient_id, risk)`,
      },
    ],
  },
  {
    id: 6,
    title: 'Alarm + Notification + Escalation System',
    summary:
      'Policy-driven escalation cascade with retry/backoff and multi-channel delivery adapters.',
    blocks: [
      {
        title: 'Notification Layers',
        items: [
          'In-app websocket events for immediate UI updates.',
          'Email adapter for routine escalations and summaries.',
          'SMS adapter abstraction for high-severity misses and emergencies.',
          'Push-ready interface preserved for future mobile app integration.',
        ],
      },
      {
        title: 'Escalation Path',
        items: [
          'Patient reminder -> caretaker alert -> doctor alert -> emergency event creation.',
          'Each step has SLA timer, max retries, and duplicate suppression token.',
          'Failures are parked in retry queue with exponential backoff and final dead-letter record.',
        ],
      },
      {
        title: 'Lightweight Resilience',
        items: [
          'Circuit breaker around external SMS/email vendors.',
          'Fallback to in-app + audit log when provider is down.',
        ],
      },
    ],
  },
  {
    id: 7,
    title: 'Emergency Alert Logic',
    summary:
      'Emergency events support manual panic and automatic threshold triggers with controlled fan-out.',
    blocks: [
      {
        title: 'Trigger Sources',
        items: [
          'Manual trigger by patient/caretaker/doctor from dashboard.',
          'Automatic trigger after policy threshold (e.g., contraindicated interaction + repeated misses).',
        ],
      },
      {
        title: 'Flow',
        items: [
          'Create emergency_event with immutable timeline state.',
          'Fan-out notifications to caretaker + doctor + optional hotline endpoint.',
          'Persist geo metadata and acknowledgment timestamps.',
        ],
      },
      {
        title: 'Abuse Prevention',
        items: [
          'Rate-limit manual emergency calls per user/session.',
          'Require confirmation step for non-critical manual events.',
          'Audit trail and anomaly detection on frequent false alarms.',
        ],
      },
    ],
  },
  {
    id: 8,
    title: 'Live Camera OCR + Upload Support',
    summary:
      'Camera capture plus file upload pipeline with async OCR processing and human correction hooks.',
    blocks: [
      {
        title: 'Capture & Upload Pipeline',
        items: [
          'Frontend uses getUserMedia + canvas capture + compression before upload.',
          'Client validates mime type and size locally before network call.',
          'Image uploaded to object storage then OCR job is queued; API returns job id.',
        ],
      },
      {
        title: 'Validation Workflow',
        items: [
          'OCR output shown with confidence score and editable corrections.',
          'Low-confidence extractions flagged for manual review queue.',
          'Corrected result saved to feedback table for future OCR model tuning.',
        ],
      },
      {
        title: 'Storage Decision',
        items: [
          'Hackathon default: local filesystem + metadata in Postgres.',
          'Upgrade path: S3-compatible object storage with signed URL retrieval.',
        ],
      },
    ],
  },
  {
    id: 9,
    title: 'Map Integration for Pharmacy Suggestions',
    summary:
      'Provider abstraction avoids lock-in while enabling cached nearby pharmacy recommendations.',
    blocks: [
      {
        title: 'Provider Abstraction',
        items: [
          'Define GeoProvider interface: geocode(), reverseGeocode(), searchNearbyPharmacies().',
          'Implement one concrete provider now; switch provider by config later.',
        ],
      },
      {
        title: 'Caching & Limits',
        items: [
          'Cache search results by geohash + radius + page for 15 minutes in Redis.',
          'Apply per-user rate limits and debounce client requests.',
          'Fallback to last-known cached list during upstream failure.',
        ],
      },
      {
        title: 'Why This Design',
        items: [
          'Maintains velocity for hackathon while preserving provider portability.',
          'Avoids hard coupling of core domain services to map SDK specifics.',
        ],
      },
    ],
  },
  {
    id: 10,
    title: 'Separate Dashboards (Frontend Architecture)',
    summary:
      'Single React app with role-aware shells, shared component library, route guards, and websocket channels.',
    blocks: [
      {
        title: 'Dashboard Strategy',
        items: [
          'Admin: tenant health, audit feed, emergency overview.',
          'Doctor: patient risk queue, interaction review, treatment plan updates.',
          'Patient: today timeline, reminders, emergency button, adherence trend.',
          'Caretaker: dependent overview, escalation inbox, acknowledgement actions.',
        ],
      },
      {
        title: 'State & Data Pattern',
        items: [
          'TanStack Query for server state, minimal local UI state via hooks.',
          'Axios API layer with typed contracts and role-based query keys.',
          'WebSocket client subscribes per role channel and invalidates impacted queries.',
        ],
      },
    ],
    codeBlocks: [
      {
        title: 'Frontend Folder Structure (Role-Aware)',
        language: 'text',
        content: `src/
  api/
  hooks/
  components/
    common/
    dashboard/
    adherence/
    emergency/
  pages/
    admin/
    doctor/
    patient/
    caretaker/
  routes/
    guards/
  websocket/
  types/
  utils/`,
      },
    ],
  },
  {
    id: 11,
    title: 'Background Task Architecture',
    summary:
      'Celery selected for durable queues, retries, and multi-worker workload separation.',
    blocks: [
      {
        title: 'Chosen Approach',
        items: [
          'Celery + Redis broker/backend with dedicated queues: ocr_cpu, adherence_eval, notifications, emergency.',
          'Beat scheduler for periodic adherence scans and stale escalation checks.',
          'Task retry policy with bounded exponential backoff and dead-letter persistence table.',
        ],
      },
      {
        title: 'Tradeoff Analysis',
        items: [
          'Why not FastAPI BackgroundTasks: no durability for process crashes and poor visibility for retries.',
          'Why not APScheduler-only: good for local scheduling but weak distributed worker coordination.',
          'Why Celery: mature retry semantics, queue routing, and sufficient for hackathon scale.',
        ],
      },
      {
        title: 'Monitoring',
        items: [
          'Queue depth + task latency metrics exposed on health admin endpoint.',
          'Task failure logs with correlation id and escalation status snapshots.',
        ],
      },
    ],
  },
  {
    id: 12,
    title: 'Security & PII Protection (HIPAA-lite)',
    summary:
      'Security baseline focused on practical hackathon compliance with a clear enterprise upgrade path.',
    blocks: [
      {
        title: 'Current Baseline',
        items: [
          'TLS in transit and encrypted volume/object storage at rest.',
          'Field-level encryption for direct identifiers and signed URL access for OCR binaries.',
          'Role-filtered API responses; no overfetching of sensitive fields.',
          'Append-only audit logs for reads/writes to sensitive records.',
        ],
      },
      {
        title: 'Emergency Override Guardrails',
        items: [
          'Break-glass endpoint requires justification text and elevated token claim.',
          'Override session auto-expires quickly and is fully audited.',
        ],
      },
      {
        title: 'Enterprise Upgrade Path',
        items: [
          'KMS-managed envelope encryption per tenant.',
          'Centralized SIEM shipping and immutable long-term audit storage.',
          'Formal policy controls for HIPAA/SOC2 evidence generation.',
        ],
      },
    ],
  },
  {
    id: 13,
    title: 'Commit Plan (40–60 Real Commits)',
    summary:
      'Feature-branch plan with realistic sequencing and migration-safe commit boundaries.',
    blocks: [
      {
        title: 'Branch Strategy',
        items: [
          'main protected with PR checks.',
          'feature/auth-rbac, feature/adherence-engine, feature/escalation, feature/ocr-camera, feature/maps, feature/role-dashboards.',
          'Short-lived branches merged via squash disabled to preserve commit audit detail.',
        ],
      },
    ],
    codeBlocks: [
      {
        title: 'Commit Sequence (50 commits)',
        language: 'text',
        content: `1. chore(repo): add architecture decision records scaffold
2. feat(config): add role-aware auth settings
3. feat(auth): implement JWT role claims and token rotation
4. feat(auth): add refresh token revocation store
5. feat(rbac): add route dependency guards for roles
6. test(auth): add JWT and guard integration tests
7. feat(db): add users and care_team_memberships tables
8. feat(db): add medication_plans and medication_plan_items tables
9. feat(db): add alarm_schedules and adherence_logs tables
10. feat(db): add escalation_logs and emergency_events tables
11. feat(db): add ocr_uploads and ocr_extractions tables
12. feat(db): add pharmacy_cache schema and indexes
13. refactor(domain): create MedicationPlan aggregate root
14. refactor(domain): create AdherenceCase aggregate root
15. feat(domain): add DoseWindow and RiskScore value objects
16. feat(domain): implement AdherencePolicyService
17. feat(domain): implement EscalationPolicyService
18. feat(app): add CareWorkflowService orchestration
19. feat(adherence): add due-dose scanner use case
20. feat(adherence): add missed-dose evaluator
21. test(adherence): add grace window and idempotency tests
22. feat(queue): configure celery app and queues
23. feat(queue): add adherence_eval worker tasks
24. feat(queue): add notification worker tasks
25. feat(queue): add emergency fan-out worker task
26. feat(queue): add beat schedule for periodic scans
27. feat(notify): add email adapter abstraction
28. feat(notify): add sms adapter abstraction
29. feat(notify): add in-app websocket notifier
30. feat(escalation): implement escalation retry policy engine
31. test(escalation): add escalation sequence integration tests
32. feat(emergency): add manual emergency trigger endpoint
33. feat(emergency): add automatic threshold trigger endpoint
34. feat(emergency): add emergency acknowledgment flow
35. feat(ocr): add camera upload endpoint and validator
36. feat(ocr): add async OCR pipeline queue integration
37. feat(ocr): add correction feedback storage
38. feat(maps): add geoprovider interface and provider adapter
39. feat(maps): add pharmacy nearby service and caching
40. feat(frontend): scaffold role-based route shells
41. feat(frontend): add patient dashboard widgets
42. feat(frontend): add caretaker escalation inbox
43. feat(frontend): add doctor risk queue page
44. feat(frontend): add admin tenant observability page
45. feat(frontend): add websocket client and live updates
46. feat(frontend): add emergency panel and acknowledgement actions
47. feat(security): add field-level encryption helpers
48. feat(security): add audit logging middleware
49. test(e2e): add end-to-end adherence-to-escalation flow
50. docs(release): publish architecture and runbook notes`,
      },
    ],
  },
  {
    id: 14,
    title: 'Implementation Priority Order',
    summary:
      'Phased delivery keeps demo value high while preserving correctness and extensibility.',
    blocks: [
      {
        title: 'Phase 1: Core MVP',
        items: [
          'RBAC auth, medication plans, adherence logs, due-dose scanner, basic escalation.',
          'Patient and caretaker dashboards with websocket in-app alerts.',
        ],
      },
      {
        title: 'Phase 2: Intelligence Layer',
        items: [
          'Integrate graph risk + adherence recalibration strategies.',
          'Async OCR ingestion with correction workflow.',
        ],
      },
      {
        title: 'Phase 3: Advanced Features',
        items: [
          'Emergency fan-out flow and location-aware pharmacy suggestions.',
          'Doctor/admin operational dashboards and metrics overlays.',
        ],
      },
      {
        title: 'Phase 4: Polish & Observability',
        items: [
          'Audit hardening, retry tuning, error budgets, on-call runbooks, demo scripts.',
          'If time-constrained, cut map enrichment and advanced admin visualizations first.',
        ],
      },
    ],
  },
]
