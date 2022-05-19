import fs from 'fs';
import path from 'path';
import { parseDot } from './graphlib';

type MasterQuery = any;
type DotJson = any;

export class CompositeQuery {
    masterQuery: MasterQuery;
    subqueries: Map<String, DotJson>;

    constructor(masterQuery: MasterQuery, subqueries: Map<String, DotJson>) {
        this.masterQuery = masterQuery;
        this.subqueries = subqueries;
    }

    static async open(masterFilename: string, subqueryDir: string) {
        const puzzleJson = JSON.parse(fs.readFileSync(masterFilename, "utf-8"));
        const subqueries = await Promise.all(fs.readdirSync(subqueryDir).map(
            async filename =>
                [filename.replace(/\.dot$/, ""),
                await parseDot(fs.readFileSync(path.join(subqueryDir, filename),
                    "utf-8"))] as [String, DotJson]
        ));

        return new CompositeQuery(puzzleJson, new Map(subqueries));
    }

}
