import ICliOptions from "../contracts/ICliOptions";
import IReturnResult from "../contracts/IReturnResult";

export default class OutputHelper {
    public static GenerateOutput(response: IReturnResult, options: ICliOptions): string {
        const result = response.Result!;

        let outputObject = {};

        outputObject = { ...result };

        if (options.queryMetadata) {
            outputObject = { ...outputObject, Query: { ...response.Query } }
        }

        if (options.json) {
            return JSON.stringify(outputObject);
        }

        return this.GetFriendlyObjectText(outputObject);
    }

    private static GetFriendlyObjectText<T>(object: T, indent: string = ''): string {
        const output: string[] = [];

        for (const key in object) {
            if (typeof object[key] === 'object' && object[key] !== null) {
                output.push(`${indent}${key}:`);
                output.push(this.GetFriendlyObjectText(object[key], indent + '  '));
            } else {
                output.push(`${indent}${key} = ${object[key]}`);
            }
        }

        return output.join("\n");
    }
}