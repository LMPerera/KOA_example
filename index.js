const Koa = require("koa");
const Router = require("koa-router");
const BodyParser = require("koa-bodyparser");
const logger = require('koa-logger');
require("./mongo")(app);
const ObjectID = require("mongodb").ObjectID;
const jwt = require("./jwt");

// Create a new securedRouter
const router = new Router();
const securedRouter = new Router();

const app = new Koa();
const router = new Router();

// Use the bodyparser middlware
app.use(BodyParser());
app.use(logger());
app.use(require("./jwt"));
app.use(jwt.errorHandler()).use(jwt.jwt());

// Add the securedRouter to our app as well
app.use(router.routes()).use(router.allowedMethods());
app.use(securedRouter.routes()).use(securedRouter.allowedMethods());

router.get("/", async function (ctx) {
    ctx.body = {message: "Hello World!"}
});

router.get("/", async function (ctx) {
    let name = ctx.request.query.name || "World";
    ctx.body = {message: `Hello ${name}!`}
});

// List all people
router.get("/people", async (ctx) => {
    ctx.body = await ctx.app.people.find().toArray();
});

// Create new person
router.post("/people", async (ctx) => {
    ctx.body = await ctx.app.people.insert(ctx.request.body);
});

// Get one
router.get("/people/:id", async (ctx) => {
    ctx.body = await ctx.app.people.findOne({"_id": ObjectID(ctx.params.id)});
});

// Update one
router.put("/people/:id", async (ctx) => {
    let documentQuery = {"_id": ObjectID(ctx.params.id)}; // Used to find the document
    let valuesToUpdate = ctx.request.body;
    ctx.body = await ctx.app.people.updateOne(documentQuery, valuesToUpdate);
});

// Delete one
router.delete("/people/:id", async (ctx) => {
    let documentQuery = {"_id": ObjectID(ctx.params.id)}; // Used to find the document
    ctx.body = await ctx.app.people.deleteOne(documentQuery);
});

// Apply JWT middleware to secured router only
securedRouter.use(jwt.errorHandler()).use(jwt.jwt());

// List all people
securedRouter.get("/people", async (ctx) => {
    ctx.body = await ctx.app.people.find().toArray();
});

// Create new person
securedRouter.post("/people", async (ctx) => {
    ctx.body = await ctx.app.people.insert(ctx.request.body);
});

// Get one
securedRouter.get("/people/:id", async (ctx) => {
    ctx.body = await ctx.app.people.findOne({"_id": ObjectID(ctx.params.id)});
});

// Update one
securedRouter.put("/people/:id", async (ctx) => {
    let documentQuery = {"_id": ObjectID(ctx.params.id)}; // Used to find the document
    let valuesToUpdate = ctx.request.body;
    ctx.body = await ctx.app.people.updateOne(documentQuery, valuesToUpdate);
});

// Delete one
securedRouter.delete("/people/:id", async (ctx) => {
    let documentQuery = {"_id": ObjectID(ctx.params.id)}; // Used to find the document
    ctx.body = await ctx.app.people.deleteOne(documentQuery);
});

router.post("/auth", async (ctx) => {
    let username = ctx.request.body.username;
    let password = ctx.request.body.password;

    if (username === "user" && password === "pwd") {
        ctx.body = {
            token: jwt.issue({
                user: "user",
                role: "admin"
            })
        }
    } else {
        ctx.status = 401;
        ctx.body = {error: "Invalid login"}
    }
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3001);