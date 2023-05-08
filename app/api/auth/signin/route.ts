import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import validator from "validator";
import bcrypt from "bcrypt";
import * as jose from "jose";
import { setCookie } from "cookies-next";
import { NextApiRequest, NextApiResponse } from "next";

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

export async function POST(req: Request, res: NextApiResponse) {
  console.log("SIGN IN REQUEST!");
  const errors: string[] = [];
  const body = await req.json();

  const validationSchema = [
    {
      valid: validator.isEmail(body.email),
      errorMessage: "Email or password is invalid",
    },
    {
      valid: validator.isLength(body.password, {
        min: 1,
      }),
      errorMessage: "Email or Password is invalid",
    },
  ];

  validationSchema.forEach((check) => {
    if (!check.valid) {
      errors.push(check.errorMessage);
    }
  });

  if (errors.length) {
    return NextResponse.json({ errorMessage: "Unauthorized" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
    },
  });

  if (!user) {
    return NextResponse.json(
      { errorMessage: "Email or password is invalid" },
      { status: 401 }
    );
  }

  const isMatch = await bcrypt.compare(body.password, user.password);

  if (!isMatch) {
    return NextResponse.json(
      { errorMessage: "Email or password is invalid" },
      { status: 401 }
    );
  }

  const alg = "HS256";

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const token = await new jose.SignJWT({ email: user.email })
    .setProtectedHeader({ alg })
    .setExpirationTime("24h")
    .sign(secret);

  //setCookie("jwt", token, { maxAge: 60 * 6 * 24 });

  const userJSON = {
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    phone: user.phone,
    city: user.city,
  };

  return NextResponse.json(userJSON, {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "Set-Cookie": `jwt=${token}; Max-Age=8640; Path=/`,
    },
  });

  //   return NextResponse.json(
  //     {
  //       message: "Unkown endpoint",
  //     },
  //     {
  //       status: 404,
  //     }
  //   );
}
