import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import jwt from "jsonwebtoken";
import next from "next/types";

 //const JWT_SECRET="ewqhjlelwqh3h2l13($eqweqwdsagdsjlkfdsncva312##$!!#EwqeqdsaRFQARQW3421)"

export async function middleware(req: NextRequest) {
  console.log(process.env.JWT_SECRET, '------ @THIS IS MIDDLEWARE')
  const bearerToken = req.headers.get("authorization") as string;

  if (!bearerToken) {
    return NextResponse.json(
      {
        errorMessage: "Unauthorized request (bearer error)",
      },
      { status: 401 }
    );
  }

  const token = bearerToken.split(" ")[1] || "";

  if (!token) {
    return NextResponse.json(
      {
        errorMessage: "Unauthorized request (missing token)",
      },
      { status: 401 }
    );
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  try {
    await jose.jwtVerify(token, secret);
  } catch (error) {
    return NextResponse.json(
      {
        errorMessage: secret,
      },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ["/api/auth/me"],
  unstable_allowDynamic: [
    // allows a single file
    "/lib/utilities.js",
    // use a glob to allow anything in the function-bind 3rd party module
    "/node_modules/function-bind/**",
  ],
};