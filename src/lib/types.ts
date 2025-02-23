export interface TestsRoot {
    dumpStateAfterTest: boolean;
    groups: Group[];
    cards: Record<number, Card>;
    buttons: Record<string, number>;
    tests: Test[];
}

export interface Group {
    groupId: string;
    useInspection: bool;
    secondaryText: string;
}

export interface Card {
    canCompete: boolean;
    name: string;
    registrantId: number;
    wcaId: string;
    groups: string[];
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

export interface ResetStateStep {
    type: "ResetState";
    data: null;
}

export interface SolveTimeRngStep {
    type: "SolveTime";
    data: null;
}

export interface ButtonStep {
    type: "Button";
    data: { name: string; time: number };
}

export interface DelegateResolveStep {
    type: "DelegateResolve";
    data: { shouldScanCards: boolean; penalty?: number; value?: number };
}

export interface VerifySendStep {
    type: "VerifySend";
    data: { time?: number; penalty?: number, delegate: boolean };
}

export interface VerifySnapshotStep {
    type: "VerifySnapshot";
    data: string[];
}

export type Step =
    | SleepStep
    | ScanCardStep
    | SnapshotStep
    | ResetStateStep
    | SolveTimeStep
    | ButtonStep
    | DelegateResolveStep
    | VerifySend
    | VerifySnapshotStep;
