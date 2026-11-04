# Project Guidelines

## Change Risk Checks

For every code change, review the affected code paths for memory/resource leaks,
performance bottlenecks, and security risks. Check resource lifetimes and
unbounded growth, repeated or super-linear work, and relevant input validation,
authorization, state handling, and secret exposure. Fix issues introduced by or
tightly coupled to the change, add focused tests where practical, and report
what was checked and any remaining risks.
