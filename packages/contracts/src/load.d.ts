import { z } from 'zod';
export declare const LoadPolicySchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    id: z.ZodString;
    baselineMs: z.ZodNumber;
    afterMs: z.ZodNumber;
    maxGapMs: z.ZodNumber;
    maxCollectionMs: z.ZodNumber;
    minimumBaselineIdlePct: z.ZodNumber;
    maximumOtherMachineCpuPct: z.ZodNumber;
    maximumOtherSingleCoreCpuPct: z.ZodNumber;
    maximumToolingCoreCpuPct: z.ZodNumber;
    maximumCollectorCoreCpuPct: z.ZodNumber;
    maximumSwapGrowthBytes: z.ZodNumber;
    maximumSwapIoBytes: z.ZodNumber;
}, z.core.$strict>;
/** Project policy, not an Apple measurement-accuracy guarantee. Frozen before collection. */
export declare const DEFAULT_LOAD_POLICY: {
    schemaVersion: 1;
    id: string;
    baselineMs: number;
    afterMs: number;
    maxGapMs: number;
    maxCollectionMs: number;
    minimumBaselineIdlePct: number;
    maximumOtherMachineCpuPct: number;
    maximumOtherSingleCoreCpuPct: number;
    maximumToolingCoreCpuPct: number;
    maximumCollectorCoreCpuPct: number;
    maximumSwapGrowthBytes: number;
    maximumSwapIoBytes: number;
};
export type LoadPolicy = z.infer<typeof LoadPolicySchema>;
export declare const LoadProcessSchema: z.ZodObject<{
    pid: z.ZodNumber;
    ppid: z.ZodNumber;
    startedAt: z.ZodISODateTime;
    name: z.ZodString;
    cpuTotalMs: z.ZodNumber;
    cpuCorePct: z.ZodNullable<z.ZodNumber>;
    cpuMachinePct: z.ZodNullable<z.ZodNumber>;
    group: z.ZodEnum<{
        target: "target";
        collector: "collector";
        "declared-tooling": "declared-tooling";
        "suspected-tooling": "suspected-tooling";
        other: "other";
    }>;
    basis: z.ZodEnum<{
        "explicit-pid": "explicit-pid";
        "observed-ancestry": "observed-ancestry";
        "name-hint-only": "name-hint-only";
        unclassified: "unclassified";
    }>;
}, z.core.$strict>;
export type LoadProcess = z.infer<typeof LoadProcessSchema>;
export declare const LoadGpuSchema: z.ZodObject<{
    source: z.ZodLiteral<"ioreg-IOAccelerator-private">;
    attribution: z.ZodEnum<{
        unavailable: "unavailable";
        "diagnostic-only": "diagnostic-only";
    }>;
    counterUnit: z.ZodLiteral<"unknown">;
    adapters: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        deviceUtilizationPct: z.ZodNullable<z.ZodNumber>;
        rendererUtilizationPct: z.ZodNullable<z.ZodNumber>;
        tilerUtilizationPct: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>>;
    clients: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        pid: z.ZodNumber;
        api: z.ZodString;
        accumulatedRaw: z.ZodString;
        deltaRaw: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>>;
    issues: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type LoadGpu = z.infer<typeof LoadGpuSchema>;
export declare const LoadMemorySchema: z.ZodObject<{
    source: z.ZodLiteral<"meminfo-csv+vm_stat+sysctl">;
    pressure: z.ZodEnum<{
        unknown: "unknown";
        warning: "warning";
        normal: "normal";
        critical: "critical";
    }>;
    pressureRaw: z.ZodNullable<z.ZodNumber>;
    totalBytes: z.ZodNullable<z.ZodNumber>;
    freeBytes: z.ZodNullable<z.ZodNumber>;
    compressedBytes: z.ZodNullable<z.ZodNumber>;
    swapBytes: z.ZodNullable<z.ZodNumber>;
    pageSize: z.ZodNullable<z.ZodNumber>;
    swapinsPages: z.ZodNullable<z.ZodNumber>;
    swapoutsPages: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>;
export declare const LoadSampleSchema: z.ZodObject<{
    index: z.ZodNumber;
    observedAt: z.ZodISODateTime;
    monotonicMs: z.ZodNumber;
    collectionDurationMs: z.ZodNumber;
    intervalStartedAt: z.ZodNullable<z.ZodISODateTime>;
    intervalMs: z.ZodNullable<z.ZodNumber>;
    cpu: z.ZodObject<{
        source: z.ZodLiteral<"top-delta+ps-cumulative">;
        idlePct: z.ZodNullable<z.ZodNumber>;
        userPct: z.ZodNullable<z.ZodNumber>;
        systemPct: z.ZodNullable<z.ZodNumber>;
        observedProcessCount: z.ZodNumber;
        activeRowsOmitted: z.ZodNumber;
        newProcessCount: z.ZodNumber;
        exitedProcessCount: z.ZodNumber;
        processes: z.ZodArray<z.ZodObject<{
            pid: z.ZodNumber;
            ppid: z.ZodNumber;
            startedAt: z.ZodISODateTime;
            name: z.ZodString;
            cpuTotalMs: z.ZodNumber;
            cpuCorePct: z.ZodNullable<z.ZodNumber>;
            cpuMachinePct: z.ZodNullable<z.ZodNumber>;
            group: z.ZodEnum<{
                target: "target";
                collector: "collector";
                "declared-tooling": "declared-tooling";
                "suspected-tooling": "suspected-tooling";
                other: "other";
            }>;
            basis: z.ZodEnum<{
                "explicit-pid": "explicit-pid";
                "observed-ancestry": "observed-ancestry";
                "name-hint-only": "name-hint-only";
                unclassified: "unclassified";
            }>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    memory: z.ZodObject<{
        source: z.ZodLiteral<"meminfo-csv+vm_stat+sysctl">;
        pressure: z.ZodEnum<{
            unknown: "unknown";
            warning: "warning";
            normal: "normal";
            critical: "critical";
        }>;
        pressureRaw: z.ZodNullable<z.ZodNumber>;
        totalBytes: z.ZodNullable<z.ZodNumber>;
        freeBytes: z.ZodNullable<z.ZodNumber>;
        compressedBytes: z.ZodNullable<z.ZodNumber>;
        swapBytes: z.ZodNullable<z.ZodNumber>;
        pageSize: z.ZodNullable<z.ZodNumber>;
        swapinsPages: z.ZodNullable<z.ZodNumber>;
        swapoutsPages: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>;
    gpu: z.ZodObject<{
        source: z.ZodLiteral<"ioreg-IOAccelerator-private">;
        attribution: z.ZodEnum<{
            unavailable: "unavailable";
            "diagnostic-only": "diagnostic-only";
        }>;
        counterUnit: z.ZodLiteral<"unknown">;
        adapters: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            deviceUtilizationPct: z.ZodNullable<z.ZodNumber>;
            rendererUtilizationPct: z.ZodNullable<z.ZodNumber>;
            tilerUtilizationPct: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strict>>;
        clients: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            pid: z.ZodNumber;
            api: z.ZodString;
            accumulatedRaw: z.ZodString;
            deltaRaw: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>>;
        issues: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    issues: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type LoadSample = z.infer<typeof LoadSampleSchema>;
export declare const LoadReportSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    kind: z.ZodLiteral<"local-load-observation">;
    startedAt: z.ZodISODateTime;
    endedAt: z.ZodISODateTime;
    platform: z.ZodLiteral<"darwin">;
    logicalCpus: z.ZodNumber;
    policy: z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        id: z.ZodString;
        baselineMs: z.ZodNumber;
        afterMs: z.ZodNumber;
        maxGapMs: z.ZodNumber;
        maxCollectionMs: z.ZodNumber;
        minimumBaselineIdlePct: z.ZodNumber;
        maximumOtherMachineCpuPct: z.ZodNumber;
        maximumOtherSingleCoreCpuPct: z.ZodNumber;
        maximumToolingCoreCpuPct: z.ZodNumber;
        maximumCollectorCoreCpuPct: z.ZodNumber;
        maximumSwapGrowthBytes: z.ZodNumber;
        maximumSwapIoBytes: z.ZodNumber;
    }, z.core.$strict>;
    policySha256: z.ZodString;
    intervalSeconds: z.ZodNumber;
    requestedDurationSeconds: z.ZodNumber;
    targetPids: z.ZodArray<z.ZodNumber>;
    toolingPids: z.ZodArray<z.ZodNumber>;
    collectorPid: z.ZodNumber;
    status: z.ZodEnum<{
        failed: "failed";
        aborted: "aborted";
        finished: "finished";
    }>;
    samples: z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        observedAt: z.ZodISODateTime;
        monotonicMs: z.ZodNumber;
        collectionDurationMs: z.ZodNumber;
        intervalStartedAt: z.ZodNullable<z.ZodISODateTime>;
        intervalMs: z.ZodNullable<z.ZodNumber>;
        cpu: z.ZodObject<{
            source: z.ZodLiteral<"top-delta+ps-cumulative">;
            idlePct: z.ZodNullable<z.ZodNumber>;
            userPct: z.ZodNullable<z.ZodNumber>;
            systemPct: z.ZodNullable<z.ZodNumber>;
            observedProcessCount: z.ZodNumber;
            activeRowsOmitted: z.ZodNumber;
            newProcessCount: z.ZodNumber;
            exitedProcessCount: z.ZodNumber;
            processes: z.ZodArray<z.ZodObject<{
                pid: z.ZodNumber;
                ppid: z.ZodNumber;
                startedAt: z.ZodISODateTime;
                name: z.ZodString;
                cpuTotalMs: z.ZodNumber;
                cpuCorePct: z.ZodNullable<z.ZodNumber>;
                cpuMachinePct: z.ZodNullable<z.ZodNumber>;
                group: z.ZodEnum<{
                    target: "target";
                    collector: "collector";
                    "declared-tooling": "declared-tooling";
                    "suspected-tooling": "suspected-tooling";
                    other: "other";
                }>;
                basis: z.ZodEnum<{
                    "explicit-pid": "explicit-pid";
                    "observed-ancestry": "observed-ancestry";
                    "name-hint-only": "name-hint-only";
                    unclassified: "unclassified";
                }>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        memory: z.ZodObject<{
            source: z.ZodLiteral<"meminfo-csv+vm_stat+sysctl">;
            pressure: z.ZodEnum<{
                unknown: "unknown";
                warning: "warning";
                normal: "normal";
                critical: "critical";
            }>;
            pressureRaw: z.ZodNullable<z.ZodNumber>;
            totalBytes: z.ZodNullable<z.ZodNumber>;
            freeBytes: z.ZodNullable<z.ZodNumber>;
            compressedBytes: z.ZodNullable<z.ZodNumber>;
            swapBytes: z.ZodNullable<z.ZodNumber>;
            pageSize: z.ZodNullable<z.ZodNumber>;
            swapinsPages: z.ZodNullable<z.ZodNumber>;
            swapoutsPages: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strict>;
        gpu: z.ZodObject<{
            source: z.ZodLiteral<"ioreg-IOAccelerator-private">;
            attribution: z.ZodEnum<{
                unavailable: "unavailable";
                "diagnostic-only": "diagnostic-only";
            }>;
            counterUnit: z.ZodLiteral<"unknown">;
            adapters: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                deviceUtilizationPct: z.ZodNullable<z.ZodNumber>;
                rendererUtilizationPct: z.ZodNullable<z.ZodNumber>;
                tilerUtilizationPct: z.ZodNullable<z.ZodNumber>;
            }, z.core.$strict>>;
            clients: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                pid: z.ZodNumber;
                api: z.ZodString;
                accumulatedRaw: z.ZodString;
                deltaRaw: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>>;
            issues: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        issues: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
    issues: z.ZodArray<z.ZodString>;
    gpuQualification: z.ZodLiteral<"diagnostic-only-units-and-coverage-unqualified">;
    optionalPowermetricsCapture: z.ZodNullable<z.ZodObject<{
        sha256: z.ZodString;
        bytes: z.ZodNumber;
        status: z.ZodLiteral<"hash-bound-format-not-qualified">;
    }, z.core.$strict>>;
    limitations: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type LoadReport = z.infer<typeof LoadReportSchema>;
export declare const LoadWindowSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    startedAt: z.ZodISODateTime;
    endedAt: z.ZodISODateTime;
    source: z.ZodLiteral<"observed-benchmark-boundary">;
    timingSha256: z.ZodString;
    buildId: z.ZodString;
}, z.core.$strict>;
export type LoadWindow = z.infer<typeof LoadWindowSchema>;
export declare const LoadAssessmentSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    kind: z.ZodLiteral<"load-window-assessment">;
    result: z.ZodEnum<{
        inconclusive: "inconclusive";
        contaminated: "contaminated";
    }>;
    performanceValidity: z.ZodLiteral<"not-qualified">;
    performanceBudgetResult: z.ZodEnum<{
        passed: "passed";
        failed: "failed";
        inconclusive: "inconclusive";
    }>;
    window: z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        startedAt: z.ZodISODateTime;
        endedAt: z.ZodISODateTime;
        source: z.ZodLiteral<"observed-benchmark-boundary">;
        timingSha256: z.ZodString;
        buildId: z.ZodString;
    }, z.core.$strict>;
    baselineSamples: z.ZodNumber;
    benchmarkSamples: z.ZodNumber;
    contamination: z.ZodArray<z.ZodString>;
    unknowns: z.ZodArray<z.ZodString>;
    metrics: z.ZodObject<{
        minimumBaselineIdlePct: z.ZodNullable<z.ZodNumber>;
        maximumOtherMachineCpuPct: z.ZodNumber;
        maximumOtherSingleCoreCpuPct: z.ZodNumber;
        maximumToolingCoreCpuPct: z.ZodNumber;
        maximumCollectorCoreCpuPct: z.ZodNumber;
        swapGrowthBytes: z.ZodNullable<z.ZodNumber>;
        swapIoBytes: z.ZodNullable<z.ZodNumber>;
        diagnosticOtherGpuActiveClients: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>;
export type LoadAssessment = z.infer<typeof LoadAssessmentSchema>;
