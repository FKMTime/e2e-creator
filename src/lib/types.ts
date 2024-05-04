export interface TestsRoot {
    dumpStateAfterTest: boolean;
    cards: Record<number, Card>;
    buttons: Record<string, number[]>;
    tests: Test[];
}

export interface Card {
    canCompete: boolean;
    name: string;
    registrantId: number;
    wcaId: string;
}

export interface Test {
    name: string;
    sleepBetween: number;
    steps: Step[];
}

export interface SleepStep {
    type: "Sleep";
    data: number;
}

export interface ScanCardStep {
    type: "ScanCard";
    data: number;
}

export interface SnapshotStep {
    type: "Snapshot";
    data: null;
}

export interface ResetStateStep {
    type: "ResetState";
    data: null;
}

export interface SolveTimeStep {
    type: "SolveTime";
    data: number;
}

export interface SolveTimeRngStep {
    type: "SolveTimeRng";
    data: null;
}

export interface ButtonStep {
    type: "Button";
    data: { name: string; time: number };
}

export interface DelegateResolveStep {
    type: "DelegateResolve";
    data: { shouldScanCards: boolean; penalty: number; value: number };
}

export interface VerifySolveTimeStep {
    type: "VerifySolveTime";
    data: { time?: number; penalty: number };
}

export interface VerifyDelegateSentStep {
    type: "VerifyDelegateSent";
    data: null;
}

export type Step =
    | SleepStep
    | ScanCardStep
    | SnapshotStep
    | ResetStateStep
    | SolveTimeStep
    | SolveTimeRngStep
    | ButtonStep
    | DelegateResolveStep
    | VerifySolveTimeStep
    | VerifyDelegateSentStep;
