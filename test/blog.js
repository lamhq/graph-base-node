const { request, expect, getApiToken } = require('./common')

var post = null

describe('POST /api/admin/posts', function () {
  it('should return added post data', async function () {
    var token = await getApiToken()
    await request
      .post('/api/admin/posts')
      .set('Authorization', `bearer ${token}`)
      .send({
        'title': 'new post',
        'content': 'new post\' content',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(resp => {
        var result = JSON.parse(resp.text)
        expect(result).to.have.property('title')
        expect(result.title).to.equal('new post')
        expect(result).to.have.property('_id')
        post = result
      })
  })
})

describe('GET /api/admin/posts/:id', function () {
  it('should return post data', async function () {
    var token = await getApiToken()
    await request
      .get(`/api/admin/posts/${post._id}`)
      .set('Authorization', `bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(resp => {
        var result = JSON.parse(resp.text)
        expect(result).to.have.property('_id')
        expect(result._id).to.equal(post._id)
      })
  })
})

describe('GET /api/admin/posts', function () {
  it('should return an array of posts', async function () {
    var token = await getApiToken()
    await request
      .get('/api/admin/posts')
      .set('Authorization', `bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(resp => {
        var result = JSON.parse(resp.text)
        expect(result).to.be.an('array')
        expect(result.length).to.not.equal(0)
      })
  })
})

describe('PUT /api/admin/posts/:id', function () {
  it('should return updated post data', async function () {
    var token = await getApiToken()
    await request
      .put(`/api/admin/posts/${post._id}`)
      .set('Authorization', `bearer ${token}`)
      .send({
        'title': 'updated post',
        'content': 'updated content',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(resp => {
        var result = JSON.parse(resp.text)
        expect(result).to.have.property('title')
        expect(result.title).to.equal('updated post')
      })
  })
})

describe('DELETE /api/admin/posts/:id', function () {
  it('should return data of deleted post', async function () {
    var token = await getApiToken()
    await request
      .delete(`/api/admin/posts/${post._id}`)
      .set('Authorization', `bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(resp => {
        var result = JSON.parse(resp.text)
        expect(result).to.have.property('title')
        expect(result.title).to.equal('updated post')
      })
  })
})

describe('GET /api/admin/posts', function () {
  it('should return 401 status when getting posts without token', async function () {
    await request
      .get('/api/admin/posts')
      .expect(401)
  })
})