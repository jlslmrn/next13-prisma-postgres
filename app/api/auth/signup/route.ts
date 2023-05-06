import { NextRequest, NextResponse } from "next/server";
import validator from "validator";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import * as jose from "jose";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, res: NextResponse) {
  return NextResponse.json(
    {
      hello: "Please enter title!",
    },
    {
      status: 200,
    }
  );
}

export async function POST(req: Request, res: NextResponse) {
  const body = await req.json();

  const errors: string[] = [];

  const validationSchema = [
    {
      valid: validator.isLength(body.firstName, {
        min: 1,
        max: 20,
      }),
      errorMessage: "First name is invalid",
    },
    {
      valid: validator.isLength(body.lastName, {
        min: 1,
        max: 20,
      }),
      errorMessage: "Last Name is invalid",
    },
    {
      valid: validator.isEmail(body.email),
      errorMessage: "Email is invalid",
    },
    {
      valid: validator.isMobilePhone(body.phone),
      errorMessage: "Phone number is invalid",
    },
    {
      valid: validator.isLength(body.city, {
        min: 1,
      }),
      errorMessage: "City is invalid",
    },
    {
      valid: validator.isStrongPassword(body.password),
      errorMessage: "Password is not strong enough",
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

  if (userWithEmail) {
    return NextResponse.json(
      { errorMessage: "Email is associated with another account" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(body.password, 10);

  const user = await prisma.user.create({
    data: {
      first_name: body.firstName,
      last_name: body.lastName,
      password: hashedPassword,
      city: body.city,
      phone: body.phone,
      email: body.email,
    },
  });

  const alg = "HS256";

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const token = await new jose.SignJWT({ email: user.email })
    .setProtectedHeader({ alg })
    .setExpirationTime("24h")
    .sign(secret);

  return NextResponse.json({ token: token }, { status: 200 });
}
