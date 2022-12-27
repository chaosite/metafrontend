import fs from 'fs';
import path from 'path';
import {parseDot} from './graphlib';

type MasterQuery = any;
export type DotJson = any;
export type Matches = Array<Array<{ vertexName: String }>>;

export type Result = {
    color: string,
    selected: number,
    matches: Matches
}

export class CompositeQuery {
    masterQuery: MasterQuery;
    subqueries: Map<String, DotJson>;
    subqueryResults: Map<String, Result>;

    constructor(masterQuery: MasterQuery, subqueries: Map<String, DotJson>, subqueryResults: Map<String, Result>) {
        this.masterQuery = masterQuery;
        this.subqueries = subqueries;
        this.subqueryResults = subqueryResults
    }

    static async open(masterFilename: string, subqueryDir: string, subqueryResultsDir: string) {
        const puzzleJson = JSON.parse(fs.readFileSync(masterFilename, "utf-8"));
        const subqueries = await Promise.all(fs.readdirSync(subqueryDir).map(
            async filename =>
                [filename.replace(/\.dot$/, ""),
                    await parseDot(fs.readFileSync(path.join(subqueryDir, filename),
                        "utf-8"))] as [String, DotJson]
        ));
        const subqueryResults = fs.readdirSync(subqueryResultsDir).map(
            filename =>
                [filename.replace(/\.json$/, ""),
                    {
                        matches: JSON.parse(fs.readFileSync(path.join(subqueryResultsDir, filename),
                            "utf-8")),
                        color: "red",
                        selected: 0
                    }] as [String, Result]
        );

        return new CompositeQuery(puzzleJson, new Map(subqueries), new Map(subqueryResults));
    }

}
