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

    async function load() {
        files = [];
        let json: TestsRoot | null = null;

        if (isSaved) {
            let saved = localStorage.getItem("save");
            if (saved) {
                json = JSON.parse(saved);
            }
        } else {
            json = await fetch("/tests-sample.json").then(
                (res) => res.json(),
            );
        }

        testRoot = json;
    }

    let cardsNewId = 0;
    let cardsNewName = "";
    let cardsNewWcaId = "";
    let cardsNewRegistrantId = 0;
    let cardsNewCanCompete = true;

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
        };

        testRoot = testRoot;

        cardsNewId = 0;
        cardsNewName = "";
        cardsNewWcaId = "";
        cardsNewRegistrantId = 0;
        cardsNewCanCompete = true;
    }

    let buttonsNewName = "";
    let buttonsNewPins = "";

    function buttonsChangePins(name: string, pins: string) {
        if (!testRoot) return;
        testRoot.buttons[name] = pins
            .split(",")
            .map((pin) => parseInt(pin.trim()));

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

        testRoot.buttons[buttonsNewName] = buttonsNewPins
            .split(",")
            .map((pin) => parseInt(pin.trim()));
        testRoot = testRoot;
        buttonsNewName = "";
        buttonsNewPins = "";
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
    <button on:click={load}>{isSaved ? "Load saved" : "Load sample"}</button>
{/if}

{#if testRoot}
    <table>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Wca ID</th>
            <th>Registrant ID</th>
            <th>Can Compete</th>
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

        {#each Object.entries(testRoot.buttons) as [name, pins]}
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
                        type="text"
                        value={pins.join(",")}
                        on:change={(event) =>
                            buttonsChangePins(name, event.currentTarget.value)}
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
                <input type="text" bind:value={buttonsNewPins} />
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
