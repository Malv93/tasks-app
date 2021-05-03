const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");

const { userOneId, userOne, setupDatabase } = require("./fixtures/db");

beforeEach(setupDatabase);

test("Should signup a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Luca",
      email: "luca@example.com",
      password: "lucapass",
    })
    .expect(201);

  //Assert that the database was changed correctly
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  //Assertion about the response
  //response.body must contain at least these properties
  expect(response.body).toMatchObject({
    user: {
      name: "Luca",
      email: "luca@example.com",
    },
    token: user.tokens[0].token,
  });
  //it must not have stored the plane text password
  expect(user.password).not.toBe("lucapass");
});

test("Should login existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  //Assert the user is in the database
  const user = await User.findById(userOneId);
  expect(user).not.toBe(null);

  //Assert the token in response matches user's second token
  expect(response.body.token).toBe(user.tokens[1].token);
});

test("SHould not login nonexisting user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: "nonexistentpass",
    })
    .expect(400);
});

test("Should get profile for user", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should not get profile for unauthenticated user", async () => {
  await request(app).get("/users/me").send().expect(401);
});

test("Should delete account for user", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test("Should not delete account for unauthenticated user", async () => {
  await request(app).delete("/users/me").send().expect(401);
});

test("Should upload avatar image", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/profile-pic.jpg")
    .expect(200);

  const user = await User.findById(userOneId);
  //toBe use ===, so it must be the same object in memory
  //toEqual compares properties values

  //expect avatar to be a buffer
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("Should update valid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ name: "Alejandro" })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.name).toBe("Alejandro");
});

test("Should not update invalid user fileds", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ location: "Soresina" })
    .expect(400);
});
