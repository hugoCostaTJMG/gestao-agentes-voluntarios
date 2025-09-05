import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { MenuButtonsComponent, MenuItem } from '../../../app/shared/components/menu-buttons/menu-buttons.component';

const VARIANTS = ['overflow', 'menu', 'combo'] as const;
const TYPES = ['primary', 'secondary', 'danger', 'ghost'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;
const PLACEMENTS = ['top', 'bottom', 'left', 'right', 'auto'] as const;

const meta: Meta<MenuButtonsComponent> = {
  title: 'Shared/Components/MenuButtons',
  component: MenuButtonsComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, MenuButtonsComponent],
    }),
  ],
  argTypes: {
    variant: { control: 'select', options: VARIANTS as unknown as string[] },
    type: { control: 'select', options: TYPES as unknown as string[] },
    size: { control: 'select', options: SIZES as unknown as string[] },
    label: { control: 'text' },
    icon: { control: 'text' },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    placement: { control: 'select', options: PLACEMENTS as unknown as string[] },
    align: { control: 'select', options: ['start', 'end'] },
    items: { control: 'object' },
    primaryClick: { action: 'primaryClick' },
    itemSelect: { action: 'itemSelect' },
    openChange: { action: 'openChange' },
  },
  args: {
    variant: 'menu',
    type: 'primary',
    size: 'md',
    label: 'Actions',
    icon: 'fa fa-ellipsis-v',
    disabled: false,
    loading: false,
    placement: 'auto',
    align: 'start',
    items: [],
  },
};
export default meta;

type Story = StoryObj<MenuButtonsComponent>;

const MENU_ITEMS: MenuItem[] = [
  { id: 'open', label: 'Open', iconLeft: 'fa fa-folder-open' },
  { id: 'save', label: 'Save as...', iconLeft: 'fa fa-save' },
  {
    id: 'delete',
    label: 'Delete',
    iconLeft: 'fa fa-trash',
    helperText: 'Del',
    danger: true,
    dividerAbove: true,
  },
];

export const OverflowAllPlacements: Story = {
  render: (args) => ({
    props: { ...args, items: MENU_ITEMS },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:16px;">
        <app-menu-buttons variant="overflow" icon="fa fa-ellipsis-v" placement="bottom" align="start" [items]="items"></app-menu-buttons>
        <app-menu-buttons variant="overflow" icon="fa fa-ellipsis-v" placement="bottom" align="end" [items]="items"></app-menu-buttons>
        <app-menu-buttons variant="overflow" icon="fa fa-ellipsis-v" placement="top" align="start" [items]="items"></app-menu-buttons>
        <app-menu-buttons variant="overflow" icon="fa fa-ellipsis-v" placement="top" align="end" [items]="items"></app-menu-buttons>
        <app-menu-buttons variant="overflow" icon="fa fa-ellipsis-v" placement="left" align="start" [items]="items"></app-menu-buttons>
        <app-menu-buttons variant="overflow" icon="fa fa-ellipsis-v" placement="left" align="end" [items]="items"></app-menu-buttons>
        <app-menu-buttons variant="overflow" icon="fa fa-ellipsis-v" placement="right" align="start" [items]="items"></app-menu-buttons>
        <app-menu-buttons variant="overflow" icon="fa fa-ellipsis-v" placement="right" align="end" [items]="items"></app-menu-buttons>
      </div>
    `,
  }),
};

export const MenuDefault: Story = {
  args: {
    variant: 'menu',
    type: 'primary',
    label: 'Actions',
    items: MENU_ITEMS,
  },
};

export const ComboDefault: Story = {
  args: {
    variant: 'combo',
    type: 'primary',
    label: 'Primary action',
    items: MENU_ITEMS,
  },
};

export const Sizes: Story = {
  render: (args) => ({
    props: { ...args, items: MENU_ITEMS },
    template: `
      <div style="display:flex;gap:16px;align-items:center;">
        <app-menu-buttons size="sm" variant="menu" label="Small" [items]="items"></app-menu-buttons>
        <app-menu-buttons size="md" variant="menu" label="Medium" [items]="items"></app-menu-buttons>
        <app-menu-buttons size="lg" variant="menu" label="Large" [items]="items"></app-menu-buttons>
      </div>
    `,
  }),
};

export const Types: Story = {
  render: (args) => ({
    props: { ...args, items: MENU_ITEMS },
    template: `
      <div style="display:flex;gap:16px;flex-wrap:wrap;">
        <app-menu-buttons type="primary" variant="menu" label="Primary" [items]="items"></app-menu-buttons>
        <app-menu-buttons type="secondary" variant="menu" label="Secondary" [items]="items"></app-menu-buttons>
        <app-menu-buttons type="danger" variant="menu" label="Danger" [items]="items"></app-menu-buttons>
        <app-menu-buttons type="ghost" variant="menu" label="Ghost" [items]="items"></app-menu-buttons>
      </div>
    `,
  }),
};

