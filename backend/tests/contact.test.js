const request = require('supertest');
const app = require('../src/index');
const {Admin,ContactMessage} = require('../src/models');
const valid = {name:'Test Visitor',email:'visitor@example.test',subject:'Support request',message:'A test message.'};
describe('First-party contact inbox',()=>{
  it('persists before acknowledging without exposing private data',async()=>{
    const r=await request(app).post('/api/v1/contact').send({...valid,status:'read'});
    expect(r.status).toBe(201); expect(r.body.reference).toBeTruthy(); expect(r.body.email).toBeUndefined();
    const saved=await ContactMessage.findByPk(r.body.reference);
    expect(saved.message).toBe(valid.message);expect(saved.status).toBe('new');
  });
  it('rejects malformed and oversized inputs',async()=>{
    expect((await request(app).post('/api/v1/contact').send({...valid,email:'invalid'})).status).toBe(400);
    expect((await request(app).post('/api/v1/contact').send({...valid,message:'x'.repeat(10001)})).status).toBe(400);
    expect(await ContactMessage.count()).toBe(0);
  });
  it('rejects honeypot submissions',async()=>{
    expect((await request(app).post('/api/v1/contact').send({...valid,_honey:'bot'})).status).toBe(400);
  });
  it('blocks anonymous inbox reads and updates',async()=>{
    expect((await request(app).get('/api/v1/contact/messages')).status).toBe(401);
    expect((await request(app).put('/api/v1/contact/messages/unknown').send({status:'read'})).status).toBe(401);
  });
  it('allows an authenticated administrator to read and mark a message',async()=>{
    await Admin.create({name:'Test Editor',email:'inbox@example.test',password:'Test-only-password-2026'});
    const login=await request(app).post('/api/v1/auth/admin/login').send({email:'inbox@example.test',password:'Test-only-password-2026'});
    const auth=`Bearer ${login.body.data.token}`;
    const saved=await ContactMessage.create(valid);
    const list=await request(app).get('/api/v1/contact/messages').set('Authorization',auth);
    expect(list.status).toBe(200);expect(list.headers['cache-control']).toBe('no-store');expect(list.body.data[0].id).toBe(saved.id);
    expect((await request(app).put(`/api/v1/contact/messages/${saved.id}`).set('Authorization',auth).send({status:'read',email:'changed@example.test'})).status).toBe(200);
    await saved.reload();expect(saved.status).toBe('read');expect(saved.email).toBe(valid.email);
  });
  it('reports storage failure without acknowledging delivery',async()=>{
    const mock=jest.spyOn(ContactMessage,'create').mockRejectedValueOnce(new Error('private database detail'));
    try {
      const response=await request(app).post('/api/v1/contact').send(valid);
      expect(response.status).toBe(503);expect(response.body.reference).toBeUndefined();
      expect(JSON.stringify(response.body)).not.toContain('private database detail');
    } finally {mock.mockRestore();}
  });
  it('rate limits repeated public submissions',async()=>{
    const response=await request(app).post('/api/v1/contact').send(valid);
    expect(response.status).toBe(429);
  });
});
