export interface IListingResponse {
    body: string;
}

export default class RedditHelper {
    public static readonly UserAgent = "web:random-bunny:v2.4.2 (by /u/vylpes)";

    public static async FetchListing(
        subreddit: string,
        sortBy: "new" | "hot" | "top",
        limit: number,
    ): Promise<IListingResponse | null> {
        const headers = { "User-Agent": RedditHelper.UserAgent };

        try {
            const session = await fetch(`https://old.reddit.com/r/${subreddit}/${sortBy}/`, { headers });
            const cookieHeader = RedditHelper.GetCookieHeader(session.headers.getSetCookie());
            const listing = await fetch(`https://old.reddit.com/r/${subreddit}/${sortBy}.json?limit=${limit}`, {
                headers: {
                    ...headers,
                    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
                },
            });

            if (!listing.ok) {
                return null;
            }

            return { body: await listing.text() };
        } catch {
            return null;
        }
    }

    private static GetCookieHeader(setCookieHeaders: string[]): string | undefined {
        if (setCookieHeaders.length === 0) {
            return undefined;
        }

        return setCookieHeaders.map((cookie) => cookie.split(";")[0]).join("; ");
    }
}
