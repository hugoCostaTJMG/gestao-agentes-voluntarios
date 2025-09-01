// badge.stories.ts
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../../../app/shared/components/badge/badge.component';

const VARIANTS = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'neutral', 'dark'] as const;
const TONES = ['solid', 'soft', 'outline'] as const;
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const SHAPES = ['pill', 'rounded'] as const;

const meta: Meta<BadgeComponent> = {
  title: 'Shared/Components/Badge',
  component: BadgeComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, BadgeComponent],
    }),
  ],
  argTypes: {
    variant: { control: 'select', options: VARIANTS as unknown as string[] },
    tone: { control: 'select', options: TONES as unknown as string[] },
    size: { control: 'select', options: SIZES as unknown as string[] },
    shape: { control: 'select', options: SHAPES as unknown as string[] },
    text: { control: 'text' },
    iconLeft: { control: 'text' },
    iconRight: { control: 'text' },
    dot: { control: 'boolean' },
    count: { control: 'number' },
    closable: { control: 'boolean' },
    disabled: { control: 'boolean' },
    clicked: { action: 'clicked' },
    closed: { action: 'closed' },
  },
};
export default meta;
type Story = StoryObj<BadgeComponent>;

// Story principal com controles
export const Playground: Story = {
  args: {
    text: 'Badge',
    variant: 'primary',
    tone: 'solid',
    size: 'md',
    shape: 'rounded',
    iconLeft: '',
    iconRight: '',
    dot: false,
    count: undefined,
    closable: false,
    disabled: false,
  },
};

// Exemplos prontos
export const Variants: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
        <app-badge *ngFor="let v of variants" [text]="v" [variant]="v" tone="solid"></app-badge>
      </div>
    `,
    props: { variants: VARIANTS },
  }),
};

export const WithIcons: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
        <app-badge text="Left" variant="info" iconLeft="fa fa-star"></app-badge>
        <app-badge text="Right" variant="success" iconRight="fa fa-check"></app-badge>
      </div>
    `,
  }),
};

export const WithDotAndCount: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
        <app-badge dot variant="warning" ariaLabel="Status"></app-badge>
        <app-badge text="Inbox" [count]="5" variant="neutral"></app-badge>
      </div>
    `,
  }),
};

export const Closable: Story = {
  render: () => ({
    template: `<app-badge text="Dismiss me" closable variant="danger"></app-badge>`,
  }),
};
