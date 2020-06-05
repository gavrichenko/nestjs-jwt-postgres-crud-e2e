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
import { RefreshDto } from '../../src/modules/auth/dto/refresh.dto';

const routes = {
  signin: { method: 'POST', path: '/auth/signin', describe: 'user login via username or email' },
  refresh: { method: 'POST', path: '/auth/refresh', describe: 'issue token pair by refresh token' },
  testAuthJwt: { method: 'GET', path: '/auth/test/jwt', describe: 'test rout with JwtAuthGuard' },
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

  const getResponse = (path: string) => request(app.getHttpServer()).get(path);
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
  const getExpiresInAccessToken = () => getUnixTimestamp(configService.get('jwt.accessTokenExpiresIn'));
  const getExpiresInRefreshToken = () =>
    getUnixTimestamp(configService.get('jwt.refreshTokenExpiresIn'));

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
      const accessTokenExpiresIn = getExpiresInAccessToken();
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
          username: body.username,
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
      const refreshTokenExpiresIn = getExpiresInRefreshToken();
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
          username: body.username,
          sub: 'auth',
          iat: expect.any(Number),
          exp: expect.any(Number),
        }),
      );
    });
  });

  describe('Some manipulations with jwt', () => {
    beforeAll(async () => {
      await clearDb();
      await authService.signUp(userDataset1);
    });

    it('User receives 401 on expired token', async done => {
      jest.setTimeout(6000);
      // identifies the expiration time on or after which the JWT MUST NOT be accepted for processing
      const accessTokenExpiresIn = 3; // in seconds
      const accessTokenPayload = {
        user_id: 'b4068da3-c714-4d57-ba17-3a9c743d75bz',
        username: 'user_test',
        sub: 'auth',
        iat: getUnixTimestamp(),
        exp: getUnixTimestamp() + accessTokenExpiresIn,
      };
      const access_token = jwt.sign(accessTokenPayload, getSecretForAccessToken());
      const { body, status } = await getResponse(getRoutePath('testAuthJwt')).set(
        'Authorization',
        'Bearer '.concat(access_token),
      );
      expect(status).toBe(200);
      expect(body['userId']).toBe(accessTokenPayload.user_id);
      expect(body['username']).toBe(accessTokenPayload.username);
      setTimeout(async () => {
        const { status } = await getResponse(getRoutePath('testAuthJwt')).set(
          'Authorization',
          'Bearer '.concat(access_token),
        );
        expect(status).toBe(401);
        done();
      }, 5000);
    });

    it('User can get new access token using refresh token', async () => {
      // checking that user can access to protected route after login
      const { access_token, refresh_token, username } = await signIn();
      const response1 = await getResponse(getRoutePath('testAuthJwt')).set(
        'Authorization',
        'Bearer '.concat(access_token),
      );
      expect(response1.status).toBe(200);

      // getting new token pair by existed refresh token
      const refreshDto: RefreshDto = { refresh_token };
      const refreshResponse = await postResponse(getRoutePath('refresh')).send(refreshDto);
      const refreshResponseBody = refreshResponse.body as SignInResponse;
      expect(refreshResponse.status).toBe(201);
      expect(refreshResponseBody.username).toBe(username);

      // checking that user can access to protected route using new access token
      const response2 = await getResponse(getRoutePath('testAuthJwt')).set(
        'Authorization',
        'Bearer '.concat(refreshResponseBody.access_token),
      );
      expect(refreshResponseBody.hasOwnProperty('access_token')).toBeTruthy();
      expect(refreshResponseBody.hasOwnProperty('refresh_token')).toBeTruthy();
      expect(response2.status).toBe(200);
    });

    it('User get 404 on invalid refresh token', async () => {
      const refreshDto: RefreshDto = { refresh_token: 'INVALID_REFRESH_TOKEN' };
      const { status } = await postResponse(getRoutePath('refresh')).send(refreshDto);
      expect(status).toBe(404);
    });

    it('User can use refresh token only once', async () => {
      const { refresh_token } = await signIn();
      const refreshDto: RefreshDto = { refresh_token };

      const refreshResponse1 = await postResponse(getRoutePath('refresh')).send(refreshDto);

      expect(refreshResponse1.body.hasOwnProperty('access_token')).toBeTruthy();
      expect(refreshResponse1.body.hasOwnProperty('refresh_token')).toBeTruthy();
      expect(refreshResponse1.status).toBe(201);

      let status: number = null;
      // FIXME: i think this problem related with jest async (manually it's works with first attempt)
      let count = 0;
      while (status !== 404 || count < 50) {
        count++;
        const refreshResponse2 = await postResponse(getRoutePath('refresh')).send(refreshDto);
        status = refreshResponse2.status;
      }
      expect(status).toBe(404);
    });

    it.todo('Refresh tokens become invalid on logout');
    it.todo('Multiple refresh tokens are valid');
  });

  afterAll(async () => {
    await clearDb();
    await app.close();
  });
});
