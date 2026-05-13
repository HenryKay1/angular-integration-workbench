# Angular Integration Workbench

## Purpose
Angular Integration Workbench is a lightweight Angular 19 application for exploring enterprise-style frontend architecture, reusable UI foundations, and integration-focused record workflows.

## Current Scope
The project currently includes a routed application shell, mock-data-driven record experiences, and a reusable form foundation that is being expanded through incremental component work.

Current pages:
- `/` dashboard landing page
- `/forms` form foundation demo page
- `/records` record list page
- `/records/:id` record detail page
- `/records/:id/history/:historyId` record diff page

## Active Components
- `core`: auth guard, auth interceptor, shared models, and record service contracts
- `features/dashboard`: dashboard landing experience
- `features/forms`: form foundation demo for configuration-driven form rendering
- `features/records`: record list, detail, and diff workflows backed by mock data
- `shared/components/form-shell`: reusable form shell for simple and sectioned layouts
- `shared/components/dropdown-field`: searchable dropdown field with support for controlled selection flows
- `shared/components/image-header-field`: modal-driven image header editor with multi-image support, shared layout settings, and per-image crop controls
- `shared/components/file-upload-field`: attachment upload field with assigned filename metadata
- `shared/components/data-view`: shared data presentation building block
- `assets/mock-data`: sample records and history payloads for UI iteration
- `assets/images`: local image header icons and placeholder imagery used by shared upload fields

## AI-Driven Development With Codex
This repository is being developed through an AI-assisted workflow centered on Codex. The current approach emphasizes:

- rapid scaffolding of Angular pages and reusable components
- iterative refinement of shared form patterns before feature-specific save logic is introduced
- human-reviewed architecture decisions, naming, and cleanup after each implementation pass
- commit-sized delivery of focused improvements, including foundational UI pieces like image headers, file upload fields, and crop controls

## Run Locally
From the project root:

```powershell
npm install
npm start
```

The Angular dev server runs at `http://localhost:4200/`.

## Manual Validation Checklist
- Open `http://localhost:4200/` and confirm the dashboard renders inside the main app shell.
- Open `http://localhost:4200/forms` and confirm the form foundation demo shows simple and sectioned form layouts.
- Verify dropdown interactions, confirmation flow, image-header modal editing, crop controls, slideshow display, and file upload metadata on the forms demo page.
- Open `http://localhost:4200/records` and confirm record data loads from mock assets.
- Open a record detail view and a history diff view to confirm routed navigation works end to end.

## Component Documentation
- Dropdown field: `src/app/shared/components/dropdown-field/README.md`
- Image header field: `src/app/shared/components/image-header-field/README.md`
- File upload field: `src/app/shared/components/file-upload-field/README.md`
- Data view component: `src/app/shared/components/data-view/README.md`
