const request = require('supertest');
const app = require('../src/index');
const { Admin } = require('../src/models');

describe('Studio editorial lifecycle on an isolated test database', () => {
  it('logs in, saves a private draft, edits, publishes, archives and deletes it', async () => {
    await Admin.create({email:'editor@example.test',password:'Test-only-editor-123',name:'Test Editor'});
    const login = await request(app).post('/api/v1/auth/admin/login').send({email:'editor@example.test',password:'Test-only-editor-123'});
    expect(login.status).toBe(200);
    const authorization = `Bearer ${login.body.data.token}`;
    const create = await request(app).post('/api/v1/blog/posts').set('Authorization',authorization).send({title:'Isolated editorial QA',content:'Original test article.',status:'draft',categories:['QA'],tags:['workflow']});
    expect(create.status).toBe(201);
    const {id,slug} = create.body.data;
    expect((await request(app).get(`/api/v1/blog/posts/${slug}`)).status).toBe(404);
    const edit = await request(app).put(`/api/v1/blog/posts/${id}`).set('Authorization',authorization).send({content:'Edited original test article.',status:'published'});
    expect(edit.status).toBe(200);
    const published = await request(app).get(`/api/v1/blog/posts/${slug}`);
    expect(published.status).toBe(200);
    expect(published.body.data.content).toBe('Edited original test article.');
    const archive = await request(app).put(`/api/v1/blog/posts/${id}`).set('Authorization',authorization).send({status:'archived'});
    expect(archive.status).toBe(200);
    expect((await request(app).get(`/api/v1/blog/posts/${slug}`)).status).toBe(404);
    expect((await request(app).delete(`/api/v1/blog/posts/${id}`).set('Authorization',authorization)).status).toBe(200);
    expect((await request(app).get(`/api/v1/blog/posts/${slug}`)).status).toBe(404);
  });
});
