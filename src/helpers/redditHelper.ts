import fetch from "got-cjs";

export default class RedditHelper {
    public static readonly UserAgent = "web:random-bunny:v2.4.1 (by /u/vylpes)";

    public static async FetchListing(
        subreddit: string,
        sortBy: "new" | "hot" | "top",
        limit: number,
    ) {
        const headers = { "User-Agent": RedditHelper.UserAgent };

        try {
            const session = await fetch(`https://old.reddit.com/r/${subreddit}/${sortBy}/`, {
                throwHttpErrors: false,
                headers,
            });

            const cookieHeader = RedditHelper.GetCookieHeader(session.headers["set-cookie"]);
            const listing = await fetch(`https://old.reddit.com/r/${subreddit}/${sortBy}.json?limit=${limit}`, {
                throwHttpErrors: false,
                headers: {
                    ...headers,
                    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
                },
            });

            if (listing.statusCode != 200) {
                return null;
            }

            return listing;
        } catch {
            return null;
        }
    }

    private static GetCookieHeader(setCookieHeaders: string | string[] | undefined): string | undefined {
        if (!setCookieHeaders) {
            return undefined;
        }

        const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];

        return headers.map((cookie) => cookie.split(";")[0]).join("; ");
    }
}
