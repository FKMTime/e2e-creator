<script lang="ts">
    import type { Group, TestsRoot } from "$lib/types";
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
    let cardsNewGroup = "";

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
            group: cardsNewGroup,
        };

        testRoot = testRoot;

        cardsNewId = 0;
        cardsNewName = "";
        cardsNewWcaId = "";
        cardsNewRegistrantId = 0;
        cardsNewCanCompete = true;
        cardsNewGroup = "";
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
    <input bind:files type="file" accept=".json" />
    <button on:click={loadSample}>Load sample</button>
    <button on:click={loadSaved} disabled={!isSaved}>Load saved</button>
{/if}

{#if testRoot}
    <table>
        <tr>
            <th>Group ID</th>
            <th>Use inspection</th>
            <th>Secondary Text</th>
            <th></th>
        </tr>

        {#each testRoot.groups as group, i}
            <tr>
                <td>
                    <input type="text" bind:value={group.groupId} />
                </td>

                <td>
                    <input type="checkbox" bind:checked={group.useInspection} />
                </td>

                <td>
                    <input type="text" bind:value={group.secondaryText} />
                </td>

                <td>
                    <button on:click={() => deleteGroup(i)}>X</button>
                </td>
            </tr>
        {/each}

        <tr class="gray">
            <td>
                <input type="text" bind:value={groupNewId} />
            </td>

            <td>
                <input type="checkbox" bind:checked={groupNewUseInspection} />
            </td>

            <td>
                <input type="text" bind:value={groupNewSecondaryText} />
            </td>

            <td>
                <button on:click={addGroup}>+</button>
            </td>
        </tr>
    </table>

    <table>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Wca ID</th>
            <th>Registrant ID</th>
            <th>Can Compete</th>
            <th>Group</th>
            <th></th>
        </tr>

        {#each Object.entries(testRoot.cards) as [id, _]}
            <tr>
                <td>
                    <input
                        type="number"
                        value={id}
                        on:change={(event) =>
                            cardsChangeId(
                                parseInt(id),
                                event.currentTarget.value,
                            )}
                    />
                </td>

                <td>
                    <input
                        type="text"
                        bind:value={testRoot.cards[parseInt(id)].name}
                    />
                </td>

                <td>
                    <input
                        type="text"
                        bind:value={testRoot.cards[parseInt(id)].name}
                    />
                </td>

                <td>
                    <input
                        type="number"
                        bind:value={testRoot.cards[parseInt(id)].registrantId}
                    />
                </td>

                <td>
                    <input
                        type="checkbox"
                        bind:checked={testRoot.cards[parseInt(id)].canCompete}
                    />
                </td>

                <td>
                    <select bind:value={testRoot.cards[parseInt(id)].group}>
                        {#each testRoot.groups as group}
                            <option value={group.groupId}
                                >{group.secondaryText}</option
                            >
                        {/each}
                    </select>
                </td>

                <td>
                    <button on:click={() => cardsDelete(parseInt(id))}>X</button
                    >
                </td>
            </tr>
        {/each}

        <tr class="gray">
            <td>
                <input type="number" bind:value={cardsNewId} />
            </td>

            <td>
                <input type="text" bind:value={cardsNewName} />
            </td>

            <td>
                <input type="text" bind:value={cardsNewWcaId} />
            </td>

            <td>
                <input type="number" bind:value={cardsNewRegistrantId} />
            </td>

            <td>
                <input type="checkbox" bind:checked={cardsNewCanCompete} />
            </td>

            <td>
                <select bind:value={cardsNewGroup}>
                    {#each testRoot.groups as group}
                        <option value={group.groupId}
                            >{group.secondaryText}</option
                        >
                    {/each}
                </select>
            </td>

            <td>
                <button on:click={cardsAddNew}>+</button>
            </td>
        </tr>
    </table>

    <table>
        <tr>
            <th>Name</th>
            <th>Pins</th>
            <th></th>
        </tr>

        {#each Object.entries(testRoot.buttons) as [name, pin]}
            <tr>
                <td>
                    <input
                        type="text"
                        value={name}
                        on:change={(event) =>
                            buttonsChangeName(name, event.currentTarget.value)}
                    />
                </td>

                <td>
                    <input
                        type="number"
                        value={pin}
                        on:change={(event) =>
                            buttonsChangePin(
                                name,
                                parseInt(event.currentTarget.value),
                            )}
                    />
                </td>

                <td>
                    <button on:click={() => buttonsDelete(name)}>X</button>
                </td>
            </tr>
        {/each}

        <tr class="gray">
            <td>
                <input type="text" bind:value={buttonsNewName} />
            </td>

            <td>
                <input type="number" bind:value={buttonsNewPin} />
            </td>

            <td>
                <button on:click={buttonsAddNew}>+</button>
            </td>
        </tr>
    </table>

    {#each testRoot.tests as test, testIdx}
        <label style="font-weight: bold;">
            Test Name:
            <input type="text" bind:value={test.name} />
        </label>
        <button on:click={() => removeTest(testIdx)}>X</button>

        <br />

        <label>
            Sleep between steps (ms):
            <input type="text" bind:value={test.sleepBetween} />
        </label>

        <ul>
            {#each test.steps as step, stepIdx}
                <li>
                    {step.type}
                    {#if step.type == "Sleep" || step.type == "SolveTime"}
                        <input type="number" bind:value={step.data} />
                    {:else if step.type == "ScanCard"}
                        <select bind:value={step.data}>
                            {#each Object.keys(testRoot.cards) as cardId}
                                <option value={parseInt(cardId)}>
                                    {testRoot.cards[parseInt(cardId)].name} ({cardId})
                                </option>
                            {/each}
                        </select>
                    {:else if step.type == "Button"}
                        <select bind:value={step.data.name}>
                            {#each Object.keys(testRoot.buttons) as buttonName}
                                <option value={buttonName}>{buttonName}</option>
                            {/each}
                        </select>

                        <input type="number" bind:value={step.data.time} />
                    {:else if step.type == "DelegateResolve"}
                        <input
                            type="checkbox"
                            bind:checked={step.data.shouldScanCards}
                        />
                        <input type="number" bind:value={step.data.penalty} />
                        <input type="number" bind:value={step.data.value} />
                    {:else if step.type == "VerifySolveTime"}
                        <input type="number" bind:value={step.data.time} />
                        <input type="number" bind:value={step.data.penalty} />
                    {/if}

                    <button on:click={() => deleteTestStep(testIdx, stepIdx)}
                        >X</button
                    >
                </li>
            {/each}
        </ul>

        <form
            on:submit|preventDefault={(event) =>
                addNewTestStep(testIdx, event.currentTarget[0].value)}
        >
            <select>
                {#each ["ScanCard", "ResetState", "Sleep", "SolveTime", "Button", "DelegateResolve", "VerifySolveTime", "Snapshot", "VerifyDelegateSent", "SolveTimeRng"] as stepType}
                    <option value={stepType}>{stepType}</option>
                {/each}
            </select>

            <button type="submit">+</button>
        </form>

        <br />
        <br />
        <br />
    {/each}

    <form
        on:submit|preventDefault={(event) =>
            addNewTest(event.currentTarget[0].value)}
    >
        <input type="text" />
        <button type="submit">+</button>
    </form>

    <button on:click={generate}>GENERATE & DOWNLOAD</button>
{/if}

<style>
    table,
    tr,
    td,
    th {
        border: 1px solid black;
        border-collapse: collapse;
    }

    td > input {
        width: 100%;
        height: 100%;
        border: none;
        background-color: transparent;
    }
    td > input:focus {
        outline: none;
    }

    td > button {
        border: none;
        background-color: transparent;
        width: 100%;
        height: 100%;
        text-align: center;
    }
    td > button:hover {
        cursor: pointer;
    }

    .gray > td {
        background-color: #f0f0f0;
    }
</style>
