<script lang="ts">
    import type { TestsRoot, Step } from "$lib/types";

    let files: FileList;
    let testRoot: TestsRoot | null = null;

    $: if (files) {
        handleFiles();
    }

    async function handleFiles() {
        let file = files[0];
        let text = await file.text();
        let json: TestsRoot = JSON.parse(text);
        testRoot = json;
    }
</script>

{#if !files}
    <input bind:files type="file" accept=".json" />
{/if}

{#if testRoot}
    {#each Object.entries(testRoot.cards) as [id, card]}
        {id}: {card.name} | {card.wcaId} | {card.registrantId} | {card.canCompete}
        <br />
    {/each}

    <br />

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
{/if}
