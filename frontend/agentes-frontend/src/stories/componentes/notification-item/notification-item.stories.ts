// frontend/agentes-frontend/src/stories/shared/components/notification/notification-item.stories.ts
import { Meta, StoryObj, moduleMetadata, applicationConfig, componentWrapperDecorator } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  NotificationItemComponent,
  NotificationItemModel,
} from '../../../app/shared/components/notification-item/notification-item.component';

type Story = StoryObj<NotificationItemComponent>;

const baseItem: NotificationItemModel = {
  id: 'demo-1',
  kind: 'inline',
  type: 'info',
  title: 'Title',
  message: 'Message',
  actionLabel: 'Action',
  actionStyle: 'link',
  dismissible: true,
  theme: 'light',
};

const meta: Meta<NotificationItemComponent> = {
  title: 'Shared/Components/Notification/Item',
  component: NotificationItemComponent,
  decorators: [
    // Se seu componente for standalone, nem precisaria do moduleMetadata;
    // mantemos vazio só por consistência
    moduleMetadata({}),
    applicationConfig({
      providers: [provideAnimations()], // ✅ animações no SB 7/8/9
    }),
  ],
  args: { item: baseItem },
  argTypes: {
    // Mapear @Output() para painel Actions
    action: { action: 'action' },
    dismiss: { action: 'dismiss' },
    item: { control: 'object' },
  },
  parameters: { controls: { expanded: true }, layout: 'padded' },
};
export default meta;

// ───────── VARIANTES ─────────

export const InfoInlineLight: Story = {
  name: 'Info / Inline / Light',
  args: { item: { ...baseItem, kind: 'inline', type: 'info', theme: 'light' } },
};

export const SuccessInlineDarkLink: Story = {
  name: 'Success / Inline / Dark / Link',
  decorators: [
    componentWrapperDecorator(
      (story) => `<div style="padding:16px;background:#121212">${story}</div>`
    ),
  ],
  args: {
    item: { ...baseItem, id: 'demo-2', kind: 'inline', type: 'success', theme: 'dark', actionStyle: 'link' },
  },
};

export const WarningToastLightOutline: Story = {
  name: 'Warning / Toast / Light / Outline',
  args: {
    item: {
      ...baseItem,
      id: 'demo-3',
      kind: 'toast',
      type: 'warning',
      theme: 'light',
      actionStyle: 'outline',
      timestamp: 'Time stamp [00:00:00]',
    },
  },
};

export const ErrorToastDarkGhost: Story = {
  name: 'Error / Toast / Dark / Ghost',
  decorators: [
    componentWrapperDecorator(
      (story) => `<div style="padding:16px;background:#121212;height:220px">${story}</div>`
    ),
  ],
  args: { item: { ...baseItem, id: 'demo-4', kind: 'toast', type: 'error', theme: 'dark', actionStyle: 'ghost' } },
};

export const WithoutTitleAndAction: Story = {
  name: 'Sem título e ação',
  args: {
    item: { ...baseItem, id: 'demo-5', title: undefined, actionLabel: undefined, timestamp: 'Time stamp [00:00:00]' },
  },
};

export const NonDismissible: Story = {
  name: 'Não descartável (sem X)',
  args: { item: { ...baseItem, id: 'demo-6', dismissible: false } },
};
