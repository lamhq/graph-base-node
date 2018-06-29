const {
  request,
  expect,
  getApiToken,
} = require('./common');

// test api refresh token
describe('POST /api/v1/tokens', () => {
  it('should return new api token', async () => {
    const token = await getApiToken();
    await request
      .post('/api/v1/tokens')
      .set('Authorization', `bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((resp) => {
        const result = JSON.parse(resp.text);
        expect(result).to.be.an('object');
        expect(result).to.have.property('token');
      });
  });
});
