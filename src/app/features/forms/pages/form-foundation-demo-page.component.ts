import { CommonModule, JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import {
  DropdownSelection,
  FormConfig,
  FormSubmissionValue
} from '../../../shared/components/form-shell/form-config.model';
import { FormShellComponent } from '../../../shared/components/form-shell/form-shell.component';

@Component({
  selector: 'aiw-form-foundation-demo-page',
  standalone: true,
  imports: [CommonModule, JsonPipe, FormShellComponent],
  templateUrl: './form-foundation-demo-page.component.html',
  styleUrl: './form-foundation-demo-page.component.css'
})
export class FormFoundationDemoPageComponent {
  protected readonly emptyState = { message: 'Submit a form to inspect the payload.' };

  protected cancelCount = 0;
  protected lastSubmission: FormSubmissionValue | null = null;

  protected readonly initialValue: FormSubmissionValue = {
    profileImage: null,
    title: 'Quarterly integration refresh',
    owner: 'Platform Team',
    category: {
      selectedKey: 'operations',
      selectedLabel: 'Operations',
      isOther: false
    } satisfies DropdownSelection,
    retryCount: 2,
    goLiveDate: '2026-05-15',
    statusNote: 'Needs final QA sign-off.',
    supportingFiles: null,
    notifyStakeholders: true,
    approvedForRelease: false,
    reviewOwner: 'QA Lead',
    reviewNotes: 'Validate uploaded files before final approval.',
    escalationRequired: false,
    deploymentWindow: 'Evening release ',
    releaseManager: 'Release Desk',
    releaseDate: '2026-05-20',
    releaseRiskScore: 3,
    rollbackReady: true
  };

  protected readonly formConfig: FormConfig = {
    formWidth: '60%',
    formAlign: 'left',
    fieldsPerLine: 5,
    fieldMinWidth: '18rem',
    fieldSpacing: '1rem',
    fields: [
      {
        key: 'profileImage',
        label: 'Profile image',
        type: 'image-crop',
        required: false,
        accept: 'image/*',
        shape: 'circle',
        frameSizePx: 80,
        minFrameSizePx: 72,
        maxFrameSizePx: 360,
        rectangleAspectRatio: '4 / 3',
        showFrame: true,
        align: 'left',
        colSpan: 3
      },
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
        key: 'category',
        label: 'Category',
        type: 'dropdown',
        required: true,
        searchable: true,
        placeholder: 'Choose a category',
        options: [
          { label: 'Operations', value: 'operations' },
          { label: 'Compliance', value: 'compliance' },
          { label: 'Billing', value: 'billing' },
          { label: 'Customer Data', value: 'customer-data' }
        ]
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
        key: 'statusNote',
        label: 'Status note',
        type: 'textarea',
        helperText: 'Sectionless fields render in the standard form area.',
        colSpan: 3
      },
      {
        key: 'supportingFiles',
        label: 'File Attachments',
        type: 'file-upload',
        required: true,
        multiple: true,
        maxFiles: 4,
        accept: '.png,.jpg,.jpeg,.pdf,.doc,.docx,.xls,.xlsx,.txt',
        allowAssignedFilename: true,
        helperText: 'This section can collapse.',
        colSpan: 2,
        section: {
          key: 'review-details',
          title: 'Review details',
          collapsible: true,
          collapsedByDefault: false
        }
      },
      {
        key: 'notifyStakeholders',
        label: 'Notify stakeholders',
        type: 'checkbox',
        controlStyle: 'checkbox',
        section: {
          key: 'review-details',
          title: 'Review details',
          collapsible: true,
          collapsedByDefault: false
        }
      },
      {
        key: 'approvedForRelease',
        label: 'Approved for release',
        type: 'checkbox',
        controlStyle: 'toggle',
        colSpan: 2,
        section: {
          key: 'review-details',
          title: 'Review details',
          collapsible: true,
          collapsedByDefault: false
        }
      },
      {
        key: 'reviewOwner',
        label: 'Review owner',
        type: 'text',
        required: true,
        section: {
          key: 'review-details',
          title: 'Review details',
          collapsible: true,
          collapsedByDefault: false
        }
      },
      {
        key: 'reviewNotes',
        label: 'Review notes',
        type: 'textarea',
        helperText: 'This section can collapse.',
        colSpan: 2,
        section: {
          key: 'review-details',
          title: 'Review details',
          collapsible: true,
          collapsedByDefault: false
        }
      },
      {
        key: 'deploymentWindow',
        label: 'Deployment window',
        type: 'text',
        helperText: 'Release controls are in an always-open section.',
        section: {
          key: 'release-controls',
          title: 'Release controls'
        }
      },
      {
        key: 'releaseManager',
        label: 'Release manager',
        type: 'text',
        required: true,
        section: {
          key: 'release-controls',
          title: 'Release controls'
        }
      },
      {
        key: 'releaseDate',
        label: 'Release date',
        type: 'date',
        required: true,
        section: {
          key: 'release-controls',
          title: 'Release controls'
        }
      },
      {
        key: 'releaseRiskScore',
        label: 'Release risk score',
        type: 'number',
        min: 1,
        max: 5,
        step: 1,
        section: {
          key: 'release-controls',
          title: 'Release controls'
        }
      },
      {
        key: 'escalationRequired',
        label: 'Escalation required',
        type: 'checkbox',
        controlStyle: 'toggle',
        section: {
          key: 'release-controls',
          title: 'Release controls'
        }
      },
      {
        key: 'rollbackReady',
        label: 'Rollback ready',
        type: 'checkbox',
        controlStyle: 'checkbox',
        section: {
          key: 'release-controls',
          title: 'Release controls'
        }
      }
    ]
  };
}
