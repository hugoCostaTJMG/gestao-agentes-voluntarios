import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { action } from '@storybook/addon-actions';
import { FileUploaderComponent, UploadItem } from './file-uploader.component';

const meta: Meta<FileUploaderComponent> = {
  title: 'Shared/Components/FileUploader',
  component: FileUploaderComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, FileUploaderComponent],
    }),
  ],
  argTypes: {
    variant: { control: 'select', options: ['button', 'dropzone', 'both'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
    maxFiles: { control: 'number' },
    maxFileSize: { control: 'number' },
    accept: { control: 'text' },
    autoUpload: { control: 'boolean' },
    showSkeleton: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<FileUploaderComponent>;

const idleItems: UploadItem[] = [
  { file: new File([], 'Filename1.png'), name: 'Filename1.png', state: 'idle', progress: 0 },
  { file: new File([], 'Filename2.png'), name: 'Filename2.png', state: 'idle', progress: 0 },
  { file: new File([], 'Filename3.png'), name: 'Filename3.png', state: 'idle', progress: 0 },
];

export const DefaultButton: Story = {
  args: {
    label: 'Upload files',
    helperText: 'Max file size is 500kb. Supported types: .jpg, .png',
    variant: 'button',
  },
  render: (args) => ({
    props: {
      ...args,
      items: idleItems.slice(),
      filesChange: action('filesChange'),
      uploadStart: action('uploadStart'),
      uploadProgress: action('uploadProgress'),
      uploadSuccess: action('uploadSuccess'),
      uploadError: action('uploadError'),
      fileRemoved: action('fileRemoved'),
      drop: action('drop'),
    },
    template: `<app-file-uploader [label]="label" [helperText]="helperText" [variant]="variant"></app-file-uploader>`,
  }),
};

export const Uploading: Story = {
  render: (args) => ({
    props: {
      ...args,
      items: [
        { file: new File([], 'Uploading.png'), name: 'Uploading.png', state: 'uploading', progress: 50 },
      ],
      variant: 'button',
    },
    template: `<app-file-uploader [variant]="variant"></app-file-uploader>`,
  }),
};

export const Success: Story = {
  render: (args) => ({
    props: {
      ...args,
      items: [
        { file: new File([], 'Done.png'), name: 'Done.png', state: 'success', progress: 100 },
      ],
      variant: 'button',
    },
    template: `<app-file-uploader [variant]="variant"></app-file-uploader>`,
  }),
};

export const ErrorSimple: Story = {
  render: (args) => ({
    props: {
      ...args,
      items: [
        {
          file: new File([], 'BigFile.png'),
          name: 'BigFile.png',
          state: 'error',
          progress: 0,
          errorPrimary: 'File exceeds size limit.',
        },
      ],
      variant: 'button',
    },
    template: `<app-file-uploader [variant]="variant"></app-file-uploader>`,
  }),
};

export const ErrorTwoLines: Story = {
  render: (args) => ({
    props: {
      ...args,
      items: [
        {
          file: new File([], 'File.png'),
          name: 'File.png',
          state: 'error',
          progress: 0,
          errorPrimary: 'File exceeds size limit.',
          errorSecondary: 'Optional secondary explanation that can go on for two lines.',
        },
      ],
      variant: 'button',
    },
    template: `<app-file-uploader [variant]="variant"></app-file-uploader>`,
  }),
};

export const DropzoneDefault: Story = {
  args: { variant: 'dropzone' },
  render: (args) => ({
    props: args,
    template: `<app-file-uploader [variant]="variant"></app-file-uploader>`,
  }),
};

export const DropzoneError: Story = {
  args: { variant: 'dropzone' },
  render: (args) => ({
    props: { ...args, dropzoneError: true },
    template: `<app-file-uploader [variant]="variant"></app-file-uploader>`,
  }),
};

export const Disabled: Story = {
  render: (args) => ({
    props: {
      ...args,
      disabled: true,
      showSkeleton: true,
      variant: 'both',
    },
    template: `<app-file-uploader [variant]="variant" [disabled]="disabled" [showSkeleton]="showSkeleton"></app-file-uploader>`,
  }),
};

export const Both: Story = {
  args: { variant: 'both' },
  render: (args) => ({
    props: { ...args, items: idleItems.slice() },
    template: `<app-file-uploader [variant]="variant"></app-file-uploader>`,
  }),
};
