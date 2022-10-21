import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthOpts } from "utils/auth";
import axios from "axios";
import { z } from "zod";
import { getCookie } from "cookies-next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = getCookie("argyle-x-user-id", { req, res });

  if (!userId) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const { year } = z
      .object({
        year: z.string(),
      })
      .parse(req.query);

    const { headers } = getAuthOpts();

    const params = {
      user: userId,
    };

    const { data } = await axios.get("/income/payouts/" + year, {
      baseURL: "https://bff.argyle.com",
      headers: {
        ...headers,
        "x-argyle-is-sandbox": "true",
      },
      params,
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(400).json(error);
  }
}
