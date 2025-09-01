// content-switcher.stories.ts
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { ContentSwitcherComponent } from '../../../app/shared/components/content-switcher/content-switcher.component';

const TYPES = ['default', 'with-icons'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

const meta: Meta<ContentSwitcherComponent> = {
  title: 'Shared/Components/Content Switcher',
  component: ContentSwitcherComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, ContentSwitcherComponent],
    }),
  ],
  argTypes: {
    type: { control: 'select', options: TYPES as unknown as string[] },
    size: { control: 'select', options: SIZES as unknown as string[] },
    ariaLabel: { control: 'text' },
    options: { control: 'object' },
    selected: { control: 'text' },
    selectedChange: { action: 'selectedChange' },
  },
};
export default meta;

type Story = StoryObj<ContentSwitcherComponent>;

export const Default: Story = {
  args: {
    type: 'default',
    size: 'md',
    ariaLabel: 'Content Switcher',
    selected: 'opt1',
    options: [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
      { label: 'Option 3', value: 'opt3', disabled: true },
    ],
  },
};

export const WithIcons: Story = {
  args: {
    type: 'with-icons',
    size: 'md',
    ariaLabel: 'Content Switcher with Icons',
    selected: 'grid',
    options: [
      { label: 'Grid', value: 'grid', icon: 'fa fa-th' },
      { label: 'List', value: 'list', icon: 'fa fa-list' },
    ],
  },
};

export const Sizes: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <app-content-switcher [size]="'sm'" [options]="options" [selected]="selected" (selectedChange)="selectedChange($event)"></app-content-switcher>
        <app-content-switcher [size]="'md'" [options]="options" [selected]="selected" (selectedChange)="selectedChange($event)"></app-content-switcher>
        <app-content-switcher [size]="'lg'" [options]="options" [selected]="selected" (selectedChange)="selectedChange($event)"></app-content-switcher>
      </div>
    `,
  }),
  args: {
    options: [
      { label: 'Option A', value: 'a' },
      { label: 'Option B', value: 'b' },
    ],
    selected: 'a',
  },
};
