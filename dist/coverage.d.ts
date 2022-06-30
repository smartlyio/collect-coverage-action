declare type Opts = {
    coverage: string;
    token: string;
    project: string;
    tag: string;
    url: string;
};
export declare function run(opts: Opts): Promise<void>;
export {};
