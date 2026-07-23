# Apply the Chicago 2024 integration patch

From the repository root:

```bash
git checkout main
git pull
git checkout -b feature/chicago-cycle-integration
```

Copy the archive contents into the repository root, preserving paths. This patch:

- adds `lib/training-cycle-data.ts`
- adds `lib/training-cycle-data.test.ts`
- replaces `app/marathons/[id]/page.tsx`

Then validate:

```bash
npm test
npm run typecheck
npm run build
npm run dev
```

Open `/marathons/chicago-2024`. The page should use engine-generated metrics and display a baseline-delta table. All other races remain on precomputed JSON.

Commit:

```bash
git add lib/training-cycle-data.ts   lib/training-cycle-data.test.ts   'app/marathons/[id]/page.tsx'
git commit -m "Integrate training cycle engine with Chicago 2024"
git push -u origin feature/chicago-cycle-integration
```
