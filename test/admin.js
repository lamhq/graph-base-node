const {
  request,
  expect,
  getApiToken,
} = require('./common');
const { createToken: createPasswordResetToken } = require('../modules/common/helpers');

// test api login
describe('POST /api/v1/admin/session', () => {
  it('should return token when login success', async () => {
    await request
      .post('/api/v1/admin/session')
      .send({
        loginId: 'demo@example.com',
        password: '123123',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((resp) => {
        const result = JSON.parse(resp.text);
        expect(result).to.have.property('token');
        expect(result).to.have.property('username');
      });
  });
});

// test api get account information
describe('GET /api/v1/admin/account', () => {
  it('should return profile data', async () => {
    const token = await getApiToken();
    await request
      .get('/api/v1/admin/account')
      .set('Authorization', `bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((resp) => {
        const result = JSON.parse(resp.text);
        expect(result).to.have.property('username');
      });
  });
});

// test api update account information
describe('PUT /api/v1/admin/account', () => {
  it('should return updated profile data', async () => {
    const token = await getApiToken();
    await request
      .put('/api/v1/admin/account')
      .set('Authorization', `bearer ${token}`)
      .send({
        email: 'admin@m.mm',
        username: 'admin1',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((resp) => {
        const result = JSON.parse(resp.text);
        expect(result).to.have.property('username');
        expect(result.username).to.equal('admin1');
      });
  });
});

// test api request reset password
describe('POST /api/v1/admin/password-reset/request', () => {
  it('should send email when request reset password', async () => {
    await request
      .post('/api/v1/admin/password-reset/request')
      .send({
        email: 'demo@example.com',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((resp) => {
        const result = JSON.parse(resp.text);
        expect(result).to.have.property('message');
      });
  });
});

// test api reset password
describe('PUT /api/v1/admin/password', () => {
  it('should update user\'s password with new password', async () => {
    const token = createPasswordResetToken({ _id: '59b39bcf538ff606c04d12db' }, '10m');
    await request
      .put('/api/v1/admin/password')
      .send({
        token: token.value,
        password: '123123',
        verify: '123123',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((resp) => {
        const result = JSON.parse(resp.text);
        expect(result).to.have.property('message');
      });
  });
});
