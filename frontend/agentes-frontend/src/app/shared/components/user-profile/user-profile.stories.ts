import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { UserProfileComponent, UserProfileService } from './user-profile.component';
class ErrorUserProfileService extends UserProfileService {
  override getProfile() {
    return throwError(() => new Error('Não foi possível carregar o perfil (mock).')).pipe(delay(300));
  }
}

const meta: Meta<UserProfileComponent> = {
  title: 'Shared/Components/UserProfile',
  component: UserProfileComponent,
  decorators: [
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Componente de perfil do usuário com formulário, preferências, avatar e alteração de senha.',
      },
    },
  },
  args: {
    size: 'md',
    fluid: true,
    skeleton: false,
    readonly: false,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    readonly: {
      control: 'boolean',
    },
    skeleton: {
      control: 'boolean',
    },
    fluid: {
      control: 'boolean',
    },
    saved: { action: 'saved' },
    canceled: { action: 'canceled' },
    avatarChanged: { action: 'avatarChanged' },
    passwordChanged: { action: 'passwordChanged' },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<UserProfileComponent>;

export const Padrao: Story = {
  name: 'Padrão',
  render: args => ({
    props: args,
  }),
};

export const Skeleton: Story = {
  args: {
    skeleton: true,
  },
};

export const SomenteLeitura: Story = {
  name: 'Somente leitura',
  args: {
    readonly: true,
  },
};

export const ErroApi: Story = {
  name: 'Erro de API',
  decorators: [
    moduleMetadata({
      providers: [{ provide: UserProfileService, useClass: ErrorUserProfileService }],
    }),
  ],
};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
