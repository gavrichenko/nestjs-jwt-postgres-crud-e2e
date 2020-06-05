import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppTestModule } from '../app.test.module';
import { clearDb } from './shared';
import { UsersModule } from '../../src/modules/users/users.module';
import { AuthService } from '../../src/modules/auth/auth.service';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { CreateAccountDto } from '../../src/modules/auth/dto/create-account.dto';
import { UserResponseDto } from '../../src/modules/users/dto/user-response.dto';

const routes = {
  getUsers: { method: 'GET', path: '/user/users', describe: 'get users list' },
  getUser: { method: 'GET', path: '/user', describe: 'get user by username or email' },
};

const getTestName = (p: keyof typeof routes) =>
  `[${routes[p].method}] ${routes[p].path} (${routes[p].describe})`;
const getRoutePath = (p: keyof typeof routes, postfix?: string): string =>
  postfix ? routes[p].path.concat(postfix) : routes[p].path;

const registeredUser1: CreateAccountDto = {
  lastName: 'UserLastName',
  firstName: 'UserFirstName',
  password: 'userPass123!@#',
  email: 'user@email.com',
  username: 'user_test',
};
const registeredUser2: CreateAccountDto = {
  lastName: 'User2LastName',
  firstName: 'User2FirstName',
  password: 'user2Pass123!@#',
  email: 'user2@email.com',
  username: 'user2_test',
};

describe('UsersController', () => {
  let app: INestApplication;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppTestModule, UsersModule, AuthModule],
    }).compile();

    app = moduleRef.createNestApplication();
    authService = await moduleRef.resolve(AuthService);
    await app.init();
  });

  const getResponse = (path: string) => request(app.getHttpServer()).get(path);

  describe(getTestName('getUsers'), () => {
    beforeEach(async () => {
      await clearDb();
    });

    it('when users list is empty', async () => {
      return getResponse(getRoutePath('getUsers')).expect(200, []);
    });

    it('take 2 users, check status code and values', async () => {
      const existedUser1 = await authService.signUp(registeredUser1);
      const existedUser2 = await authService.signUp(registeredUser2);

      const { body, status } = await getResponse(getRoutePath('getUsers'));
      const [user1, user2] = body as UserResponseDto[];
      user1.created_at = new Date(user1.created_at);
      user2.created_at = new Date(user2.created_at);
      expect(status).toBe(200);
      expect(body.length).toBe(2);
      expect(user1).toEqual(existedUser1);
      expect(user2).toEqual(existedUser2);
    });
  });

  describe(getTestName('getUser'), () => {
    beforeEach(async () => {
      await clearDb();
    });

    it('get user by username', async () => {
      const existedUser = await authService.signUp(registeredUser1);
      const { body, status } = await getResponse(
        getRoutePath('getUser', '/').concat(existedUser.username),
      );
      body.created_at = new Date(body.created_at);
      expect(status).toBe(200);
      expect(body).toEqual(existedUser);
    });

    it('get user by email', async () => {
      const existedUser = await authService.signUp(registeredUser1);
      const { body, status } = await getResponse(getRoutePath('getUser', '/').concat(existedUser.email));
      body.created_at = new Date(body.created_at);
      expect(status).toBe(200);
      expect(body).toEqual(existedUser);
    });

    it('get user by nonexistent username', async () => {
      const username = 'nonexistent';
      const { body, status } = await getResponse(getRoutePath('getUser', '/').concat(username));
      body.created_at = new Date(body.created_at);
      expect(status).toBe(404);
    });

    it('get user by nonexistent email', async () => {
      const email = 'nonexistent@emal.com';
      const { body, status } = await getResponse(getRoutePath('getUser', '/').concat(email));
      body.created_at = new Date(body.created_at);
      expect(status).toBe(404);
    });

    it('get user without username or email', async () => {
      const { body, status } = await getResponse(getRoutePath('getUser'));
      body.created_at = new Date(body.created_at);
      expect(status).toBe(404);
    });
  });

  afterAll(async () => {
    await clearDb();
    await app.close();
  });
});
