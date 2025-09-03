import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { FileUploaderComponent, UploadItem } from '../../../app/shared/components/file-uploader/file-uploader.component';
import { CommonModule } from '@angular/common';

// Logger simples para substituir "action" no SB9
const log = (name: string) => (...args: any[]) => {
  console.log(`[Storybook:${name}]`, ...args);
};

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

// Mock de arquivos em diferentes estados
const idleItems: UploadItem[] = [
  { file: new File([], 'Filename1.png'), name: 'Filename1.png', state: 'idle', progress: 0 },
  { file: new File([], 'Filename2.png'), name: 'Filename2.png', state: 'idle', progress: 0 },
  { file: new File([], 'Filename3.png'), name: 'Filename3.png', state: 'idle', progress: 0 },
];

// 🔹 Template centralizado para todos os stories
const template = `
  <app-file-uploader
    [label]="label"
    [helperText]="helperText"
    [variant]="variant"
    [items]="items"
    [disabled]="disabled"
    [showSkeleton]="showSkeleton"
    [size]="size"
    [multiple]="multiple"
    [maxFiles]="maxFiles"
    [maxFileSize]="maxFileSize"
    [accept]="accept"
    [autoUpload]="autoUpload"
    [dropzoneError]="dropzoneError"
    (filesChange)="filesChange($event)"
    (uploadStart)="uploadStart($event)"
    (uploadProgress)="uploadProgress($event)"
    (uploadSuccess)="uploadSuccess($event)"
    (uploadError)="uploadError($event)"
    (fileRemoved)="fileRemoved($event)"
    (drop)="drop($event)"
  ></app-file-uploader>
`;

// 🔹 Estados principais
export const DefaultButton: Story = {
  args: {
    label: 'Upload files',
    helperText: 'Max file size is 500kb. Supported types: .jpg, .png',
    variant: 'button',
    size: 'md',
    items: idleItems.slice(),
    filesChange: log('filesChange'),
    uploadStart: log('uploadStart'),
    uploadProgress: log('uploadProgress'),
    uploadSuccess: log('uploadSuccess'),
    uploadError: log('uploadError'),
    fileRemoved: log('fileRemoved'),
    drop: log('drop'),
  },
  render: (args) => ({ props: args, template }),
};

export const Uploading: Story = {
  args: {
    variant: 'button',
    size: 'md',
    items: [
      { file: new File([], 'Uploading.png'), name: 'Uploading.png', state: 'uploading', progress: 50 },
    ],
  },
  render: (args) => ({ props: args, template }),
};

export const Success: Story = {
  args: {
    variant: 'button',
    size: 'md',
    items: [
      { file: new File([], 'Done.png'), name: 'Done.png', state: 'success', progress: 100 },
    ],
  },
  render: (args) => ({ props: args, template }),
};

// 🔹 Erros
export const ErrorSimple: Story = {
  args: {
    variant: 'button',
    size: 'md',
    items: [
      {
        file: new File([], 'BigFile.png'),
        name: 'BigFile.png',
        state: 'error',
        progress: 0,
        errorPrimary: 'File exceeds size limit.',
      },
    ],
  },
  render: (args) => ({ props: args, template }),
};

export const ErrorTwoLines: Story = {
  args: {
    variant: 'button',
    size: 'md',
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
  },
  render: (args) => ({ props: args, template }),
};

// 🔹 Dropzone
export const DropzoneDefault: Story = {
  args: { variant: 'dropzone', size: 'md' },
  render: (args) => ({ props: args, template }),
};

export const DropzoneError: Story = {
  args: { variant: 'dropzone', size: 'md', dropzoneError: true },
  render: (args) => ({ props: args, template }),
};

// 🔹 Disabled e Both
export const Disabled: Story = {
  args: {
    variant: 'both',
    size: 'md',
    disabled: true,
    showSkeleton: true,
  },
  render: (args) => ({ props: args, template }),
};

export const Both: Story = {
  args: {
    variant: 'both',
    size: 'md',
    items: idleItems.slice(),
  },
  render: (args) => ({ props: args, template }),
};
