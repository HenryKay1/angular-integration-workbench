import { CommonModule, JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormConfig,
  FormSubmissionValue
} from '../../../shared/components/form-shell/form-config.model';
import { FormShellComponent } from '../../../shared/components/form-shell/form-shell.component';

@Component({
  selector: 'aiw-form-foundation-demo-page',
  standalone: true,
  imports: [CommonModule, JsonPipe, FormShellComponent],
  template: `
    <section class="forms-page">
      <header class="forms-page__header">
        <div>
          <p class="forms-page__eyebrow">Reusable Form Foundation</p>
          <h2>Phase 0 and 1 workbench</h2>
          <p class="forms-page__intro">
            This demo keeps the new form shell decoupled from records save logic while
            proving the contracts, layouts, reactive form generation, and confirmation flow.
          </p>
        </div>
      </header>

      <section class="forms-page__grid">
        <article class="forms-page__panel">
          <div class="forms-page__panel-header">
            <h3>Simple Layout</h3>
            <p>Flat config with three-up density and standard fields only.</p>
          </div>

          <aiw-form-shell
            [config]="simpleFormConfig"
            [initialValue]="simpleInitialValue"
            submitLabel="Preview submit"
            (submitForm)="lastSimpleSubmission = $event"
            (cancelForm)="simpleCancelCount = simpleCancelCount + 1"
          />
        </article>

        <article class="forms-page__panel">
          <div class="forms-page__panel-header">
            <h3>Sectioned Layout</h3>
            <p>Top-level sections, collapsed-by-default support, and submit confirmation.</p>
          </div>

          <aiw-form-shell
            [config]="sectionedFormConfig"
            [initialValue]="sectionedInitialValue"
            submitLabel="Submit sectioned form"
            (submitForm)="lastSectionedSubmission = $event"
            (cancelForm)="sectionedCancelCount = sectionedCancelCount + 1"
          />
        </article>
      </section>

      <section class="forms-page__results">
        <article class="forms-page__result-card">
          <h3>Simple Layout Output</h3>
          <p>Cancel clicks: {{ simpleCancelCount }}</p>
          <pre>{{ lastSimpleSubmission || emptyState | json }}</pre>
        </article>

        <article class="forms-page__result-card">
          <h3>Sectioned Layout Output</h3>
          <p>Cancel clicks: {{ sectionedCancelCount }}</p>
          <pre>{{ lastSectionedSubmission || emptyState | json }}</pre>
        </article>
      </section>
    </section>
  `,
  styles: [`
    .forms-page {
      display: grid;
      gap: 1.25rem;
    }

    .forms-page__header,
    .forms-page__panel,
    .forms-page__result-card {
      padding: 1.25rem;
      border-radius: 1rem;
      border: 1px solid #d9e2ec;
      background: #ffffff;
      box-shadow: 0 14px 36px rgba(15, 23, 42, 0.06);
    }

    .forms-page__eyebrow {
      margin: 0 0 0.5rem;
      color: #0f766e;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .forms-page__header h2,
    .forms-page__header p,
    .forms-page__panel-header h3,
    .forms-page__panel-header p,
    .forms-page__result-card h3,
    .forms-page__result-card p,
    .forms-page__result-card pre {
      margin: 0;
    }

    .forms-page__intro,
    .forms-page__panel-header p,
    .forms-page__result-card p {
      color: #52606d;
    }

    .forms-page__grid,
    .forms-page__results {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    }

    .forms-page__panel,
    .forms-page__result-card {
      display: grid;
      gap: 1rem;
    }

    .forms-page__result-card pre {
      padding: 1rem;
      overflow: auto;
      border-radius: 0.75rem;
      background: #102a43;
      color: #f0f4f8;
      font-size: 0.85rem;
    }
  `]
})
export class FormFoundationDemoPageComponent {
  protected readonly emptyState = { message: 'Submit a form to inspect the payload.' };

  protected simpleCancelCount = 0;
  protected sectionedCancelCount = 0;
  protected lastSimpleSubmission: FormSubmissionValue | null = null;
  protected lastSectionedSubmission: FormSubmissionValue | null = null;

  protected readonly simpleInitialValue: FormSubmissionValue = {
    title: 'Quarterly integration refresh',
    owner: 'Platform Team',
    statusNote: 'Needs final QA sign-off.',
    retryCount: 2,
    goLiveDate: '2026-05-15',
    notifyStakeholders: true
  };

  protected readonly sectionedInitialValue: FormSubmissionValue = {
    recordTitle: 'Customer profile sync',
    owner: 'Data Operations',
    environment: 'UAT',
    summary: 'Refresh mapping and validate transformed payload fields.',
    runbookLink: 'https://internal.example/runbooks/customer-profile-sync',
    approved: false
  };

  protected readonly simpleFormConfig: FormConfig = {
    layout: 'simple',
    fieldsPerLine: 3,
    fields: [
      {
        key: 'title',
        label: 'Title',
        type: 'text',
        required: true,
        placeholder: 'Enter a concise title',
        colSpan: 2
      },
      {
        key: 'owner',
        label: 'Owner',
        type: 'text',
        required: true
      },
      {
        key: 'statusNote',
        label: 'Status note',
        type: 'textarea',
        helperText: 'Use this for lightweight implementation notes.',
        colSpan: 3
      },
      {
        key: 'retryCount',
        label: 'Retry count',
        type: 'number',
        min: 0,
        max: 10,
        step: 1
      },
      {
        key: 'goLiveDate',
        label: 'Go-live date',
        type: 'date',
        required: true
      },
      {
        key: 'notifyStakeholders',
        label: 'Notify stakeholders',
        type: 'checkbox'
      }
    ]
  };

  protected readonly sectionedFormConfig: FormConfig = {
    layout: 'sectioned',
    fieldsPerLine: 2,
    requireSubmitConfirmation: true,
    submitConfirmationTitle: 'Submit sectioned demo?',
    submitConfirmationMessage:
      'This mirrors the foundation-level confirmation flow before feature-specific save logic exists.',
    sections: [
      {
        key: 'basics',
        title: 'Basics',
        fields: [
          {
            key: 'recordTitle',
            label: 'Record title',
            type: 'text',
            required: true
          },
          {
            key: 'owner',
            label: 'Owner',
            type: 'text',
            required: true
          },
          {
            key: 'summary',
            label: 'Summary',
            type: 'textarea',
            colSpan: 2,
            required: true
          }
        ]
      },
      {
        key: 'ops',
        title: 'Operational Notes',
        collapsible: true,
        collapsedByDefault: true,
        fields: [
          {
            key: 'environment',
            label: 'Environment',
            type: 'text'
          },
          {
            key: 'runbookLink',
            label: 'Runbook URL',
            type: 'text',
            helperText: 'This remains plain text until richer field types arrive.'
          },
          {
            key: 'approved',
            label: 'Approved for release',
            type: 'checkbox',
            colSpan: 2
          }
        ]
      }
    ]
  };
}

