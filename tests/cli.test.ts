import { exec } from "child_process";
import path from "path";

describe('default', () => {
    test('GIVEN no options are supplied, EXPECT standard output', async () => {
        const result = await cli([], '.');

        const keys = result.stdout.split('\n')
            .flatMap(x => x.split(' = ')[0])
            .filter(x => x && x.length > 0);
        const values = result.stdout.split('\n')
            .flatMap(x => x.split(' = ')[1])
            .filter(x => x && x.length > 0);


        expect(result.code).toBe(0);
        expect(keys).toStrictEqual(['Archived', 'Downvotes', 'Hidden', 'Permalink', 'Subreddit', 'Subreddit Subscribers', 'Title', 'Upvotes', 'Url']);
        expect(values.length).toBe(9);
    }, 5000);

    test('GIVEN an error occurs, EXPECT error output', async () => {
        const result = await cli(['-s', 'textonly'], '.');

        expect(result.code).toBe(1);
        expect(result.stderr).toBeDefined();
    }, 5000);
});

describe('version', () => {
    test('GIVEN -V flag is supplied, EXPECT version returned', async () => {
        const result = await cli(['-V'], '.');

        expect(result.code).toBe(0);
        expect(result.stdout).toBe('2.2\n');
    });

    test('GIVEN --version is supplied, EXPECT version returned', async () => {
        const result = await cli(['--version'], '.');

        expect(result.code).toBe(0);
        expect(result.stdout).toBe('2.2\n');
    });
});

describe('help', () => {
    test('GIVEN -h is supplied, EXPECT help returned', async () => {
        const result = await cli(['-h'], '.');

        expect(result.code).toBe(0);
        expect(result.stdout.split('\n')[0]).toBe('Usage: random-bunny [options]');
    });

    test('GIVEN --help is supplied, EXPECT help returned', async () => {
        const result = await cli(['--help'], '.');

        expect(result.code).toBe(0);
        expect(result.stdout.split('\n')[0]).toBe('Usage: random-bunny [options]');
    });
});

describe('subreddit', () => {
    test('GIVEN -s is not supplied, EXPECT subreddit to be defaulted', async () => {
        const result = await cli([], '.');

        const subreddit = result.stdout.split('\n')
            .find(x => x && x.length > 0 && x.split(' = ')[0] == 'Subreddit')!
            .split(' = ')[1];

        expect(subreddit).toBe('Rabbits');
    }, 5000);

    test('GIVEN -s is supplied, EXPECT subreddit to be changed', async () => {
        const result = await cli(['-s', 'pics'], '.');

        const subreddit = result.stdout.split('\n')
            .find(x => x && x.length > 0 && x.split(' = ')[0] == 'Subreddit')!
            .split(' = ')[1];

        expect(subreddit).toBe('pics');
    }, 5000);

    test('GIVEN --subreddit is supplied, EXPECT subreddit to be changed', async () => {
        const result = await cli(['--subreddit', 'pics'], '.');

        const subreddit = result.stdout.split('\n')
            .find(x => x && x.length > 0 && x.split(' = ')[0] == 'Subreddit')!
            .split(' = ')[1];

        expect(subreddit).toBe('pics');
    }, 5000);
});

describe('json', () => {
    test('GIVEN -j is supplied, EXPECT output to be valid JSON', async () => {
        const result = await cli(['-j'], '.');

        const json = JSON.parse(result.stdout);

        expect(json).toBeDefined();
    }, 5000);

    test('GIVEN --json is supplied, EXPECT output to be valid JSON', async () => {
        const result = await cli(['--json'], '.');

        const json = JSON.parse(result.stdout);

        expect(json).toBeDefined();
    }, 5000);
});

describe('sort', () => {
    test('GIVEN --sort is not supplied, EXPECT sort to be defaulted', async () => {
        const result = await cli(['-q'], '.');

        const sortBy = result.stdout.split('\n')
            .find(x => x && x.length > 0 && x.split(' = ')[0] == 'Query.Sort By')!
            .split(' = ')[1];

        expect(sortBy).toBe('hot');
    }, 5000);

    test('GIVEN --sort is supplied WITH a valid input, EXPECT sort to be used', async () => {
        const result = await cli(['-q', '--sort', 'new'], '.');

        const sortBy = result.stdout.split('\n')
            .find(x => x && x.length > 0 && x.split(' = ')[0] == 'Query.Sort By')!
            .split(' = ')[1];

        expect(sortBy).toBe('new');
    }, 5000);

    test('GIVEN --sort is supplied WITH an invalid input, EXPECT error', async () => {
        const result = await cli(['-q', '--sort', 'invalid'], '.');

        expect(result.code).toBe(1);
        expect(result.stderr).toBe("error: option '--sort <sort>' argument 'invalid' is invalid. Allowed choices are hot, new, top.\n");
    }, 5000);
});

describe('query-metadata', () => {
    test('GIVEN --query-metadata is not supplied, EXPECT no query metadata returned', async () => {
        const result = await cli([], '.');

        const query = result.stdout.split('\n')
            .find(x => x && x.length > 0 && x.split(' = ')[0].startsWith('Query'));

        expect(query).toBeUndefined();
    }, 5000);

    test('GIVEN --query-metadata is supplied, EXPECT query metadata returned', async () => {
        const result = await cli(['--query-metadata'], '.');

        const query = result.stdout.split('\n')
            .find(x => x && x.length > 0 && x.split(' = ')[0].startsWith('Query'));

        expect(query).toBeDefined();
    }, 5000);

    test('GIVEN -q is supplied, EXPECT query metadata returned', async () => {
        const result = await cli(['-q'], '.');

        const query = result.stdout.split('\n')
            .find(x => x && x.length > 0 && x.split(' = ')[0].startsWith('Query'));

        expect(query).toBeDefined();
    }, 5000);
});

function cli(args: string[], cwd: string): Promise<cliResult> {
    return new Promise(resolve => {
        exec(`node ${path.resolve('./dist/cli.js')} ${args.join(' ')}`,
        { cwd },
        (error, stdout, stderr) => { resolve({
            code: error && error.code ? error.code : 0,
            error,
            stdout,
            stderr });
        });
    });
}

interface cliResult {
    code: number,
    error: any,
    stdout: string,
    stderr: string,
}