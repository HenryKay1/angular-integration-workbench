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

  protected simpleCancelCount = 0;
  protected sectionedCancelCount = 0;
  protected lastSimpleSubmission: FormSubmissionValue | null = null;
  protected lastSectionedSubmission: FormSubmissionValue | null = null;

  protected readonly simpleInitialValue: FormSubmissionValue = {
    title: 'Quarterly integration refresh',
    owner: 'Platform Team',
    statusNote: 'Needs final QA sign-off.',
    category: {
      selectedKey: 'operations',
      selectedLabel: 'Operations',
      isOther: false
    } satisfies DropdownSelection,
    retryCount: 2,
    goLiveDate: '2026-05-15',
    notifyStakeholders: true,
    heroImage: null,
    profileImage: null,
    supportingDoc: null
  };

  protected readonly sectionedInitialValue: FormSubmissionValue = {
    recordTitle: 'Customer profile sync',
    owner: 'Data Operations',
    environment: {
      selectedKey: undefined,
      selectedLabel: 'Other',
      isOther: true,
      otherValue: 'UAT'
    } satisfies DropdownSelection,
    summary: 'Refresh mapping and validate transformed payload fields.',
    runbookLink: 'https://internal.example/runbooks/customer-profile-sync',
    attachments: null,
    approved: false
  };

  protected readonly simpleFormConfig: FormConfig = {
    layout: 'simple',
    fieldsPerLine: 3,
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
        key: 'statusNote',
        label: 'Status note',
        type: 'textarea',
        helperText: 'Use this for lightweight implementation notes.',
        colSpan: 3
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
      // {
      //   key: 'heroImage',
      //   label: 'Image header',
      //   type: 'image-header',
      //   required: false,
      //   accept: 'image/*',
      //   profileType: false,
      //   shape: 'circle',
      //   size: 'md',
      //   frameSizePx: 80,
      //   defaultPosition: 'center',
      //   multiple: true,
      //   showLabels: true,
      //   helperText: 'Supports optional validation, shared label display, multiple images, and horizontal scrolling when the header runs out of space.',
      //   colSpan: 2
      // },
    
      {
        key: 'supportingDoc',
        label: 'Supporting file',
        type: 'file-upload',
        required: true,
        accept: '.png,.jpg,.jpeg,.pdf,.doc,.docx,.xls,.xlsx',
        allowAssignedFilename: true,
        helperText: 'Styled upload with editable assigned filename, extension display, and preview action.',
        colSpan: 2
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
    fieldSpacing: '1.25rem',
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
            type: 'dropdown',
            required: true,
            searchable: true,
            allowOther: true,
            placeholder: 'Select an environment',
            options: [
              { label: 'Development', value: 'dev' },
              { label: 'QA', value: 'qa' },
              { label: 'Staging', value: 'staging' },
              { label: 'Production', value: 'prod' },
              { label: 'Development1', value: 'dev1' },
              { label: 'QA1', value: 'qa1' },
              { label: 'Staging1', value: 'staging1' },
              { label: 'Production1', value: 'prod1' }
            ]
          },
          {
            key: 'runbookLink',
            label: 'Runbook URL',
            type: 'text',
            helperText: 'This remains plain text until richer field types arrive.'
          },
          {
            key: 'attachments',
            label: 'Attachments',
            type: 'file-upload',
            multiple: true,
            maxFiles: 4,
            accept: '.png,.jpg,.jpeg,.pdf,.doc,.docx,.xls,.xlsx,.txt',
            allowAssignedFilename: true,
            helperText: 'Supports images, Office docs, PDFs, text files, and other browser-openable uploads.',
            colSpan: 2
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
