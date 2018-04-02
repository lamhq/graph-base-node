const { request, expect, getApiToken } = require('./common');

describe.only('POST /api/v1/admin/session', () => {
  it('should return token when login success', async () => {
    await request
      .post('/api/v1/admin/session')
      .send({
        loginId: 'demo',
        password: 'demo',
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

describe('PUT /api/v1/admin/session', function () {
  it('should return updated profile data', async function () {
    var token = await getApiToken()
    await request
      .put('/api/v1/admin/account')
      .set('Authorization', `bearer ${token}`)
      .send({
        'email': 'admin@m.mm',
        'username': 'admin1',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(resp => {
        var result = JSON.parse(resp.text)
        expect(result).to.have.property('username')
        expect(result.username).to.equal('admin1')
      })
  })
})

// test api: request reset password
describe('POST /api/v1/admin/password-reset/request', function () {
  this.timeout(10000);
  it('should send email when request reset password', async function () {
    var token = await getApiToken();
    await request
      .post('/api/v1/admin/password-reset/request')
      .set('Authorization', `bearer ${token}`)
      .send({
        email: 'demo@example.com',
      })
      .expect('Content-Type', /json/)
      // .expect(200)
      .expect(resp => {
        var result = JSON.parse(resp.text)
        console.log(result)
      })
  })
});

// test api: reset password
describe('PUT /api/v1/ci/admin/password', function () {
  it('should update user\'s password with new password', function (done) {
    var token = createToken({ _id: '59b39bcf538ff606c04d12db' }, '10m')
    request
      .put('/api/v1/ci/admin/password')
      .send({
        token: token.value,
        password: '123123',
        verify: '123123',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(done)
  })
});