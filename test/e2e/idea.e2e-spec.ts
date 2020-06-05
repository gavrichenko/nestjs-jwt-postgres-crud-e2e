import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { IdeaModule } from '../../src/modules/idea/idea.module';
import { AppTestModule } from '../app.test.module';
import { IdeaService } from '../../src/modules/idea/idea.service';
import { IdeaResponseDto } from '../../src/modules/idea/dto/idea-response.dto';
import { IdeaCreateDto } from '../../src/modules/idea/dto/idea-create.dto';
import { clearDb } from './shared';

const routes = {
  getIdeas: { method: 'GET', path: '/idea/ideas', describe: 'get ideas list' },
  getIdea: { method: 'GET', path: '/idea', describe: 'get idea by id' },
  updateIdea: { method: 'PUT', path: '/idea', describe: 'update idea' },
  createIdea: { method: 'POST', path: '/idea', describe: 'create idea' },
  removeIdea: { method: 'DELETE', path: '/idea', describe: 'remove idea' },
};

const getTestName = (p: keyof typeof routes) =>
  `[${routes[p].method}] ${routes[p].path} (${routes[p].describe})`;
const getRoutePath = (p: keyof typeof routes, postfix?: string): string =>
  postfix ? routes[p].path.concat(postfix) : routes[p].path;

describe('IdeaController', () => {
  let app: INestApplication;
  let ideaService: IdeaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppTestModule, IdeaModule],
    }).compile();

    app = moduleRef.createNestApplication();
    ideaService = await moduleRef.resolve(IdeaService);
    await app.init();
  });

  const getResponse = (path: string) => request(app.getHttpServer()).get(path);
  const postResponse = (path: string) => request(app.getHttpServer()).post(path);
  const putResponse = (path: string) => request(app.getHttpServer()).put(path);
  const deleteResponse = (path: string) => request(app.getHttpServer()).delete(path);

  describe(getTestName('getIdeas'), () => {
    beforeEach(async () => {
      await clearDb();
    });

    it('when ideas list is empty', async () => {
      return getResponse(getRoutePath('getIdeas')).expect(200, []);
    });

    it('take 2 ideas, check status code and values', async () => {
      const existedIdea1 = await ideaService.createIdea({ idea: 'hello', description: 'world' });
      const existedIdea2 = await ideaService.createIdea({ idea: 'hello1', description: 'world2' });

      const { body, status } = await getResponse(getRoutePath('getIdeas'));
      const [idea1, idea2] = body as IdeaResponseDto[];
      idea1.created = new Date(idea1.created);
      idea2.created = new Date(idea2.created);
      expect(status).toBe(200);
      expect(body.length).toBe(2);
      expect(idea1).toEqual(existedIdea1);
      expect(idea2).toEqual(existedIdea2);
    });
  });

  describe(getTestName('getIdea'), () => {
    beforeEach(async () => {
      await clearDb();
    });

    it('get idea by id', async () => {
      const existedIdea = await ideaService.createIdea({ idea: 'hello', description: 'world' });
      const { body, status } = await getResponse(getRoutePath('getIdea', '/').concat(existedIdea.id));
      body.created = new Date(body.created);
      expect(status).toBe(200);
      expect(body).toEqual(existedIdea);
    });

    it('get idea by nonexistent id', async () => {
      const nonexistentId = '94e4571b-4191-4093-ab84-cfa86070e0e5';
      const { body, status } = await getResponse(getRoutePath('getIdea', '/').concat(nonexistentId));
      body.created = new Date(body.created);
      expect(status).toBe(404);
    });
  });

  describe(getTestName('createIdea'), () => {
    beforeEach(async () => {
      await clearDb();
    });

    it('create new idea', async () => {
      const newIdea: IdeaCreateDto = {
        idea: 'hello',
        description: 'world',
      };
      const { body, status } = await postResponse(getRoutePath('createIdea')).send(newIdea);
      expect(status).toBe(201);
      expect(body.idea).toBe(newIdea.idea);
      expect(body.description).toBe(newIdea.description);
    });

    it('create new idea with empty title', async () => {
      const newIdea: Partial<IdeaCreateDto> = {
        description: 'world',
      };
      const { status } = await postResponse(getRoutePath('createIdea')).send(newIdea);
      expect(status).toBe(400);
    });

    it('create new idea with empty description', async () => {
      const newIdea: Partial<IdeaCreateDto> = {
        idea: 'hello',
      };
      const { status } = await postResponse(getRoutePath('createIdea')).send(newIdea);
      expect(status).toBe(400);
    });
  });

  describe(getTestName('updateIdea'), () => {
    beforeEach(async () => {
      await clearDb();
    });

    it('update title of idea', async () => {
      const existedIdea = await ideaService.createIdea({ idea: 'hello', description: 'world' });
      const updateDto: Partial<IdeaCreateDto> = { idea: 'updated_title' };
      const { body, status } = await putResponse(
        getRoutePath('updateIdea', '/').concat(existedIdea.id),
      ).send(updateDto);
      expect(status).toBe(200);
      expect(body.idea).toBe(updateDto.idea);
      expect(body.description).toBe(existedIdea.description);
    });

    it('update description of idea', async () => {
      const existedIdea = await ideaService.createIdea({ idea: 'hello', description: 'world' });
      const updateDto: Partial<IdeaCreateDto> = { description: 'updated_description' };
      const { body, status } = await putResponse(
        getRoutePath('updateIdea', '/').concat(existedIdea.id),
      ).send(updateDto);
      expect(status).toBe(200);
      expect(body.idea).toBe(existedIdea.idea);
      expect(body.description).toBe(updateDto.description);
    });

    it('update title and description of idea', async () => {
      const existedIdea = await ideaService.createIdea({ idea: 'hello', description: 'world' });
      const updateDto: Partial<IdeaCreateDto> = { idea: 'hello1', description: 'updated_description1' };
      const { body, status } = await putResponse(
        getRoutePath('updateIdea', '/').concat(existedIdea.id),
      ).send(updateDto);
      expect(status).toBe(200);
      expect(body.idea).toBe(updateDto.idea);
      expect(body.description).toBe(updateDto.description);
    });

    it('update idea by nonexistent id', async () => {
      const nonexistentId = '94e4571b-4191-4093-ab84-cfa86070e0e5';
      const { status } = await deleteResponse(getRoutePath('updateIdea', '/').concat(nonexistentId));
      expect(status).toBe(404);
    });
  });

  describe(getTestName('removeIdea'), () => {
    beforeEach(async () => {
      await clearDb();
    });

    it('remove idea by id', async () => {
      const existedIdea = await ideaService.createIdea({ idea: 'hello', description: 'world' });
      const { body, status } = await deleteResponse(
        getRoutePath('removeIdea', '/').concat(existedIdea.id),
      );
      expect(status).toBe(200);
      expect(body).toEqual({ deleted: existedIdea.id });
    });

    it('remove idea by nonexistent id', async () => {
      const nonexistentId = '94e4571b-4191-4093-ab84-cfa86070e0e5';
      const { status } = await deleteResponse(getRoutePath('removeIdea', '/').concat(nonexistentId));
      expect(status).toBe(404);
    });
  });

  afterAll(async () => {
    await clearDb();
    await app.close();
  });
});
