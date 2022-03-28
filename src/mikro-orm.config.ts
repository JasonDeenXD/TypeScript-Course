import { Options } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import path from 'path';
import { User } from "./entities/User";

const config: Options = {
    migrations: {
        path: path.join(__dirname, "./migrations"),
    },
    entities: [Post, User],
    dbName: "lireddit",
    user: "jason",
    password: "71621",
    type: "postgresql",
    debug: !__prod__,
    allowGlobalContext: true
};
export default config;