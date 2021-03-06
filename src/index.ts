import 'reflect-metadata';
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroConfig from "./mikro-orm.config";
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema} from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from './resolvers/user';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';

const main = async () => {
    const orm = await MikroORM.init(mikroConfig);
    await orm.getMigrator().up()

    const app = express();

    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient({ legacyMode: true });
    redisClient.connect().catch(console.error);

    app.use(
        session({
          store: new RedisStore({ client: redisClient }),
          saveUninitialized: false,
          secret: "keyboard cat",
          resave: false,
        })
      )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: () => ({ em: orm.em })
    })

    apolloServer.applyMiddleware({ app });

    app.listen(4000 , () => {
        console.log('Listening on port 4000');
    })

}

main()
