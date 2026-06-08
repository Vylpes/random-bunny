import IReturnResult from "./contracts/IReturnResult";
import IRedditResult from "./contracts/IRedditResult";
import { List } from 'linqts';
import IFetchResult from "./contracts/IFetchResult";
import { ErrorCode } from "./constants/ErrorCode";
import ErrorMessages from "./constants/ErrorMessages";
import GalleryHelper from "./helpers/galleryHelper";
import RedditHelper from "./helpers/redditHelper";

export default async function randomBunny(subreddit: string, sortBy: "new" | "hot" | "top" = 'hot', limit: number = 100): Promise<IReturnResult> {
    if (limit < 1 || limit > 100) {
        return {
            IsSuccess: false,
            Query: {
                subreddit: subreddit,
                sortBy: sortBy,
                limit: limit,
            },
            Error: {
                Code: ErrorCode.LimitOutOfRange,
                Message: ErrorMessages.LimitOutOfRange,
            }
        };
    }

    const result = await RedditHelper.FetchListing(subreddit, sortBy, limit);

    if (!result) {
        return {
            IsSuccess: false,
            Query: {
                subreddit: subreddit,
                sortBy: sortBy,
                limit: limit,
            },
            Error: {
                Code: ErrorCode.FailedToFetchReddit,
                Message: ErrorMessages.FailedToFetchReddit,
            },
        }
    }

    const json = JSON.parse(result.body);

    if (!json) {
        return {
            IsSuccess: false,
            Query: {
                subreddit: subreddit,
                sortBy: sortBy,
                limit: limit,
            },
            Error: {
                Code: ErrorCode.UnableToParseJSON,
                Message: ErrorMessages.UnableToParseJSON,
            },
        }
    }

    const data: IFetchResult[] = json.data.children;

    const dataWithImages = new List<IFetchResult>(data)
        .Where(x => x!.data.url.includes('.jpg') || x!.data.url.includes('.png') || x!.data.is_gallery == true)
        .ToArray();

    let random = 0;

    if (dataWithImages.length == 0) {
        return {
            IsSuccess: false,
            Query: {
                subreddit: subreddit,
                sortBy: sortBy,
                limit: limit,
            },
            Error: {
                Code: ErrorCode.NoImageResultsFound,
                Message: ErrorMessages.NoImageResultsFound,
            },
        };
    } else {
        random = Math.floor((Math.random() * (dataWithImages.length - 1)) + 0); // Between 0 and (size - 1)
    }

    const randomSelect = dataWithImages[random];

    const randomData = randomSelect.data;

    let gallery: string[] = [];

    if (randomData.is_gallery == true) {
        gallery = GalleryHelper.GetImageUrls(randomData);
    }

    if (gallery.length == 0) {
        gallery = [randomData.url];
    }

    const url = gallery[0];

    const redditResult: IRedditResult = {
        Author: randomData['author'],
        Archived: randomData['archived'],
        Downs: randomData['downs'],
        Hidden: randomData['hidden'],
        Permalink: randomData['permalink'],
        Subreddit: randomData['subreddit'],
        SubredditSubscribers: randomData['subreddit_subscribers'],
        Title: randomData['title'],
        Ups: randomData['ups'],
        Url: url,
        Gallery: gallery,
    };

    return {
        IsSuccess: true,
        Query: {
            subreddit: subreddit,
            sortBy: sortBy,
            limit: limit,
        },
        Result: redditResult
    };
}
