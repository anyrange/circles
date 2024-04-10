import jwt from "jsonwebtoken";
import { env } from "@/config";

export const sign = (data: object) =>
  new Promise<string>((resolve, reject) => {
    jwt.sign(
      data,
      env.SPOTIFY_CLIENT_SECRET,
      { expiresIn: "7d" },
      (err, token) => {
        if (err) {
          return reject(err);
        }

        if (!token) {
          return reject("Empty token");
        }

        resolve(token);
      },
    );
  });

export const verify = <T>(token: string) =>
  new Promise<T>((resolve, reject) => {
    jwt.verify(token, env.SPOTIFY_CLIENT_SECRET, (err, decoded) => {
      if (err) {
        return reject(err);
      }

      if (!decoded) {
        return reject("Empty token");
      }

      resolve(decoded as T);
    });
  });
