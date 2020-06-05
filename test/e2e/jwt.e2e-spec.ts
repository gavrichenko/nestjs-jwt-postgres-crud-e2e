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
import { SignInResponse } from '../../src/modules/auth/dto/sign-in-response';
import { getUnixTimestamp } from '../../src/shared/utils';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
const routes = {
  signin: { method: 'POST', path: '/auth/signin', describe: 'user login via username or email' },
};

const getRoutePath = (p: keyof typeof routes, postfix?: string): string =>
  postfix ? routes[p].path.concat(postfix) : routes[p].path;

const userDataset1: CreateAccountDto = {
  email: 'user@email.com',
  username: 'user_test',
  password: 'userPass123!@#',
  lastName: 'UserLastName',
  firstName: 'UserFirstName',
};

describe('JWT', () => {
  let app: INestApplication;
  let authService: AuthService;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppTestModule, AuthModule, UsersModule],
    }).compile();

    app = moduleRef.createNestApplication();
    authService = await moduleRef.resolve(AuthService);
    configService = await moduleRef.resolve(ConfigService);
    await app.init();
  });

  const postResponse = (path: string) => request(app.getHttpServer()).post(path);

  const signIn = async (): Promise<SignInResponse> => {
    const loginDto: Partial<LoginDto> = {
      username: userDataset1.username,
      password: userDataset1.password,
    };
    const { body } = await postResponse(getRoutePath('signin')).send(loginDto);
    return body;
  };

  const getSecretForAccessToken = () => configService.get('jwt.secret_access');
  const getSecretForRefreshToken = () => configService.get('jwt.secret_refresh');

  describe('JWT-access token is correct', () => {
    beforeAll(async () => {
      await clearDb();
      await authService.signUp(userDataset1);
    });

    it('Signature is valid when secret is correct', async () => {
      const body = await signIn();
      expect(() => jwt.verify(body.access_token, getSecretForAccessToken())).not.toThrow();
    });

    it('Signature is not valid when secret is incorrect', async () => {
      const body = await signIn();
      expect(() => jwt.verify(body.access_token, 'INVALID_SIGNATURE')).toThrow();
    });

    it('Issued at (iat) field is correct', async () => {
      const unixTimeBeforeRequest = getUnixTimestamp();
      const body = await signIn();
      const decodedJwt = jwt.decode(body.access_token);
      const timeBuffer = 5;
      expect(decodedJwt['iat']).toBeLessThan(decodedJwt['exp']);
      expect(decodedJwt['iat'] + timeBuffer).toBeGreaterThan(unixTimeBeforeRequest);
      expect(decodedJwt['iat'] - timeBuffer).toBeLessThan(unixTimeBeforeRequest);
    });

    it('Expiration time (exp) field is correct', async () => {
      const accessTokenExpiresIn = getUnixTimestamp(configService.get('jwt.accessTokenExpiresIn'));
      const body = await signIn();
      const timeBuffer = 5;
      const decodedJwt = jwt.decode(body.access_token);
      expect(decodedJwt['exp'] + timeBuffer).toBeGreaterThan(decodedJwt['iat'] + accessTokenExpiresIn);
      expect(decodedJwt['exp'] - timeBuffer).toBeLessThan(decodedJwt['iat'] + accessTokenExpiresIn);
    });

    it('Payload of jwt contains user id', async () => {
      const body = await signIn();
      const decodedJwt = jwt.decode(body.access_token);
      expect(decodedJwt).toEqual(
        expect.objectContaining({
          user_id: body.id,
          sub: 'auth',
          iat: expect.any(Number),
          exp: expect.any(Number),
        }),
      );
    });
  });

  describe('JWT-refresh token is correct', () => {
    beforeAll(async () => {
      await clearDb();
      await authService.signUp(userDataset1);
    });

    it('Signature is valid when secret is correct', async () => {
      const body = await signIn();
      expect(() => jwt.verify(body.refresh_token, getSecretForRefreshToken())).not.toThrow();
    });

    it('Signature is not valid when secret is incorrect', async () => {
      const body = await signIn();
      expect(() => jwt.verify(body.refresh_token, 'INVALID_SIGNATURE')).toThrow();
    });

    it('Issued at (iat) field is correct', async () => {
      const unixTimeBeforeRequest = getUnixTimestamp();
      const body = await signIn();
      const decodedJwt = jwt.decode(body.refresh_token);
      const timeBuffer = 5;
      expect(decodedJwt['iat']).toBeLessThan(decodedJwt['exp']);
      expect(decodedJwt['iat'] + timeBuffer).toBeGreaterThan(unixTimeBeforeRequest);
      expect(decodedJwt['iat'] - timeBuffer).toBeLessThan(unixTimeBeforeRequest);
    });

    it('Expiration time (exp) field is correct', async () => {
      const refreshTokenExpiresIn = getUnixTimestamp(configService.get('jwt.refreshTokenExpiresIn'));
      const body = await signIn();
      const decodedJwt = jwt.decode(body.refresh_token);
      const timeBuffer = 5;
      expect(decodedJwt['exp'] + timeBuffer).toBeGreaterThan(decodedJwt['iat'] + refreshTokenExpiresIn);
      expect(decodedJwt['exp'] - timeBuffer).toBeLessThan(decodedJwt['iat'] + refreshTokenExpiresIn);
    });

    it('Payload of jwt contains user id', async () => {
      const body = await signIn();
      const decodedJwt = jwt.decode(body.refresh_token);
      expect(decodedJwt).toEqual(
        expect.objectContaining({
          user_id: body.id,
          sub: 'auth',
          iat: expect.any(Number),
          exp: expect.any(Number),
        }),
      );
    });
  });

  afterAll(async () => {
    await clearDb();
    await app.close();
  });
});
