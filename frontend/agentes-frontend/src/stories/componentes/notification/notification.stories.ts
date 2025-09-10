// frontend/agentes-frontend/src/stories/shared/components/notification/notification.stories.ts
import { Meta, StoryObj, moduleMetadata, applicationConfig, componentWrapperDecorator } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';

import { NotificationComponent } from '../../../app/shared/components/notification/notification.component';
import { NotificationItemModel } from '../../../app/shared/components/notification-item/notification-item.component';

type Story = StoryObj<NotificationComponent>;

const inlineItems: NotificationItemModel[] = [
  {
    id: 'i1',
    kind: 'inline',
    type: 'info',
    title: 'Title',
    message: 'Message',
    actionLabel: 'Action',
    actionStyle: 'link',
    theme: 'light',
  },
  {
    id: 'i2',
    kind: 'inline',
    type: 'success',
    title: 'Title',
    message: 'Message',
    timestamp: 'Time stamp [00:00:00]',
    theme: 'light',
  },
];

const toastItemsLight: NotificationItemModel[] = [
  {
    id: 't1',
    kind: 'toast',
    type: 'warning',
    title: 'Title',
    message: 'Message',
    actionLabel: 'Action',
    actionStyle: 'outline',
    theme: 'light',
  },
  { id: 't2', kind: 'toast', type: 'error', title: 'Title', message: 'Message', theme: 'light' },
];

const toastItemsDark: NotificationItemModel[] = [
  {
    id: 't3',
    kind: 'toast',
    type: 'info',
    title: 'Title',
    message: 'Message',
    timestamp: 'Time stamp [00:00:00]',
    actionLabel: 'Action',
    actionStyle: 'ghost',
    theme: 'dark',
  },
];

const meta: Meta<NotificationComponent> = {
  title: 'Shared/Components/Notification/Container',
  component: NotificationComponent,
  decorators: [
    moduleMetadata({}),
    applicationConfig({
      providers: [provideAnimations()], // ✅ animações
    }),
  ],
  args: { items: inlineItems, position: 'top-right', theme: 'light' },
  argTypes: {
    itemAction: { action: 'itemAction' },
    itemDismiss: { action: 'itemDismiss' },
    items: { control: 'object' },
    position: { control: 'select', options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'] },
    theme: { control: { type: 'inline-radio' }, options: ['light', 'dark'] },
  },
  parameters: { controls: { expanded: true }, layout: 'padded' },
};
export default meta;

// ───────── VARIANTES ─────────

export const InlineLight: Story = {
  name: 'Inline / Light',
  args: { items: inlineItems, theme: 'light' },
};

export const InlineDark: Story = {
  name: 'Inline / Dark',
  decorators: [
    componentWrapperDecorator(
      (story) => `<div style="padding:16px;background:#121212">${story}</div>`
    ),
  ],
  args: { items: inlineItems.map((i, idx) => ({ ...i, id: `d-${idx}`, theme: 'dark' })), theme: 'dark' },
};

export const ToastTopRightLight: Story = {
  name: 'Toast / Top Right / Light',
  args: { items: toastItemsLight, position: 'top-right', theme: 'light' },
};


export const ManyToastsStack: Story = {
  name: 'Toast / Empilhamento',
  args: {
    items: [
      ...toastItemsLight,
      { id: 't4', kind: 'toast', type: 'success', title: 'Title', message: 'Message', theme: 'light' },
      { id: 't5', kind: 'toast', type: 'info', title: 'Title', message: 'Message', actionLabel: 'Action', actionStyle: 'link', theme: 'light' },
    ],
    position: 'top-left',
    theme: 'light',
  },
};
