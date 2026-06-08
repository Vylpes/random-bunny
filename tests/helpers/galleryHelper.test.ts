import IFetchResult from "../../src/contracts/IFetchResult";
import GalleryHelper from "../../src/helpers/galleryHelper";

function createGalleryPost(overrides: Partial<IFetchResult["data"]> = {}): IFetchResult["data"] {
    return {
        archived: false,
        author: "author",
        downs: 0,
        hidden: false,
        permalink: "/r/Rabbits/comments/test/gallery/",
        subreddit: "Rabbits",
        subreddit_subscribers: 1,
        title: "Gallery post",
        ups: 1,
        url: "https://i.redd.it/gallery/test",
        ...overrides,
    };
}

describe("GetImageUrls", () => {
    test("GIVEN gallery metadata is present, EXPECT decoded preview urls to be returned", () => {
        const post = createGalleryPost({
            gallery_data: {
                items: [
                    { media_id: "media_1" },
                    { media_id: "media_2" },
                ],
            },
            media_metadata: {
                media_1: {
                    s: {
                        u: "https://preview.redd.it/image-1.jpg?width=640&amp;crop=smart&amp;s=1",
                    },
                },
                media_2: {
                    s: {
                        u: "https://preview.redd.it/image-2.jpg?width=640&amp;s=2",
                    },
                },
            },
        });

        const result = GalleryHelper.GetImageUrls(post);

        expect(result).toEqual([
            "https://preview.redd.it/image-1.jpg?width=640&crop=smart&s=1",
            "https://preview.redd.it/image-2.jpg?width=640&s=2",
        ]);
    });

    test("GIVEN gallery_data is missing, EXPECT empty array", () => {
        const post = createGalleryPost({
            media_metadata: {
                media_1: {
                    s: {
                        u: "https://preview.redd.it/image-1.jpg",
                    },
                },
            },
        });

        expect(GalleryHelper.GetImageUrls(post)).toEqual([]);
    });

    test("GIVEN media_metadata is missing, EXPECT empty array", () => {
        const post = createGalleryPost({
            gallery_data: {
                items: [{ media_id: "media_1" }],
            },
        });

        expect(GalleryHelper.GetImageUrls(post)).toEqual([]);
    });

    test("GIVEN one gallery item is missing metadata, EXPECT only valid urls to be returned", () => {
        const post = createGalleryPost({
            gallery_data: {
                items: [
                    { media_id: "present" },
                    { media_id: "missing" },
                ],
            },
            media_metadata: {
                present: {
                    s: {
                        u: "https://preview.redd.it/partial.jpg?width=640&amp;s=1",
                    },
                },
            },
        });

        expect(GalleryHelper.GetImageUrls(post)).toEqual([
            "https://preview.redd.it/partial.jpg?width=640&s=1",
        ]);
    });

    test("GIVEN url contains other html entities, EXPECT them to be decoded", () => {
        const post = createGalleryPost({
            gallery_data: {
                items: [{ media_id: "media_1" }],
            },
            media_metadata: {
                media_1: {
                    s: {
                        u: "https://preview.redd.it/test.jpg?a=&lt;1&amp;b=&gt;2",
                    },
                },
            },
        });

        expect(GalleryHelper.GetImageUrls(post)).toEqual([
            "https://preview.redd.it/test.jpg?a=<1&b=>2",
        ]);
    });
});
