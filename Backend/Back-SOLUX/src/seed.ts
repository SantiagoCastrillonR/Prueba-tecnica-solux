import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { CreateChatUseCase } from '@modules/chats/application/use-cases/create-chat.use-case.js';
import { ListMyChatsUseCase } from '@modules/chats/application/use-cases/list-my-chats.use-case.js';
import { SendMessageUseCase } from '@modules/chats/application/use-cases/send-message.use-case.js';
import { CreateUserUseCase } from '@modules/users/application/use-cases/create-user.use-case.js';
import type { User } from '@modules/users/domain/entities/user.entity.js';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '@modules/users/domain/ports/user.repository.js';
import { AppModule } from './app.module.js';

export const SEED_PASSWORD = 'Solux2026!';

const USERS = {
  ana: { name: 'Ana García', email: 'ana@solux.test' },
  bruno: { name: 'Bruno Díaz', email: 'bruno@solux.test' },
  carla: { name: 'Carla Ruiz', email: 'carla@solux.test' },
  david: { name: 'David Mora', email: 'david@solux.test' },
} as const;

type UserKey = keyof typeof USERS;
type SeedMessage = [author: UserKey, body: string];

const DIRECT_MESSAGES: SeedMessage[] = [
  ['ana', '¡Hola Bruno! ¿Ya probaste el chat en tiempo real?'],
  ['bruno', 'Sí, los mensajes llegan al instante.'],
  ['ana', 'Prueba a desconectar el wifi: al volver se sincroniza solo.'],
  ['bruno', 'Genial, lo pruebo ahora mismo.'],
];

const GROUP = {
  name: 'Equipo SOLUX',
  creator: 'ana' as UserKey,
  others: ['bruno', 'carla'] as UserKey[],
  messages: [
    ['ana', 'Bienvenidos al grupo del equipo.'],
    ['carla', '¡Gracias! Aquí veo los mensajes de los tres.'],
    ['bruno', 'Y David no los ve porque no está en el grupo.'],
  ] as SeedMessage[],
};

const logger = new Logger('Seed');

async function seed(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  Logger.overrideLogger(['log', 'warn', 'error']);
  try {
    if (app.get(ConfigService).get('NODE_ENV') === 'production') {
      throw new Error('Refusing to seed demo users with NODE_ENV=production');
    }
    const repo = app.get<UserRepository>(USER_REPOSITORY);
    const createUser = app.get(CreateUserUseCase);
    const createChat = app.get(CreateChatUseCase);
    const listMyChats = app.get(ListMyChatsUseCase);
    const sendMessage = app.get(SendMessageUseCase);

    const users = {} as Record<UserKey, User>;
    for (const [key, data] of Object.entries(USERS) as [
      UserKey,
      (typeof USERS)[UserKey],
    ][]) {
      users[key] =
        (await repo.findByEmail(data.email)) ??
        (await createUser.execute({ ...data, password: SEED_PASSWORD }));
    }

    const { chat: direct } = await createChat.execute(
      { participantIds: [users.bruno.id] },
      users.ana.id,
    );

    const creatorId = users[GROUP.creator].id;
    const existingGroup = (await listMyChats.execute(creatorId)).find(
      (s) => s.chat.isGroup && s.chat.name === GROUP.name,
    )?.chat;
    const group =
      existingGroup ??
      (
        await createChat.execute(
          {
            participantIds: GROUP.others.map((k) => users[k].id),
            name: GROUP.name,
          },
          creatorId,
        )
      ).chat;

    const send = async (chatId: string, tag: string, list: SeedMessage[]) => {
      for (const [i, [author, body]] of list.entries()) {
        await sendMessage.execute(
          { chatId, body, clientId: `seed-${tag}-${i + 1}` },
          users[author].id,
        );
      }
    };
    await send(direct.id, 'direct', DIRECT_MESSAGES);
    await send(group.id, 'group', GROUP.messages);

    logger.log(
      `Seed listo: ${Object.keys(users).length} usuarios, chat directo Ana–Bruno, grupo "${GROUP.name}" (Ana, Bruno, Carla).`,
    );
    logger.log(
      `Usuarios: ${Object.values(USERS)
        .map((u) => u.email)
        .join(', ')} — contraseña: ${SEED_PASSWORD}`,
    );
  } finally {
    await app.close();
  }
}

try {
  await seed();
} catch (err) {
  logger.error((err as Error).message, (err as Error).stack);
  process.exitCode = 1;
}
