import IFetchResult from "../contracts/IFetchResult";

export default class GalleryHelper {
    public static GetImageUrls(post: IFetchResult["data"]): string[] {
        if (!post.gallery_data?.items?.length || !post.media_metadata) {
            return [];
        }

        return post.gallery_data.items
            .map((item) => {
                const metadata = post.media_metadata?.[item.media_id];

                return GalleryHelper.ConvertRedditUrl(metadata?.s?.u);
            })
            .filter((url): url is string => !!url);
    }

    private static ConvertRedditUrl(url?: string): string | undefined {
        if (!url) {
            return undefined;
        }

        return url
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">");
    }
}
