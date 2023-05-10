import { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import * as jose from "jose";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, res: NextResponse) {
  const bearerToken = req.headers.get("authorization");
  if (!bearerToken) {
    return NextResponse.json(
      {
        errorMessage: "Unauthorized request (bearer error)",
      },
      { status: 401 }
    );
  }
  const token = bearerToken.split(" ")[1] || "";

  const payload = jwt.decode(token) as { email: string };

  console.log('---- @SUCCESSFUL AUTHENTICATION');

  if (!payload.email) {
    return NextResponse.json(
      {
        errorMessage: "Unauthorized request (token not valid)",
      },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      city: true,
      phone: true,
    },
  });

  console.log('---- @DATA RETRIEVED SUCCESSFULLY');

  return NextResponse.json(
    {
      user: user,
    },
    {
      status: 200,
    }
  );
}

export async function POST(req: Request, res: NextResponse) {
  return NextResponse.json(
    {
      hello: "This is Signin API!",
    },
    {
      status: 200,
    }
  );
}
