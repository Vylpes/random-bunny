import IReturnResult from "./contracts/IReturnResult.js";
import IRedditResult from "./contracts/IRedditResult.js";
import fetch from "got-cjs";
import { List } from 'linqts';
import IFetchResult from "./contracts/IFetchResult.js";

const sortable = [
    'new',
    'hot',
    'top'
];

export default async function randomBunny(subreddit: string, sortBy?: string): Promise<IReturnResult> {
    if (!sortBy || !sortable.includes(sortBy)) sortBy = 'hot';

    const result = await fetch(`https://reddit.com/r/${subreddit}/${sortBy}.json`);

    if (!result) {
        return {
            IsSuccess: false
        }
    }

    const json = JSON.parse(result.body);

    if (!json) {
        return {
            IsSuccess: false
        }
    }

    const data: IFetchResult[] = json.data.children;

    const dataWithImages = new List<IFetchResult>(data)
        .Where(x => x!.data.url.includes('.jpg') || x!.data.url.includes('.png'))
        .ToArray();

    let random = 0;

    if (dataWithImages.length == 0) {
        return {
            IsSuccess: false,
        };
    } else {
        random = Math.floor((Math.random() * (dataWithImages.length - 1)) + 0); // Between 0 and (size - 1)
    }

    const randomSelect = dataWithImages[random];

    const randomData = randomSelect.data;

    const redditResult: IRedditResult = {
        Archived: randomData['archived'],
        Downs: randomData['downs'],
        Hidden: randomData['hidden'],
        Permalink: randomData['permalink'],
        Subreddit: randomData['subreddit'],
        SubredditSubscribers: randomData['subreddit_subscribers'],
        Title: randomData['title'],
        Ups: randomData['ups'],
        Url: randomData['url']
    };

    return {
        IsSuccess: true,
        Result: redditResult
    };
}