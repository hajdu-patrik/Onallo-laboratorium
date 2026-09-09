# GitHub Copilot Deprecation

| Field | Value |
| --- | --- |
| Status | Deprecated |
| Decision date | 2026-09-09 |
| Archive branch | `deprecated/github-copilot` |
| Scope | The GitHub Copilot instruction layer of this repository |
| Remaining active layer | The Claude layer (`CLAUDE.md`, `**/CLAUDE.md`, `.claude/**`) |

## 1. What this branch is

This branch is the archive of the GitHub Copilot harness of the ARSM repository. Every file that
exists only so that Copilot behaves the way the Claude layer already behaves is preserved here, in
its last working state, together with the reasoning that ended its use.

The archive exists because the layer was never dead weight. It was a complete, working mirror of the
Claude harness: the same agent roles, the same routing rules, the same gates, the same UI/UX policy.
Deleting it without a record would throw away months of alignment work and leave no explanation for
why a second, fully specified harness disappeared from the history. Keeping it on a named branch
costs nothing and makes the decision reversible.

Nothing here is loaded by any tooling on `main` once the layer is removed there. This branch is a
reference, not a runtime.

## 2. Why the layer is being retired

The reason is not technical. The Copilot harness worked. What stopped working was the access model
underneath it: over roughly a year the terms changed four times, each change reduced what the same
money bought, and the last change made the cost per unit of work impossible to predict before
starting a task. A harness that cannot be reached affordably is not a harness.

The history below is the actual usage record for this project.

### Phase 1. Student subscription, flagship models included

The work started on the student subscription. At that time it carried the top-tier models outright:
Claude Opus 4.6 and Codex 5.3 were both selectable and usable without a separate paid tier. This is
the period the Copilot layer of this repository was written for and against. The agent definitions,
the routing rules and the gate conditions all assume a model good enough to hold the whole
instruction set in mind, and that assumption was satisfied.

The top-tier models were later withdrawn from the student subscription. The subscription itself
remained, but the models it now offered were no longer the ones the harness was designed around.

### Phase 2. The paid plan, and two good months

The response was to pay for the tier that restored the previous capability: the plan at $40 per
month. For two months this was a good arrangement. The flagship models of that period, Opus 4.7 and
GPT-5.5, were available under a flat monthly fee, and the cost of a working session was known in
advance because it was simply a fraction of the monthly price. Model choice could be driven by what
the task needed rather than by what the task would consume.

This is the only phase in the whole history where the economics and the engineering pointed the same
way, and it lasted two months.

### Phase 3. The switch to token-based billing

The plan then moved from flat monthly access to token-based billing. This is the change that
undermined the arrangement, because it moved the cost of a task from something known before starting
it to something discovered after finishing it. A repository like this one carries a large standing
instruction set: root guidance, six area rule files, eleven agent definitions, seven skills, and a
mandatory workflow that routes almost every change through several of them. Under a flat fee that
context is free to re-read. Under token billing it is charged again on every step of every route.

The subscription was dropped at this point, and the project ran for two months without the Copilot
layer at all.

### Phase 4. The return, on credits, for one month

The plan was taken up again after that two-month gap, at the same $40, now settled in credits. The
allowance was 7,000 credits, presented as worth roughly twice the token volume of the $40 tier, so
nominally around $80 of usage. Measured against what the credits actually bought, the real value
landed closer to $65 to $70. The gap between the nominal and the real figure was not the decisive
problem, though. The decisive problem was the burn rate.

| Item | Figure |
| --- | --- |
| Monthly price | $40 |
| Credits granted | 7,000 |
| Nominal value, as presented | about 2x the $40 tier, so roughly $80 |
| Observed real value | about $65 to $70 |
| Time to exhaustion | far less than the billing period |

The allowance was consumed quickly under every pattern of use that was tried:

- Staying on the older, cheaper GPT-5.5 to stretch the budget. The credits still ran out well before
  the period ended, which means the shortfall was structural rather than a consequence of reaching
  for expensive models.
- Trying the current generation, GPT-5.6, Terra and Luna. Each was capable, and each drew down the
  allowance fast enough that the remaining budget had to be checked before starting anything
  non-trivial.
- Trying Opus 5.0. Same outcome, faster.

That is the point at which the arrangement stopped being usable. The failure mode was not running
out of credits once. It was that every task had to be priced before it could be started, and a
harness whose mandatory workflow chains an orchestrator, a specialist, a validator, a docs pass and
a principles pass cannot be run under a budget that has to be rationed per step. The workflow was
designed on the assumption that routing through the right agents is always correct. Credit billing
makes routing a cost decision, and a cost decision made per task is exactly the kind of judgement
this repository's guidance says should not be improvised.

### Summary of the access history

| Phase | Access model | Models available | Duration | Outcome |
| --- | --- | --- | --- | --- |
| 1 | Student subscription | Opus 4.6, Codex 5.3 | Until withdrawal | Top-tier models removed from the tier |
| 2 | $40 per month, flat | Opus 4.7, GPT-5.5 | 2 months | Worked well |
| 3 | Token-based billing | n/a | 2 months, unsubscribed | Cost per task became unpredictable |
| 4 | $40 per month, credits | GPT-5.5, GPT-5.6, Terra, Luna, Opus 5.0 | 1 month | Allowance exhausted early, repeatedly |

## 3. What follows from this

The Claude layer stays as the single active instruction layer. This is the practical consequence of
the decision, not a new preference: the repository guidance already treats the two layers as
independent, and with one of them retired the surviving one simply becomes the only one.

Two standing obligations in the root guidance lose their counterpart and should be revisited by the
repository owner when the layer is removed from `main`:

- The instruction layer separation rule, which describes Copilot as an active layer that Claude must
  not read outside a `docs-sync` run.
- The UI/UX policy synchronization rule, which requires four documented file pairs to be kept
  semantically equivalent across the two surfaces. Half of every pair lives on this branch now.

Both are documentation-level changes on `main` and are left to the owner rather than folded into
this archive.

## 4. Inventory of the archived layer

Twenty-five tracked files make up the Copilot harness. All of them exist solely to give Copilot the
behaviour the Claude layer already defines.

**Root guidance**

- `.github/copilot-instructions.md`

**Agent definitions**

- `.github/agents/backend.agent.md`
- `.github/agents/coding-principles.agent.md`
- `.github/agents/docs-sync.agent.md`
- `.github/agents/e2e-playwright-test.agent.md`
- `.github/agents/frontend.agent.md`
- `.github/agents/http-endpoint-test.agent.md`
- `.github/agents/migration.agent.md`
- `.github/agents/orchestrator.agent.md`
- `.github/agents/sql-database-test.agent.md`
- `.github/agents/ui-ux-style-profile.agent.md`
- `.github/agents/validate.agent.md`

**Area instructions**

- `.github/instructions/apiservice.instructions.md`
- `.github/instructions/apphost.instructions.md`
- `.github/instructions/scripts.instructions.md`
- `.github/instructions/servicedefaults.instructions.md`
- `.github/instructions/tests.instructions.md`
- `.github/instructions/webui.instructions.md`

**Skills**

- `.github/skills/autoservice-coding-principles/SKILL.md`
- `.github/skills/autoservice-docs-sync/SKILL.md`
- `.github/skills/autoservice-e2e-playwright-test/SKILL.md`
- `.github/skills/autoservice-ef-migration/SKILL.md`
- `.github/skills/autoservice-http-endpoint-test/SKILL.md`
- `.github/skills/autoservice-sql-database-test/SKILL.md`
- `.github/skills/ui-ux-sync/SKILL.md`

`.github/workflows/dotnet.yml` is deliberately not part of this list. It is the continuous
integration pipeline, it has nothing to do with Copilot, and it stays on `main`.

## 5. Restoring the layer

If the access model becomes workable again, the layer can be brought back with a single checkout of
the archived paths:

```bash
git checkout deprecated/github-copilot -- .github/agents .github/instructions .github/skills .github/copilot-instructions.md
```

The restored files reflect the state of the Claude layer as of 2026-09-09. Anything the Claude layer
gained after that date has to be propagated across through a `docs-sync` run before the two surfaces
can be called equivalent again.

## 6. Hungarian version

The same document in Hungarian: [`GitHub-Copilot-Deprecation(HU).md`](GitHub-Copilot-Deprecation%28HU%29.md).
