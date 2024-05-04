<script lang="ts">
    import type { TestsRoot, Step } from "$lib/types";

    let files: FileList | any;
    let testRoot: TestsRoot | null = null;

    $: if (files) {
        handleFiles();
    }

    async function handleFiles() {
        if (!(files instanceof FileList)) return;

        let file = files[0];
        let text = await file.text();
        let json: TestsRoot = JSON.parse(text);
        testRoot = json;
    }

    async function loadSample() {
        files = [];
        let json: TestsRoot = await fetch("/tests-sample.json").then((res) =>
            res.json(),
        );

        testRoot = json;
    }

    let cardsNewId = 0;
    let cardsNewName = "";
    let cardsNewWcaId = "";
    let cardsNewRegistrantId = 0;
    let cardsNewCanCompete = true;

    function cardsChangeCanCompete(id: number) {
        if (!testRoot) return;

        testRoot.cards[id].canCompete = !testRoot.cards[id].canCompete;
        testRoot = testRoot;
    }

    function cardsChangeRegistrantId(id: number, registrantId: number) {
        if (!testRoot) return;
        testRoot.cards[id].registrantId = registrantId;
        testRoot = testRoot;
    }

    function cardsChangeWcaId(id: number, wcaId: string) {
        if (!testRoot) return;
        testRoot.cards[id].wcaId = wcaId;
        testRoot = testRoot;
    }

    function cardsChangeName(id: number, name: string) {
        if (!testRoot) return;
        testRoot.cards[id].name = name;
        testRoot = testRoot;
    }

    function cardsDelete(id: number) {
        if (!testRoot) return;
        delete testRoot.cards[id];
        testRoot = testRoot;
    }

    function cardsChangeId(id: number, newId: string) {
        if (!testRoot) return;
        let card = testRoot.cards[id];
        delete testRoot.cards[id];
        testRoot.cards[newId] = card;
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

    async function test() {
        console.log(testRoot);
    }
</script>

{#if !files}
    <input bind:files type="file" accept=".json" />
    <button on:click={loadSample}>Load sample</button>
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

        {#each Object.entries(testRoot.cards) as [id, card]}
            <tr>
                <td>
                    <input
                        type="number"
                        value={id}
                        on:change={(event) =>
                            cardsChangeId(id, event.target.value)}
                    />
                </td>

                <td>
                    <input
                        type="text"
                        value={card.name}
                        on:change={(event) =>
                            cardsChangeName(id, event.target.value)}
                    />
                </td>

                <td>
                    <input
                        type="text"
                        value={card.wcaId}
                        on:change={(event) =>
                            cardsChangeWcaId(id, event.target.value)}
                    />
                </td>

                <td>
                    <input
                        type="number"
                        value={card.registrantId}
                        on:change={(event) =>
                            cardsChangeRegistrantId(id, event.target.value)}
                    />
                </td>

                <td>
                    <input
                        type="checkbox"
                        checked={card.canCompete}
                        on:change={() => cardsChangeCanCompete(id)}
                    />
                </td>

                <td>
                    <button on:click={() => cardsDelete(id)}>X</button>
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

    {#each Object.entries(testRoot.buttons) as [name, pins]}
        {name}: {pins.join(", ")}
        <br />
    {/each}

    <br />

    {#each testRoot.tests as test}
        {test.name}
        <ul>
            {#each test.steps as step}
                <li>{step.type}</li>
                {#if step.data}
                    {JSON.stringify(step.data)}
                {/if}
            {/each}
        </ul>

        <br />
    {/each}

    <button on:click={test}>Test</button>
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
