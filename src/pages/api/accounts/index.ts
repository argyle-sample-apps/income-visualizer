import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { getAuthOpts } from "utils/auth";
import { Account } from "models/account";
import { getCookie } from "cookies-next";

async function getLinkItem(linkItemId: string) {
  const { headers } = getAuthOpts();

  const { data } = await axios.get("/link-items/" + linkItemId, {
    baseURL: process.env.NEXT_PUBLIC_ARGYLE_BASE_URL,
    headers,
  });

  return data;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = getCookie("argyle-x-user-id", { req, res });

  if (!userId) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const { headers } = getAuthOpts();

    const params = {
      user: userId,
    };

    const { data } = await axios.get("/accounts", {
      baseURL: process.env.NEXT_PUBLIC_ARGYLE_BASE_URL,
      headers,
      params,
    });

    const accounts = data.results;

    const linkItemIds = accounts.map((account: Account) => account.link_item);

    const linkItems = await Promise.all(linkItemIds.map(getLinkItem));

    const merged = accounts.map((account: Account) => ({
      ...account,
      link_item_details: linkItems.find(
        (linkItem) => linkItem.id === account.link_item
      ),
    }));

    res.status(200).json(merged);
  } catch (error) {
    res.status(400).json(error);
  }
}
