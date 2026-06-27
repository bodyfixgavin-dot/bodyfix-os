# BodyFix Fascia Line Taxonomy v1.1

## Locked entry layer

1. `BF-FL-SBL`｜淺背線
2. `BF-FL-SFL`｜淺前線
3. `BF-FL-LL`｜側線
4. `BF-FL-SL`｜螺旋線
5. `BF-FL-DFL`｜深前線
6. `BF-FLG-ARM`｜手臂線群組
7. `BF-FLG-FUNC`｜功能線群組

## Locked leaf nodes

1. `BF-FL-SBL`
2. `BF-FL-SFL`
3. `BF-FL-LL`
4. `BF-FL-SL`
5. `BF-FL-DFL`
6. `BF-FL-SBAL`
7. `BF-FL-DBAL`
8. `BF-FL-SFAL`
9. `BF-FL-DFAL`
10. `BF-FL-BFL`
11. `BF-FL-FFL`
12. `BF-FL-IFL`

## Alias and legacy-code rule

`aliases` stores name aliases only. It must not store historical codes.

Current name aliases:

- `BF-FL-LL`｜側線：`體側線`
- `BF-FL-DFL`｜深前線：`前深線`

Current legacy code migration map:

```json
{
  "BF-FL-SPL": "BF-FL-SL"
}
```

`BF-FL-SPL` is a historical code for spiral line records. New writes should use `BF-FL-SL`; reads and migration scripts should resolve `BF-FL-SPL` to `BF-FL-SL`.

## Phase-1 repository flashlight notes

Commands used on 2026-06-27:

- `rg -n "BF-FL-SPL|體側線|前深線|BF-FL-|筋膜|fascia|aliases|legacyCodes" -g '!node_modules' -g '!dist' -g '!build' .`
- `rg -n "BF-FL-SPL|BF-FL-SL|體側線|前深線|表淺背線|表淺前線|LN-SPL|Spiral" -g '!node_modules' .`

Findings:

1. Formal production site repository still needs deployment mapping confirmation outside this repository.
2. Pricing appears in shared service/configuration files as fallback data and SQL seed data, not only in page copy.
3. Fascia-line references appear in booking services, codebook SQL seeds, anatomy image metadata, clinic record fields, tests, and public copy.
4. Before this v1.1 change, `BF-FL-SPL`, `體側線`, and `前深線` were not found in tracked application/source files outside dependencies. Existing SQL seeds still use older `LN-*` codebook identifiers, so database migrations should explicitly map either `LN-SL`/new `BF-FL-SL` and keep `BF-FL-SPL` compatibility for any external historic records not present in this repo.
