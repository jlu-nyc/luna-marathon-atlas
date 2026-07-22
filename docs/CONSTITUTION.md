# Marathon Constitution

This document contains the rules that govern Luna Marathon Atlas. Athlete-specific “laws” remain hypotheses until the data supports them.

## Data rules

1. Never invent a race result, split, workout, or condition.
2. Mark approximate and manually entered values explicitly.
3. Preserve raw source data separately from derived datasets.
4. Record the formula, window, and version used for every derived metric.
5. Treat missing data as unknown, not zero.

## Analytics rules

1. Use a 14-week pre-race window by default: a 12-week build plus a 2-week lead-in.
2. Exclude race day from pre-race training calculations.
3. Distinguish correlation from causation.
4. Avoid conclusions from tiny samples without an uncertainty warning.
5. Account for course, weather, age, injury, race priority, and multi-marathon effects when the data becomes available.
6. Prefer interpretable metrics before opaque scores or machine-learning models.
7. Add or change an analytics formula only with tests and a recorded decision.

## Product rules

1. Every chart must answer a named question.
2. Important metrics should link to their definition and inputs.
3. Athlete stories and memories must never be overwritten by generated prose.
4. Private activity data remains private by default.
5. The application may advise, but it must not pretend to replace medical judgment or a qualified coach.

## Athlete-law lifecycle

Each proposed law must include:

- the hypothesis;
- supporting and contradicting cycles;
- sample size;
- likely confounders;
- confidence level;
- the next observation that could strengthen or falsify it.
