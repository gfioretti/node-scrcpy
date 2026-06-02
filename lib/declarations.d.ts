declare module 'which' {
  function which(cmd: string, options?: { all?: false; nothrow?: boolean }): Promise<string>;
  function which(cmd: string, options: { all: true; nothrow?: boolean }): Promise<string[]>;
  export default which;
}

declare module 'teen_process' {
  export class SubProcess {
    constructor(cmd: string, args: string[]);
    start(startDetector?: string | RegExp, detectionTimeout?: number): Promise<void>;
    stop(signal?: string, timeout?: number): Promise<void>;
    readonly isRunning: boolean;
  }
}
