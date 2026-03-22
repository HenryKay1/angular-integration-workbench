# Angular Integration Workbench

## Purpose
Angular Integration Workbench is a lightweight enterprise-style Angular application for exploring modular frontend architecture, integration-oriented workflows, and structured record inspection patterns.

## Current Phase
Phase 1: architecture shell and foundational Angular setup.

## Planned Features
- Dashboard overview for integration activity
- Record list and record detail pages
- Record history timeline and diff views
- JSON-oriented payload inspection
- Mock-data driven development for early UI iteration
- Guard and interceptor patterns for application-wide concerns

## Architecture Overview
- `core`: application-wide guards, interceptors, models, and services
- `features`: feature-specific pages and flows such as dashboard and records
- `assets/mock-data`: realistic sample data for records and history
- Standalone Angular configuration with route-based page loading
- `shared`: planned for reusable components and utilities, but not scaffolded yet

## AI-Assisted Workflow
This project follows a design-first, incremental workflow where AI assists with scaffolding and implementation, while human review drives validation, refinement, and architectural decisions.

## Manual Run
From the project root:

```powershell
npm install
npm start
```

The Angular dev server should start on `http://localhost:4200/`.

## Manual Validation Checklist
- Open `http://localhost:4200/` and confirm the dashboard page renders under the application header.
- Open `http://localhost:4200/records` and confirm the record list loads from mock data.
- Open an individual record and then a history/diff view to confirm routing works end to end.
- Watch the terminal for Angular compile errors, missing asset errors, or route/navigation failures.
