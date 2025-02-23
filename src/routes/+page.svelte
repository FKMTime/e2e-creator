<script lang="ts">
    import type { TestsRoot } from "$lib/types";
    import { onMount } from "svelte";

    let files: FileList | any;
    let testRoot: TestsRoot | null = null;
    let isSaved = false;

    $: if (files) {
        handleFiles();
    }

    $: if (testRoot) {
        localStorage.setItem("save", JSON.stringify(testRoot));
    }

    onMount(() => {
        isSaved = localStorage.getItem("save") != null;
    });

    async function handleFiles() {
        if (!(files instanceof FileList)) return;

        let file = files[0];
        let text = await file.text();
        let json: TestsRoot = JSON.parse(text);
        testRoot = json;
    }

    async function loadSample() {
        files = [];
        let json: TestsRoot | null = null;
        json = await fetch("/tests-sample.json").then((res) => res.json());

        testRoot = json;
    }

    async function loadSaved() {
        files = [];
        let json: TestsRoot | null = null;
        let saved = localStorage.getItem("save");
        if (saved) {
            json = JSON.parse(saved);
        }

        testRoot = json;
    }

    let groupNewId = "";
    let groupNewUseInspection = true;
    let groupNewSecondaryText = "";

    function addGroup() {
        if (!testRoot) return;
        if (testRoot.groups.findIndex((x) => x.groupId == groupNewId) >= 0)
            return;

        testRoot.groups.push({
            groupId: groupNewId,
            useInspection: groupNewUseInspection,
            secondaryText: groupNewSecondaryText,
        });
        testRoot.groups = testRoot.groups;

        groupNewId = "";
        groupNewUseInspection = true;
        groupNewSecondaryText = "";
    }

    function deleteGroup(idx: number) {
        if (!testRoot) return;
        testRoot.groups.splice(idx, 1);
        testRoot = testRoot;
    }

    let cardsNewId = 0;
    let cardsNewName = "";
    let cardsNewWcaId = "";
    let cardsNewRegistrantId = 0;
    let cardsNewCanCompete = true;
    let cardsNewGroups: string[] = [];

    function cardsDelete(id: number) {
        if (!testRoot) return;
        delete testRoot.cards[id];
        testRoot = testRoot;
    }

    function cardsChangeId(id: number, newId: string) {
        if (!testRoot) return;
        let card = testRoot.cards[id];
        delete testRoot.cards[id];
        testRoot.cards[parseInt(newId)] = card;
        testRoot = testRoot;
    }

    function cardsAddNew() {
        if (!testRoot) return;
        if (cardsNewId in testRoot.cards) return;

        testRoot.cards[cardsNewId] = {
            name: cardsNewName,
            wcaId: cardsNewWcaId,
            registrantId: cardsNewRegistrantId,
            canCompete: cardsNewCanCompete,
            groups: cardsNewGroups,
        };

        testRoot = testRoot;

        cardsNewId = 0;
        cardsNewName = "";
        cardsNewWcaId = "";
        cardsNewRegistrantId = 0;
        cardsNewCanCompete = true;
        cardsNewGroups = [];
    }

    let buttonsNewName = "";
    let buttonsNewPin = 0;

    function buttonsChangePin(name: string, pin: number) {
        if (!testRoot) return;
        testRoot.buttons[name] = pin;
        testRoot = testRoot;
    }

    function buttonsChangeName(oldName: string, newName: string) {
        if (!testRoot) return;
        testRoot.buttons[newName] = testRoot.buttons[oldName];
        delete testRoot.buttons[oldName];
        testRoot = testRoot;
    }

    function buttonsDelete(name: string) {
        if (!testRoot) return;
        delete testRoot.buttons[name];
        testRoot = testRoot;
    }

    function buttonsAddNew() {
        if (!testRoot) return;
        if (buttonsNewName in testRoot.buttons) return;
        if (buttonsNewName.trim() === "") return;

        testRoot.buttons[buttonsNewName] = buttonsNewPin;
        testRoot = testRoot;
        buttonsNewName = "";
        buttonsNewPin = 0;
    }

    function deleteTestStep(testIdx: number, stepIdx: number) {
        if (!testRoot) return;
        testRoot.tests[testIdx].steps.splice(stepIdx, 1);
        testRoot = testRoot;
    }

    function addNewTestStep(testIdx: number, type: string) {
        if (!testRoot) return;

        let step: any = { type };
        switch (type) {
            case "ScanCard":
                step.data = null;
                break;
            case "Sleep":
                step.data = null;
            case "SolveTime":
                step.data = null;
                break;
            case "Button":
                step.data = { name: "", time: 50 };
                break;
            case "DelegateResolve":
                step.data = {
                    shouldScanCards: false,
                    penalty: null,
                    value: null,
                };
                break;
            case "VerifySend":
                step.data = { time: null, penalty: null, delegate: false };
                break;
            case "VerifySnapshot":
                step.data = [""];
                break;
        }

        testRoot.tests[testIdx].steps.push(step);
        testRoot = testRoot;
    }

    function addNewTest(name: string) {
        if (!testRoot) return;
        testRoot.tests.push({
            name,
            sleepBetween: 500,
            steps: [],
        });
        testRoot = testRoot;
    }

    function removeTest(testIdx: number) {
        if (!testRoot) return;
        testRoot.tests.splice(testIdx, 1);
        testRoot = testRoot;
    }

    function addSnapshotQuery(testIdx: number, stepIdx: number) {
        if (!testRoot) return;
        testRoot.tests[testIdx].steps[stepIdx].data.push("");
        testRoot = testRoot;
    }

    function deleteSnapshotQuery(
        testIdx: number,
        stepIdx: number,
        queryIdx: number,
    ) {
        if (!testRoot) return;
        testRoot.tests[testIdx].steps[stepIdx].data.splice(queryIdx, 1);
        testRoot = testRoot;
    }

    function replacer(_key: any, value: any) {
        // Filtering out properties
        if (value === null) {
            return undefined;
        }
        return value;
    }

    async function generate() {
        let json = JSON.stringify(testRoot, replacer, 4);
        let blob = new Blob([json], { type: "application/json" });
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = "tests.json";
        a.click();
    }
</script>

{#if !files}
    <div class="file-upload">
        <label class="compact-label"
            ><span>File:</span>
            <input
                bind:files
                type="file"
                accept=".json"
                class="file-input"
                placeholder="Select JSON file"
                title="Select JSON file"
            />
        </label>
        <button on:click={loadSample} class="btn btn-sample">Load Sample</button
        >
        <button on:click={loadSaved} disabled={!isSaved} class="btn btn-saved"
            >Load Saved</button
        >
    </div>
{/if}

{#if testRoot}
    <div class="container">
        <div class="section">
            <h2>Groups</h2>
            <div class="table-wrapper">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Group ID</th>
                            <th>Use Inspection</th>
                            <th>Secondary Text</th>
                            <th class="action-column"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each testRoot.groups as group, i}
                            <tr>
                                <td
                                    ><label class="compact-label"
                                        ><span>ID:</span><input
                                            type="text"
                                            bind:value={group.groupId}
                                            class="input-text"
                                            placeholder="e.g., A1"
                                            title="e.g., A1"
                                        /></label
                                    ></td
                                >
                                <td class="center"
                                    ><label class="compact-label"
                                        ><span>Inspect:</span><input
                                            type="checkbox"
                                            bind:checked={group.useInspection}
                                            class="input-checkbox"
                                            title="Use Inspection"
                                        /></label
                                    ></td
                                >
                                <td
                                    ><label class="compact-label"
                                        ><span>Text:</span><input
                                            type="text"
                                            bind:value={group.secondaryText}
                                            class="input-text"
                                            placeholder="e.g., Group Description"
                                            title="e.g., Group Description"
                                        /></label
                                    ></td
                                >
                                <td class="center"
                                    ><button
                                        on:click={() => deleteGroup(i)}
                                        class="btn btn-delete">X</button
                                    ></td
                                >
                            </tr>
                        {/each}
                        <tr class="new-row">
                            <td
                                ><label class="compact-label"
                                    ><span>ID:</span><input
                                        type="text"
                                        bind:value={groupNewId}
                                        class="input-text"
                                        placeholder="New Group ID"
                                        title="New Group ID"
                                    /></label
                                ></td
                            >
                            <td class="center"
                                ><label class="compact-label"
                                    ><span>Inspect:</span><input
                                        type="checkbox"
                                        bind:checked={groupNewUseInspection}
                                        class="input-checkbox"
                                        title="Use Inspection"
                                    /></label
                                ></td
                            >
                            <td
                                ><label class="compact-label"
                                    ><span>Text:</span><input
                                        type="text"
                                        bind:value={groupNewSecondaryText}
                                        class="input-text"
                                        placeholder="New Secondary Text"
                                        title="New Secondary Text"
                                    /></label
                                ></td
                            >
                            <td class="center"
                                ><button on:click={addGroup} class="btn btn-add"
                                    >+</button
                                ></td
                            >
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <h2>Cards</h2>
            <div class="table-wrapper">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>WCA ID</th>
                            <th>Registrant ID</th>
                            <th>Can Compete</th>
                            <th>Groups</th>
                            <th class="action-column"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each Object.entries(testRoot.cards) as [id, _]}
                            <tr>
                                <td
                                    ><label class="compact-label"
                                        ><span>ID:</span><input
                                            type="number"
                                            value={id}
                                            on:change={(event) =>
                                                cardsChangeId(
                                                    parseInt(id),
                                                    event.currentTarget.value,
                                                )}
                                            class="input-number"
                                            placeholder="Card ID"
                                            title="Card ID"
                                        /></label
                                    ></td
                                >
                                <td
                                    ><label class="compact-label"
                                        ><span>Name:</span><input
                                            type="text"
                                            bind:value={
                                                testRoot.cards[parseInt(id)]
                                                    .name
                                            }
                                            class="input-text"
                                            placeholder="Competitor Name"
                                            title="Competitor Name"
                                        /></label
                                    ></td
                                >
                                <td
                                    ><label class="compact-label"
                                        ><span>WCA:</span><input
                                            type="text"
                                            bind:value={
                                                testRoot.cards[parseInt(id)]
                                                    .wcaId
                                            }
                                            class="input-text"
                                            placeholder="e.g., 2023SMIT01"
                                            title="e.g., 2023SMIT01"
                                        /></label
                                    ></td
                                >
                                <td
                                    ><label class="compact-label"
                                        ><span>Reg ID:</span><input
                                            type="number"
                                            bind:value={
                                                testRoot.cards[parseInt(id)]
                                                    .registrantId
                                            }
                                            class="input-number"
                                            placeholder="Registrant Number"
                                            title="Registrant Number"
                                        /></label
                                    ></td
                                >
                                <td class="center"
                                    ><label class="compact-label"
                                        ><span>Compete:</span><input
                                            type="checkbox"
                                            bind:checked={
                                                testRoot.cards[parseInt(id)]
                                                    .canCompete
                                            }
                                            class="input-checkbox"
                                            title="Can Compete"
                                        /></label
                                    ></td
                                >
                                <td
                                    ><label class="compact-label"
                                        ><span>Groups:</span>
                                        <select
                                            multiple
                                            bind:value={
                                                testRoot.cards[parseInt(id)]
                                                    .groups
                                            }
                                            class="input-select"
                                            title="Select Groups"
                                        >
                                            {#each testRoot.groups as group}
                                                <option value={group.groupId}
                                                    >{group.secondaryText}</option
                                                >
                                            {/each}
                                        </select></label
                                    >
                                </td>
                                <td class="center"
                                    ><button
                                        on:click={() =>
                                            cardsDelete(parseInt(id))}
                                        class="btn btn-delete">X</button
                                    ></td
                                >
                            </tr>
                        {/each}
                        <tr class="new-row">
                            <td
                                ><label class="compact-label"
                                    ><span>ID:</span><input
                                        type="number"
                                        bind:value={cardsNewId}
                                        class="input-number"
                                        placeholder="New Card ID"
                                        title="New Card ID"
                                    /></label
                                ></td
                            >
                            <td
                                ><label class="compact-label"
                                    ><span>Name:</span><input
                                        type="text"
                                        bind:value={cardsNewName}
                                        class="input-text"
                                        placeholder="New Competitor Name"
                                        title="New Competitor Name"
                                    /></label
                                ></td
                            >
                            <td
                                ><label class="compact-label"
                                    ><span>WCA:</span><input
                                        type="text"
                                        bind:value={cardsNewWcaId}
                                        class="input-text"
                                        placeholder="New WCA ID"
                                        title="New WCA ID"
                                    /></label
                                ></td
                            >
                            <td
                                ><label class="compact-label"
                                    ><span>Reg ID:</span><input
                                        type="number"
                                        bind:value={cardsNewRegistrantId}
                                        class="input-number"
                                        placeholder="New Registrant ID"
                                        title="New Registrant ID"
                                    /></label
                                ></td
                            >
                            <td class="center"
                                ><label class="compact-label"
                                    ><span>Compete:</span><input
                                        type="checkbox"
                                        bind:checked={cardsNewCanCompete}
                                        class="input-checkbox"
                                        title="Can Compete"
                                    /></label
                                ></td
                            >
                            <td
                                ><label class="compact-label"
                                    ><span>Groups:</span>
                                    <select
                                        multiple
                                        bind:value={cardsNewGroups}
                                        class="input-select"
                                        title="Select Groups"
                                    >
                                        {#each testRoot.groups as group}
                                            <option value={group.groupId}
                                                >{group.secondaryText}</option
                                            >
                                        {/each}
                                    </select></label
                                >
                            </td>
                            <td class="center"
                                ><button
                                    on:click={cardsAddNew}
                                    class="btn btn-add">+</button
                                ></td
                            >
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <h2>Buttons</h2>
            <div class="table-wrapper">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Pins</th>
                            <th class="action-column"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each Object.entries(testRoot.buttons) as [name, pin]}
                            <tr>
                                <td
                                    ><label class="compact-label"
                                        ><span>Name:</span><input
                                            type="text"
                                            value={name}
                                            on:change={(event) =>
                                                buttonsChangeName(
                                                    name,
                                                    event.currentTarget.value,
                                                )}
                                            class="input-text"
                                            placeholder="Button Name"
                                            title="Button Name"
                                        /></label
                                    ></td
                                >
                                <td
                                    ><label class="compact-label"
                                        ><span>Pin:</span><input
                                            type="number"
                                            value={pin}
                                            on:change={(event) =>
                                                buttonsChangePin(
                                                    name,
                                                    parseInt(
                                                        event.currentTarget
                                                            .value,
                                                    ),
                                                )}
                                            class="input-number"
                                            placeholder="Pin Number"
                                            title="Pin Number"
                                        /></label
                                    ></td
                                >
                                <td class="center"
                                    ><button
                                        on:click={() => buttonsDelete(name)}
                                        class="btn btn-delete">X</button
                                    ></td
                                >
                            </tr>
                        {/each}
                        <tr class="new-row">
                            <td
                                ><label class="compact-label"
                                    ><span>Name:</span><input
                                        type="text"
                                        bind:value={buttonsNewName}
                                        class="input-text"
                                        placeholder="New Button Name"
                                        title="New Button Name"
                                    /></label
                                ></td
                            >
                            <td
                                ><label class="compact-label"
                                    ><span>Pin:</span><input
                                        type="number"
                                        bind:value={buttonsNewPin}
                                        class="input-number"
                                        placeholder="New Pin Number"
                                        title="New Pin Number"
                                    /></label
                                ></td
                            >
                            <td class="center"
                                ><button
                                    on:click={buttonsAddNew}
                                    class="btn btn-add">+</button
                                ></td
                            >
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <h2>Tests</h2>
            {#each testRoot.tests as test, testIdx}
                <div class="test">
                    <div class="test-header">
                        <label class="compact-label"
                            ><span>Name:</span><input
                                type="text"
                                bind:value={test.name}
                                class="input-text test-name"
                                placeholder="Test Name"
                                title="Test Name"
                            /></label
                        >
                        <button
                            on:click={() => removeTest(testIdx)}
                            class="btn btn-delete">X</button
                        >
                    </div>
                    <div class="form-group">
                        <label class="compact-label"
                            ><span>Sleep (ms):</span><input
                                type="number"
                                bind:value={test.sleepBetween}
                                class="input-number"
                                placeholder="Milliseconds"
                                title="Milliseconds"
                            /></label
                        >
                    </div>
                    <div class="steps">
                        {#each test.steps as step, stepIdx}
                            <div class="step">
                                <span class="step-type">{step.type}</span>
                                <div class="step-content">
                                    {#if step.type == "Sleep"}
                                        <label class="compact-label"
                                            ><span>Duration:</span><input
                                                type="number"
                                                bind:value={step.data}
                                                class="input-number"
                                                placeholder="Sleep Duration (ms)"
                                                title="Sleep Duration (ms)"
                                            /></label
                                        >
                                    {:else if step.type == "ScanCard"}
                                        <label class="compact-label"
                                            ><span>Card:</span>
                                            <select
                                                bind:value={step.data}
                                                class="input-select"
                                                title="Select Card ID"
                                            >
                                                {#each Object.keys(testRoot.cards) as cardId}
                                                    <option
                                                        value={parseInt(cardId)}
                                                        >{testRoot.cards[
                                                            parseInt(cardId)
                                                        ].name} ({cardId})</option
                                                    >
                                                {/each}
                                            </select></label
                                        >
                                    {:else if step.type == "Button"}
                                        <div class="form-row">
                                            <label class="compact-label"
                                                ><span>Button:</span>
                                                <select
                                                    bind:value={step.data.name}
                                                    class="input-select"
                                                    title="Select Button Name"
                                                >
                                                    {#each Object.keys(testRoot.buttons) as buttonName}
                                                        <option
                                                            value={buttonName}
                                                            >{buttonName}</option
                                                        >
                                                    {/each}
                                                </select></label
                                            >
                                            <label class="compact-label"
                                                ><span>Time:</span><input
                                                    type="number"
                                                    bind:value={step.data.time}
                                                    class="input-number"
                                                    placeholder="Press Time (ms)"
                                                    title="Press Time (ms)"
                                                /></label
                                            >
                                        </div>
                                    {:else if step.type == "DelegateResolve"}
                                        <div class="form-row">
                                            <label class="compact-label"
                                                ><span>Scan:</span><input
                                                    type="checkbox"
                                                    bind:checked={
                                                        step.data
                                                            .shouldScanCards
                                                    }
                                                    class="input-checkbox"
                                                    title="Should Scan Cards"
                                                /></label
                                            >
                                            <label class="compact-label"
                                                ><span>Penalty:</span><input
                                                    type="number"
                                                    bind:value={
                                                        step.data.penalty
                                                    }
                                                    class="input-number"
                                                    placeholder="Penalty (optional)"
                                                    title="Penalty (optional)"
                                                /></label
                                            >
                                            <label class="compact-label"
                                                ><span>Value:</span><input
                                                    type="number"
                                                    bind:value={step.data.value}
                                                    class="input-number"
                                                    placeholder="Value (optional)"
                                                    title="Value (optional)"
                                                /></label
                                            >
                                        </div>
                                    {:else if step.type == "VerifySend"}
                                        <div class="form-row">
                                            <label class="compact-label"
                                                ><span>Time:</span><input
                                                    type="number"
                                                    bind:value={step.data.time}
                                                    class="input-number"
                                                    placeholder="Time (optional)"
                                                    title="Time (optional)"
                                                /></label
                                            >
                                            <label class="compact-label"
                                                ><span>Penalty:</span><input
                                                    type="number"
                                                    bind:value={
                                                        step.data.penalty
                                                    }
                                                    class="input-number"
                                                    placeholder="Penalty (optional)"
                                                    title="Penalty (optional)"
                                                /></label
                                            >
                                            <label class="compact-label"
                                                ><span>Delegate:</span><input
                                                    type="checkbox"
                                                    bind:checked={
                                                        step.data.delegate
                                                    }
                                                    class="input-checkbox"
                                                    title="Delegate"
                                                /></label
                                            >
                                        </div>
                                    {:else if step.type == "VerifySnapshot"}
                                        <div class="snapshot-queries">
                                            {#each step.data as query, queryIdx}
                                                <div class="form-row">
                                                    <label class="compact-label"
                                                        ><span>Query:</span
                                                        ><input
                                                            type="text"
                                                            bind:value={query}
                                                            class="input-text flex-grow"
                                                            placeholder="Snapshot Query"
                                                            title="Snapshot Query"
                                                        /></label
                                                    >
                                                    <button
                                                        on:click={() =>
                                                            deleteSnapshotQuery(
                                                                testIdx,
                                                                stepIdx,
                                                                queryIdx,
                                                            )}
                                                        class="btn btn-delete"
                                                        >X</button
                                                    >
                                                </div>
                                            {/each}
                                            <button
                                                on:click={() =>
                                                    addSnapshotQuery(
                                                        testIdx,
                                                        stepIdx,
                                                    )}
                                                class="btn btn-add btn-small btn-query"
                                                >+ Query</button
                                            >
                                        </div>
                                    {/if}
                                </div>
                                <button
                                    on:click={() =>
                                        deleteTestStep(testIdx, stepIdx)}
                                    class="btn btn-delete">X</button
                                >
                            </div>
                        {/each}
                    </div>
                    <form
                        on:submit|preventDefault={(event) =>
                            addNewTestStep(
                                testIdx,
                                event.currentTarget[0].value,
                            )}
                        class="step-form"
                    >
                        <label class="compact-label"
                            ><span>Type:</span>
                            <select
                                class="input-select"
                                title="Select Step Type"
                            >
                                {#each ["ScanCard", "ResetState", "Sleep", "SolveTime", "Button", "DelegateResolve", "VerifySend", "VerifySnapshot"] as stepType}
                                    <option value={stepType}>{stepType}</option>
                                {/each}
                            </select></label
                        >
                        <button type="submit" class="btn btn-add">+</button>
                    </form>
                </div>
            {/each}
            <form
                on:submit|preventDefault={(event) =>
                    addNewTest(event.currentTarget[0].value)}
                class="test-form"
            >
                <label class="compact-label"
                    ><span>Name:</span><input
                        type="text"
                        class="input-text"
                        placeholder="New Test Name"
                        title="New Test Name"
                    /></label
                >
                <button type="submit" class="btn btn-add">+</button>
            </form>
        </div>

        <div class="actions">
            <button on:click={generate} class="btn btn-generate"
                >Generate & Download</button
            >
        </div>
    </div>
{/if}

<style>
    :global(body) {
        font-family: Arial, sans-serif;
        background-color: #f5f7fa;
        color: #333;
        margin: 0;
        padding: 20px;
        line-height: 1.6;
    }

    .compact-label {
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .compact-label span {
        font-size: 0.8rem;
        color: #666;
        font-weight: 500;
        white-space: nowrap;
    }

    .compact-label input,
    .compact-label select {
        flex-grow: 1;
    }

    .table td .compact-label {
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
    }

    .table td.center .compact-label {
        align-items: center;
    }

    .test-header .compact-label {
        flex-grow: 1;
    }

    .step-content .compact-label {
        align-items: center;
    }

    .form-group .compact-label {
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
    }

    .input-text,
    .input-number,
    .input-select {
        width: 100%;
        padding: 6px 10px;
        font-size: 0.9rem;
    }

    .input-checkbox {
        width: auto;
    }

    .step-form .compact-label,
    .test-form .compact-label {
        flex-grow: 1;
    }

    .container {
        max-width: 1400px;
        margin: 0 auto;
    }

    .section {
        margin-bottom: 40px;
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    h2 {
        font-size: 1.5rem;
        margin-bottom: 20px;
        color: #2c3e50;
        border-bottom: 2px solid #eee;
        padding-bottom: 10px;
    }

    .table-wrapper {
        overflow-x: auto;
        margin-bottom: 20px;
    }

    .table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
    }

    .table th,
    .table td {
        padding: 12px;
        border-bottom: 1px solid #eee;
        vertical-align: middle;
    }

    .table th {
        background-color: #f8f9fa;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.9rem;
        color: #666;
    }

    .table tr:last-child td {
        border-bottom: none;
    }

    .new-row {
        background-color: #f8f9fa;
    }

    .action-column {
        width: 60px;
    }

    .center {
        text-align: center;
    }

    .input-text,
    .input-number,
    .input-select {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 0.9rem;
        background: white;
        transition: border-color 0.2s ease;
    }

    .input-text:focus,
    .input-number:focus,
    .input-select:focus {
        border-color: #007bff;
        outline: none;
    }

    .input-checkbox {
        width: auto;
        margin: 0 auto;
        display: block;
    }

    .input-select[multiple] {
        height: 100px;
    }

    .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s ease;
        min-width: 40px;
    }

    .btn-small {
        padding: 6px 12px;
        font-size: 0.8rem;
    }

    .btn-add {
        background-color: #2ecc71;
        color: white;
    }

    .btn-add:hover {
        background-color: #27ae60;
    }

    .btn-delete {
        background-color: #e74c3c;
        color: white;
    }

    .btn-delete:hover {
        background-color: #c0392b;
    }

    .btn-sample,
    .btn-saved {
        background-color: #3498db;
        color: white;
    }

    .btn-query {
        padding: 4px 8px;
        font-size: 0.75rem;
        min-width: 0;
        width: auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .btn-sample:hover,
    .btn-saved:hover {
        background-color: #2980b9;
    }

    .btn-generate {
        background-color: #16a085;
        color: white;
        padding: 12px 24px;
        font-size: 1rem;
    }

    .btn-generate:hover {
        background-color: #138d75;
    }

    .test {
        background-color: #fff;
        padding: 20px;
        border-radius: 6px;
        margin-bottom: 20px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .test-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }

    .test-name {
        font-size: 1.2rem;
        font-weight: 600;
        flex-grow: 1;
        margin-right: 10px;
    }

    .steps {
        border: 1px solid #eee;
        border-radius: 4px;
        padding: 10px;
        margin: 15px 0;
    }

    .step {
        display: grid;
        grid-template-columns: 150px 1fr 60px;
        gap: 15px;
        padding: 10px 0;
        border-bottom: 1px solid #f0f0f0;
        align-items: center;
    }

    .step:last-child {
        border-bottom: none;
    }

    .step-type {
        font-weight: 600;
        color: #555;
    }

    .step-content {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
    }

    .form-row {
        display: flex;
        gap: 10px;
        width: 100%;
        align-items: center;
    }

    .form-group {
        display: flex;
        gap: 10px;
        align-items: center;
        margin-bottom: 15px;
    }

    .form-group label {
        font-weight: 500;
    }

    .snapshot-queries {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
    }

    .flex-grow {
        flex-grow: 1;
    }

    .step-form,
    .test-form {
        display: flex;
        gap: 10px;
        margin-top: 15px;
        align-items: center;
    }

    .file-upload {
        display: flex;
        gap: 15px;
        margin-bottom: 30px;
        padding: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .file-input {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 0.9rem;
    }

    .actions {
        text-align: right;
        padding: 20px 0;
    }

    @media (max-width: 768px) {
        .step {
            grid-template-columns: 1fr;
            gap: 10px;
        }

        .file-upload {
            flex-direction: column;
        }

        .btn {
            width: 100%;
        }
    }
</style>
