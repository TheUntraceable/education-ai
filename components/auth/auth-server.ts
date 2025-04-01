import type {
    GetServerSidePropsContext,
    NextApiRequest,
    NextApiResponse,
} from "next";

import { getServerSession } from "next-auth";

import { authOptions as config } from "@/lib/utils/auth-options";
export function auth(
    ...args:
        | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
        | [NextApiRequest, NextApiResponse]
        | []
) {
    return getServerSession(...args, config);
}
