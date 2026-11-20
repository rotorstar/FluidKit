---
type: API Reference
title: API-Exportreferenz
description: Sämtliche direkt exportierten Deklarationen und tatsächlichen
  Package-Einstiegspunkte.
audience: engineering
tags:
  - reference
  - generated
status: draft
generated:
  by: process:fluidkit-knowledge-sync
  at: 2026-11-20T11:46:48.000Z
stale_after: 2026-12-02T00:00:00Z
sources:
  - id: implementation
    resource: assets/source-inventory.json
    title: SHA-gebundenes Quellinventar
---

# Export-Referenz

Automatisch aus den direkt exportierten Quelldeklarationen ermittelt. Ein Export in einer internen Datei ist nicht automatisch ein veröffentlichter Package-Entry. Die Packages verwenden derzeit private Workspace-/Source-Exports. Vollständige Feldverträge stehen in der [Schema-Referenz](schema-reference.md); Verhalten in [Core](core-runtime.md), [Renderer](rendering.md) und [Daten](data-actions.md).[^implementation]

| Name | Deklaration | Quellposition |
|---|---|---|
| `authoredCatalogFingerprint` | const | `packages/cases/src/authoring.ts:20` |
| `authoredWorkspaceHeight` | FunctionDeclaration | `packages/cases/src/authoring.ts:70` |
| `createAuthoredWorkspaceFlow` | FunctionDeclaration | `packages/cases/src/authoring.ts:74` |
| `authoredWorkspaceScene` | FunctionDeclaration | `packages/cases/src/authoring.ts:96` |
| `architectureReviewModule` | FunctionDeclaration | `packages/cases/src/flow-explorer.ts:12` |
| `createArchitectureReviewFlow` | FunctionDeclaration | `packages/cases/src/flow-explorer.ts:17` |
| `architectureReviewGraph` | FunctionDeclaration | `packages/cases/src/flow-explorer.ts:32` |
| `architectureReviewMermaid` | FunctionDeclaration | `packages/cases/src/flow-explorer.ts:36` |
| `architectureReviewReturnUrl` | FunctionDeclaration | `packages/cases/src/flow-explorer.ts:46` |
| `architectureReviewLayout` | FunctionDeclaration | `packages/cases/src/flow-explorer.ts:49` |
| `architectureReviewHeight` | FunctionDeclaration | `packages/cases/src/flow-explorer.ts:61` |
| `architectureReviewScene` | FunctionDeclaration | `packages/cases/src/flow-explorer.ts:63` |
| `createProjectProof` | FunctionDeclaration | `packages/cases/src/index.ts:6` |
| `projectProofOptions` | FunctionDeclaration | `packages/cases/src/index.ts:35` |
| `caseMessage` | const | `packages/cases/src/messages.ts:215` |
| `CaseMessageKey` | TypeAliasDeclaration | `packages/cases/src/messages.ts:216` |
| `caseTranslator` | FunctionDeclaration | `packages/cases/src/messages.ts:217` |
| `caseCatalogFingerprint` | const | `packages/cases/src/messages.ts:221` |
| `searchText` | FunctionDeclaration | `packages/cases/src/messages.ts:223` |
| `compareIds` | FunctionDeclaration | `packages/cases/src/messages.ts:227` |
| `SIMULATION_TITLES` | const | `packages/cases/src/simulation-flow.ts:7` |
| `simulationRows` | FunctionDeclaration | `packages/cases/src/simulation-flow.ts:9` |
| `simulationCanPrepare` | FunctionDeclaration | `packages/cases/src/simulation-flow.ts:13` |
| `createSimulationFlow` | FunctionDeclaration | `packages/cases/src/simulation-flow.ts:20` |
| `simulationScene` | FunctionDeclaration | `packages/cases/src/simulation-flow.ts:38` |
| `simulationLocation` | FunctionDeclaration | `packages/cases/src/simulation-flow.ts:121` |
| `simulationSearch` | FunctionDeclaration | `packages/cases/src/simulation-flow.ts:127` |
| `SimulationRecordSchema` | const | `packages/cases/src/simulation.ts:13` |
| `SimulationDatasetSchema` | const | `packages/cases/src/simulation.ts:21` |
| `SimulationDataset` | TypeAliasDeclaration | `packages/cases/src/simulation.ts:31` |
| `SimulationRecord` | TypeAliasDeclaration | `packages/cases/src/simulation.ts:32` |
| `SIMULATION_DATASETS` | const | `packages/cases/src/simulation.ts:33` |
| `SimulationQuerySchema` | const | `packages/cases/src/simulation.ts:34` |
| `filterSimulationRecords` | FunctionDeclaration | `packages/cases/src/simulation.ts:35` |
| `createSimulationAdapter` | FunctionDeclaration | `packages/cases/src/simulation.ts:41` |
| `formatSimulationMoney` | const | `packages/cases/src/simulation.ts:49` |
| `selectedSimulationRecord` | FunctionDeclaration | `packages/cases/src/simulation.ts:50` |
| `AtlasRect` | TypeAliasDeclaration | `packages/cases/src/workspace-atlas.ts:7` |
| `AtlasCell` | TypeAliasDeclaration | `packages/cases/src/workspace-atlas.ts:8` |
| `workspaceTreemap` | FunctionDeclaration | `packages/cases/src/workspace-atlas.ts:10` |
| `workspaceAtlasCells` | FunctionDeclaration | `packages/cases/src/workspace-atlas.ts:35` |
| `workspaceAtlasScene` | FunctionDeclaration | `packages/cases/src/workspace-atlas.ts:42` |
| `WorkspaceModuleProjector` | TypeAliasDeclaration | `packages/cases/src/workspace-compare.ts:6` |
| `WORKSPACE_GROUP_COLORS` | const | `packages/cases/src/workspace-compare.ts:7` |
| `workspaceSuggestedComparison` | FunctionDeclaration | `packages/cases/src/workspace-compare.ts:8` |
| `workspaceWrap` | FunctionDeclaration | `packages/cases/src/workspace-compare.ts:14` |
| `workspaceViewNode` | FunctionDeclaration | `packages/cases/src/workspace-compare.ts:29` |
| `workspaceViewText` | FunctionDeclaration | `packages/cases/src/workspace-compare.ts:33` |
| `workspaceComparison` | FunctionDeclaration | `packages/cases/src/workspace-compare.ts:38` |
| `workspaceCompareScene` | FunctionDeclaration | `packages/cases/src/workspace-compare.ts:52` |
| `workspaceLayout` | FunctionDeclaration | `packages/cases/src/workspace-layout.ts:2` |
| `createWorkspaceStory` | FunctionDeclaration | `packages/cases/src/workspace-story.ts:6` |
| `WorkspaceModuleSchema` | const | `packages/cases/src/workspace.ts:11` |
| `WorkspaceDataSchema` | const | `packages/cases/src/workspace.ts:16` |
| `WorkspaceData` | TypeAliasDeclaration | `packages/cases/src/workspace.ts:22` |
| `WorkspaceModule` | TypeAliasDeclaration | `packages/cases/src/workspace.ts:23` |
| `WorkspaceLocationSchema` | const | `packages/cases/src/workspace.ts:24` |
| `readWorkspaceLocation` | FunctionDeclaration | `packages/cases/src/workspace.ts:33` |
| `workspaceSearch` | FunctionDeclaration | `packages/cases/src/workspace.ts:41` |
| `workspaceSelection` | FunctionDeclaration | `packages/cases/src/workspace.ts:50` |
| `workspaceRows` | FunctionDeclaration | `packages/cases/src/workspace.ts:54` |
| `workspaceCollectionOrder` | FunctionDeclaration | `packages/cases/src/workspace.ts:70` |
| `createWorkspaceFlow` | FunctionDeclaration | `packages/cases/src/workspace.ts:79` |
| `WORKSPACE_MODULE_DEFINITION` | const | `packages/cases/src/workspace.ts:108` |
| `workspaceScene` | FunctionDeclaration | `packages/cases/src/workspace.ts:118` |
| `workspaceSurfaceHeight` | FunctionDeclaration | `packages/cases/src/workspace.ts:334` |
| `AcceptanceStatusSchema` | const | `packages/contracts/src/acceptance.ts:3` |
| `AcceptanceCriterionSchema` | const | `packages/contracts/src/acceptance.ts:4` |
| `AcceptanceLedgerSchema` | const | `packages/contracts/src/acceptance.ts:14` |
| `AcceptanceCriterion` | TypeAliasDeclaration | `packages/contracts/src/acceptance.ts:17` |
| `AcceptanceLedger` | TypeAliasDeclaration | `packages/contracts/src/acceptance.ts:18` |
| `AGENT_MAX_STEPS` | const | `packages/contracts/src/agent.ts:7` |
| `AgentScopeSchema` | const | `packages/contracts/src/agent.ts:8` |
| `AgentActionRefSchema` | const | `packages/contracts/src/agent.ts:9` |
| `AgentStepSchema` | const | `packages/contracts/src/agent.ts:10` |
| `AgentRequestSchema` | const | `packages/contracts/src/agent.ts:11` |
| `AgentPolicySchema` | const | `packages/contracts/src/agent.ts:18` |
| `LocalCommandSchema` | const | `packages/contracts/src/agent.ts:25` |
| `LocalTransactionSchema` | const | `packages/contracts/src/agent.ts:30` |
| `AgentQueryRequestSchema` | const | `packages/contracts/src/agent.ts:34` |
| `AgentReadSnapshotSchema` | const | `packages/contracts/src/agent.ts:38` |
| `AgentErrorCodeSchema` | const | `packages/contracts/src/agent.ts:43` |
| `AgentStepResultSchema` | const | `packages/contracts/src/agent.ts:49` |
| `AgentExecutionSchema` | const | `packages/contracts/src/agent.ts:54` |
| `AgentProposalSchema` | const | `packages/contracts/src/agent.ts:60` |
| `AgentScope` | TypeAliasDeclaration | `packages/contracts/src/agent.ts:65` |
| `AgentActionRef` | TypeAliasDeclaration | `packages/contracts/src/agent.ts:66` |
| `AgentRequest` | TypeAliasDeclaration | `packages/contracts/src/agent.ts:67` |
| `AgentStep` | TypeAliasDeclaration | `packages/contracts/src/agent.ts:68` |
| `AgentPolicy` | TypeAliasDeclaration | `packages/contracts/src/agent.ts:69` |
| `AgentQueryRequest` | TypeAliasDeclaration | `packages/contracts/src/agent.ts:70` |
| `AgentReadSnapshot` | TypeAliasDeclaration | `packages/contracts/src/agent.ts:71` |
| `AgentExecution` | TypeAliasDeclaration | `packages/contracts/src/agent.ts:72` |
| `AgentProposal` | TypeAliasDeclaration | `packages/contracts/src/agent.ts:73` |
| `AgentStepResult` | TypeAliasDeclaration | `packages/contracts/src/agent.ts:74` |
| `AgentErrorCode` | TypeAliasDeclaration | `packages/contracts/src/agent.ts:75` |
| `LocalCommand` | TypeAliasDeclaration | `packages/contracts/src/agent.ts:76` |
| `LocalTransaction` | TypeAliasDeclaration | `packages/contracts/src/agent.ts:77` |
| `AuthoringMetricSchema` | const | `packages/contracts/src/authoring.ts:6` |
| `AuthoringSectionSchema` | const | `packages/contracts/src/authoring.ts:10` |
| `AUTHORING_REGISTRY_VERSION` | const | `packages/contracts/src/authoring.ts:16` |
| `AuthoringDocumentSchema` | const | `packages/contracts/src/authoring.ts:17` |
| `AuthoringDocument` | TypeAliasDeclaration | `packages/contracts/src/authoring.ts:31` |
| `AuthoringSection` | TypeAliasDeclaration | `packages/contracts/src/authoring.ts:32` |
| `DEFAULT_AUTHORING_DOCUMENT` | const | `packages/contracts/src/authoring.ts:33` |
| `AuthoringRequestSchema` | const | `packages/contracts/src/authoring.ts:41` |
| `AuthoringRequest` | TypeAliasDeclaration | `packages/contracts/src/authoring.ts:47` |
| `AuthoringProvenanceSchema` | const | `packages/contracts/src/authoring.ts:48` |
| `AuthoringResultSchema` | const | `packages/contracts/src/authoring.ts:57` |
| `AuthoringResult` | TypeAliasDeclaration | `packages/contracts/src/authoring.ts:63` |
| `AuthoringStreamEventSchema` | const | `packages/contracts/src/authoring.ts:64` |
| `AuthoringStreamEvent` | TypeAliasDeclaration | `packages/contracts/src/authoring.ts:69` |
| `AUTHORING_PALETTE` | const | `packages/contracts/src/authoring.ts:72` |
| `ComponentCapabilitiesSchema` | const | `packages/contracts/src/components.ts:9` |
| `ComponentPartSchema` | const | `packages/contracts/src/components.ts:14` |
| `MultipartComponentDefinitionSchema` | const | `packages/contracts/src/components.ts:32` |
| `MultipartComponentDefinition` | TypeAliasDeclaration | `packages/contracts/src/components.ts:83` |
| `ComponentPart` | TypeAliasDeclaration | `packages/contracts/src/components.ts:84` |
| `ComponentCapabilities` | TypeAliasDeclaration | `packages/contracts/src/components.ts:85` |
| `ComponentLayoutSchema` | const | `packages/contracts/src/components.ts:89` |
| `ComponentCommandBindingSchema` | const | `packages/contracts/src/components.ts:94` |
| `MultipartComponentInstanceSchema` | const | `packages/contracts/src/components.ts:99` |
| `MultipartComponentInstance` | TypeAliasDeclaration | `packages/contracts/src/components.ts:114` |
| `ComponentInstantiationSchema` | const | `packages/contracts/src/components.ts:115` |
| `ComponentInstantiation` | TypeAliasDeclaration | `packages/contracts/src/components.ts:124` |
| `defineMultipartComponent` | FunctionDeclaration | `packages/contracts/src/components.ts:126` |
| `instantiateMultipartComponent` | FunctionDeclaration | `packages/contracts/src/components.ts:158` |
| `projectMultipartComponent` | FunctionDeclaration | `packages/contracts/src/components.ts:169` |
| `DataSourceSchema` | const | `packages/contracts/src/data.ts:3` |
| `DataSource` | TypeAliasDeclaration | `packages/contracts/src/data.ts:14` |
| `ActionContextSchema` | const | `packages/contracts/src/data.ts:15` |
| `ActionContext` | TypeAliasDeclaration | `packages/contracts/src/data.ts:19` |
| `dataResultSchema` | FunctionDeclaration | `packages/contracts/src/data.ts:20` |
| `DesignTokensSchema` | const | `packages/contracts/src/design-tokens.ts:4` |
| `DESIGN_TOKENS` | const | `packages/contracts/src/design-tokens.ts:9` |
| `DevelopmentProposalRequestSchema` | const | `packages/contracts/src/development-proposal.ts:10` |
| `DevelopmentProposalRequest` | TypeAliasDeclaration | `packages/contracts/src/development-proposal.ts:14` |
| `DevelopmentTypecheckSchema` | const | `packages/contracts/src/development-proposal.ts:17` |
| `DevelopmentCheckSchema` | const | `packages/contracts/src/development-proposal.ts:21` |
| `DevelopmentConformanceSchema` | const | `packages/contracts/src/development-proposal.ts:22` |
| `DevelopmentProposalSchema` | const | `packages/contracts/src/development-proposal.ts:26` |
| `DevelopmentProposal` | TypeAliasDeclaration | `packages/contracts/src/development-proposal.ts:36` |
| `EffectReferenceSchema` | const | `packages/contracts/src/effects.ts:5` |
| `EffectReference` | TypeAliasDeclaration | `packages/contracts/src/effects.ts:6` |
| `EFFECT_POLICY_VERSION` | const | `packages/contracts/src/effects.ts:7` |
| `EffectParametersSchema` | const | `packages/contracts/src/effects.ts:8` |
| `EffectRuleSchema` | const | `packages/contracts/src/effects.ts:13` |
| `EffectRule` | TypeAliasDeclaration | `packages/contracts/src/effects.ts:21` |
| `VisualCommandSchema` | const | `packages/contracts/src/effects.ts:22` |
| `VisualCommand` | TypeAliasDeclaration | `packages/contracts/src/effects.ts:27` |
| `EffectSettingsSchema` | const | `packages/contracts/src/effects.ts:28` |
| `EffectSettings` | TypeAliasDeclaration | `packages/contracts/src/effects.ts:43` |
| `DEFAULT_EFFECT_SETTINGS` | const | `packages/contracts/src/effects.ts:44` |
| `EffectDefinitionSchema` | const | `packages/contracts/src/effects.ts:45` |
| `EffectDefinition` | TypeAliasDeclaration | `packages/contracts/src/effects.ts:58` |
| `RenderCapabilitiesSchema` | const | `packages/contracts/src/effects.ts:59` |
| `RenderCapabilities` | TypeAliasDeclaration | `packages/contracts/src/effects.ts:63` |
| `EffectPresentationSchema` | const | `packages/contracts/src/effects.ts:64` |
| `ResolvedEffectPlanSchema` | const | `packages/contracts/src/effects.ts:74` |
| `ResolvedEffectPlan` | TypeAliasDeclaration | `packages/contracts/src/effects.ts:91` |
| `VisualStateSchema` | const | `packages/contracts/src/effects.ts:92` |
| `VisualState` | TypeAliasDeclaration | `packages/contracts/src/effects.ts:98` |
| `SCHEMA_VERSION` | const | `packages/contracts/src/index.ts:8` |
| `IdentifierSchema` | const | `packages/contracts/src/index.ts:9` |
| `JsonSchema` | const | `packages/contracts/src/index.ts:10` |
| `Json` | TypeAliasDeclaration | `packages/contracts/src/index.ts:11` |
| `ModeSchema` | const | `packages/contracts/src/index.ts:12` |
| `BackendModeSchema` | const | `packages/contracts/src/index.ts:13` |
| `BackendMode` | TypeAliasDeclaration | `packages/contracts/src/index.ts:14` |
| `ControlMode` | TypeAliasDeclaration | `packages/contracts/src/index.ts:15` |
| `ColorSchema` | const | `packages/contracts/src/index.ts:16` |
| `NodeKindSchema` | const | `packages/contracts/src/index.ts:17` |
| `PartDefinitionSchema` | const | `packages/contracts/src/index.ts:18` |
| `PartDefinition` | TypeAliasDeclaration | `packages/contracts/src/index.ts:23` |
| `SceneNodeSchema` | const | `packages/contracts/src/index.ts:24` |
| `SceneNode` | TypeAliasDeclaration | `packages/contracts/src/index.ts:68` |
| `SceneNodeInput` | TypeAliasDeclaration | `packages/contracts/src/index.ts:69` |
| `FieldValueSchema` | const | `packages/contracts/src/index.ts:70` |
| `FieldValue` | TypeAliasDeclaration | `packages/contracts/src/index.ts:71` |
| `FieldSchema` | const | `packages/contracts/src/index.ts:72` |
| `isFieldValue` | FunctionDeclaration | `packages/contracts/src/index.ts:79` |
| `CollectionDefinitionSchema` | const | `packages/contracts/src/index.ts:83` |
| `TransitionSchema` | const | `packages/contracts/src/index.ts:89` |
| `StateSchema` | const | `packages/contracts/src/index.ts:99` |
| `FlowDefinitionSchema` | const | `packages/contracts/src/index.ts:106` |
| `FlowDefinition` | TypeAliasDeclaration | `packages/contracts/src/index.ts:186` |
| `ComponentDefinitionSchema` | const | `packages/contracts/src/index.ts:188` |
| `ComponentDefinition` | TypeAliasDeclaration | `packages/contracts/src/index.ts:189` |
| `RuntimeSnapshotSchema` | const | `packages/contracts/src/index.ts:190` |
| `RuntimeSnapshot` | TypeAliasDeclaration | `packages/contracts/src/index.ts:195` |
| `InteractionSnapshotSchema` | const | `packages/contracts/src/index.ts:196` |
| `InteractionSnapshot` | TypeAliasDeclaration | `packages/contracts/src/index.ts:201` |
| `ChangeReasonSchema` | const | `packages/contracts/src/index.ts:202` |
| `ChangeReason` | TypeAliasDeclaration | `packages/contracts/src/index.ts:203` |
| `RuntimeEventSchema` | const | `packages/contracts/src/index.ts:204` |
| `RuntimeEvent` | TypeAliasDeclaration | `packages/contracts/src/index.ts:212` |
| `DecisionPlanSchema` | const | `packages/contracts/src/index.ts:213` |
| `DecisionPlan` | TypeAliasDeclaration | `packages/contracts/src/index.ts:219` |
| `TraceEntrySchema` | const | `packages/contracts/src/index.ts:220` |
| `TraceEntry` | TypeAliasDeclaration | `packages/contracts/src/index.ts:229` |
| `ScenarioDefinitionSchema` | const | `packages/contracts/src/index.ts:230` |
| `ScenarioDefinition` | TypeAliasDeclaration | `packages/contracts/src/index.ts:237` |
| `DatasetSchema` | const | `packages/contracts/src/index.ts:238` |
| `Dataset` | TypeAliasDeclaration | `packages/contracts/src/index.ts:243` |
| `ProjectSchema` | const | `packages/contracts/src/index.ts:244` |
| `FluidProject` | TypeAliasDeclaration | `packages/contracts/src/index.ts:253` |
| `defineFlow` | FunctionDeclaration | `packages/contracts/src/index.ts:254` |
| `defineComponent` | FunctionDeclaration | `packages/contracts/src/index.ts:255` |
| `VisualScenarioV2Schema` | const | `packages/contracts/src/index.ts:263` |
| `VisualScenarioV3Schema` | const | `packages/contracts/src/index.ts:264` |
| `VisualScenarioV4Schema` | const | `packages/contracts/src/index.ts:265` |
| `RecordingLanguageProfileSchema` | const | `packages/contracts/src/index.ts:270` |
| `RecordingLanguageProfile` | TypeAliasDeclaration | `packages/contracts/src/index.ts:276` |
| `VisualScenarioV5Schema` | const | `packages/contracts/src/index.ts:277` |
| `VisualScenarioSchema` | const | `packages/contracts/src/index.ts:285` |
| `TextInkBoxSchema` | const | `packages/contracts/src/index.ts:299` |
| `TextInkBox` | TypeAliasDeclaration | `packages/contracts/src/index.ts:300` |
| `TextAuditSchema` | const | `packages/contracts/src/index.ts:301` |
| `TextAudit` | TypeAliasDeclaration | `packages/contracts/src/index.ts:308` |
| `VisualScenario` | TypeAliasDeclaration | `packages/contracts/src/index.ts:309` |
| `RestagedRecordingSchema` | const | `packages/contracts/src/index.ts:310` |
| `RestagedRecording` | TypeAliasDeclaration | `packages/contracts/src/index.ts:314` |
| `NativeInputContextSchema` | const | `packages/contracts/src/input-observation.ts:3` |
| `NativeInputObservationSchema` | const | `packages/contracts/src/input-observation.ts:4` |
| `NativeInputObservation` | TypeAliasDeclaration | `packages/contracts/src/input-observation.ts:13` |
| `NativeInputProtocolSchema` | const | `packages/contracts/src/input-observation.ts:14` |
| `NativeInputProtocol` | TypeAliasDeclaration | `packages/contracts/src/input-observation.ts:20` |
| `ResourceKindSchema` | const | `packages/contracts/src/lifecycle.ts:3` |
| `ResourceSnapshotSchema` | const | `packages/contracts/src/lifecycle.ts:4` |
| `LifecycleRunSchema` | const | `packages/contracts/src/lifecycle.ts:9` |
| `ResourceKind` | TypeAliasDeclaration | `packages/contracts/src/lifecycle.ts:17` |
| `ResourceSnapshot` | TypeAliasDeclaration | `packages/contracts/src/lifecycle.ts:18` |
| `LifecycleRun` | TypeAliasDeclaration | `packages/contracts/src/lifecycle.ts:19` |
| `LoadPolicySchema` | const | `packages/contracts/src/load.d.ts:2` |
| `DEFAULT_LOAD_POLICY` | const | `packages/contracts/src/load.d.ts:18` |
| `LoadPolicy` | TypeAliasDeclaration | `packages/contracts/src/load.d.ts:33` |
| `LoadProcessSchema` | const | `packages/contracts/src/load.d.ts:34` |
| `LoadProcess` | TypeAliasDeclaration | `packages/contracts/src/load.d.ts:56` |
| `LoadGpuSchema` | const | `packages/contracts/src/load.d.ts:57` |
| `LoadGpu` | TypeAliasDeclaration | `packages/contracts/src/load.d.ts:79` |
| `LoadMemorySchema` | const | `packages/contracts/src/load.d.ts:80` |
| `LoadSampleSchema` | const | `packages/contracts/src/load.d.ts:97` |
| `LoadSample` | TypeAliasDeclaration | `packages/contracts/src/load.d.ts:177` |
| `LoadReportSchema` | const | `packages/contracts/src/load.d.ts:178` |
| `LoadReport` | TypeAliasDeclaration | `packages/contracts/src/load.d.ts:300` |
| `LoadWindowSchema` | const | `packages/contracts/src/load.d.ts:301` |
| `LoadWindow` | TypeAliasDeclaration | `packages/contracts/src/load.d.ts:309` |
| `LoadAssessmentSchema` | const | `packages/contracts/src/load.d.ts:310` |
| `LoadAssessment` | TypeAliasDeclaration | `packages/contracts/src/load.d.ts:346` |
| `LoadPolicySchema` | const | `packages/contracts/src/load.ts:8` |
| `DEFAULT_LOAD_POLICY` | const | `packages/contracts/src/load.ts:17` |
| `LoadPolicy` | TypeAliasDeclaration | `packages/contracts/src/load.ts:21` |
| `LoadProcessSchema` | const | `packages/contracts/src/load.ts:22` |
| `LoadProcess` | TypeAliasDeclaration | `packages/contracts/src/load.ts:28` |
| `LoadGpuSchema` | const | `packages/contracts/src/load.ts:29` |
| `LoadGpu` | TypeAliasDeclaration | `packages/contracts/src/load.ts:36` |
| `LoadMemorySchema` | const | `packages/contracts/src/load.ts:37` |
| `LoadSampleSchema` | const | `packages/contracts/src/load.ts:42` |
| `LoadSample` | TypeAliasDeclaration | `packages/contracts/src/load.ts:51` |
| `LoadReportSchema` | const | `packages/contracts/src/load.ts:52` |
| `LoadReport` | TypeAliasDeclaration | `packages/contracts/src/load.ts:63` |
| `LoadWindowSchema` | const | `packages/contracts/src/load.ts:64` |
| `LoadWindow` | TypeAliasDeclaration | `packages/contracts/src/load.ts:68` |
| `LoadAssessmentSchema` | const | `packages/contracts/src/load.ts:69` |
| `LoadAssessment` | TypeAliasDeclaration | `packages/contracts/src/load.ts:79` |
| `ContentHashSchema` | const | `packages/contracts/src/local-project.ts:4` |
| `LocalDraftInputSchema` | const | `packages/contracts/src/local-project.ts:5` |
| `LocalDraftVersionSchema` | const | `packages/contracts/src/local-project.ts:13` |
| `LocalDraftVersion` | TypeAliasDeclaration | `packages/contracts/src/local-project.ts:18` |
| `LocalDraftListSchema` | const | `packages/contracts/src/local-project.ts:19` |
| `LocalBudgetSummarySchema` | const | `packages/contracts/src/local-project.ts:20` |
| `LocalBudgetSummary` | TypeAliasDeclaration | `packages/contracts/src/local-project.ts:24` |
| `LocalReviewEvidenceSchema` | const | `packages/contracts/src/local-project.ts:25` |
| `LocalReviewEvidence` | TypeAliasDeclaration | `packages/contracts/src/local-project.ts:36` |
| `M8_DIRECTIONS` | const | `packages/contracts/src/m8-qualification.ts:6` |
| `M8_EFFECT_IDS` | const | `packages/contracts/src/m8-qualification.ts:7` |
| `M8_PHASES` | const | `packages/contracts/src/m8-qualification.ts:8` |
| `M8QualificationSampleSchema` | const | `packages/contracts/src/m8-qualification.ts:13` |
| `M8QualificationCaseSchema` | const | `packages/contracts/src/m8-qualification.ts:16` |
| `M8QualificationSchema` | const | `packages/contracts/src/m8-qualification.ts:22` |
| `M8Qualification` | TypeAliasDeclaration | `packages/contracts/src/m8-qualification.ts:81` |
| `M8QualificationCase` | TypeAliasDeclaration | `packages/contracts/src/m8-qualification.ts:82` |
| `M8_TIMING_BUDGET` | const | `packages/contracts/src/m8-timing.ts:5` |
| `summarizeM8Timings` | FunctionDeclaration | `packages/contracts/src/m8-timing.ts:9` |
| `M8TimingWarmupSchema` | const | `packages/contracts/src/m8-timing.ts:21` |
| `M8TimingCaseSchema` | const | `packages/contracts/src/m8-timing.ts:22` |
| `M8TimingReportSchema` | const | `packages/contracts/src/m8-timing.ts:26` |
| `M8TimingReport` | TypeAliasDeclaration | `packages/contracts/src/m8-timing.ts:63` |
| `M8TimingCase` | TypeAliasDeclaration | `packages/contracts/src/m8-timing.ts:64` |
| `M8TimingWarmup` | TypeAliasDeclaration | `packages/contracts/src/m8-timing.ts:65` |
| `resolveMotionPorts` | FunctionDeclaration | `packages/contracts/src/motion-geometry.ts:4` |
| `MOTION_LIMITS` | const | `packages/contracts/src/motion.ts:5` |
| `MotionRuleSchema` | const | `packages/contracts/src/motion.ts:8` |
| `MotionPortReferenceSchema` | const | `packages/contracts/src/motion.ts:20` |
| `SceneMotionSchema` | const | `packages/contracts/src/motion.ts:21` |
| `SceneMotion` | TypeAliasDeclaration | `packages/contracts/src/motion.ts:33` |
| `MorphRelationSchema` | const | `packages/contracts/src/motion.ts:34` |
| `MotionPlanSchema` | const | `packages/contracts/src/motion.ts:44` |
| `MotionPlan` | TypeAliasDeclaration | `packages/contracts/src/motion.ts:45` |
| `MorphRelation` | TypeAliasDeclaration | `packages/contracts/src/motion.ts:46` |
| `MotionVelocitySchema` | const | `packages/contracts/src/motion.ts:47` |
| `MotionVelocity` | TypeAliasDeclaration | `packages/contracts/src/motion.ts:48` |
| `CouplingPresentationSchema` | const | `packages/contracts/src/motion.ts:49` |
| `CouplingPresentation` | TypeAliasDeclaration | `packages/contracts/src/motion.ts:55` |
| `MotionCheckpointSchema` | const | `packages/contracts/src/motion.ts:56` |
| `M8_NATIVE_TOLERANCE_PX` | const | `packages/contracts/src/native-targets.ts:3` |
| `NativeTargetBoundsSchema` | const | `packages/contracts/src/native-targets.ts:4` |
| `NativeTargetObservationSchema` | const | `packages/contracts/src/native-targets.ts:5` |
| `NativeTargetAuditSchema` | const | `packages/contracts/src/native-targets.ts:12` |
| `NativeTargetBounds` | TypeAliasDeclaration | `packages/contracts/src/native-targets.ts:24` |
| `NativeTargetObservation` | TypeAliasDeclaration | `packages/contracts/src/native-targets.ts:25` |
| `NativeTargetAudit` | TypeAliasDeclaration | `packages/contracts/src/native-targets.ts:26` |
| `PresentedNodeStateSchema` | const | `packages/contracts/src/presentation.ts:6` |
| `PresentedNodeState` | TypeAliasDeclaration | `packages/contracts/src/presentation.ts:12` |
| `LensPresentationSchema` | const | `packages/contracts/src/presentation.ts:13` |
| `LensPresentation` | TypeAliasDeclaration | `packages/contracts/src/presentation.ts:18` |
| `ParticlePresentationSchema` | const | `packages/contracts/src/presentation.ts:19` |
| `ParticlePresentation` | TypeAliasDeclaration | `packages/contracts/src/presentation.ts:25` |
| `SourcePresentationCheckpointSchema` | const | `packages/contracts/src/presentation.ts:27` |
| `SourcePresentationCheckpoint` | TypeAliasDeclaration | `packages/contracts/src/presentation.ts:38` |
| `ProofViewportSchema` | const | `packages/contracts/src/proof-capture.ts:9` |
| `ProofFieldsSchema` | const | `packages/contracts/src/proof-capture.ts:14` |
| `NativeProofSchema` | const | `packages/contracts/src/proof-capture.ts:21` |
| `ProofViewport` | TypeAliasDeclaration | `packages/contracts/src/proof-capture.ts:66` |
| `NativeProof` | TypeAliasDeclaration | `packages/contracts/src/proof-capture.ts:67` |
| `QualitySourceSchema` | const | `packages/contracts/src/quality.ts:3` |
| `QualityFindingSchema` | const | `packages/contracts/src/quality.ts:4` |
| `QualityCheckSchema` | const | `packages/contracts/src/quality.ts:14` |
| `QualityContextSchema` | const | `packages/contracts/src/quality.ts:25` |
| `QualityReportSchema` | const | `packages/contracts/src/quality.ts:31` |
| `QualityFinding` | TypeAliasDeclaration | `packages/contracts/src/quality.ts:37` |
| `QualityCheck` | TypeAliasDeclaration | `packages/contracts/src/quality.ts:38` |
| `QualityContext` | TypeAliasDeclaration | `packages/contracts/src/quality.ts:39` |
| `QualityReport` | TypeAliasDeclaration | `packages/contracts/src/quality.ts:40` |
| `StoryDefinitionSchema` | const | `packages/contracts/src/rehearsal.ts:6` |
| `StoryDefinition` | TypeAliasDeclaration | `packages/contracts/src/rehearsal.ts:25` |
| `CapturedFrameSchema` | const | `packages/contracts/src/rehearsal.ts:27` |
| `CapturedFrame` | TypeAliasDeclaration | `packages/contracts/src/rehearsal.ts:37` |
| `AIReviewFrameSchema` | const | `packages/contracts/src/rehearsal.ts:38` |
| `AIReviewFrame` | TypeAliasDeclaration | `packages/contracts/src/rehearsal.ts:42` |
| `AIReviewBundleSchema` | const | `packages/contracts/src/rehearsal.ts:43` |
| `AIReviewBundle` | TypeAliasDeclaration | `packages/contracts/src/rehearsal.ts:52` |
| `AIReviewFindingSchema` | const | `packages/contracts/src/rehearsal.ts:55` |
| `AIReviewFinding` | TypeAliasDeclaration | `packages/contracts/src/rehearsal.ts:63` |
| `AIReviewOutputSchema` | const | `packages/contracts/src/rehearsal.ts:64` |
| `AIReviewOutput` | TypeAliasDeclaration | `packages/contracts/src/rehearsal.ts:68` |
| `AIReviewResultSchema` | const | `packages/contracts/src/rehearsal.ts:69` |
| `AIReviewResult` | TypeAliasDeclaration | `packages/contracts/src/rehearsal.ts:75` |
| `AIReviewAssessmentSchema` | const | `packages/contracts/src/rehearsal.ts:76` |
| `AIReviewAssessment` | TypeAliasDeclaration | `packages/contracts/src/rehearsal.ts:83` |
| `AIReviewStatusSchema` | const | `packages/contracts/src/rehearsal.ts:84` |
| `AIReviewStatus` | TypeAliasDeclaration | `packages/contracts/src/rehearsal.ts:88` |
| `validateReviewReferences` | FunctionDeclaration | `packages/contracts/src/rehearsal.ts:90` |
| `SequenceGeometrySchema` | const | `packages/contracts/src/sequence-geometry.ts:3` |
| `SequenceGeometry` | TypeAliasDeclaration | `packages/contracts/src/sequence-geometry.ts:8` |
| `SEQUENCE_LIMITS` | const | `packages/contracts/src/sequence.ts:9` |
| `EffectRuntimeMetricsSchema` | const | `packages/contracts/src/sequence.ts:10` |
| `SequenceSampleSchema` | const | `packages/contracts/src/sequence.ts:16` |
| `SequenceReportSchema` | const | `packages/contracts/src/sequence.ts:21` |
| `SequenceSample` | TypeAliasDeclaration | `packages/contracts/src/sequence.ts:38` |
| `SequenceReport` | TypeAliasDeclaration | `packages/contracts/src/sequence.ts:39` |
| `EffectRuntimeMetrics` | TypeAliasDeclaration | `packages/contracts/src/sequence.ts:40` |
| `EffectStressReportSchema` | const | `packages/contracts/src/sequence.ts:41` |
| `EffectStressReport` | TypeAliasDeclaration | `packages/contracts/src/sequence.ts:48` |
| `NaturalPlaybackReportSchema` | const | `packages/contracts/src/sequence.ts:49` |
| `NaturalPlaybackReport` | TypeAliasDeclaration | `packages/contracts/src/sequence.ts:57` |
| `VisualRetargetReportSchema` | const | `packages/contracts/src/sequence.ts:58` |
| `VisualRetargetReport` | TypeAliasDeclaration | `packages/contracts/src/sequence.ts:68` |
| `M7SurfaceCaseSchema` | const | `packages/contracts/src/surface-qualification.ts:5` |
| `M7SurfaceQualificationSchema` | const | `packages/contracts/src/surface-qualification.ts:18` |
| `M7SurfaceCase` | TypeAliasDeclaration | `packages/contracts/src/surface-qualification.ts:42` |
| `M7SurfaceQualification` | TypeAliasDeclaration | `packages/contracts/src/surface-qualification.ts:43` |
| `resolveTextInsetY` | FunctionDeclaration | `packages/contracts/src/text-geometry.ts:2` |
| `ThemeDefinitionSchema` | const | `packages/contracts/src/theme.ts:4` |
| `ThemeDefinition` | TypeAliasDeclaration | `packages/contracts/src/theme.ts:13` |
| `themeCSS` | FunctionDeclaration | `packages/contracts/src/theme.ts:22` |
| `ThemePresetIdSchema` | const | `packages/contracts/src/theme.ts:27` |
| `ThemePresetId` | TypeAliasDeclaration | `packages/contracts/src/theme.ts:28` |
| `ThemePreferencesSchema` | const | `packages/contracts/src/theme.ts:29` |
| `ThemePreferences` | TypeAliasDeclaration | `packages/contracts/src/theme.ts:33` |
| `DEFAULT_THEME_PREFERENCES` | const | `packages/contracts/src/theme.ts:34` |
| `THEME_PRESETS` | const | `packages/contracts/src/theme.ts:35` |
| `mixThemeColor` | FunctionDeclaration | `packages/contracts/src/theme.ts:42` |
| `themeContrast` | FunctionDeclaration | `packages/contracts/src/theme.ts:46` |
| `resolveAppearance` | FunctionDeclaration | `packages/contracts/src/theme.ts:59` |
| `GPU_PALETTE` | const | `packages/contracts/src/theme.ts:87` |
| `GpuPalette` | TypeAliasDeclaration | `packages/contracts/src/theme.ts:88` |
| `projectThemePaint` | FunctionDeclaration | `packages/contracts/src/theme.ts:91` |
| `FLUID_THEME` | const | `packages/contracts/src/theme.ts:98` |
| `appearanceCSS` | FunctionDeclaration | `packages/contracts/src/theme.ts:102` |
| `M7_DIRECTIONS` | const | `packages/contracts/src/workspace-qualification.ts:6` |
| `M7_EFFECT_IDS` | const | `packages/contracts/src/workspace-qualification.ts:7` |
| `M7_PHASES` | const | `packages/contracts/src/workspace-qualification.ts:8` |
| `WorkspaceQualificationCaseSchema` | const | `packages/contracts/src/workspace-qualification.ts:9` |
| `WorkspaceQualificationSchema` | const | `packages/contracts/src/workspace-qualification.ts:15` |
| `WorkspaceQualification` | TypeAliasDeclaration | `packages/contracts/src/workspace-qualification.ts:30` |
| `WorkspaceQualificationCase` | TypeAliasDeclaration | `packages/contracts/src/workspace-qualification.ts:31` |
| `MotionEnvironmentReportSchema` | const | `packages/contracts/src/workspace-qualification.ts:33` |
| `MotionEnvironmentReport` | TypeAliasDeclaration | `packages/contracts/src/workspace-qualification.ts:40` |
| `AgentBridgeError` | ClassDeclaration | `packages/core/src/agent.ts:12` |
| `AgentLocalAction` | TypeAliasDeclaration | `packages/core/src/agent.ts:15` |
| `AgentExternalAction` | TypeAliasDeclaration | `packages/core/src/agent.ts:20` |
| `AgentQuery` | TypeAliasDeclaration | `packages/core/src/agent.ts:27` |
| `defineAgentLocalAction` | FunctionDeclaration | `packages/core/src/agent.ts:31` |
| `defineAgentExternalAction` | FunctionDeclaration | `packages/core/src/agent.ts:40` |
| `defineAgentQuery` | FunctionDeclaration | `packages/core/src/agent.ts:65` |
| `createFluidAgentBridge` | FunctionDeclaration | `packages/core/src/agent.ts:105` |
| `CollectionBehaviorConfig` | TypeAliasDeclaration | `packages/core/src/collection.ts:6` |
| `CollectionTypeaheadInput` | TypeAliasDeclaration | `packages/core/src/collection.ts:17` |
| `createCollectionBehavior` | FunctionDeclaration | `packages/core/src/collection.ts:43` |
| `defineDataAdapter` | FunctionDeclaration | `packages/core/src/data.ts:5` |
| `StaleDataError` | ClassDeclaration | `packages/core/src/data.ts:36` |
| `createDataClient` | FunctionDeclaration | `packages/core/src/data.ts:39` |
| `defineActionAdapter` | FunctionDeclaration | `packages/core/src/data.ts:84` |
| `createActionClient` | FunctionDeclaration | `packages/core/src/data.ts:92` |
| `Clock` | InterfaceDeclaration | `packages/core/src/index.ts:15` |
| `TraceSink` | InterfaceDeclaration | `packages/core/src/index.ts:16` |
| `RouterAdapter` | InterfaceDeclaration | `packages/core/src/index.ts:17` |
| `Guard` | TypeAliasDeclaration | `packages/core/src/index.ts:18` |
| `Action` | TypeAliasDeclaration | `packages/core/src/index.ts:19` |
| `ChangeDetails` | InterfaceDeclaration | `packages/core/src/index.ts:20` |
| `RuntimeOptions` | InterfaceDeclaration | `packages/core/src/index.ts:26` |
| `EventResult` | TypeAliasDeclaration | `packages/core/src/index.ts:36` |
| `LocalTransactionAuthority` | TypeAliasDeclaration | `packages/core/src/index.ts:38` |
| `createFluidRuntime` | FunctionDeclaration | `packages/core/src/index.ts:53` |
| `FluidRuntime` | TypeAliasDeclaration | `packages/core/src/index.ts:524` |
| `flowToMermaid` | FunctionDeclaration | `packages/core/src/index.ts:526` |
| `SceneViewportSchema` | const | `packages/core/src/layout.ts:5` |
| `SceneViewport` | TypeAliasDeclaration | `packages/core/src/layout.ts:6` |
| `resolveSceneLayout` | FunctionDeclaration | `packages/core/src/layout.ts:16` |
| `defaultViewport` | const | `packages/core/src/surface-interactions.ts:6` |
| `createSurfaceInteractions` | FunctionDeclaration | `packages/core/src/surface-interactions.ts:11` |
| `EFFECT_LIBRARY` | const | `packages/effects/src/index.ts:7` |
| `effectReference` | FunctionDeclaration | `packages/effects/src/index.ts:15` |
| `findEffect` | FunctionDeclaration | `packages/effects/src/index.ts:16` |
| `transitionSeed` | FunctionDeclaration | `packages/effects/src/index.ts:17` |
| `resolveEffect` | FunctionDeclaration | `packages/effects/src/index.ts:29` |
| `validateEffectReplay` | FunctionDeclaration | `packages/effects/src/index.ts:77` |
| `validateMotionPlan` | FunctionDeclaration | `packages/effects/src/motion-plan.ts:25` |
| `compileMotionPlan` | FunctionDeclaration | `packages/effects/src/motion-plan.ts:51` |
| `sampleCorrespondenceMotion` | FunctionDeclaration | `packages/effects/src/motion-sampler.ts:26` |
| `TransitionClipSchema` | const | `packages/effects/src/presentation.ts:14` |
| `TransitionClip` | TypeAliasDeclaration | `packages/effects/src/presentation.ts:22` |
| `PresentationFrameSchema` | const | `packages/effects/src/presentation.ts:23` |
| `PresentationFrame` | TypeAliasDeclaration | `packages/effects/src/presentation.ts:30` |
| `createTransitionClip` | FunctionDeclaration | `packages/effects/src/presentation.ts:61` |
| `getTransitionQuality` | FunctionDeclaration | `packages/effects/src/presentation.ts:118` |
| `sampleTransitionClip` | FunctionDeclaration | `packages/effects/src/presentation.ts:136` |
| `capturePresentationCheckpoint` | FunctionDeclaration | `packages/effects/src/presentation.ts:268` |
| `captureTransitionSource` | FunctionDeclaration | `packages/effects/src/presentation.ts:275` |
| `normalizeVisualScenario` | FunctionDeclaration | `packages/effects/src/presentation.ts:300` |
| `recordTransitionClip` | FunctionDeclaration | `packages/effects/src/presentation.ts:311` |
| `createClipFromRecording` | FunctionDeclaration | `packages/effects/src/presentation.ts:322` |
| `MAX_COUPLING_SHAPES` | const | `packages/gpu-kernels/src/coupling.ts:7` |
| `couplingPrimitiveDistance` | const | `packages/gpu-kernels/src/coupling.ts:12` |
| `couplingSmoothUnion` | const | `packages/gpu-kernels/src/coupling.ts:32` |
| `couplingPaintWeight` | const | `packages/gpu-kernels/src/coupling.ts:41` |
| `createCouplingShader` | FunctionDeclaration | `packages/gpu-kernels/src/coupling.ts:51` |
| `panelDistance` | FunctionDeclaration | `packages/gpu-kernels/src/index.ts:13` |
| `createPanelShader` | FunctionDeclaration | `packages/gpu-kernels/src/index.ts:18` |
| `lensDisplacement` | const | `packages/gpu-kernels/src/index.ts:76` |
| `createLensCoordinates` | FunctionDeclaration | `packages/gpu-kernels/src/index.ts:89` |
| `createSoftShadow` | FunctionDeclaration | `packages/gpu-kernels/src/index.ts:122` |
| `verifyPanelKernel` | FunctionDeclaration | `packages/gpu-kernels/src/index.ts:137` |
| `HostMessages` | TypeAliasDeclaration | `packages/i18n/src/host-catalog.ts:4` |
| `createHostCatalog` | FunctionDeclaration | `packages/i18n/src/host-catalog.ts:6` |
| `MessageValues` | TypeAliasDeclaration | `packages/i18n/src/index.ts:7` |
| `formatNumber` | FunctionDeclaration | `packages/i18n/src/index.ts:25` |
| `getCollator` | FunctionDeclaration | `packages/i18n/src/index.ts:29` |
| `formatMessage` | FunctionDeclaration | `packages/i18n/src/index.ts:43` |
| `contentFingerprint` | FunctionDeclaration | `packages/i18n/src/index.ts:50` |
| `assertCompatibleMessage` | FunctionDeclaration | `packages/i18n/src/index.ts:74` |
| `FluidCatalog` | InterfaceDeclaration | `packages/i18n/src/index.ts:78` |
| `defineCatalog` | FunctionDeclaration | `packages/i18n/src/index.ts:84` |
| `LOCALES` | const | `packages/i18n/src/locale.ts:3` |
| `LocaleSchema` | const | `packages/i18n/src/locale.ts:4` |
| `Locale` | TypeAliasDeclaration | `packages/i18n/src/locale.ts:5` |
| `LOCALE_NAMES` | const | `packages/i18n/src/locale.ts:6` |
| `LocaleContextSchema` | const | `packages/i18n/src/locale.ts:8` |
| `LocaleContext` | TypeAliasDeclaration | `packages/i18n/src/locale.ts:18` |
| `resolveLocaleContext` | FunctionDeclaration | `packages/i18n/src/locale.ts:19` |
| `formatRegion` | const | `packages/i18n/src/locale.ts:22` |
| `DecisionProvider` | InterfaceDeclaration | `packages/intelligence/src/index.ts:3` |
| `FluidLocaleProvider` | FunctionDeclaration | `packages/react/src/index.tsx:19` |
| `FluidThemeProvider` | FunctionDeclaration | `packages/react/src/index.tsx:24` |
| `FluidProvider` | FunctionDeclaration | `packages/react/src/index.tsx:27` |
| `FluidContextValue` | TypeAliasDeclaration | `packages/react/src/index.tsx:39` |
| `useFluid` | FunctionDeclaration | `packages/react/src/index.tsx:47` |
| `FluidSurface` | FunctionDeclaration | `packages/react/src/index.tsx:61` |
| `AUTHORING_POLICY` | const | `packages/server/src/ai-authoring.ts:9` |
| `AuthoringDataScopeSchema` | const | `packages/server/src/ai-authoring.ts:25` |
| `AuthoringDataScope` | TypeAliasDeclaration | `packages/server/src/ai-authoring.ts:26` |
| `createBoundedAuthoringFetch` | FunctionDeclaration | `packages/server/src/ai-authoring.ts:29` |
| `createAuthoringService` | FunctionDeclaration | `packages/server/src/ai-authoring.ts:52` |
| `getConfiguredAuthoring` | FunctionDeclaration | `packages/server/src/ai-authoring.ts:122` |
| `qualifyReviewModel` | FunctionDeclaration | `packages/server/src/ai-review.ts:20` |
| `createAIReviewService` | FunctionDeclaration | `packages/server/src/ai-review.ts:41` |
| `getConfiguredReview` | FunctionDeclaration | `packages/server/src/ai-review.ts:99` |
| `reviewProviderLabel` | FunctionDeclaration | `packages/server/src/ai-review.ts:119` |
| `checkDevelopmentDocumentType` | FunctionDeclaration | `packages/server/src/development-proposal.ts:36` |
| `createDevelopmentProposal` | FunctionDeclaration | `packages/server/src/development-proposal.ts:117` |
| `readAcceptanceEvidence` | FunctionDeclaration | `packages/server/src/evidence-files.ts:7` |
| `validateFlow` | FunctionDeclaration | `packages/server/src/index.ts:6` |
| `getLocalStudioAccess` | FunctionDeclaration | `packages/server/src/local-access.ts:4` |
| `LOCAL_BUDGET` | const | `packages/server/src/local-project.ts:10` |
| `contentHash` | const | `packages/server/src/local-project.ts:11` |
| `workspaceDatasetHash` | FunctionDeclaration | `packages/server/src/local-project.ts:13` |
| `LocalBudgetAuthority` | InterfaceDeclaration | `packages/server/src/local-project.ts:16` |
| `findLocalProjectRoot` | FunctionDeclaration | `packages/server/src/local-project.ts:21` |
| `createLocalProjectStore` | FunctionDeclaration | `packages/server/src/local-project.ts:44` |
| `getLocalProjectStore` | const | `packages/server/src/local-project.ts:135` |
| `OPENAI_REVIEW_QUOTE` | const | `packages/server/src/openai-review.ts:9` |
| `createBoundedOpenAIFetch` | FunctionDeclaration | `packages/server/src/openai-review.ts:26` |
| `createOpenAIReviewModel` | FunctionDeclaration | `packages/server/src/openai-review.ts:45` |
| `responseLanguageInstruction` | FunctionDeclaration | `packages/server/src/response-language.ts:10` |
| `createLocalReviewAccess` | FunctionDeclaration | `packages/server/src/review-access.ts:4` |
| `readBoundedJSON` | FunctionDeclaration | `packages/server/src/review-access.ts:41` |
| `REVIEW_POLICY` | const | `packages/server/src/review-policy.ts:3` |
| `ReviewError` | ClassDeclaration | `packages/server/src/review-policy.ts:4` |
| `defineReviewQuote` | FunctionDeclaration | `packages/server/src/review-policy.ts:13` |
| `ReviewModelQuote` | TypeAliasDeclaration | `packages/server/src/review-policy.ts:20` |
| `intersectText` | FunctionDeclaration | `packages/testing/src/dom-quality.ts:5` |
| `occludedByChrome` | FunctionDeclaration | `packages/testing/src/dom-quality.ts:11` |
| `hiddenByClosedDetails` | FunctionDeclaration | `packages/testing/src/dom-quality.ts:36` |
| `inspectDomQuality` | FunctionDeclaration | `packages/testing/src/dom-quality.ts:55` |
| `inspectSemantics` | FunctionDeclaration | `packages/testing/src/dom-quality.ts:99` |
| `createTestClock` | FunctionDeclaration | `packages/testing/src/index.ts:5` |
| `runScenario` | FunctionDeclaration | `packages/testing/src/index.ts:9` |
| `ProcessObservation` | TypeAliasDeclaration | `packages/testing/src/load.ts:3` |
| `shortProcessName` | FunctionDeclaration | `packages/testing/src/load.ts:4` |
| `cpuTimeMs` | FunctionDeclaration | `packages/testing/src/load.ts:5` |
| `parseProcessSnapshot` | FunctionDeclaration | `packages/testing/src/load.ts:11` |
| `classifyProcesses` | FunctionDeclaration | `packages/testing/src/load.ts:24` |
| `parseTopCpu` | FunctionDeclaration | `packages/testing/src/load.ts:43` |
| `pressureLevel` | FunctionDeclaration | `packages/testing/src/load.ts:50` |
| `parseMemoryCsv` | FunctionDeclaration | `packages/testing/src/load.ts:54` |
| `parseSwapCounters` | FunctionDeclaration | `packages/testing/src/load.ts:60` |
| `parseGpuRegistry` | FunctionDeclaration | `packages/testing/src/load.ts:65` |
| `assessLoadWindow` | FunctionDeclaration | `packages/testing/src/load.ts:101` |
| `NativeProofPort` | TypeAliasDeclaration | `packages/testing/src/proof-capture.ts:7` |
| `NativeProofContext` | TypeAliasDeclaration | `packages/testing/src/proof-capture.ts:18` |
| `proofSha256` | FunctionDeclaration | `packages/testing/src/proof-capture.ts:20` |
| `proofImageBytes` | FunctionDeclaration | `packages/testing/src/proof-capture.ts:24` |
| `validateNativeProof` | FunctionDeclaration | `packages/testing/src/proof-capture.ts:37` |
| `captureNativeProof` | FunctionDeclaration | `packages/testing/src/proof-capture.ts:46` |
| `measuredCheck` | FunctionDeclaration | `packages/testing/src/quality.ts:3` |
| `openCheck` | FunctionDeclaration | `packages/testing/src/quality.ts:9` |
| `createQualityReport` | FunctionDeclaration | `packages/testing/src/quality.ts:12` |
| `summarizeQuality` | FunctionDeclaration | `packages/testing/src/quality.ts:15` |
| `textAuditCheck` | FunctionDeclaration | `packages/testing/src/quality.ts:22` |
| `replayReadabilityCheck` | FunctionDeclaration | `packages/testing/src/quality.ts:26` |
| `gpuReadabilityCheck` | FunctionDeclaration | `packages/testing/src/quality.ts:32` |
| `SequenceCaptureAdapter` | TypeAliasDeclaration | `packages/testing/src/sequence.ts:11` |
| `sequenceTimes` | FunctionDeclaration | `packages/testing/src/sequence.ts:23` |
| `captureSequence` | FunctionDeclaration | `packages/testing/src/sequence.ts:51` |
| `EffectDiagnosticAdapter` | TypeAliasDeclaration | `packages/testing/src/sequence.ts:145` |
| `stressEffect` | FunctionDeclaration | `packages/testing/src/sequence.ts:177` |
| `measureEffectPlayback` | FunctionDeclaration | `packages/testing/src/sequence.ts:207` |
| `VisualRetargetAdapter` | TypeAliasDeclaration | `packages/testing/src/sequence.ts:237` |
| `stressVisualRetargeting` | FunctionDeclaration | `packages/testing/src/sequence.ts:261` |
| `createStoryRunner` | FunctionDeclaration | `packages/testing/src/story.ts:4` |
| `qualificationGeometry` | FunctionDeclaration | `packages/testing/src/workspace-qualification.ts:4` |
| `endpointIssues` | FunctionDeclaration | `packages/testing/src/workspace-qualification.ts:8` |
| `checkpointComplete` | FunctionDeclaration | `packages/testing/src/workspace-qualification.ts:18` |
| `resolveGPUPreference` | FunctionDeclaration | `packages/webgpu/src/backend-policy.ts:4` |
| `observeSurfaceCapabilities` | FunctionDeclaration | `packages/webgpu/src/capabilities.ts:7` |
| `couplingBounds` | FunctionDeclaration | `packages/webgpu/src/coupling-layer.ts:9` |
| `createCouplingLayer` | FunctionDeclaration | `packages/webgpu/src/coupling-layer.ts:21` |
| `createEffectLayers` | FunctionDeclaration | `packages/webgpu/src/effect-layers.ts:9` |
| `resolveFocusRing` | FunctionDeclaration | `packages/webgpu/src/focus-ring.ts:11` |
| `FocusRingGeometry` | TypeAliasDeclaration | `packages/webgpu/src/focus-ring.ts:26` |
| `createFocusRing` | FunctionDeclaration | `packages/webgpu/src/focus-ring.ts:29` |
| `fetchSurfaceFontAssets` | FunctionDeclaration | `packages/webgpu/src/font-assets.ts:2` |
| `DEFAULT_PRIMARY_FONT_URL` | const | `packages/webgpu/src/fonts.ts:4` |
| `DEFAULT_FALLBACK_FONT_URLS` | const | `packages/webgpu/src/fonts.ts:5` |
| `loadSurfaceFonts` | FunctionDeclaration | `packages/webgpu/src/fonts.ts:8` |
| `PresentedHitTarget` | TypeAliasDeclaration | `packages/webgpu/src/hit-testing.ts:4` |
| `hitTestPresentation` | FunctionDeclaration | `packages/webgpu/src/hit-testing.ts:42` |
| `CapabilityError` | ClassDeclaration | `packages/webgpu/src/index.ts:35` |
| `SurfaceFontError` | ClassDeclaration | `packages/webgpu/src/index.ts:36` |
| `SurfaceMetrics` | InterfaceDeclaration | `packages/webgpu/src/index.ts:37` |
| `SurfaceOptions` | InterfaceDeclaration | `packages/webgpu/src/index.ts:38` |
| `TextSelection` | InterfaceDeclaration | `packages/webgpu/src/index.ts:51` |
| `layoutScene` | FunctionDeclaration | `packages/webgpu/src/index.ts:86` |
| `visibleRange` | FunctionDeclaration | `packages/webgpu/src/index.ts:90` |
| `createFluidSurface` | FunctionDeclaration | `packages/webgpu/src/index.ts:97` |
| `FluidSurfaceHandle` | TypeAliasDeclaration | `packages/webgpu/src/index.ts:644` |
| `SurfacePlaybackControls` | TypeAliasDeclaration | `packages/webgpu/src/index.ts:645` |
| `motionProgress` | FunctionDeclaration | `packages/webgpu/src/motion.ts:4` |
| `interpolateBounds` | FunctionDeclaration | `packages/webgpu/src/motion.ts:8` |
| `transitionStages` | FunctionDeclaration | `packages/webgpu/src/motion.ts:13` |
| `redactSceneNode` | FunctionDeclaration | `packages/webgpu/src/privacy.ts:4` |
| `createResourceLedger` | FunctionDeclaration | `packages/webgpu/src/resources.ts:4` |
| `ResourceLedger` | TypeAliasDeclaration | `packages/webgpu/src/resources.ts:15` |
| `createResourceScope` | FunctionDeclaration | `packages/webgpu/src/resources.ts:18` |
| `deriveLocalizedRecording` | FunctionDeclaration | `packages/webgpu/src/restage.ts:5` |
| `isTextSelectionVisible` | FunctionDeclaration | `packages/webgpu/src/selection-visibility.ts:5` |
| `glyphCaretAtOffset` | FunctionDeclaration | `packages/webgpu/src/text-input.ts:7` |
| `textInputScroll` | FunctionDeclaration | `packages/webgpu/src/text-input.ts:29` |
| `clipTextRect` | FunctionDeclaration | `packages/webgpu/src/text-input.ts:40` |
| `TEXT_LINE_HEIGHT` | const | `packages/webgpu/src/text-layout.ts:3` |
| `textRegion` | FunctionDeclaration | `packages/webgpu/src/text-layout.ts:5` |
| `overlappingText` | FunctionDeclaration | `packages/webgpu/src/text-layout.ts:13` |
| `recordingScale` | FunctionDeclaration | `packages/webgpu/src/text-layout.ts:25` |
| `createPresentationTimeline` | FunctionDeclaration | `packages/webgpu/src/timeline.ts:2` |

## Paket-Einstiegspunkte

### @fluidkit/cases

```json
{
  ".": {
    "types": "./src/index.ts",
    "default": "./src/index.ts"
  }
}
```

### @fluidkit/cli

```json
{
  ".": {
    "types": "./src/index.ts",
    "default": "./src/index.ts"
  }
}
```

### @fluidkit/contracts

```json
{
  ".": {
    "types": "./src/index.ts",
    "default": "./src/index.ts"
  }
}
```

### @fluidkit/core

```json
{
  "./layout": {
    "types": "./src/layout.ts",
    "default": "./src/layout.ts"
  },
  ".": {
    "types": "./src/index.ts",
    "default": "./src/index.ts"
  },
  "./data": {
    "types": "./src/data.ts",
    "default": "./src/data.ts"
  }
}
```

### @fluidkit/effects

```json
{
  ".": {
    "types": "./src/index.ts",
    "default": "./src/index.ts"
  }
}
```

### @fluidkit/gpu-kernels

```json
{
  ".": {
    "types": "./dist/index.d.ts",
    "default": "./dist/index.js"
  }
}
```

### @fluidkit/i18n

```json
{
  ".": {
    "types": "./src/index.ts",
    "default": "./src/index.ts"
  },
  "./locale": {
    "types": "./src/locale.ts",
    "default": "./src/locale.ts"
  },
  "./host": {
    "types": "./src/host-catalog.ts",
    "default": "./src/host-catalog.ts"
  }
}
```

### @fluidkit/intelligence

```json
{
  ".": {
    "types": "./src/index.ts",
    "default": "./src/index.ts"
  }
}
```

### @fluidkit/react

```json
{
  ".": {
    "types": "./src/index.tsx",
    "default": "./src/index.tsx"
  }
}
```

### @fluidkit/server

```json
{
  ".": {
    "types": "./src/index.ts",
    "default": "./src/index.ts"
  }
}
```

### @fluidkit/testing

```json
{
  "./proof-capture": {
    "types": "./src/proof-capture.ts",
    "default": "./src/proof-capture.ts"
  },
  "./sequence": {
    "types": "./src/sequence.ts",
    "default": "./src/sequence.ts"
  },
  "./story": {
    "types": "./src/story.ts",
    "default": "./src/story.ts"
  },
  "./quality": {
    "types": "./src/quality.ts",
    "default": "./src/quality.ts"
  },
  "./dom-quality": {
    "types": "./src/dom-quality.ts",
    "default": "./src/dom-quality.ts"
  },
  ".": {
    "types": "./src/index.ts",
    "default": "./src/index.ts"
  },
  "./workspace-qualification": {
    "types": "./src/workspace-qualification.ts",
    "default": "./src/workspace-qualification.ts"
  }
}
```

### @fluidkit/webgpu

```json
{
  ".": {
    "types": "./src/index.ts",
    "default": "./src/index.ts"
  }
}
```

## Signaturen und Typverträge

Aus der AST gelesene Signaturen, Interfaces und Typableitungen. Inferenz bleibt Inferenz; Rückgabemethoden sind zusätzlich im jeweiligen Laufzeitkonzept beschrieben. Konstante Schemas stehen vollständig in der Schema-Referenz.

### authoredWorkspaceHeight

Quelle: `packages/cases/src/authoring.ts:70`.

```typescript
export function authoredWorkspaceHeight(document: AuthoringDocument, width: number, moduleCount: number, inspectorOpen = false): number
```

### createAuthoredWorkspaceFlow

Quelle: `packages/cases/src/authoring.ts:74`.

```typescript
export function createAuthoredWorkspaceFlow(document: AuthoringDocument, data: WorkspaceData)
```

### authoredWorkspaceScene

Quelle: `packages/cases/src/authoring.ts:96`.

```typescript
export function authoredWorkspaceScene(document: AuthoringDocument, data: WorkspaceData, snapshot: RuntimeSnapshot,
  viewport: { width: number; height: number }, _effects?: EffectSettings, locale: Locale = 'de', context: Locale | LocaleContext = locale): SceneNode[]
```

### architectureReviewModule

Quelle: `packages/cases/src/flow-explorer.ts:12`.

```typescript
export function architectureReviewModule(data: WorkspaceData, moduleId?: string)
```

### createArchitectureReviewFlow

Quelle: `packages/cases/src/flow-explorer.ts:17`.

```typescript
export function createArchitectureReviewFlow(input: WorkspaceData, moduleId?: string, locale: Locale = 'de'): FlowDefinition
```

### architectureReviewGraph

Quelle: `packages/cases/src/flow-explorer.ts:32`.

```typescript
export function architectureReviewGraph(flow: FlowDefinition, locale: Locale = 'de')
```

### architectureReviewMermaid

Quelle: `packages/cases/src/flow-explorer.ts:36`.

```typescript
export function architectureReviewMermaid(flow: FlowDefinition, currentState?: string, locale: Locale = 'de')
```

### architectureReviewReturnUrl

Quelle: `packages/cases/src/flow-explorer.ts:46`.

```typescript
export function architectureReviewReturnUrl(moduleId: string)
```

### architectureReviewLayout

Quelle: `packages/cases/src/flow-explorer.ts:49`.

```typescript
export function architectureReviewLayout(width: number)
```

### architectureReviewHeight

Quelle: `packages/cases/src/flow-explorer.ts:61`.

```typescript
export function architectureReviewHeight(width: number)
```

### architectureReviewScene

Quelle: `packages/cases/src/flow-explorer.ts:63`.

```typescript
export function architectureReviewScene(data: WorkspaceData, moduleId: string, flow: FlowDefinition, snapshot: RuntimeSnapshot, viewport: { width: number; height: number }, locale: Locale = 'de', context: Locale | LocaleContext = locale): SceneNodeInput[]
```

### createProjectProof

Quelle: `packages/cases/src/index.ts:6`.

```typescript
export function createProjectProof(projectName: string, locale: Locale = 'de'): FlowDefinition
```

### projectProofOptions

Quelle: `packages/cases/src/index.ts:35`.

```typescript
export function projectProofOptions(flow: FlowDefinition)
```

### CaseMessageKey

Quelle: `packages/cases/src/messages.ts:216`.

```typescript
export type CaseMessageKey = keyof typeof messages;
```

### caseTranslator

Quelle: `packages/cases/src/messages.ts:217`.

```typescript
export function caseTranslator(locale: Locale | LocaleContext)
```

### searchText

Quelle: `packages/cases/src/messages.ts:223`.

```typescript
export function searchText(value: string, locale: Locale)
```

### compareIds

Quelle: `packages/cases/src/messages.ts:227`.

```typescript
export function compareIds(a: string, b: string)
```

### simulationRows

Quelle: `packages/cases/src/simulation-flow.ts:9`.

```typescript
export function simulationRows(dataset: SimulationDataset, snapshot: RuntimeSnapshot, locale: Locale = 'de')
```

### simulationCanPrepare

Quelle: `packages/cases/src/simulation-flow.ts:13`.

```typescript
export function simulationCanPrepare(dataset: SimulationDataset, snapshot: RuntimeSnapshot)
```

### createSimulationFlow

Quelle: `packages/cases/src/simulation-flow.ts:20`.

```typescript
export function createSimulationFlow(dataset: SimulationDataset)
```

### simulationScene

Quelle: `packages/cases/src/simulation-flow.ts:38`.

```typescript
export function simulationScene(dataset: SimulationDataset, snapshot: RuntimeSnapshot, viewport: { width: number; height: number }, locale: Locale = 'de', context: LocaleContext = resolveLocaleContext(locale)): SceneNodeInput[]
```

### simulationLocation

Quelle: `packages/cases/src/simulation-flow.ts:121`.

```typescript
export function simulationLocation(search:string,dataset:SimulationDataset)
```

### simulationSearch

Quelle: `packages/cases/src/simulation-flow.ts:127`.

```typescript
export function simulationSearch(snapshot:RuntimeSnapshot)
```

### SimulationDataset

Quelle: `packages/cases/src/simulation.ts:31`.

```typescript
export type SimulationDataset = z.infer<typeof SimulationDatasetSchema>;
```

### SimulationRecord

Quelle: `packages/cases/src/simulation.ts:32`.

```typescript
export type SimulationRecord = z.infer<typeof SimulationRecordSchema>;
```

### filterSimulationRecords

Quelle: `packages/cases/src/simulation.ts:35`.

```typescript
export function filterSimulationRecords(dataset: SimulationDataset, query: z.infer<typeof SimulationQuerySchema>)
```

### createSimulationAdapter

Quelle: `packages/cases/src/simulation.ts:41`.

```typescript
export function createSimulationAdapter(dataset: SimulationDataset)
```

### selectedSimulationRecord

Quelle: `packages/cases/src/simulation.ts:50`.

```typescript
export function selectedSimulationRecord(dataset: SimulationDataset, snapshot: RuntimeSnapshot)
```

### AtlasRect

Quelle: `packages/cases/src/workspace-atlas.ts:7`.

```typescript
export type AtlasRect = { x: number; y: number; width: number; height: number };
```

### AtlasCell

Quelle: `packages/cases/src/workspace-atlas.ts:8`.

```typescript
export type AtlasCell = AtlasRect & { id: string; weight: number };
```

### workspaceTreemap

Quelle: `packages/cases/src/workspace-atlas.ts:10`.

```typescript
export function workspaceTreemap(items: readonly { id: string; weight: number }[], bounds: AtlasRect): AtlasCell[]
```

### workspaceAtlasCells

Quelle: `packages/cases/src/workspace-atlas.ts:35`.

```typescript
export function workspaceAtlasCells(modules: readonly WorkspaceModule[], metric: 'files' | 'lines', bounds: AtlasRect)
```

### workspaceAtlasScene

Quelle: `packages/cases/src/workspace-atlas.ts:42`.

```typescript
export function workspaceAtlasScene(rows: WorkspaceModule[], snapshot: RuntimeSnapshot, width: number, project: WorkspaceModuleProjector, locale: Locale | LocaleContext = 'de'): SceneNodeInput[]
```

### WorkspaceModuleProjector

Quelle: `packages/cases/src/workspace-compare.ts:6`.

```typescript
export type WorkspaceModuleProjector = (module: WorkspaceModule, layouts: ComponentInstantiation['layouts']) => SceneNodeInput[];
```

### workspaceSuggestedComparison

Quelle: `packages/cases/src/workspace-compare.ts:8`.

```typescript
export function workspaceSuggestedComparison(data: WorkspaceData): string[]
```

### workspaceWrap

Quelle: `packages/cases/src/workspace-compare.ts:14`.

```typescript
export function workspaceWrap(value: string, width: number, fontSize = 12): string[]
```

### workspaceViewNode

Quelle: `packages/cases/src/workspace-compare.ts:29`.

```typescript
export function workspaceViewNode(id: string, input: Omit<SceneNodeInput, 'id' | 'anatomy'> & { anatomy?: SceneNodeInput['anatomy'] }): SceneNodeInput
```

### workspaceViewText

Quelle: `packages/cases/src/workspace-compare.ts:33`.

```typescript
export function workspaceViewText(id: string, value: string, x: number, y: number, width: number, fontSize = 12, foreground: string = P.muted): SceneNodeInput
```

### workspaceComparison

Quelle: `packages/cases/src/workspace-compare.ts:38`.

```typescript
export function workspaceComparison(modules: WorkspaceModule[], locale: Locale | LocaleContext = 'de')
```

### workspaceCompareScene

Quelle: `packages/cases/src/workspace-compare.ts:52`.

```typescript
export function workspaceCompareScene(data: WorkspaceData, snapshot: RuntimeSnapshot, width: number, project: WorkspaceModuleProjector, locale: Locale = 'de', context: Locale | LocaleContext = locale): SceneNodeInput[]
```

### workspaceLayout

Quelle: `packages/cases/src/workspace-layout.ts:2`.

```typescript
export function workspaceLayout(width: number, moduleCount: number, effectCount: number, inspectorOpen = false)
```

### createWorkspaceStory

Quelle: `packages/cases/src/workspace-story.ts:6`.

```typescript
export function createWorkspaceStory(data: WorkspaceData, locale: Locale = 'de')
```

### WorkspaceData

Quelle: `packages/cases/src/workspace.ts:22`.

```typescript
export type WorkspaceData = z.infer<typeof WorkspaceDataSchema>;
```

### WorkspaceModule

Quelle: `packages/cases/src/workspace.ts:23`.

```typescript
export type WorkspaceModule = z.infer<typeof WorkspaceModuleSchema>;
```

### readWorkspaceLocation

Quelle: `packages/cases/src/workspace.ts:33`.

```typescript
export function readWorkspaceLocation(search: string, data: WorkspaceData)
```

### workspaceSearch

Quelle: `packages/cases/src/workspace.ts:41`.

```typescript
export function workspaceSearch(snapshot: RuntimeSnapshot)
```

### workspaceSelection

Quelle: `packages/cases/src/workspace.ts:50`.

```typescript
export function workspaceSelection(snapshot: RuntimeSnapshot): string[]
```

### workspaceRows

Quelle: `packages/cases/src/workspace.ts:54`.

```typescript
export function workspaceRows(data: WorkspaceData, snapshot: RuntimeSnapshot, locale: Locale = 'de')
```

### workspaceCollectionOrder

Quelle: `packages/cases/src/workspace.ts:70`.

```typescript
export function workspaceCollectionOrder(data: WorkspaceData, snapshot: RuntimeSnapshot, locale: Locale = 'de'): string[]
```

### createWorkspaceFlow

Quelle: `packages/cases/src/workspace.ts:79`.

```typescript
export function createWorkspaceFlow(data: WorkspaceData, locale: Locale = 'de')
```

### workspaceScene

Quelle: `packages/cases/src/workspace.ts:118`.

```typescript
export function workspaceScene(data: WorkspaceData, snapshot: RuntimeSnapshot, viewport: { width: number; height: number }, effects?: EffectSettings, locale: Locale = 'de', context: Locale | LocaleContext = locale): SceneNodeInput[]
```

### workspaceSurfaceHeight

Quelle: `packages/cases/src/workspace.ts:334`.

```typescript
export function workspaceSurfaceHeight(data: WorkspaceData, snapshot: RuntimeSnapshot, width: number, effectCount = EFFECT_LIBRARY.length, locale: Locale = 'de', context: Locale | LocaleContext = locale)
```

### AcceptanceCriterion

Quelle: `packages/contracts/src/acceptance.ts:17`.

```typescript
export type AcceptanceCriterion = z.infer<typeof AcceptanceCriterionSchema>;
```

### AcceptanceLedger

Quelle: `packages/contracts/src/acceptance.ts:18`.

```typescript
export type AcceptanceLedger = z.infer<typeof AcceptanceLedgerSchema>;
```

### AgentScope

Quelle: `packages/contracts/src/agent.ts:65`.

```typescript
export type AgentScope = z.infer<typeof AgentScopeSchema>;
```

### AgentActionRef

Quelle: `packages/contracts/src/agent.ts:66`.

```typescript
export type AgentActionRef = z.infer<typeof AgentActionRefSchema>;
```

### AgentRequest

Quelle: `packages/contracts/src/agent.ts:67`.

```typescript
export type AgentRequest = z.infer<typeof AgentRequestSchema>;
```

### AgentStep

Quelle: `packages/contracts/src/agent.ts:68`.

```typescript
export type AgentStep = z.infer<typeof AgentStepSchema>;
```

### AgentPolicy

Quelle: `packages/contracts/src/agent.ts:69`.

```typescript
export type AgentPolicy = z.infer<typeof AgentPolicySchema>;
```

### AgentQueryRequest

Quelle: `packages/contracts/src/agent.ts:70`.

```typescript
export type AgentQueryRequest = z.infer<typeof AgentQueryRequestSchema>;
```

### AgentReadSnapshot

Quelle: `packages/contracts/src/agent.ts:71`.

```typescript
export type AgentReadSnapshot = z.infer<typeof AgentReadSnapshotSchema>;
```

### AgentExecution

Quelle: `packages/contracts/src/agent.ts:72`.

```typescript
export type AgentExecution = z.infer<typeof AgentExecutionSchema>;
```

### AgentProposal

Quelle: `packages/contracts/src/agent.ts:73`.

```typescript
export type AgentProposal = z.infer<typeof AgentProposalSchema>;
```

### AgentStepResult

Quelle: `packages/contracts/src/agent.ts:74`.

```typescript
export type AgentStepResult = z.infer<typeof AgentStepResultSchema>;
```

### AgentErrorCode

Quelle: `packages/contracts/src/agent.ts:75`.

```typescript
export type AgentErrorCode = z.infer<typeof AgentErrorCodeSchema>;
```

### LocalCommand

Quelle: `packages/contracts/src/agent.ts:76`.

```typescript
export type LocalCommand = z.infer<typeof LocalCommandSchema>;
```

### LocalTransaction

Quelle: `packages/contracts/src/agent.ts:77`.

```typescript
export type LocalTransaction = z.infer<typeof LocalTransactionSchema>;
```

### AuthoringDocument

Quelle: `packages/contracts/src/authoring.ts:31`.

```typescript
export type AuthoringDocument = z.infer<typeof AuthoringDocumentSchema>;
```

### AuthoringSection

Quelle: `packages/contracts/src/authoring.ts:32`.

```typescript
export type AuthoringSection = z.infer<typeof AuthoringSectionSchema>;
```

### AuthoringRequest

Quelle: `packages/contracts/src/authoring.ts:47`.

```typescript
export type AuthoringRequest = z.infer<typeof AuthoringRequestSchema>;
```

### AuthoringResult

Quelle: `packages/contracts/src/authoring.ts:63`.

```typescript
export type AuthoringResult = z.infer<typeof AuthoringResultSchema>;
```

### AuthoringStreamEvent

Quelle: `packages/contracts/src/authoring.ts:69`.

```typescript
export type AuthoringStreamEvent = z.infer<typeof AuthoringStreamEventSchema>;
```

### MultipartComponentDefinition

Quelle: `packages/contracts/src/components.ts:83`.

```typescript
export type MultipartComponentDefinition = z.infer<typeof MultipartComponentDefinitionSchema>;
```

### ComponentPart

Quelle: `packages/contracts/src/components.ts:84`.

```typescript
export type ComponentPart = z.infer<typeof ComponentPartSchema>;
```

### ComponentCapabilities

Quelle: `packages/contracts/src/components.ts:85`.

```typescript
export type ComponentCapabilities = z.infer<typeof ComponentCapabilitiesSchema>;
```

### MultipartComponentInstance

Quelle: `packages/contracts/src/components.ts:114`.

```typescript
export type MultipartComponentInstance = z.infer<typeof MultipartComponentInstanceSchema>;
```

### ComponentInstantiation

Quelle: `packages/contracts/src/components.ts:124`.

```typescript
export type ComponentInstantiation = z.input<typeof ComponentInstantiationSchema>;
```

### defineMultipartComponent

Quelle: `packages/contracts/src/components.ts:126`.

```typescript
export function defineMultipartComponent(input: z.input<typeof MultipartComponentDefinitionSchema>): MultipartComponentDefinition
```

### instantiateMultipartComponent

Quelle: `packages/contracts/src/components.ts:158`.

```typescript
export function instantiateMultipartComponent(input: MultipartComponentDefinition, options: ComponentInstantiation): MultipartComponentInstance
```

### projectMultipartComponent

Quelle: `packages/contracts/src/components.ts:169`.

```typescript
export function projectMultipartComponent(input: MultipartComponentDefinition, value: MultipartComponentInstance): SceneNode[]
```

### DataSource

Quelle: `packages/contracts/src/data.ts:14`.

```typescript
export type DataSource = z.infer<typeof DataSourceSchema>;
```

### ActionContext

Quelle: `packages/contracts/src/data.ts:19`.

```typescript
export type ActionContext = z.infer<typeof ActionContextSchema>;
```

### dataResultSchema

Quelle: `packages/contracts/src/data.ts:20`.

```typescript
export function dataResultSchema<T extends z.ZodType>(schema: T)
```

### DevelopmentProposalRequest

Quelle: `packages/contracts/src/development-proposal.ts:14`.

```typescript
export type DevelopmentProposalRequest = z.infer<typeof DevelopmentProposalRequestSchema>;
```

### DevelopmentProposal

Quelle: `packages/contracts/src/development-proposal.ts:36`.

```typescript
export type DevelopmentProposal = z.infer<typeof DevelopmentProposalSchema>;
```

### EffectReference

Quelle: `packages/contracts/src/effects.ts:6`.

```typescript
export type EffectReference = z.infer<typeof EffectReferenceSchema>;
```

### EffectRule

Quelle: `packages/contracts/src/effects.ts:21`.

```typescript
export type EffectRule = z.infer<typeof EffectRuleSchema>;
```

### VisualCommand

Quelle: `packages/contracts/src/effects.ts:27`.

```typescript
export type VisualCommand = z.infer<typeof VisualCommandSchema>;
```

### EffectSettings

Quelle: `packages/contracts/src/effects.ts:43`.

```typescript
export type EffectSettings = z.infer<typeof EffectSettingsSchema>;
```

### EffectDefinition

Quelle: `packages/contracts/src/effects.ts:58`.

```typescript
export type EffectDefinition = z.infer<typeof EffectDefinitionSchema>;
```

### RenderCapabilities

Quelle: `packages/contracts/src/effects.ts:63`.

```typescript
export type RenderCapabilities = z.infer<typeof RenderCapabilitiesSchema>;
```

### ResolvedEffectPlan

Quelle: `packages/contracts/src/effects.ts:91`.

```typescript
export type ResolvedEffectPlan = z.infer<typeof ResolvedEffectPlanSchema>;
```

### VisualState

Quelle: `packages/contracts/src/effects.ts:98`.

```typescript
export type VisualState = z.infer<typeof VisualStateSchema>;
```

### Json

Quelle: `packages/contracts/src/index.ts:11`.

```typescript
export type Json = z.infer<typeof JsonSchema>;
```

### BackendMode

Quelle: `packages/contracts/src/index.ts:14`.

```typescript
export type BackendMode = z.infer<typeof BackendModeSchema>;
```

### ControlMode

Quelle: `packages/contracts/src/index.ts:15`.

```typescript
export type ControlMode = z.infer<typeof ModeSchema>;
```

### PartDefinition

Quelle: `packages/contracts/src/index.ts:23`.

```typescript
export type PartDefinition = z.infer<typeof PartDefinitionSchema>;
```

### SceneNode

Quelle: `packages/contracts/src/index.ts:68`.

```typescript
export type SceneNode = z.infer<typeof SceneNodeSchema>;
```

### SceneNodeInput

Quelle: `packages/contracts/src/index.ts:69`.

```typescript
export type SceneNodeInput = z.input<typeof SceneNodeSchema>;
```

### FieldValue

Quelle: `packages/contracts/src/index.ts:71`.

```typescript
export type FieldValue = z.infer<typeof FieldValueSchema>;
```

### isFieldValue

Quelle: `packages/contracts/src/index.ts:79`.

```typescript
export function isFieldValue(field: z.infer<typeof FieldSchema>, value: unknown): value is FieldValue
```

### FlowDefinition

Quelle: `packages/contracts/src/index.ts:186`.

```typescript
export type FlowDefinition = z.infer<typeof FlowDefinitionSchema>;
```

### ComponentDefinition

Quelle: `packages/contracts/src/index.ts:189`.

```typescript
export type ComponentDefinition = z.infer<typeof ComponentDefinitionSchema>;
```

### RuntimeSnapshot

Quelle: `packages/contracts/src/index.ts:195`.

```typescript
export type RuntimeSnapshot = z.infer<typeof RuntimeSnapshotSchema>;
```

### InteractionSnapshot

Quelle: `packages/contracts/src/index.ts:201`.

```typescript
export type InteractionSnapshot = z.infer<typeof InteractionSnapshotSchema>;
```

### ChangeReason

Quelle: `packages/contracts/src/index.ts:203`.

```typescript
export type ChangeReason = z.infer<typeof ChangeReasonSchema>;
```

### RuntimeEvent

Quelle: `packages/contracts/src/index.ts:212`.

```typescript
export type RuntimeEvent = z.infer<typeof RuntimeEventSchema>;
```

### DecisionPlan

Quelle: `packages/contracts/src/index.ts:219`.

```typescript
export type DecisionPlan = z.infer<typeof DecisionPlanSchema>;
```

### TraceEntry

Quelle: `packages/contracts/src/index.ts:229`.

```typescript
export type TraceEntry = z.infer<typeof TraceEntrySchema>;
```

### ScenarioDefinition

Quelle: `packages/contracts/src/index.ts:237`.

```typescript
export type ScenarioDefinition = z.infer<typeof ScenarioDefinitionSchema>;
```

### Dataset

Quelle: `packages/contracts/src/index.ts:243`.

```typescript
export type Dataset = z.infer<typeof DatasetSchema>;
```

### FluidProject

Quelle: `packages/contracts/src/index.ts:253`.

```typescript
export type FluidProject = z.infer<typeof ProjectSchema>;
```

### defineFlow

Quelle: `packages/contracts/src/index.ts:254`.

```typescript
export function defineFlow(input: z.input<typeof FlowDefinitionSchema>): FlowDefinition
```

### defineComponent

Quelle: `packages/contracts/src/index.ts:255`.

```typescript
export function defineComponent(input: z.input<typeof ComponentDefinitionSchema>): ComponentDefinition
```

### RecordingLanguageProfile

Quelle: `packages/contracts/src/index.ts:276`.

```typescript
export type RecordingLanguageProfile = z.infer<typeof RecordingLanguageProfileSchema>;
```

### TextInkBox

Quelle: `packages/contracts/src/index.ts:300`.

```typescript
export type TextInkBox=z.infer<typeof TextInkBoxSchema>;
```

### TextAudit

Quelle: `packages/contracts/src/index.ts:308`.

```typescript
export type TextAudit=z.infer<typeof TextAuditSchema>;
```

### VisualScenario

Quelle: `packages/contracts/src/index.ts:309`.

```typescript
export type VisualScenario = z.infer<typeof VisualScenarioSchema>;
```

### RestagedRecording

Quelle: `packages/contracts/src/index.ts:314`.

```typescript
export type RestagedRecording = z.infer<typeof RestagedRecordingSchema>;
```

### NativeInputObservation

Quelle: `packages/contracts/src/input-observation.ts:13`.

```typescript
export type NativeInputObservation = z.infer<typeof NativeInputObservationSchema>;
```

### NativeInputProtocol

Quelle: `packages/contracts/src/input-observation.ts:20`.

```typescript
export type NativeInputProtocol = z.infer<typeof NativeInputProtocolSchema>;
```

### ResourceKind

Quelle: `packages/contracts/src/lifecycle.ts:17`.

```typescript
export type ResourceKind = z.infer<typeof ResourceKindSchema>;
```

### ResourceSnapshot

Quelle: `packages/contracts/src/lifecycle.ts:18`.

```typescript
export type ResourceSnapshot = z.infer<typeof ResourceSnapshotSchema>;
```

### LifecycleRun

Quelle: `packages/contracts/src/lifecycle.ts:19`.

```typescript
export type LifecycleRun = z.infer<typeof LifecycleRunSchema>;
```

### LoadPolicy

Quelle: `packages/contracts/src/load.d.ts:33`.

```typescript
export type LoadPolicy = z.infer<typeof LoadPolicySchema>;
```

### LoadProcess

Quelle: `packages/contracts/src/load.d.ts:56`.

```typescript
export type LoadProcess = z.infer<typeof LoadProcessSchema>;
```

### LoadGpu

Quelle: `packages/contracts/src/load.d.ts:79`.

```typescript
export type LoadGpu = z.infer<typeof LoadGpuSchema>;
```

### LoadSample

Quelle: `packages/contracts/src/load.d.ts:177`.

```typescript
export type LoadSample = z.infer<typeof LoadSampleSchema>;
```

### LoadReport

Quelle: `packages/contracts/src/load.d.ts:300`.

```typescript
export type LoadReport = z.infer<typeof LoadReportSchema>;
```

### LoadWindow

Quelle: `packages/contracts/src/load.d.ts:309`.

```typescript
export type LoadWindow = z.infer<typeof LoadWindowSchema>;
```

### LoadAssessment

Quelle: `packages/contracts/src/load.d.ts:346`.

```typescript
export type LoadAssessment = z.infer<typeof LoadAssessmentSchema>;
```

### LoadPolicy

Quelle: `packages/contracts/src/load.ts:21`.

```typescript
export type LoadPolicy = z.infer<typeof LoadPolicySchema>;
```

### LoadProcess

Quelle: `packages/contracts/src/load.ts:28`.

```typescript
export type LoadProcess = z.infer<typeof LoadProcessSchema>;
```

### LoadGpu

Quelle: `packages/contracts/src/load.ts:36`.

```typescript
export type LoadGpu = z.infer<typeof LoadGpuSchema>;
```

### LoadSample

Quelle: `packages/contracts/src/load.ts:51`.

```typescript
export type LoadSample = z.infer<typeof LoadSampleSchema>;
```

### LoadReport

Quelle: `packages/contracts/src/load.ts:63`.

```typescript
export type LoadReport = z.infer<typeof LoadReportSchema>;
```

### LoadWindow

Quelle: `packages/contracts/src/load.ts:68`.

```typescript
export type LoadWindow = z.infer<typeof LoadWindowSchema>;
```

### LoadAssessment

Quelle: `packages/contracts/src/load.ts:79`.

```typescript
export type LoadAssessment = z.infer<typeof LoadAssessmentSchema>;
```

### LocalDraftVersion

Quelle: `packages/contracts/src/local-project.ts:18`.

```typescript
export type LocalDraftVersion = z.infer<typeof LocalDraftVersionSchema>;
```

### LocalBudgetSummary

Quelle: `packages/contracts/src/local-project.ts:24`.

```typescript
export type LocalBudgetSummary = z.infer<typeof LocalBudgetSummarySchema>;
```

### LocalReviewEvidence

Quelle: `packages/contracts/src/local-project.ts:36`.

```typescript
export type LocalReviewEvidence = z.infer<typeof LocalReviewEvidenceSchema>;
```

### M8Qualification

Quelle: `packages/contracts/src/m8-qualification.ts:81`.

```typescript
export type M8Qualification = z.infer<typeof M8QualificationSchema>;
```

### M8QualificationCase

Quelle: `packages/contracts/src/m8-qualification.ts:82`.

```typescript
export type M8QualificationCase = z.infer<typeof M8QualificationCaseSchema>;
```

### summarizeM8Timings

Quelle: `packages/contracts/src/m8-timing.ts:9`.

```typescript
export function summarizeM8Timings(intervals: readonly number[])
```

### M8TimingReport

Quelle: `packages/contracts/src/m8-timing.ts:63`.

```typescript
export type M8TimingReport = z.infer<typeof M8TimingReportSchema>;
```

### M8TimingCase

Quelle: `packages/contracts/src/m8-timing.ts:64`.

```typescript
export type M8TimingCase = z.infer<typeof M8TimingCaseSchema>;
```

### M8TimingWarmup

Quelle: `packages/contracts/src/m8-timing.ts:65`.

```typescript
export type M8TimingWarmup = z.infer<typeof M8TimingWarmupSchema>;
```

### resolveMotionPorts

Quelle: `packages/contracts/src/motion-geometry.ts:4`.

```typescript
export function resolveMotionPorts(input: readonly SceneNode[]): SceneNode[]
```

### SceneMotion

Quelle: `packages/contracts/src/motion.ts:33`.

```typescript
export type SceneMotion = z.infer<typeof SceneMotionSchema>;
```

### MotionPlan

Quelle: `packages/contracts/src/motion.ts:45`.

```typescript
export type MotionPlan = z.infer<typeof MotionPlanSchema>;
```

### MorphRelation

Quelle: `packages/contracts/src/motion.ts:46`.

```typescript
export type MorphRelation = z.infer<typeof MorphRelationSchema>;
```

### MotionVelocity

Quelle: `packages/contracts/src/motion.ts:48`.

```typescript
export type MotionVelocity = z.infer<typeof MotionVelocitySchema>;
```

### CouplingPresentation

Quelle: `packages/contracts/src/motion.ts:55`.

```typescript
export type CouplingPresentation = z.infer<typeof CouplingPresentationSchema>;
```

### NativeTargetBounds

Quelle: `packages/contracts/src/native-targets.ts:24`.

```typescript
export type NativeTargetBounds = z.infer<typeof NativeTargetBoundsSchema>;
```

### NativeTargetObservation

Quelle: `packages/contracts/src/native-targets.ts:25`.

```typescript
export type NativeTargetObservation = z.infer<typeof NativeTargetObservationSchema>;
```

### NativeTargetAudit

Quelle: `packages/contracts/src/native-targets.ts:26`.

```typescript
export type NativeTargetAudit = z.infer<typeof NativeTargetAuditSchema>;
```

### PresentedNodeState

Quelle: `packages/contracts/src/presentation.ts:12`.

```typescript
export type PresentedNodeState = z.infer<typeof PresentedNodeStateSchema>;
```

### LensPresentation

Quelle: `packages/contracts/src/presentation.ts:18`.

```typescript
export type LensPresentation = z.infer<typeof LensPresentationSchema>;
```

### ParticlePresentation

Quelle: `packages/contracts/src/presentation.ts:25`.

```typescript
export type ParticlePresentation = z.infer<typeof ParticlePresentationSchema>;
```

### SourcePresentationCheckpoint

Quelle: `packages/contracts/src/presentation.ts:38`.

```typescript
export type SourcePresentationCheckpoint = z.infer<typeof SourcePresentationCheckpointSchema>;
```

### ProofViewport

Quelle: `packages/contracts/src/proof-capture.ts:66`.

```typescript
export type ProofViewport = z.infer<typeof ProofViewportSchema>;
```

### NativeProof

Quelle: `packages/contracts/src/proof-capture.ts:67`.

```typescript
export type NativeProof = z.infer<typeof NativeProofSchema>;
```

### QualityFinding

Quelle: `packages/contracts/src/quality.ts:37`.

```typescript
export type QualityFinding = z.infer<typeof QualityFindingSchema>;
```

### QualityCheck

Quelle: `packages/contracts/src/quality.ts:38`.

```typescript
export type QualityCheck = z.infer<typeof QualityCheckSchema>;
```

### QualityContext

Quelle: `packages/contracts/src/quality.ts:39`.

```typescript
export type QualityContext = z.infer<typeof QualityContextSchema>;
```

### QualityReport

Quelle: `packages/contracts/src/quality.ts:40`.

```typescript
export type QualityReport = z.infer<typeof QualityReportSchema>;
```

### StoryDefinition

Quelle: `packages/contracts/src/rehearsal.ts:25`.

```typescript
export type StoryDefinition = z.infer<typeof StoryDefinitionSchema>;
```

### CapturedFrame

Quelle: `packages/contracts/src/rehearsal.ts:37`.

```typescript
export type CapturedFrame = z.infer<typeof CapturedFrameSchema>;
```

### AIReviewFrame

Quelle: `packages/contracts/src/rehearsal.ts:42`.

```typescript
export type AIReviewFrame = z.infer<typeof AIReviewFrameSchema>;
```

### AIReviewBundle

Quelle: `packages/contracts/src/rehearsal.ts:52`.

```typescript
export type AIReviewBundle = z.infer<typeof AIReviewBundleSchema>;
```

### AIReviewFinding

Quelle: `packages/contracts/src/rehearsal.ts:63`.

```typescript
export type AIReviewFinding = z.infer<typeof AIReviewFindingSchema>;
```

### AIReviewOutput

Quelle: `packages/contracts/src/rehearsal.ts:68`.

```typescript
export type AIReviewOutput = z.infer<typeof AIReviewOutputSchema>;
```

### AIReviewResult

Quelle: `packages/contracts/src/rehearsal.ts:75`.

```typescript
export type AIReviewResult = z.infer<typeof AIReviewResultSchema>;
```

### AIReviewAssessment

Quelle: `packages/contracts/src/rehearsal.ts:83`.

```typescript
export type AIReviewAssessment = z.infer<typeof AIReviewAssessmentSchema>;
```

### AIReviewStatus

Quelle: `packages/contracts/src/rehearsal.ts:88`.

```typescript
export type AIReviewStatus = z.infer<typeof AIReviewStatusSchema>;
```

### validateReviewReferences

Quelle: `packages/contracts/src/rehearsal.ts:90`.

```typescript
export function validateReviewReferences(input: unknown, bundle: Pick<AIReviewBundle, 'frames'>): AIReviewOutput
```

### SequenceGeometry

Quelle: `packages/contracts/src/sequence-geometry.ts:8`.

```typescript
export type SequenceGeometry = z.infer<typeof SequenceGeometrySchema>;
```

### SequenceSample

Quelle: `packages/contracts/src/sequence.ts:38`.

```typescript
export type SequenceSample = z.infer<typeof SequenceSampleSchema>;
```

### SequenceReport

Quelle: `packages/contracts/src/sequence.ts:39`.

```typescript
export type SequenceReport = z.infer<typeof SequenceReportSchema>;
```

### EffectRuntimeMetrics

Quelle: `packages/contracts/src/sequence.ts:40`.

```typescript
export type EffectRuntimeMetrics = z.infer<typeof EffectRuntimeMetricsSchema>;
```

### EffectStressReport

Quelle: `packages/contracts/src/sequence.ts:48`.

```typescript
export type EffectStressReport = z.infer<typeof EffectStressReportSchema>;
```

### NaturalPlaybackReport

Quelle: `packages/contracts/src/sequence.ts:57`.

```typescript
export type NaturalPlaybackReport = z.infer<typeof NaturalPlaybackReportSchema>;
```

### VisualRetargetReport

Quelle: `packages/contracts/src/sequence.ts:68`.

```typescript
export type VisualRetargetReport = z.infer<typeof VisualRetargetReportSchema>;
```

### M7SurfaceCase

Quelle: `packages/contracts/src/surface-qualification.ts:42`.

```typescript
export type M7SurfaceCase = z.infer<typeof M7SurfaceCaseSchema>;
```

### M7SurfaceQualification

Quelle: `packages/contracts/src/surface-qualification.ts:43`.

```typescript
export type M7SurfaceQualification = z.infer<typeof M7SurfaceQualificationSchema>;
```

### resolveTextInsetY

Quelle: `packages/contracts/src/text-geometry.ts:2`.

```typescript
export function resolveTextInsetY(node: { textInsetY?: number }, height: number): number
```

### ThemeDefinition

Quelle: `packages/contracts/src/theme.ts:13`.

```typescript
export type ThemeDefinition = z.infer<typeof ThemeDefinitionSchema>;
```

### themeCSS

Quelle: `packages/contracts/src/theme.ts:22`.

```typescript
export function themeCSS(input: ThemeDefinition)
```

### ThemePresetId

Quelle: `packages/contracts/src/theme.ts:28`.

```typescript
export type ThemePresetId = z.infer<typeof ThemePresetIdSchema>;
```

### ThemePreferences

Quelle: `packages/contracts/src/theme.ts:33`.

```typescript
export type ThemePreferences = z.infer<typeof ThemePreferencesSchema>;
```

### mixThemeColor

Quelle: `packages/contracts/src/theme.ts:42`.

```typescript
export function mixThemeColor(from: string, to: string, amount: number)
```

### themeContrast

Quelle: `packages/contracts/src/theme.ts:46`.

```typescript
export function themeContrast(a: string, b: string)
```

### resolveAppearance

Quelle: `packages/contracts/src/theme.ts:59`.

```typescript
export function resolveAppearance(input: ThemePreferences = DEFAULT_THEME_PREFERENCES)
```

### GpuPalette

Quelle: `packages/contracts/src/theme.ts:88`.

```typescript
export type GpuPalette = typeof GPU_PALETTE;
```

### projectThemePaint

Quelle: `packages/contracts/src/theme.ts:91`.

```typescript
export function projectThemePaint<T extends { color: string; foreground: string }>(node: T, preferences: ThemePreferences, palette?: GpuPalette): T
```

### appearanceCSS

Quelle: `packages/contracts/src/theme.ts:102`.

```typescript
export function appearanceCSS(preferences: ThemePreferences = DEFAULT_THEME_PREFERENCES)
```

### WorkspaceQualification

Quelle: `packages/contracts/src/workspace-qualification.ts:30`.

```typescript
export type WorkspaceQualification = z.infer<typeof WorkspaceQualificationSchema>;
```

### WorkspaceQualificationCase

Quelle: `packages/contracts/src/workspace-qualification.ts:31`.

```typescript
export type WorkspaceQualificationCase = z.infer<typeof WorkspaceQualificationCaseSchema>;
```

### MotionEnvironmentReport

Quelle: `packages/contracts/src/workspace-qualification.ts:40`.

```typescript
export type MotionEnvironmentReport = z.infer<typeof MotionEnvironmentReportSchema>;
```

### AgentBridgeError

Quelle: `packages/core/src/agent.ts:12`.

```typescript
export class AgentBridgeError extends Error {
  constructor(readonly code: AgentErrorCode) { super(code); this.name = 'AgentBridgeError'; }
}
```

### AgentLocalAction

Quelle: `packages/core/src/agent.ts:15`.

```typescript
export type AgentLocalAction = {
  kind: 'local'; id: string; componentId: string;
  validate(parameters: unknown): void;
  commands(parameters: unknown): LocalCommand[];
};
```

### AgentExternalAction

Quelle: `packages/core/src/agent.ts:20`.

```typescript
export type AgentExternalAction = {
  kind: 'external'; id: string; componentId: string;
  validate(parameters: unknown): void;
  execute(client: ReturnType<typeof createActionClient>, parameters: unknown, context: ActionContext,
    options: { idempotencyKey: string; signal: AbortSignal; assertCurrent(): void; onStarted(): void }): Promise<unknown>;
  publicResult(value: unknown): Json | undefined;
};
```

### AgentQuery

Quelle: `packages/core/src/agent.ts:27`.

```typescript
export type AgentQuery = {
  id: string; validate(parameters: unknown): void;
  read(parameters: unknown, context: { snapshot: AgentReadSnapshot; signal: AbortSignal; assertCurrent(): void }): Promise<Json>;
};
```

### defineAgentLocalAction

Quelle: `packages/core/src/agent.ts:31`.

```typescript
export function defineAgentLocalAction<P extends z.ZodType>(definition: {
  id: string; componentId: string; parameters: P;
  commands(parameters: z.output<P>): readonly LocalCommand[];
}): AgentLocalAction
```

### defineAgentExternalAction

Quelle: `packages/core/src/agent.ts:40`.

```typescript
export function defineAgentExternalAction<I extends z.ZodType, O extends z.ZodType>(definition: {
  id: string; componentId: string; adapter: ReturnType<typeof defineActionAdapter<I, O>>;
  /** Omit this projection to expose no external result data. */
  publicResult?(result: z.output<O>): Json;
}): AgentExternalAction
```

### defineAgentQuery

Quelle: `packages/core/src/agent.ts:65`.

```typescript
export function defineAgentQuery<P extends z.ZodType, O extends z.ZodType>(definition: {
  id: string; parameters: P; result: O;
  read(parameters: z.output<P>, context: { snapshot: AgentReadSnapshot; signal: AbortSignal }): Promise<unknown>;
  /** Explicit public projection: raw adapter responses never leave the bridge. */
  publicResult(value: z.output<O>): Json;
}): AgentQuery
```

### createFluidAgentBridge

Quelle: `packages/core/src/agent.ts:105`.

```typescript
export function createFluidAgentBridge(options: BridgeOptions)
```

### CollectionBehaviorConfig

Quelle: `packages/core/src/collection.ts:6`.

```typescript
export type CollectionBehaviorConfig = {
  getKeys(): readonly string[];
  setKeys(keys: string[], reason: ChangeReason): boolean;
  /** The currently visible order, after sorting and filtering. */
  getOrder(): readonly string[];
  getLabel(key: string): string;
  getLocale?(): Locale;
  isSelectable?(key: string): boolean;
  now?(): number;
};
```

### CollectionTypeaheadInput

Quelle: `packages/core/src/collection.ts:17`.

```typescript
export type CollectionTypeaheadInput = {
  currentKey?: string | null;
  time?: number;
  composing?: boolean;
  editing?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
};
```

### createCollectionBehavior

Quelle: `packages/core/src/collection.ts:43`.

```typescript
export function createCollectionBehavior(config: CollectionBehaviorConfig)
```

### defineDataAdapter

Quelle: `packages/core/src/data.ts:5`.

```typescript
export function defineDataAdapter<Q extends z.ZodType, D extends z.ZodType>(definition: {
  id: string; version: string; query: Q; data: D;
  read(query: z.output<Q>, context: { signal: AbortSignal }): Promise<unknown>;
})
```

### StaleDataError

Quelle: `packages/core/src/data.ts:36`.

```typescript
export class StaleDataError extends Error { constructor() { super('Query no longer belongs to the current revision'); this.name = 'StaleDataError'; } }
```

### createDataClient

Quelle: `packages/core/src/data.ts:39`.

```typescript
export function createDataClient(options: { revision(): number; now?: () => number; maxCacheEntries?: number })
```

### defineActionAdapter

Quelle: `packages/core/src/data.ts:84`.

```typescript
export function defineActionAdapter<I extends z.ZodType, O extends z.ZodType>(definition: {
  id: string; version: string; input: I; output: O;
  authorize(input: z.output<I>, context: ActionContext): boolean | Promise<boolean>;
  execute(input: z.output<I>, context: ActionContext): Promise<unknown>;
})
```

### createActionClient

Quelle: `packages/core/src/data.ts:92`.

```typescript
export function createActionClient(options: { maxEntries?: number } = {})
```

### Clock

Quelle: `packages/core/src/index.ts:15`.

```typescript
export interface Clock { now(): number }
```

### TraceSink

Quelle: `packages/core/src/index.ts:16`.

```typescript
export interface TraceSink { write(entry: TraceEntry): void }
```

### RouterAdapter

Quelle: `packages/core/src/index.ts:17`.

```typescript
export interface RouterAdapter { navigate(path: string, replace: boolean): void }
```

### Guard

Quelle: `packages/core/src/index.ts:18`.

```typescript
export type Guard = (snapshot: RuntimeSnapshot, event: RuntimeEvent) => boolean;
```

### Action

Quelle: `packages/core/src/index.ts:19`.

```typescript
export type Action = (context: { snapshot: RuntimeSnapshot; event: RuntimeEvent; signal: AbortSignal }) => Promise<void>;
```

### ChangeDetails

Quelle: `packages/core/src/index.ts:20`.

```typescript
export interface ChangeDetails {
  readonly event: RuntimeEvent;
  readonly reason: ChangeReason;
  readonly isCanceled: boolean;
  cancel(): void;
}
```

### RuntimeOptions

Quelle: `packages/core/src/index.ts:26`.

```typescript
export interface RuntimeOptions {
  flow: FlowDefinition; locale?: Locale | LocaleContext; mode?: ControlMode; clock?: Clock; trace?: TraceSink; router?: RouterAdapter;
  guards?: Readonly<Record<string, Guard>>; actions?: Readonly<Record<string, Action>>;
  replay?: boolean; policyVersion?: string;
  effectSettings?: EffectSettings;
  effectReplay?: readonly ResolvedEffectPlan[];
  beforeChange?: (details: ChangeDetails, snapshot: RuntimeSnapshot) => void;
  projections?: Readonly<Record<string, (snapshot: RuntimeSnapshot, viewport: { width: number; height: number }, settings: EffectSettings, locale: Locale, context: LocaleContext) => SceneNodeInput[]>>;
  collectionOrder?: (snapshot: RuntimeSnapshot, collectionId: string, locale: Locale) => readonly string[];
}
```

### EventResult

Quelle: `packages/core/src/index.ts:36`.

```typescript
export type EventResult = { accepted: true; snapshot: RuntimeSnapshot } | { accepted: false; reason: string };
```

### LocalTransactionAuthority

Quelle: `packages/core/src/index.ts:38`.

```typescript
export type LocalTransactionAuthority = {
  source: 'user' | 'host' | 'ai' | 'replay'; reason: ChangeReason;
  authorize(): boolean;
  /** Explicit host approval for the Hybrid AI path. */
  approved?: boolean;
};
```

### createFluidRuntime

Quelle: `packages/core/src/index.ts:53`.

```typescript
export function createFluidRuntime(options: RuntimeOptions)
```

### FluidRuntime

Quelle: `packages/core/src/index.ts:524`.

```typescript
export type FluidRuntime = ReturnType<typeof createFluidRuntime>;
```

### flowToMermaid

Quelle: `packages/core/src/index.ts:526`.

```typescript
export function flowToMermaid(flow: FlowDefinition): string
```

### SceneViewport

Quelle: `packages/core/src/layout.ts:6`.

```typescript
export type SceneViewport = z.infer<typeof SceneViewportSchema>;
```

### resolveSceneLayout

Quelle: `packages/core/src/layout.ts:16`.

```typescript
export function resolveSceneLayout(nodes: readonly SceneNode[], viewport: SceneViewport): SceneNode[]
```

### createSurfaceInteractions

Quelle: `packages/core/src/surface-interactions.ts:11`.

```typescript
export function createSurfaceInteractions()
```

### effectReference

Quelle: `packages/effects/src/index.ts:15`.

```typescript
export function effectReference(effect: EffectDefinition): EffectReference
```

### findEffect

Quelle: `packages/effects/src/index.ts:16`.

```typescript
export function findEffect(ref: EffectReference, library = EFFECT_LIBRARY)
```

### transitionSeed

Quelle: `packages/effects/src/index.ts:17`.

```typescript
export function transitionSeed(runSeed: number, eventId: string, caseId: string): number
```

### resolveEffect

Quelle: `packages/effects/src/index.ts:29`.

```typescript
export function resolveEffect(input: {
  settings: EffectSettings; capabilities: RenderCapabilities;
  eventId: string; eventType: string; caseId: string; sourceState: string; targetState: string;
  sourceRevision: number; targetRevision: number; baseDuration: number; nodeCount: number;
  transitionRule?: EffectRule; protectedNodeIds?: string[]; library?: readonly EffectDefinition[];
}): ResolvedEffectPlan
```

### validateEffectReplay

Quelle: `packages/effects/src/index.ts:77`.

```typescript
export function validateEffectReplay(input: unknown, capabilities: RenderCapabilities, library = EFFECT_LIBRARY): ResolvedEffectPlan
```

### validateMotionPlan

Quelle: `packages/effects/src/motion-plan.ts:25`.

```typescript
export function validateMotionPlan(input: unknown, source: readonly SceneNode[], target: readonly SceneNode[]): MotionPlan
```

### compileMotionPlan

Quelle: `packages/effects/src/motion-plan.ts:51`.

```typescript
export function compileMotionPlan(source: readonly SceneNode[], target: readonly SceneNode[], sourceState?: string): MotionPlan
```

### sampleCorrespondenceMotion

Quelle: `packages/effects/src/motion-sampler.ts:26`.

```typescript
export function sampleCorrespondenceMotion(clip: TransitionClip, progress: number, options: { reducedMotion?: boolean }, legacy: PresentationFrame): PresentationFrame
```

### TransitionClip

Quelle: `packages/effects/src/presentation.ts:22`.

```typescript
export type TransitionClip = z.infer<typeof TransitionClipSchema>;
```

### PresentationFrame

Quelle: `packages/effects/src/presentation.ts:30`.

```typescript
export type PresentationFrame = z.infer<typeof PresentationFrameSchema>;
```

### createTransitionClip

Quelle: `packages/effects/src/presentation.ts:61`.

```typescript
export function createTransitionClip(input: z.input<typeof TransitionClipSchema>): TransitionClip
```

### getTransitionQuality

Quelle: `packages/effects/src/presentation.ts:118`.

```typescript
export function getTransitionQuality(clip: TransitionClip): Pick<NonNullable<ResolvedEffectPlan['presentation']>, 'quality' | 'particleBudget' | 'targetEdge'>
```

### sampleTransitionClip

Quelle: `packages/effects/src/presentation.ts:136`.

```typescript
export function sampleTransitionClip(clip: TransitionClip, progress: number, options: { reducedMotion?: boolean } = {}): PresentationFrame
```

### capturePresentationCheckpoint

Quelle: `packages/effects/src/presentation.ts:268`.

```typescript
export function capturePresentationCheckpoint(frame: PresentationFrame): SourcePresentationCheckpoint
```

### captureTransitionSource

Quelle: `packages/effects/src/presentation.ts:275`.

```typescript
export function captureTransitionSource(frame: PresentationFrame): Pick<TransitionClip, 'source' | 'sourceCheckpoint'>
```

### normalizeVisualScenario

Quelle: `packages/effects/src/presentation.ts:300`.

```typescript
export function normalizeVisualScenario(input: unknown): z.infer<typeof VisualScenarioV3Schema> | z.infer<typeof VisualScenarioV4Schema> | z.infer<typeof VisualScenarioV5Schema>
```

### recordTransitionClip

Quelle: `packages/effects/src/presentation.ts:311`.

```typescript
export function recordTransitionClip(clip: TransitionClip, caseId: string, redacted = false)
```

### createClipFromRecording

Quelle: `packages/effects/src/presentation.ts:322`.

```typescript
export function createClipFromRecording(input: unknown): TransitionClip
```

### createCouplingShader

Quelle: `packages/gpu-kernels/src/coupling.ts:51`.

```typescript
export function createCouplingShader()
```

### panelDistance

Quelle: `packages/gpu-kernels/src/index.ts:13`.

```typescript
export function panelDistance(x: number, y: number, width: number, height: number, radius: number): number
```

### createPanelShader

Quelle: `packages/gpu-kernels/src/index.ts:18`.

```typescript
export function createPanelShader(inputs: {
  size: ReturnType<typeof uniform<'vec2'>>;
  radius: ReturnType<typeof uniform<'float'>>;
  visibility: ReturnType<typeof uniform<'float'>>;
  effect: ReturnType<typeof uniform<'vec4'>>;
  seed: ReturnType<typeof uniform<'float'>>;
})
```

### createLensCoordinates

Quelle: `packages/gpu-kernels/src/index.ts:89`.

```typescript
export function createLensCoordinates(inputs: {
  origin: ReturnType<typeof uniform<'vec2'>>;
  size: ReturnType<typeof uniform<'vec2'>>;
  viewport: ReturnType<typeof uniform<'vec2'>>;
  lens: ReturnType<typeof uniform<'vec4'>>;
  phase: ReturnType<typeof uniform<'float'>>;
  amount: ReturnType<typeof uniform<'float'>>;
})
```

### createSoftShadow

Quelle: `packages/gpu-kernels/src/index.ts:122`.

```typescript
export function createSoftShadow(inputs: {
  size: ReturnType<typeof uniform<'vec2'>>; radius: ReturnType<typeof uniform<'float'>>;
  blur: ReturnType<typeof uniform<'float'>>; opacity: ReturnType<typeof uniform<'float'>>;
})
```

### verifyPanelKernel

Quelle: `packages/gpu-kernels/src/index.ts:137`.

```typescript
export async function verifyPanelKernel(device: GPUDevice)
```

### HostMessages

Quelle: `packages/i18n/src/host-catalog.ts:4`.

```typescript
export type HostMessages = Readonly<Record<string,string>>;
```

### createHostCatalog

Quelle: `packages/i18n/src/host-catalog.ts:6`.

```typescript
export function createHostCatalog(initial: LocaleContext, source: HostMessages)
```

### MessageValues

Quelle: `packages/i18n/src/index.ts:7`.

```typescript
export type MessageValues = Readonly<Record<string, string | number | boolean | Date | bigint>>;
```

### formatNumber

Quelle: `packages/i18n/src/index.ts:25`.

```typescript
export function formatNumber(locale: FormatContext, value: number | bigint, options: Intl.NumberFormatOptions = {}): string
```

### getCollator

Quelle: `packages/i18n/src/index.ts:29`.

```typescript
export function getCollator(locale: FormatContext, options: Intl.CollatorOptions = {}): Intl.Collator
```

### formatMessage

Quelle: `packages/i18n/src/index.ts:43`.

```typescript
export function formatMessage(locale: FormatContext, pattern: string, values?: MessageValues): string
```

### contentFingerprint

Quelle: `packages/i18n/src/index.ts:50`.

```typescript
export function contentFingerprint(text: string): string
```

### assertCompatibleMessage

Quelle: `packages/i18n/src/index.ts:74`.

```typescript
export function assertCompatibleMessage(source: string, translation: string)
```

### FluidCatalog

Quelle: `packages/i18n/src/index.ts:78`.

```typescript
export interface FluidCatalog<Entries extends Readonly<Record<string, Translations>>> {
  (locale: FormatContext, key: Extract<keyof Entries,string>, values?: MessageValues): string;
  typed<Key extends Extract<keyof Entries,string>>(locale: FormatContext, key: Key, ...args: keyof CatalogArguments<Entries[Key]['de']> extends never ? [] : [values:CatalogArguments<Entries[Key]['de']>]): string;
  fingerprint(locale: Locale): string;
  validate(): void;
}
```

### defineCatalog

Quelle: `packages/i18n/src/index.ts:84`.

```typescript
export function defineCatalog<const Entries extends Readonly<Record<string, Translations>>>(entries: Entries): FluidCatalog<Entries>
```

### Locale

Quelle: `packages/i18n/src/locale.ts:5`.

```typescript
export type Locale = z.infer<typeof LocaleSchema>;
```

### LocaleContext

Quelle: `packages/i18n/src/locale.ts:18`.

```typescript
export type LocaleContext = z.infer<typeof LocaleContextSchema>;
```

### resolveLocaleContext

Quelle: `packages/i18n/src/locale.ts:19`.

```typescript
export function resolveLocaleContext(language: Locale, options: Partial<Pick<LocaleContext, 'formatLocale' | 'timeZone'>> = {}): LocaleContext
```

### DecisionProvider

Quelle: `packages/intelligence/src/index.ts:3`.

```typescript
export interface DecisionProvider {
  propose(context: { snapshot: RuntimeSnapshot; allowedEvents: readonly string[]; signal: AbortSignal }): Promise<DecisionPlan | null>;
}
```

### FluidLocaleProvider

Quelle: `packages/react/src/index.tsx:19`.

```typescript
export function FluidLocaleProvider({locale, children}: {locale: Locale | FluidLocaleContext; children: ReactNode})
```

### FluidThemeProvider

Quelle: `packages/react/src/index.tsx:24`.

```typescript
export function FluidThemeProvider({ preferences, children }: { preferences: ThemePreferences; children: ReactNode })
```

### FluidProvider

Quelle: `packages/react/src/index.tsx:27`.

```typescript
export function FluidProvider({ runtime, children }: { runtime: FluidRuntime; children: ReactNode })
```

### FluidContextValue

Quelle: `packages/react/src/index.tsx:39`.

```typescript
export type FluidContextValue = {
  runtime: FluidRuntime;
  locale: Locale;
  localeContext: FluidLocaleContext;
  snapshot: ReturnType<FluidRuntime['getSnapshot']>;
  interaction: ReturnType<FluidRuntime['getInteraction']>;
  visual: ReturnType<FluidRuntime['getVisualState']>;
};
```

### useFluid

Quelle: `packages/react/src/index.tsx:47`.

```typescript
export function useFluid(): FluidContextValue
```

### FluidSurface

Quelle: `packages/react/src/index.tsx:61`.

```typescript
export function FluidSurface({ buildId, catalogFingerprint, fontUrl = DEFAULT_PRIMARY_FONT_URL, fallbackFontUrls, onMetrics, onControls, height, motionVersion, deviceLossToken = 0, backendMode = 'webgpu-first', resourceLedger, onError }: { buildId?:string; catalogFingerprint?: (locale: Locale) => string; fontUrl?: string; fallbackFontUrls?: readonly string[]; resourceLedger?: ResourceLedger; onError?: (error:Error)=>void; onMetrics?: (metrics: SurfaceMetrics) => void; onControls?: (controls: SurfacePlaybackControls | null) => void; height?: number; motionVersion?: 1 | 2; deviceLossToken?: number; backendMode?: BackendMode })
```

### AuthoringDataScope

Quelle: `packages/server/src/ai-authoring.ts:26`.

```typescript
export type AuthoringDataScope = z.infer<typeof AuthoringDataScopeSchema>;
```

### createBoundedAuthoringFetch

Quelle: `packages/server/src/ai-authoring.ts:29`.

```typescript
export function createBoundedAuthoringFetch(transport: typeof fetch = fetch): typeof fetch
```

### createAuthoringService

Quelle: `packages/server/src/ai-authoring.ts:52`.

```typescript
export function createAuthoringService(options: { model: LanguageModel; now?: () => number; deadlineMs?: number; budget?: LocalBudgetAuthority })
```

### getConfiguredAuthoring

Quelle: `packages/server/src/ai-authoring.ts:122`.

```typescript
export function getConfiguredAuthoring()
```

### qualifyReviewModel

Quelle: `packages/server/src/ai-review.ts:20`.

```typescript
export function qualifyReviewModel(input: unknown)
```

### createAIReviewService

Quelle: `packages/server/src/ai-review.ts:41`.

```typescript
export function createAIReviewService(options: { model: LanguageModel; quote: ReviewModelQuote; now?: () => number; deadlineMs?: number; budget?: LocalBudgetAuthority })
```

### getConfiguredReview

Quelle: `packages/server/src/ai-review.ts:99`.

```typescript
export async function getConfiguredReview()
```

### reviewProviderLabel

Quelle: `packages/server/src/ai-review.ts:119`.

```typescript
export function reviewProviderLabel()
```

### checkDevelopmentDocumentType

Quelle: `packages/server/src/development-proposal.ts:36`.

```typescript
export function checkDevelopmentDocumentType(value: unknown): z.infer<typeof TypecheckSchema>
```

### createDevelopmentProposal

Quelle: `packages/server/src/development-proposal.ts:117`.

```typescript
export function createDevelopmentProposal(input: unknown): DevelopmentProposal
```

### readAcceptanceEvidence

Quelle: `packages/server/src/evidence-files.ts:7`.

```typescript
export async function readAcceptanceEvidence(root: string, criterionId: string, index: number)
```

### validateFlow

Quelle: `packages/server/src/index.ts:6`.

```typescript
export function validateFlow(input: unknown)
```

### getLocalStudioAccess

Quelle: `packages/server/src/local-access.ts:4`.

```typescript
export function getLocalStudioAccess()
```

### workspaceDatasetHash

Quelle: `packages/server/src/local-project.ts:13`.

```typescript
export function workspaceDatasetHash(input: WorkspaceData)
```

### LocalBudgetAuthority

Quelle: `packages/server/src/local-project.ts:16`.

```typescript
export interface LocalBudgetAuthority {
  reserve(session: string, feature: 'authoring' | 'review', micros: number, deadlineMs: number): string;
  settle(id: string, micros: number | null): void;
}
```

### findLocalProjectRoot

Quelle: `packages/server/src/local-project.ts:21`.

```typescript
export function findLocalProjectRoot(start = process.cwd())
```

### createLocalProjectStore

Quelle: `packages/server/src/local-project.ts:44`.

```typescript
export function createLocalProjectStore(root: string, now: () => number = Date.now)
```

### createBoundedOpenAIFetch

Quelle: `packages/server/src/openai-review.ts:26`.

```typescript
export function createBoundedOpenAIFetch(quote: ReviewModelQuote, transport: typeof fetch = fetch): typeof fetch
```

### createOpenAIReviewModel

Quelle: `packages/server/src/openai-review.ts:45`.

```typescript
export async function createOpenAIReviewModel(apiKey: string, modelId: string)
```

### responseLanguageInstruction

Quelle: `packages/server/src/response-language.ts:10`.

```typescript
export function responseLanguageInstruction(locale: Locale = 'de')
```

### createLocalReviewAccess

Quelle: `packages/server/src/review-access.ts:4`.

```typescript
export function createLocalReviewAccess(now = Date.now, scope = { cookie: 'fluid_review', path: '/api/design-review', header: 'x-fluid-review-token' }, store?: { get(id: string): { token: string; expires: number } | undefined; set(id: string, value: { token: string; expires: number }): void })
```

### readBoundedJSON

Quelle: `packages/server/src/review-access.ts:41`.

```typescript
export async function readBoundedJSON(request: Request, maxBytes = 8_500_000): Promise<unknown>
```

### ReviewError

Quelle: `packages/server/src/review-policy.ts:4`.

```typescript
export class ReviewError extends Error {
  constructor(message: string, public readonly status: number) { super(message); }
}
```

### defineReviewQuote

Quelle: `packages/server/src/review-policy.ts:13`.

```typescript
export function defineReviewQuote(input: z.input<typeof QuoteSchema>)
```

### ReviewModelQuote

Quelle: `packages/server/src/review-policy.ts:20`.

```typescript
export type ReviewModelQuote = ReturnType<typeof defineReviewQuote>;
```

### intersectText

Quelle: `packages/testing/src/dom-quality.ts:5`.

```typescript
export function intersectText(a: Rect, b: Rect, tolerance = 1)
```

### occludedByChrome

Quelle: `packages/testing/src/dom-quality.ts:11`.

```typescript
export function occludedByChrome(a: Element, b: Element, area: Rect): boolean
```

### hiddenByClosedDetails

Quelle: `packages/testing/src/dom-quality.ts:36`.

```typescript
export function hiddenByClosedDetails(element: Element): boolean
```

### inspectDomQuality

Quelle: `packages/testing/src/dom-quality.ts:55`.

```typescript
export function inspectDomQuality(root: HTMLElement): QualityCheck[]
```

### inspectSemantics

Quelle: `packages/testing/src/dom-quality.ts:99`.

```typescript
export function inspectSemantics(root: HTMLElement, nodes: SceneNode[]): QualityCheck[]
```

### createTestClock

Quelle: `packages/testing/src/index.ts:5`.

```typescript
export function createTestClock(initial = 0)
```

### runScenario

Quelle: `packages/testing/src/index.ts:9`.

```typescript
export function runScenario(flow: FlowDefinition, input: ScenarioDefinition)
```

### ProcessObservation

Quelle: `packages/testing/src/load.ts:3`.

```typescript
export type ProcessObservation = Pick<LoadProcess, 'pid' | 'ppid' | 'startedAt' | 'name' | 'cpuTotalMs'>;
```

### shortProcessName

Quelle: `packages/testing/src/load.ts:4`.

```typescript
export function shortProcessName(value: string)
```

### cpuTimeMs

Quelle: `packages/testing/src/load.ts:5`.

```typescript
export function cpuTimeMs(value: string): number | null
```

### parseProcessSnapshot

Quelle: `packages/testing/src/load.ts:11`.

```typescript
export function parseProcessSnapshot(text: string): ProcessObservation[]
```

### classifyProcesses

Quelle: `packages/testing/src/load.ts:24`.

```typescript
export function classifyProcesses(current: readonly ProcessObservation[], previous: readonly ProcessObservation[], intervalMs: number | null,
  logicalCpus: number, pids: { targets: readonly number[]; tooling: readonly number[]; collectors: readonly number[] }): LoadProcess[]
```

### parseTopCpu

Quelle: `packages/testing/src/load.ts:43`.

```typescript
export function parseTopCpu(line: string)
```

### pressureLevel

Quelle: `packages/testing/src/load.ts:50`.

```typescript
export function pressureLevel(raw: string)
```

### parseMemoryCsv

Quelle: `packages/testing/src/load.ts:54`.

```typescript
export function parseMemoryCsv(csv: string)
```

### parseSwapCounters

Quelle: `packages/testing/src/load.ts:60`.

```typescript
export function parseSwapCounters(text: string)
```

### parseGpuRegistry

Quelle: `packages/testing/src/load.ts:65`.

```typescript
export function parseGpuRegistry(input: unknown, previous?: LoadGpu): LoadGpu
```

### assessLoadWindow

Quelle: `packages/testing/src/load.ts:101`.

```typescript
export function assessLoadWindow(reportInput: unknown, windowInput: unknown, performanceBudgetResult: LoadAssessment['performanceBudgetResult']): LoadAssessment
```

### NativeProofPort

Quelle: `packages/testing/src/proof-capture.ts:7`.

```typescript
export type NativeProofPort = {
  runtime: FluidRuntime;
  captureFrame(): Promise<CapturedFrame>;
  getPresentation(): PresentationFrame | null;
  getMetrics(): Metrics | null;
  getRecording(): VisualScenario | null;
  getPresentationMode(): 'live' | 'replay';
  viewport(): ProofViewport;
  inspectTargets(frame: PresentationFrame, scene: SceneNode[]): NativeTargetAudit;
  isCurrent(): boolean;
};
```

### NativeProofContext

Quelle: `packages/testing/src/proof-capture.ts:18`.

```typescript
export type NativeProofContext = Pick<NativeProof, 'id' | 'buildId' | 'dataset'>;
```

### proofSha256

Quelle: `packages/testing/src/proof-capture.ts:20`.

```typescript
export async function proofSha256(value: string | Uint8Array): Promise<string>
```

### proofImageBytes

Quelle: `packages/testing/src/proof-capture.ts:24`.

```typescript
export function proofImageBytes(image: string): Uint8Array
```

### validateNativeProof

Quelle: `packages/testing/src/proof-capture.ts:37`.

```typescript
export async function validateNativeProof(input: unknown): Promise<NativeProof>
```

### captureNativeProof

Quelle: `packages/testing/src/proof-capture.ts:46`.

```typescript
export async function captureNativeProof(port: NativeProofPort, context: NativeProofContext): Promise<NativeProof>
```

### measuredCheck

Quelle: `packages/testing/src/quality.ts:3`.

```typescript
export function measuredCheck(id: string, source: QualityCheck['source'], title: string, checked: number, findings: QualityFinding[]): QualityCheck
```

### openCheck

Quelle: `packages/testing/src/quality.ts:9`.

```typescript
export function openCheck(id: string, source: QualityCheck['source'], title: string, reason: string, status: 'not-checked' | 'unsupported' = 'not-checked'): QualityCheck
```

### createQualityReport

Quelle: `packages/testing/src/quality.ts:12`.

```typescript
export function createQualityReport(context: QualityContext, checks: QualityCheck[], tools: QualityReport['tools'] = {}): QualityReport
```

### summarizeQuality

Quelle: `packages/testing/src/quality.ts:15`.

```typescript
export function summarizeQuality(report: QualityReport)
```

### textAuditCheck

Quelle: `packages/testing/src/quality.ts:22`.

```typescript
export function textAuditCheck(audit: TextAudit): QualityCheck
```

### replayReadabilityCheck

Quelle: `packages/testing/src/quality.ts:26`.

```typescript
export function replayReadabilityCheck(audit: TextAudit): QualityCheck
```

### gpuReadabilityCheck

Quelle: `packages/testing/src/quality.ts:32`.

```typescript
export function gpuReadabilityCheck(audit: TextAudit): QualityCheck
```

### SequenceCaptureAdapter

Quelle: `packages/testing/src/sequence.ts:11`.

```typescript
export type SequenceCaptureAdapter = {
  replay(): void; seek(progress: number): void;
  captureFrame(): Promise<CapturedFrame>; inspectText(): Promise<TextAudit>;
  getRecording(): VisualScenario | null; getPresentation(): PresentationFrame | null;
  getMetrics?(): EffectRuntimeMetrics | null; getResources?(): ResourceSnapshot;
};
```

### sequenceTimes

Quelle: `packages/testing/src/sequence.ts:23`.

```typescript
export function sequenceTimes(durationMs: number): number[]
```

### captureSequence

Quelle: `packages/testing/src/sequence.ts:51`.

```typescript
export async function captureSequence(adapter: SequenceCaptureAdapter, options: {
  context: SequenceReport['context']; getRevision: () => number; initialProgress: number; signal?: AbortSignal;
  onProgress?: (captured: number, expected: number) => void;
}): Promise<SequenceReport>
```

### EffectDiagnosticAdapter

Quelle: `packages/testing/src/sequence.ts:145`.

```typescript
export type EffectDiagnosticAdapter = SequenceCaptureAdapter & {
  getMetrics(): EffectRuntimeMetrics | null; getResources(): ResourceSnapshot; getFrameTimings(): number[]; play(): void; pause(): void;
};
```

### stressEffect

Quelle: `packages/testing/src/sequence.ts:177`.

```typescript
export async function stressEffect(adapter: EffectDiagnosticAdapter, options: DiagnosticOptions): Promise<EffectStressReport>
```

### measureEffectPlayback

Quelle: `packages/testing/src/sequence.ts:207`.

```typescript
export async function measureEffectPlayback(adapter: EffectDiagnosticAdapter, options: DiagnosticOptions): Promise<NaturalPlaybackReport>
```

### VisualRetargetAdapter

Quelle: `packages/testing/src/sequence.ts:237`.

```typescript
export type VisualRetargetAdapter = EffectDiagnosticAdapter & { importRecording(input: unknown): void };
```

### stressVisualRetargeting

Quelle: `packages/testing/src/sequence.ts:261`.

```typescript
export async function stressVisualRetargeting(adapter: VisualRetargetAdapter, options: DiagnosticOptions): Promise<VisualRetargetReport>
```

### createStoryRunner

Quelle: `packages/testing/src/story.ts:4`.

```typescript
export function createStoryRunner(runtime: FluidRuntime, input: StoryDefinition)
```

### qualificationGeometry

Quelle: `packages/testing/src/workspace-qualification.ts:4`.

```typescript
export function qualificationGeometry(frame: PresentationFrame): SequenceGeometry
```

### endpointIssues

Quelle: `packages/testing/src/workspace-qualification.ts:8`.

```typescript
export function endpointIssues(geometry: SequenceGeometry, expected: SceneNode[], label: string): string[]
```

### checkpointComplete

Quelle: `packages/testing/src/workspace-qualification.ts:18`.

```typescript
export function checkpointComplete(progress: number[])
```

### resolveGPUPreference

Quelle: `packages/webgpu/src/backend-policy.ts:4`.

```typescript
export async function resolveGPUPreference<T>(input: BackendMode, requestWebGPU: () => Promise<T>)
```

### observeSurfaceCapabilities

Quelle: `packages/webgpu/src/capabilities.ts:7`.

```typescript
export function observeSurfaceCapabilities(options: {
  backend: 'webgpu' | 'webgl2'; motion: MotionSource;
  onChange(capabilities: RenderCapabilities, initial: boolean): void;
  onError(error: Error): void;
})
```

### couplingBounds

Quelle: `packages/webgpu/src/coupling-layer.ts:9`.

```typescript
export function couplingBounds(group: CouplingPresentation)
```

### createCouplingLayer

Quelle: `packages/webgpu/src/coupling-layer.ts:21`.

```typescript
export function createCouplingLayer(scope: Scope, scene: Scene)
```

### createEffectLayers

Quelle: `packages/webgpu/src/effect-layers.ts:9`.

```typescript
export function createEffectLayers(scope: Scope, scene: Scene)
```

### resolveFocusRing

Quelle: `packages/webgpu/src/focus-ring.ts:11`.

```typescript
export function resolveFocusRing(id: string | null, items: readonly PresentedHitTarget[], viewport: { width: number; height: number })
```

### FocusRingGeometry

Quelle: `packages/webgpu/src/focus-ring.ts:26`.

```typescript
export type FocusRingGeometry = NonNullable<ReturnType<typeof resolveFocusRing>>;
```

### createFocusRing

Quelle: `packages/webgpu/src/focus-ring.ts:29`.

```typescript
export function createFocusRing(scope: ReturnType<typeof createResourceScope>, scene: Scene, geometry: PlaneGeometry)
```

### fetchSurfaceFontAssets

Quelle: `packages/webgpu/src/font-assets.ts:2`.

```typescript
export async function fetchSurfaceFontAssets(urls: readonly string[], signal?: AbortSignal)
```

### loadSurfaceFonts

Quelle: `packages/webgpu/src/fonts.ts:8`.

```typescript
export async function loadSurfaceFonts(primary: FontFaceSource, fallbacks: readonly FontFaceSource[] = [], signal?: AbortSignal)
```

### PresentedHitTarget

Quelle: `packages/webgpu/src/hit-testing.ts:4`.

```typescript
export type PresentedHitTarget = Readonly<{
  presented: SceneNode;
  target: SceneNode;
  panelOpacity: number;
  textOpacity: number;
  renderOrder: number;
  exiting: boolean;
}>;
```

### hitTestPresentation

Quelle: `packages/webgpu/src/hit-testing.ts:42`.

```typescript
export function hitTestPresentation(items: readonly PresentedHitTarget[], x: number, y: number): SceneNode | undefined
```

### CapabilityError

Quelle: `packages/webgpu/src/index.ts:35`.

```typescript
export class CapabilityError extends Error { override name = 'CapabilityError'; }
```

### SurfaceFontError

Quelle: `packages/webgpu/src/index.ts:36`.

```typescript
export class SurfaceFontError extends Error { override name = 'SurfaceFontError'; }
```

### SurfaceMetrics

Quelle: `packages/webgpu/src/index.ts:37`.

```typescript
export interface SurfaceMetrics { recordingLanguage?: Locale | null; backend: 'webgpu' | 'webgl2'; fallbackReason: string | null; frames: number; nodes: number; geometries: number; textBytes: number; lastFrameMs: number; phase: 'idle' | 'transitioning' | 'paused'; progress: number; durationMs: number; shader: 'typegpu-0.12.9'; effectId: string | null; effectPhase: 'source' | 'bridge' | 'target' | 'settled'; canReplay: boolean; kernelCheck: Awaited<ReturnType<typeof verifyPanelKernel>> | null; effectResources?: { renderTargets: number; targetBytes: number; particles: number; particleDrawCalls: number; couplingGroups?: number; couplingPieces?: number; couplingDrawCalls?: number }; qualityProfile?: 'standard' | 'compact' }
```

### SurfaceOptions

Quelle: `packages/webgpu/src/index.ts:38`.

```typescript
export interface SurfaceOptions {
  fontUrl: string; fallbackFontUrls?: readonly string[]; signal?: AbortSignal; resourceLedger?: ResourceLedger;
  backendMode?: BackendMode;
  /** Explicit legacy comparison only; imported recordings select their recorded version. */
  motionVersion?: 1 | 2;
  onError?: (error: Error) => void; onMetrics?: (metrics: SurfaceMetrics) => void;
  /** Initial actual backend/preferences and later browser preference changes. */
  onCapabilitiesChange?: (capabilities: RenderCapabilities) => void;
  /** Same sampled frame and scheduler as GPU/hit-testing; never a second animation loop. */
  onPresentation?: (frame: PresentationFrame) => void;
  /** Observable initialization boundaries, also used by Studio's explicit abort qualification. */
  onInitializationStage?: (value: { stage: 'renderer-ready' | 'fonts-ready'; backend: 'webgpu' | 'webgl2' }) => void;
}
```

### TextSelection

Quelle: `packages/webgpu/src/index.ts:51`.

```typescript
export interface TextSelection { nodeId: string; start: number; end: number; direction?: 'forward' | 'backward' | 'none' }
```

### layoutScene

Quelle: `packages/webgpu/src/index.ts:86`.

```typescript
export function layoutScene(nodes: readonly SceneNode[], width: number, height: number): SceneNode[]
```

### visibleRange

Quelle: `packages/webgpu/src/index.ts:90`.

```typescript
export function visibleRange(count: number, rowHeight: number, scrollTop: number, viewportHeight: number, overscan = 2)
```

### createFluidSurface

Quelle: `packages/webgpu/src/index.ts:97`.

```typescript
export async function createFluidSurface(canvas: HTMLCanvasElement, options: SurfaceOptions)
```

### FluidSurfaceHandle

Quelle: `packages/webgpu/src/index.ts:644`.

```typescript
export type FluidSurfaceHandle = Awaited<ReturnType<typeof createFluidSurface>>;
```

### SurfacePlaybackControls

Quelle: `packages/webgpu/src/index.ts:645`.

```typescript
export type SurfacePlaybackControls = Pick<FluidSurfaceHandle, 'pause' | 'play' | 'seek' | 'replay' | 'verifyKernels' | 'getRecording' | 'getPresentation' | 'getMetrics' | 'getResources' | 'getFrameTimings' | 'inspectText' | 'captureFrame'> & { canRestage?(): boolean; getRestagedRecording?(locale: Locale): Promise<RestagedRecording | null>; getPresentationMode(): 'live' | 'replay'; importRecording(input: unknown): void; restoreLive(): void };
```

### motionProgress

Quelle: `packages/webgpu/src/motion.ts:4`.

```typescript
export function motionProgress(elapsed: number, duration: number, reducedMotion = false)
```

### interpolateBounds

Quelle: `packages/webgpu/src/motion.ts:8`.

```typescript
export function interpolateBounds(from: Pick<SceneNode, 'x' | 'y' | 'width' | 'height' | 'radius' | 'rotation' | 'opacity'>, target: typeof from, t: number)
```

### transitionStages

Quelle: `packages/webgpu/src/motion.ts:13`.

```typescript
export function transitionStages(progress:number)
```

### redactSceneNode

Quelle: `packages/webgpu/src/privacy.ts:4`.

```typescript
export function redactSceneNode(node: SceneNode): SceneNode
```

### createResourceLedger

Quelle: `packages/webgpu/src/resources.ts:4`.

```typescript
export function createResourceLedger()
```

### ResourceLedger

Quelle: `packages/webgpu/src/resources.ts:15`.

```typescript
export type ResourceLedger = ReturnType<typeof createResourceLedger>;
```

### createResourceScope

Quelle: `packages/webgpu/src/resources.ts:18`.

```typescript
export function createResourceScope(ledger: ResourceLedger)
```

### deriveLocalizedRecording

Quelle: `packages/webgpu/src/restage.ts:5`.

```typescript
export async function deriveLocalizedRecording(original: VisualScenario, source: SceneNode[], target: SceneNode[], languageProfile: RecordingLanguageProfile)
```

### isTextSelectionVisible

Quelle: `packages/webgpu/src/selection-visibility.ts:5`.

```typescript
export function isTextSelectionVisible(part: {
  target: SceneNode;
  exiting: boolean;
  presentedOpacity: number;
  textOpacity: number;
}): boolean
```

### glyphCaretAtOffset

Quelle: `packages/webgpu/src/text-input.ts:7`.

```typescript
export function glyphCaretAtOffset(text: ShapedText, value: string, offset: number)
```

### textInputScroll

Quelle: `packages/webgpu/src/text-input.ts:29`.

```typescript
export function textInputScroll(previous: number, width: number, contentWidth: number, caretX: number, padding = 3): number
```

### clipTextRect

Quelle: `packages/webgpu/src/text-input.ts:40`.

```typescript
export function clipTextRect(rect: LayoutBox, viewport: LayoutBox): LayoutBox | null
```

### textRegion

Quelle: `packages/webgpu/src/text-layout.ts:5`.

```typescript
export function textRegion(node:SceneNode,width:number,height:number,fontSize:number)
```

### overlappingText

Quelle: `packages/webgpu/src/text-layout.ts:13`.

```typescript
export function overlappingText(boxes:readonly TextInkBox[],tolerance=1)
```

### recordingScale

Quelle: `packages/webgpu/src/text-layout.ts:25`.

```typescript
export function recordingScale(recorded:{width:number;height:number},display:{width:number;height:number})
```

### createPresentationTimeline

Quelle: `packages/webgpu/src/timeline.ts:2`.

```typescript
export function createPresentationTimeline(now: () => number)
```

[^implementation]: Quellinventar mit SHA-256 je Datei.
