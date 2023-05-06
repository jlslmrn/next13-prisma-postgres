import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import validator from "validator";
import bcrypt from "bcrypt";
import * as jose from "jose";

const prisma = new PrismaClient();

export async function GET(req: Request, res: NextResponse) {
  return NextResponse.json(
    {
      hello: "This is Signin API!",
    },
    {
      status: 200,
    }
  );
}

export async function POST(req: Request, res: NextResponse) {
  console.log("SIGN IN REQUEST!");
  const errors: string[] = [];
  const body = await req.json();

  const validationSchema = [
    {
      valid: validator.isEmail(body.email),
      errorMessage: "Email is invalid",
    },
    {
      valid: validator.isLength(body.password, {
        min: 1,
      }),
      errorMessage: "Password is invalid",
    },
  ];

  validationSchema.forEach((check) => {
    if (!check.valid) {
      errors.push(check.errorMessage);
    }
  });

  if (errors.length) {
    return NextResponse.json({ errorMessage: errors }, { status: 400 });
  }

  const userWithEmail = await prisma.user.findUnique({
    where: {
      email: body.email,
    },
  });

  if (!userWithEmail) {
    return NextResponse.json(
      { errorMessage: "Email or password is invalid" },
      { status: 401 }
    );
  }

  const isMatch = await bcrypt.compare(body.password, userWithEmail.password);

  if (!isMatch) {
    return NextResponse.json(
      { errorMessage: "Email or password is invalid" },
      { status: 401 }
    );
  }

  const alg = "HS256";

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const token = await new jose.SignJWT({ email: userWithEmail.email })
    .setProtectedHeader({ alg })
    .setExpirationTime("24h")
    .sign(secret);

  return NextResponse.json({ token: token }, { status: 200 });

  //   return NextResponse.json(
  //     {
  //       message: "Unkown endpoint",
  //     },
  //     {
  //       status: 404,
  //     }
  //   );
}
