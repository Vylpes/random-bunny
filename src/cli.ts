#!/usr/bin/env node
import { Command, Option } from "commander";
import randomBunny from "./index";
import ICliOptions from "./contracts/ICliOptions";
import { exit } from "process";
import CliHelper from "./helpers/cliHelper";

const program = new Command();

program
    .name('random-bunny')
    .description('Get a random image url from a subreddit of your choosing')
    .version('2.4')
    .option('-s, --subreddit <subreddit>', 'The subreddit to search', 'rabbits')
    .option('-j, --json', 'Output as JSON')
    .option('-q, --query-metadata', 'Include query metadata in result')
    .option('-o <file>', 'Output to file')
    .addOption(new Option('--sort <sort>', 'Sort by').default('hot').choices(['hot', 'new', 'top']))
    .addOption(new Option('--limit <limit>', 'The amount of posts to fetch from the reddit api').default(100));

program.parse();

const options: ICliOptions = program.opts();

randomBunny(options.subreddit, options.sort, options.limit)
    .then((response) => exit(CliHelper.Endpoint(response, options)));