// checkbox.stories.ts
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { CheckboxComponent } from '../../../app/shared/components/checkbox/checkbox.component';
import { CheckboxGroupComponent } from '../../../app/shared/components/checkbox/checkbox-group.component';

const meta: Meta<CheckboxComponent> = {
  title: 'Shared/Components/Checkbox',
  component: CheckboxComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, CheckboxComponent, CheckboxGroupComponent],
    }),
  ],
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    errorMessage: { control: 'text' },
    warningMessage: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj<CheckboxComponent>;

/** ✅ Story base */
export const Default: Story = {
  args: {
    label: 'Aceito os termos',
    checked: false,
    disabled: false,
  },
};

/** ✅ Marcado */
export const Checked: Story = {
  args: {
    label: 'Opção marcada',
    checked: true,
  },
};

/** ✅ Desabilitado */
export const Disabled: Story = {
  args: {
    label: 'Opção desabilitada',
    disabled: true,
  },
};

/** ✅ Com erro */
export const WithError: Story = {
  args: {
    label: 'Opção com erro',
    errorMessage: 'Campo obrigatório',
  },
};

/** ✅ Com aviso */
export const WithWarning: Story = {
  args: {
    label: 'Opção com aviso',
    warningMessage: 'Verifique esta opção',
  },
};

/** ✅ CheckboxGroup */
export const CheckboxGroup = () => ({
  component: CheckboxGroupComponent,
  props: {
    groupLabel: 'Selecione as opções',
    options: [
      { label: 'Opção 1', value: '1' },
      { label: 'Opção 2', value: '2', checked: true },
      { label: 'Opção 3', value: '3', disabled: true },
    ],
    warningMessage: '',
    errorMessage: '',
  },
});
