import { User } from "../entities/User";
import { MyContext } from "../types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver } from "type-graphql";
import argon2 from "argon2"; 

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class UserResonse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver()
export class UserResolver {
    @Mutation(() => UserResonse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em }: MyContext
    ): Promise<UserResonse> {
        if (options.username.length <= 2) {
            return {
                errors: [{ field: 'username', message: 'length must be greater than 2' }]
            }
        }

        if (options.password.length <= 3) {
            return {
                errors: [{ field: 'password', message: 'length must be greater than 3' }]
            }
        }

        const hashedPassword = await argon2.hash(options.password);
        const user = em.create(User, { username: options.username, password: hashedPassword });
        try {
            await em.persistAndFlush(user);
        } catch (err) {
            if (err.code === '23505') {
                return {
                    errors: [{ field: 'username', message: 'username already taken' }]
                }
            }
        }
        return { user };
    }

    @Mutation(() => UserResonse)
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em }: MyContext
    ): Promise<UserResonse> {
        const user = await em.findOne(User, { username: options.username });
        if (!user) {
            return {
                errors: [{ field: 'username', message: 'that username does not exist' }]  
            }
        }
        const valid = await argon2.verify(user.password, options.password);
        if (!valid) {
            return {
                errors: [{ field: 'password', message: 'incorrect password' }]
            }
        }

        return { user };
    }
}