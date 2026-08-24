import { CommonModule, JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import {
  DropdownOption,
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

  private readonly usStateOptions: DropdownOption[] = [
    { label: 'Texas', value: 'TX' },
    { label: 'California', value: 'CA' },
    { label: 'New York', value: 'NY' }
  ];

  private readonly canadianProvinceOptions: DropdownOption[] = [
    { label: 'Ontario', value: 'ON' },
    { label: 'Quebec', value: 'QC' },
    { label: 'British Columbia', value: 'BC' }
  ];

  protected readonly initialValue: FormSubmissionValue = {
    profileImage: null,
    title: 'Quarterly integration refresh',
    owner: 'Platform Team',
    category: {
      selectedKey: 'operations',
      selectedLabel: 'Operations',
      isOther: false
    } satisfies DropdownSelection,
    country: {
      selectedKey: 'US',
      selectedLabel: 'United States',
      isOther: false
    } satisfies DropdownSelection,
    state: {
      selectedKey: 'TX',
      selectedLabel: 'Texas',
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
    formWidth: '80%',
    formAlign: 'center',
    fieldsPerLine: 5,
    fieldMinWidth: '18rem',
    fieldSpacing: '1rem',
    sections: [
      {
        key: 'review-details',
        title: 'Review details',
        collapsible: true,
        collapsedByDefault: true
      },
      {
        key: 'release-controls',
        title: 'Release controls'
      }
    ],
    fields: [
      {
        key: 'profileImage',
        label: 'Profile image',
        type: 'image-crop',
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
        placeholder: 'Enter a concise title',
        validators: [
          {
            validator: 'required',
            message: 'Title is required.'
          },
          {
            validator: 'maxLength',
            value: 100,
            message: 'Title cannot exceed 100 characters.'
          }
        ],
        colSpan: 2
      },
      {
        key: 'owner',
        label: 'Owner',
        type: 'text',
        validators: [
          {
            validator: 'required',
            message: 'Owner is required.'
          }
        ]
      },
      {
        key: 'category',
        label: 'Category',
        type: 'dropdown',
        searchable: true,
        placeholder: 'Choose a category',
        validators: [
          {
            validator: 'required',
            message: 'Category is required.'
          }
        ],
        options: [
          { label: 'Operations', value: 'operations' },
          { label: 'Compliance', value: 'compliance' },
          { label: 'Billing', value: 'billing' },
          { label: 'Customer Data', value: 'customer-data' }
        ]
      },
      {
        key: 'country',
        label: 'Country',
        type: 'dropdown',
        searchable: true,
        placeholder: 'Choose a country',
        validators: [
          {
            validator: 'required',
            message: 'Country is required.'
          }
        ],
        options: [
          { label: 'United States', value: 'US' },
          { label: 'Canada', value: 'CA' },
          { label: 'Mexico', value: 'MX' }
        ]
      },
      {
        key: 'state',
        label: 'State',
        type: 'dropdown',
        searchable: true,
        placeholder: 'State or province',
        options: this.usStateOptions,
        validators: [
          {
            validator: 'required',
            dependsOn: ['country'],
            when: ({ values }) =>
              (values['country'] as DropdownSelection | null)?.selectedKey === 'US',
            message: 'State is required for U.S. addresses.'
          }
        ]
      },
      {
        key: 'retryCount',
        label: 'Retry count',
        type: 'number',
        min: 0,
        max: 10,
        step: 1,
        validators: [
          {
            validator: 'min',
            value: 0,
            message: 'Retry count must be at least 0.'
          },
          {
            validator: 'max',
            value: 10,
            message: 'Retry count must be at most 10.'
          }
        ]
      },
      {
        key: 'goLiveDate',
        label: 'Go-live date',
        type: 'date',
        validators: [
          {
            validator: 'required',
            message: 'Go-live date is required.'
          }
        ]
      },
      {
        key: 'statusNote',
        label: 'Status note',
        type: 'textarea',
        helperText: 'Sectionless fields render in the standard form area.',
        colSpan: 3
      },
      
 
      {
        key: 'reviewOwner',
        label: 'Review owner',
        type: 'text',
        validators: [
          {
            validator: 'required',
            message: 'Review owner is required.'
          }
        ],
        section: 'review-details'
      },
      {
        key: 'notifyStakeholders',
        label: 'Notify stakeholders',
        type: 'checkbox',
        controlStyle: 'toggle',
        section: 'review-details'
      },
      {
        key: 'approvedForRelease',
        label: 'Approved for release',
        type: 'checkbox',
        controlStyle: 'toggle',
        colSpan: 1,
        section: 'review-details'
      },

      {
        key: 'supportingFiles',
        label: 'File Attachments',
        type: 'file-upload',
        multiple: true,
        maxFiles: 4,
        accept: '.png,.jpg,.jpeg,.pdf,.doc,.docx,.xls,.xlsx,.txt',
        allowAssignedFilename: true,
        validators: [
          {
            validator: 'required',
            message: 'Please add at least one file.'
          }
        ],
        helperText: 'This section can collapse.',
        colSpan: 5,
        section: 'review-details'
      },
            {
        key: 'reviewNotes',
        label: 'Review notes',
        type: 'textarea',
        helperText: 'This section can collapse.',
        colSpan: 4,
        section: 'review-details'
      },
 

      {
        key: 'deploymentWindow',
        label: 'Deployment window',
        type: 'text',
        helperText: 'Release controls are in an always-open section.',
        section: 'release-controls'
      },
      {
        key: 'releaseManager',
        label: 'Release manager',
        type: 'text',
        validators: [
          {
            validator: 'required',
            message: 'Release manager is required.'
          }
        ],
        section: 'release-controls'
      },
      {
        key: 'releaseDate',
        label: 'Release date',
        type: 'date',
        validators: [
          {
            validator: 'required',
            message: 'Release date is required.'
          }
        ],
        section: 'release-controls'
      },
      {
        key: 'releaseRiskScore',
        label: 'Release risk score',
        type: 'number',
        min: 1,
        max: 5,
        step: 1,
        validators: [
          {
            validator: 'min',
            value: 1,
            message: 'Release risk score must be at least 1.'
          },
          {
            validator: 'max',
            value: 5,
            message: 'Release risk score must be at most 5.'
          }
        ],
        section: 'release-controls'
      },
      {
        key: 'escalationRequired',
        label: 'Escalation required',
        type: 'checkbox',
        controlStyle: 'toggle',
        section: 'release-controls'
      },
      {
        key: 'rollbackReady',
        label: 'Rollback ready',
        type: 'checkbox',
        controlStyle: 'checkbox',
        section: 'release-controls'
      }
    ],
    stateRules: [
      {
        dependsOn: ['country'],
        execute: ({ values, fields }) => {
          const country = (values['country'] as DropdownSelection | null)
            ?.selectedKey;

          if (country === 'US') {
            fields.show('state');
            fields.enable('state');
            fields.update('state', {
              label: 'State',
              placeholder: 'Choose a state'
            });
            fields.setOptions('state', this.usStateOptions);
            return;
          }

          if (country === 'CA') {
            fields.show('state');
            fields.enable('state');
            fields.update('state', {
              label: 'Province',
              placeholder: 'Choose a province'
            });
            fields.setOptions('state', this.canadianProvinceOptions);
            return;
          }

          fields.hide('state');
          fields.disable('state');
          fields.clear('state');
        }
      },
      {
        dependsOn: ['escalationRequired'],
        execute: ({ values, fields }) => {
          const escalationRequired = values['escalationRequired'] === true;

          fields.setReadonly('releaseManager', !escalationRequired);
          fields.update('releaseManager', {
            label: escalationRequired
              ? 'Escalation manager'
              : 'Release manager'
          });
        }
      },
      {
        dependsOn: ['rollbackReady'],
        execute: ({ values, fields }) => {
          if (values['rollbackReady'] === true) {
            fields.reset('retryCount');
          }
        }
      }
    ]
  };
}
