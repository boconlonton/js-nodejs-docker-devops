const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const redis = require("redis");
const cors = require("cors");
let RedisStore = require("connect-redis")(session);

const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  REDIS_URL,
  REDIS_PORT,
  SESSION_SECRET,
} = require("./config/config");

const redisClient = redis.createClient({
  url: `redis://${REDIS_URL}:${REDIS_PORT}`,
  legacyMode: true,
});

redisClient.on("connect", () => console.log("Connected to Redis"));
redisClient.on("error", (err) => console.log("Redis Client Error"));
redisClient.connect();

const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

// Retry until the mongodb is ready
const connectWithRetry = async () => {
  mongoose
    .connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("successfully connected to DB"))
    .catch((e) => {
      console.log(e);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

// Middleware for storing session
app.enable("trust proxy");
// CORS
app.use(cors({}));
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 30000,
    },
  })
);

// Middleware for parsing Request Body
app.use(express.json());

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on port ${port}`));
