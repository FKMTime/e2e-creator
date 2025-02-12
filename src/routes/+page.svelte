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
        cardsNewGroup = [];
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
            case "VerifySolveTime":
                step.data = { time: null, penalty: 0 };
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
        <input bind:files type="file" accept=".json" class="file-input" />
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
            <table class="table">
                <thead>
                    <tr>
                        <th>Group ID</th>
                        <th>Use Inspection</th>
                        <th>Secondary Text</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {#each testRoot.groups as group, i}
                        <tr>
                            <td
                                ><input
                                    type="text"
                                    bind:value={group.groupId}
                                    class="input-text"
                                /></td
                            >
                            <td
                                ><input
                                    type="checkbox"
                                    bind:checked={group.useInspection}
                                    class="input-checkbox"
                                /></td
                            >
                            <td
                                ><input
                                    type="text"
                                    bind:value={group.secondaryText}
                                    class="input-text"
                                /></td
                            >
                            <td
                                ><button
                                    on:click={() => deleteGroup(i)}
                                    class="btn btn-delete">X</button
                                ></td
                            >
                        </tr>
                    {/each}
                    <tr class="new-row">
                        <td
                            ><input
                                type="text"
                                bind:value={groupNewId}
                                class="input-text"
                            /></td
                        >
                        <td
                            ><input
                                type="checkbox"
                                bind:checked={groupNewUseInspection}
                                class="input-checkbox"
                            /></td
                        >
                        <td
                            ><input
                                type="text"
                                bind:value={groupNewSecondaryText}
                                class="input-text"
                            /></td
                        >
                        <td
                            ><button on:click={addGroup} class="btn btn-add"
                                >+</button
                            ></td
                        >
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>Cards</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>WCA ID</th>
                        <th>Registrant ID</th>
                        <th>Can Compete</th>
                        <th>Groups</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {#each Object.entries(testRoot.cards) as [id, _]}
                        <tr>
                            <td
                                ><input
                                    type="number"
                                    value={id}
                                    on:change={(event) =>
                                        cardsChangeId(
                                            parseInt(id),
                                            event.currentTarget.value,
                                        )}
                                    class="input-number"
                                /></td
                            >
                            <td
                                ><input
                                    type="text"
                                    bind:value={
                                        testRoot.cards[parseInt(id)].name
                                    }
                                    class="input-text"
                                /></td
                            >
                            <td
                                ><input
                                    type="text"
                                    bind:value={
                                        testRoot.cards[parseInt(id)].wcaId
                                    }
                                    class="input-text"
                                /></td
                            >
                            <td
                                ><input
                                    type="number"
                                    bind:value={
                                        testRoot.cards[parseInt(id)]
                                            .registrantId
                                    }
                                    class="input-number"
                                /></td
                            >
                            <td
                                ><input
                                    type="checkbox"
                                    bind:checked={
                                        testRoot.cards[parseInt(id)].canCompete
                                    }
                                    class="input-checkbox"
                                /></td
                            >
                            <td>
                                <select
                                    multiple
                                    bind:value={
                                        testRoot.cards[parseInt(id)].groups
                                    }
                                    class="input-select"
                                >
                                    {#each testRoot.groups as group}
                                        <option value={group.groupId}
                                            >{group.secondaryText}</option
                                        >
                                    {/each}
                                </select>
                            </td>
                            <td
                                ><button
                                    on:click={() => cardsDelete(parseInt(id))}
                                    class="btn btn-delete">X</button
                                ></td
                            >
                        </tr>
                    {/each}
                    <tr class="new-row">
                        <td
                            ><input
                                type="number"
                                bind:value={cardsNewId}
                                class="input-number"
                            /></td
                        >
                        <td
                            ><input
                                type="text"
                                bind:value={cardsNewName}
                                class="input-text"
                            /></td
                        >
                        <td
                            ><input
                                type="text"
                                bind:value={cardsNewWcaId}
                                class="input-text"
                            /></td
                        >
                        <td
                            ><input
                                type="number"
                                bind:value={cardsNewRegistrantId}
                                class="input-number"
                            /></td
                        >
                        <td
                            ><input
                                type="checkbox"
                                bind:checked={cardsNewCanCompete}
                                class="input-checkbox"
                            /></td
                        >
                        <td>
                            <select
                                multiple
                                bind:value={cardsNewGroups}
                                class="input-select"
                            >
                                {#each testRoot.groups as group}
                                    <option value={group.groupId}
                                        >{group.secondaryText}</option
                                    >
                                {/each}
                            </select>
                        </td>
                        <td
                            ><button on:click={cardsAddNew} class="btn btn-add"
                                >+</button
                            ></td
                        >
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>Buttons</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Pins</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {#each Object.entries(testRoot.buttons) as [name, pin]}
                        <tr>
                            <td
                                ><input
                                    type="text"
                                    value={name}
                                    on:change={(event) =>
                                        buttonsChangeName(
                                            name,
                                            event.currentTarget.value,
                                        )}
                                    class="input-text"
                                /></td
                            >
                            <td
                                ><input
                                    type="number"
                                    value={pin}
                                    on:change={(event) =>
                                        buttonsChangePin(
                                            name,
                                            parseInt(event.currentTarget.value),
                                        )}
                                    class="input-number"
                                /></td
                            >
                            <td
                                ><button
                                    on:click={() => buttonsDelete(name)}
                                    class="btn btn-delete">X</button
                                ></td
                            >
                        </tr>
                    {/each}
                    <tr class="new-row">
                        <td
                            ><input
                                type="text"
                                bind:value={buttonsNewName}
                                class="input-text"
                            /></td
                        >
                        <td
                            ><input
                                type="number"
                                bind:value={buttonsNewPin}
                                class="input-number"
                            /></td
                        >
                        <td
                            ><button
                                on:click={buttonsAddNew}
                                class="btn btn-add">+</button
                            ></td
                        >
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>Tests</h2>
            {#each testRoot.tests as test, testIdx}
                <div class="test">
                    <div class="test-header">
                        <input
                            type="text"
                            bind:value={test.name}
                            class="input-text test-name"
                        />
                        <button
                            on:click={() => removeTest(testIdx)}
                            class="btn btn-delete">X</button
                        >
                    </div>
                    <label>
                        Sleep between steps (ms):
                        <input
                            type="text"
                            bind:value={test.sleepBetween}
                            class="input-number"
                        />
                    </label>
                    <ul class="steps">
                        {#each test.steps as step, stepIdx}
                            <li class="step">
                                <span class="step-type">{step.type}</span>
                                {#if step.type == "Sleep" || step.type == "SolveTime"}
                                    <input
                                        type="number"
                                        bind:value={step.data}
                                        class="input-number"
                                    />
                                {:else if step.type == "ScanCard"}
                                    <select
                                        bind:value={step.data}
                                        class="input-select"
                                    >
                                        {#each Object.keys(testRoot.cards) as cardId}
                                            <option value={parseInt(cardId)}
                                                >{testRoot.cards[
                                                    parseInt(cardId)
                                                ].name} ({cardId})</option
                                            >
                                        {/each}
                                    </select>
                                {:else if step.type == "Button"}
                                    <select
                                        bind:value={step.data.name}
                                        class="input-select"
                                    >
                                        {#each Object.keys(testRoot.buttons) as buttonName}
                                            <option value={buttonName}
                                                >{buttonName}</option
                                            >
                                        {/each}
                                    </select>
                                    <input
                                        type="number"
                                        bind:value={step.data.time}
                                        class="input-number"
                                    />
                                {:else if step.type == "DelegateResolve"}
                                    <input
                                        type="checkbox"
                                        bind:checked={step.data.shouldScanCards}
                                        class="input-checkbox"
                                    />
                                    <input
                                        type="number"
                                        bind:value={step.data.penalty}
                                        class="input-number"
                                    />
                                    <input
                                        type="number"
                                        bind:value={step.data.value}
                                        class="input-number"
                                    />
                                {:else if step.type == "VerifySolveTime"}
                                    <input
                                        type="number"
                                        bind:value={step.data.time}
                                        class="input-number"
                                    />
                                    <input
                                        type="number"
                                        bind:value={step.data.penalty}
                                        class="input-number"
                                    />
                                {/if}
                                <button
                                    on:click={() =>
                                        deleteTestStep(testIdx, stepIdx)}
                                    class="btn btn-delete">X</button
                                >
                            </li>
                        {/each}
                    </ul>
                    <form
                        on:submit|preventDefault={(event) =>
                            addNewTestStep(
                                testIdx,
                                event.currentTarget[0].value,
                            )}
                        class="step-form"
                    >
                        <select class="input-select">
                            {#each ["ScanCard", "ResetState", "Sleep", "SolveTime", "Button", "DelegateResolve", "VerifySolveTime", "Snapshot", "VerifyDelegateSent", "SolveTimeRng"] as stepType}
                                <option value={stepType}>{stepType}</option>
                            {/each}
                        </select>
                        <button type="submit" class="btn btn-add">+</button>
                    </form>
                </div>
            {/each}
            <form
                on:submit|preventDefault={(event) =>
                    addNewTest(event.currentTarget[0].value)}
                class="test-form"
            >
                <input type="text" class="input-text" />
                <button type="submit" class="btn btn-add">+</button>
            </form>
        </div>

        <button on:click={generate} class="btn btn-generate"
            >GENERATE & DOWNLOAD</button
        >
    </div>
{/if}

<style>
    body {
        font-family: Arial, sans-serif;
        background-color: #f9f9f9;
        color: #333;
        margin: 0;
        padding: 20px;
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
    }

    .section {
        margin-bottom: 30px;
    }

    h2 {
        font-size: 24px;
        margin-bottom: 15px;
        color: #444;
    }

    .table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
    }

    .table th,
    .table td {
        padding: 12px;
        border: 1px solid #ddd;
        text-align: left;
    }

    .table th {
        background-color: #f5f5f5;
        font-weight: bold;
    }

    .new-row td {
        background-color: #f0f0f0;
    }

    .input-text,
    .input-number,
    .input-select,
    .input-checkbox {
        width: 100%;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
    }

    .input-checkbox {
        width: auto;
    }

    .btn {
        padding: 8px 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.3s ease;
    }

    .btn-add {
        background-color: #28a745;
        color: white;
    }

    .btn-add:hover {
        background-color: #218838;
    }

    .btn-delete {
        background-color: #dc3545;
        color: white;
    }

    .btn-delete:hover {
        background-color: #c82333;
    }

    .btn-sample,
    .btn-saved {
        background-color: #007bff;
        color: white;
    }

    .btn-sample:hover,
    .btn-saved:hover {
        background-color: #0056b3;
    }

    .btn-generate {
        background-color: #17a2b8;
        color: white;
        padding: 10px 20px;
        font-size: 16px;
    }

    .btn-generate:hover {
        background-color: #138496;
    }

    .test {
        background-color: white;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-bottom: 20px;
    }

    .test-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }

    .test-name {
        font-size: 18px;
        font-weight: bold;
    }

    .steps {
        list-style-type: none;
        padding: 0;
    }

    .step {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        border-bottom: 1px solid #eee;
    }

    .step:last-child {
        border-bottom: none;
    }

    .step-type {
        font-weight: bold;
    }

    .step-form,
    .test-form {
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }

    .file-upload {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
    }

    .file-input {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
</style>
