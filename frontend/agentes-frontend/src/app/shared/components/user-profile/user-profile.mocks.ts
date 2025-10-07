import { UserProfile } from './user-profile.component';

export const userProfileMock: UserProfile = {
  id: 'usr-001',
  name: 'Ana Paula Oliveira',
  email: 'ana.oliveira@example.com',
  role: 'Agente',
  phone: '+55 11 98888-1234',
  unit: 'Comarca de São Paulo',
  availability: 'Segunda a Sexta, das 09h às 17h',
  avatarUrl: 'https://i.pravatar.cc/160?img=47',
  updatedAt: new Date().toISOString(),
  preferences: {
    theme: 'system',
    emailNotifications: true,
  },
};

export const userProfileErrorMock = new Error('Simulação de erro ao carregar o perfil.');
