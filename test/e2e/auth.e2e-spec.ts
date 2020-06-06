import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppTestModule } from '../app.test.module';
import { clearDb } from './shared';
import { AuthService } from '../../src/modules/auth/auth.service';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { CreateAccountDto } from '../../src/modules/auth/dto/create-account.dto';
import { UsersModule } from '../../src/modules/users/users.module';
import { LoginDto } from '../../src/modules/auth/dto/login.dto';
import { SignInResponseDto } from '../../src/modules/auth/dto/sign-in-response.dto';
import { UserResponseDto } from '../../src/modules/users/dto/user-response.dto';

const routes = {
  signin: { method: 'POST', path: '/auth/signin', describe: 'user login via username or email' },
  signup: { method: 'POST', path: '/auth/signup', describe: 'user register' },
};

const getTestName = (p: keyof typeof routes) =>
  `[${routes[p].method}] ${routes[p].path} (${routes[p].describe})`;
const getRoutePath = (p: keyof typeof routes, postfix?: string): string =>
  postfix ? routes[p].path.concat(postfix) : routes[p].path;

const userDataset1: CreateAccountDto = {
  email: 'user@email.com',
  username: 'user_test',
  password: 'userPass123!@#',
  lastName: 'UserLastName',
  firstName: 'UserFirstName',
};

describe('AuthController', () => {
  let app: INestApplication;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppTestModule, AuthModule, UsersModule],
    }).compile();

    app = moduleRef.createNestApplication();
    authService = await moduleRef.resolve(AuthService);
    await app.init();
  });

  const postResponse = (path: string) => request(app.getHttpServer()).post(path);

  describe(getTestName('signup'), () => {
    beforeEach(async () => {
      await clearDb();
    });

    it('User can successfully sign up', async () => {
      const registerDto: CreateAccountDto = {
        email: userDataset1.email,
        username: userDataset1.username,
        password: userDataset1.password,
        firstName: userDataset1.firstName,
        lastName: userDataset1.lastName,
      };
      const { body, status }: { body: UserResponseDto; status: number } = await postResponse(
        getRoutePath('signup'),
      ).send(registerDto);
      expect(status).toBe(201);
      expect(body.hasOwnProperty('access_token')).toBeFalsy();
      expect(body.hasOwnProperty('refresh_token')).toBeFalsy();
      expect(body).toEqual(
        expect.objectContaining({
          username: registerDto.username,
          email: registerDto.email,
          lastName: registerDto.lastName,
          firstName: registerDto.firstName,
          created_at: expect.any(String),
          id: expect.any(String),
        } as UserResponseDto),
      );
    });

    it('User can successfully sign up with filled only email, username and password', async () => {
      const registerDto: CreateAccountDto = {
        email: userDataset1.email,
        username: userDataset1.username,
        password: userDataset1.password,
      };
      const { body, status }: { body: UserResponseDto; status: number } = await postResponse(
        getRoutePath('signup'),
      ).send(registerDto);
      expect(status).toBe(201);
      expect(body.hasOwnProperty('access_token')).toBeFalsy();
      expect(body.hasOwnProperty('refresh_token')).toBeFalsy();
      expect(body).toEqual(
        expect.objectContaining({
          username: registerDto.username,
          email: registerDto.email,
          lastName: null,
          firstName: null,
          created_at: expect.any(String),
          id: expect.any(String),
        } as UserResponseDto),
      );
    });

    it(
      'User can successfully sign up if user with' + ' same firstname and lastname already exist',
      async () => {
        await authService.signUp(userDataset1);
        const registerDto: CreateAccountDto = {
          email: 'some@email.com',
          username: 'some_username',
          password: 'some_password',
          firstName: userDataset1.firstName,
          lastName: userDataset1.lastName,
        };
        const { body, status }: { body: UserResponseDto; status: number } = await postResponse(
          getRoutePath('signup'),
        ).send(registerDto);
        expect(status).toBe(201);
        expect(body.hasOwnProperty('access_token')).toBeFalsy();
        expect(body.hasOwnProperty('refresh_token')).toBeFalsy();
        expect(body).toEqual(
          expect.objectContaining({
            username: registerDto.username,
            email: registerDto.email,
            lastName: registerDto.lastName,
            firstName: registerDto.firstName,
            created_at: expect.any(String),
            id: expect.any(String),
          } as UserResponseDto),
        );
      },
    );

    it('User can not successfully sign up without username', async () => {
      const registerDto: Partial<CreateAccountDto> = {
        email: userDataset1.email,
        password: userDataset1.password,
      };
      const { status } = await postResponse(getRoutePath('signup')).send(registerDto);
      expect(status).toBe(400);
    });

    it('User can not successfully sign up without email', async () => {
      const registerDto: Partial<CreateAccountDto> = {
        username: userDataset1.username,
        password: userDataset1.password,
      };
      const { status } = await postResponse(getRoutePath('signup')).send(registerDto);
      expect(status).toBe(400);
    });

    it('User can not successfully sign up without password', async () => {
      const registerDto: Partial<CreateAccountDto> = {
        email: userDataset1.email,
        username: userDataset1.username,
      };
      const { status } = await postResponse(getRoutePath('signup')).send(registerDto);
      expect(status).toBe(400);
    });

    it('User can not successfully sign up with empty password', async () => {
      const registerDto: Partial<CreateAccountDto> = {
        email: userDataset1.email,
        username: userDataset1.username,
        password: '',
      };
      const { status } = await postResponse(getRoutePath('signup')).send(registerDto);
      expect(status).toBe(400);
    });

    it('User can not successfully sign up with short password', async () => {
      const registerDto: Partial<CreateAccountDto> = {
        email: userDataset1.email,
        username: userDataset1.username,
        password: 'abc',
      };
      const { status } = await postResponse(getRoutePath('signup')).send(registerDto);
      expect(status).toBe(400);
    });

    it('User can not successfully sign up with incorrect email', async () => {
      const registerDto: CreateAccountDto = {
        email: 'INCORRECT',
        username: userDataset1.username,
        password: userDataset1.password,
      };
      const { status } = await postResponse(getRoutePath('signup')).send(registerDto);
      expect(status).toBe(400);
    });

    it('User can not successfully sign up if his username already exist', async () => {
      await authService.signUp(userDataset1);
      const registerDto: CreateAccountDto = {
        email: 'some@email.com',
        username: userDataset1.username,
        password: 'some_password',
      };
      const { status } = await postResponse(getRoutePath('signup')).send(registerDto);
      expect(status).toBe(400);
    });

    it('User can not successfully sign up if his email already exist', async () => {
      await authService.signUp(userDataset1);
      const registerDto: CreateAccountDto = {
        email: userDataset1.email,
        username: 'some_username',
        password: 'some_password',
      };
      const { status } = await postResponse(getRoutePath('signup')).send(registerDto);
      expect(status).toBe(400);
    });
  });

  describe(getTestName('signin'), () => {
    beforeEach(async () => {
      await clearDb();
    });

    it('User can successfully login by username', async () => {
      await authService.signUp(userDataset1);
      const loginDto: Partial<LoginDto> = {
        username: userDataset1.username,
        password: userDataset1.password,
      };
      const { body, status } = await postResponse(getRoutePath('signin')).send(loginDto);
      const { access_token, refresh_token } = body as SignInResponseDto;
      expect(status).toBe(200);
      expect(body).toEqual(
        expect.objectContaining({
          username: userDataset1.username,
          email: userDataset1.email,
          lastName: userDataset1.lastName,
          firstName: userDataset1.firstName,
          created_at: expect.any(String),
          id: expect.any(String),
        } as UserResponseDto),
      );
      expect(body.hasOwnProperty('access_token')).toBeTruthy();
      expect(body.hasOwnProperty('refresh_token')).toBeTruthy();
      expect(typeof access_token === 'string' && access_token.length).toBeTruthy();
      expect(typeof refresh_token === 'string' && refresh_token.length).toBeTruthy();
    });

    it('User can successfully login by email', async () => {
      await authService.signUp(userDataset1);
      const loginDto: Partial<LoginDto> = {
        email: userDataset1.email,
        password: userDataset1.password,
      };
      const { body, status } = await postResponse(getRoutePath('signin')).send(loginDto);
      const { access_token, refresh_token } = body as SignInResponseDto;
      expect(status).toBe(200);
      expect(body).toEqual(
        expect.objectContaining({
          username: userDataset1.username,
          email: userDataset1.email,
          lastName: userDataset1.lastName,
          firstName: userDataset1.firstName,
          created_at: expect.any(String),
          id: expect.any(String),
        } as UserResponseDto),
      );
      expect(body.hasOwnProperty('access_token')).toBeTruthy();
      expect(body.hasOwnProperty('refresh_token')).toBeTruthy();
      expect(typeof access_token === 'string' && access_token.length).toBeTruthy();
      expect(typeof refresh_token === 'string' && refresh_token.length).toBeTruthy();
    });

    it('User gets 401 on invalid credentials', async () => {
      await authService.signUp(userDataset1);
      const loginDto: Partial<LoginDto> = {
        email: userDataset1.email,
        password: 'INVALID_PASSWORD',
      };
      const { body, status } = await postResponse(getRoutePath('signin')).send(loginDto);
      expect(status).toBe(401);
      expect(body.hasOwnProperty('access_token')).toBeFalsy();
      expect(body.hasOwnProperty('refresh_token')).toBeFalsy();
    });
  });

  afterAll(async () => {
    await clearDb();
    await app.close();
  });
});
